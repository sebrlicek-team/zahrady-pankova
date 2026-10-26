import test from 'node:test';
import assert from 'node:assert/strict';
import {handleForms, FormsOutbox, validateSubmission} from '../server/worker.mjs';
const origin='https://template.ccn-dev.cz';
const fields={name:'Test formuláře',email:'visitor@example.com',phone:'',message:'Zkušební dotaz.'};
const body=()=>({...fields,formId:'template-contact',requestId:crypto.randomUUID(),token:'valid-token'});
const request=(data,opts={})=>new Request(origin+'/api/forms',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','CF-Connecting-IP':'192.0.2.10',...opts.headers},body:JSON.stringify(data)});
function setup(){
 const map=new Map();let alarm=null;
 const storage={get:async k=>structuredClone(map.get(k)),put:async(k,v)=>{if(typeof k==='string')map.set(k,structuredClone(v));else for(const [key,value] of Object.entries(k))map.set(key,structuredClone(value));},delete:async k=>map.delete(k),list:async({prefix})=>new Map([...map].filter(([k])=>k.startsWith(prefix)).map(([k,v])=>[k,structuredClone(v)])),getAlarm:async()=>alarm,setAlarm:async t=>{alarm=t;},deleteAlarm:async()=>{alarm=null;},transaction:async fn=>fn(storage)};
 const env={RESEND_API_KEY:'test',TURNSTILE_SECRET_KEY:'test'};
 const outbox=new FormsOutbox({storage,blockConcurrencyWhile:fn=>fn()},env);
 env.FORMS={idFromName:()=> 'global',get:()=>({fetch:(url,init)=>outbox.fetch(new Request(url,init))})};
 return {env,outbox,map,getAlarm:()=>alarm};
}
const verify=async()=>Response.json({success:true,hostname:'template.ccn-dev.cz',action:'template-contact'});
test('Refuses untrusted origins, unknown forms and forged Turnstile host/action',async()=>{
 const {env,map}=setup();let calls=0;const never=()=>{calls++;throw new Error('must not call');};
 assert.equal((await handleForms(request(body(),{headers:{Origin:'https://evil.example'}}),env,never)).status,403);
 assert.equal((await handleForms(request({...body(),formId:'other'}),env,never)).status,403);
 assert.equal((await handleForms(request({...body(),token:''}),env,never)).status,400);
 assert.equal(calls,0);
 for(const result of [{success:false},{success:true,hostname:'evil.example',action:'template-contact'},{success:true,hostname:'template.ccn-dev.cz',action:'other'}])assert.equal((await handleForms(request(body()),env,async()=>Response.json(result))).status,400);
 assert.equal(map.size,0);
});
test('Accepts only validated fields and ignores injected recipient/from/subject',async()=>{
 const {env,map,getAlarm}=setup();const input={...body(),to:'evil@example.com',from:'evil@example.com',subject:'injected'};
 const response=await handleForms(request(input),env,verify);
 assert.equal(response.status,202);assert.equal(response.headers.get('Access-Control-Allow-Origin'),origin);
 const msg=[...map.values()].find(x=>x.payload);assert.deepEqual(msg.payload.to,['arnost.stepanek@gmail.com']);assert.equal(msg.payload.reply_to,fields.email);assert.match(msg.payload.from,/forms@ccn.cz/);assert.notEqual(msg.payload.subject,'injected');assert(getAlarm());
 const again=await handleForms(request(input),env,verify);assert.equal(again.status,202);assert.equal(map.get('limits').total,1);
 const changed=await handleForms(request({...input,message:'Changed message'}),env,verify);assert.equal(changed.status,409);
});
test('Rate limit protects one visitor and aggregate allowance',async()=>{
 const {env,map}=setup();for(let i=0;i<3;i++)assert.equal((await handleForms(request(body()),env,verify)).status,202);
 assert.equal((await handleForms(request(body()),env,verify)).status,429);
 const limits=map.get('limits');limits.total=20;
 assert.equal((await handleForms(request(body(),{headers:{'CF-Connecting-IP':'192.0.2.11'}}),env,verify)).status,429);
});
test('Rejects oversized payload, malformed email and missing backend secrets',async()=>{
 assert.throws(()=>validateSubmission({...body(),email:'x@example.com\r\nBcc:evil@example.com'}));
 const {env}=setup();assert.equal((await handleForms(request({...body(),message:'x'.repeat(25000)}),env,verify)).status,400);
 assert.equal((await handleForms(request(body()),{},verify)).status,503);
});
test('Durable outbox retries provider failures with the same idempotency key, then removes message content',async t=>{
 const {env,outbox,map}=setup();const input=body();await handleForms(request(input),env,verify);
 const calls=[];t.mock.method(globalThis,'fetch',async(url,init)=>{calls.push({url,init});return calls.length===1?Response.json({error:'busy'},{status:503}):Response.json({id:'email-123'});});
 await outbox.alarm();let message=[...map.values()].find(x=>x.requestId);assert.equal(message.status,'pending');assert.equal(message.attempts,1);
 const key=[...map.keys()].find(k=>k.startsWith('message:'));message.next=Date.now()-1;map.set(key,message);
 await outbox.alarm();message=map.get(key);assert.equal(message.status,'sent');assert.equal(message.payload,undefined);assert.equal(message.emailId,'email-123');assert.equal(calls[0].init.headers['Idempotency-Key'],calls[1].init.headers['Idempotency-Key']);
 await outbox.alarm();assert.equal(calls.length,2);
});
test('Retains failed messages and never retries beyond provider idempotency window',async t=>{
 const {env,outbox,map}=setup();await handleForms(request(body()),env,verify);const key=[...map.keys()].find(k=>k.startsWith('message:'));map.get(key).created=Date.now()-21*3600000;
 t.mock.method(globalThis,'fetch',()=>{throw new Error('must not resend');});await outbox.alarm();assert.equal(map.get(key).status,'failed');assert(map.get(key).payload);
});

test('Allows preview subdomains only over HTTPS and rejects suffix spoofing',async()=>{
 const {allowedOrigin,previewHostname}=await import('../server/forms-config.mjs');
 for(const origin of ['https://novy-web.ccn-dev.cz','https://v2.novy-web.ccn-dev.cz'])assert(allowedOrigin(origin));
 for(const origin of ['https://ccn-dev.cz.evil.test','https://evil-ccn-dev.cz','http://novy-web.ccn-dev.cz','https://novy-web.ccn-dev.cz:8443','https://novy-web.ccn-dev.cz/path','https://user@novy-web.ccn-dev.cz','null','https://ccn-dev.cz'])assert.equal(allowedOrigin(origin),false,origin);
 assert.equal(previewHostname('https://novy-web.ccn-dev.cz'),'novy-web');
 const response=await handleForms(new Request('https://template.ccn-dev.cz/api/forms',{method:'OPTIONS',headers:{Origin:'https://novy-web.ccn-dev.cz'}}),{});
 assert.equal(response.status,204);assert.equal(response.headers.get('Access-Control-Allow-Origin'),'https://novy-web.ccn-dev.cz');
});
test('Preview needs only recipient configuration and never inherits a different project recipient',async()=>{
 const {buildForms,resolveForm}=await import('../server/forms-config.mjs');
 const registry=buildForms({alpha:['a@example.com'],beta:['b@example.com','c@example.com']},{});
 const alpha=resolveForm('https://alpha.ccn-dev.cz','contact',registry),beta=resolveForm('https://beta.ccn-dev.cz','contact',registry);
 assert.deepEqual(alpha.to,['a@example.com']);assert.deepEqual(beta.to,['b@example.com','c@example.com']);
 assert.match(alpha.subject,/^\[TEST\]/);assert.equal(resolveForm('https://alpha.ccn-dev.cz','beta-contact',registry),null);
 assert.equal(resolveForm('https://unknown.ccn-dev.cz','contact',registry),null);
 const {env,map}=setup();assert.equal((await handleForms(request({...body(),formId:'contact'},{headers:{Origin:'https://unknown.ccn-dev.cz'}}),env,verify)).status,403);assert.equal(map.size,0);
});
test('Production recipient is separate and requires an exact approved domain',async()=>{
 const {buildForms,resolveForm,allowedOrigin}=await import('../server/forms-config.mjs');
 const registry=buildForms({alpha:['tester@example.com']},{'alpha-live':{origins:['https://client.example'],to:['client@example.com'],name:'Client'}});
 const live=resolveForm('https://client.example','contact',registry);
 assert.deepEqual(live.to,['client@example.com']);assert.equal(live.mode,'production');assert(!live.subject.includes('[TEST]'));
 assert.equal(resolveForm('https://alpha.ccn-dev.cz','contact',registry).mode,'preview');
 assert.equal(allowedOrigin('https://www.client.example',registry),false);
 assert.throws(()=>buildForms({}, {bad:{origins:['https://alpha.ccn-dev.cz'],to:['client@example.com']}}));
 assert.throws(()=>buildForms({alpha:[]},{}));
});
