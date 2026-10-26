const normalise = text => text.toLocaleLowerCase('cs').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
if(menu && nav){
 menu.hidden=false;
 document.documentElement.classList.add('enhanced');
 const close=()=>{menu.setAttribute('aria-expanded','false');nav.classList.remove('open');};
 menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
 nav.addEventListener('click',event=>{if(event.target.closest('a'))close();});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('open')){close();menu.focus();}});
 matchMedia('(min-width: 761px)').addEventListener('change',close);
}
for(const group of document.querySelectorAll('.collection')){
 const controls=group.querySelector('.collection-controls');if(!controls)continue;
 controls.hidden=false;
 const cards=[...group.querySelectorAll('[data-card]')];let category='';
 const update=()=>{const query=normalise(controls.querySelector('input').value.trim());let count=0;for(const card of cards){card.hidden=!( (!category||category===card.dataset.category) && normalise(card.dataset.search).includes(query));if(!card.hidden)count++;}group.querySelector('[data-count]').textContent=`Počet položek: ${count}`;group.querySelector('[data-empty]').hidden=count>0;};
 controls.addEventListener('input',update);
 controls.addEventListener('click',event=>{const button=event.target.closest('[data-filter]');if(!button)return;category=button.dataset.filter;controls.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));update();});update();
}
for(const gallery of document.querySelectorAll('[data-gallery]')){
 const links=[...gallery.querySelectorAll('[data-photo]')],dialog=gallery.querySelector('dialog');let index=0,opener;
 const show=delta=>{index=(index+delta+links.length)%links.length;const img=dialog.querySelector('[data-large]');img.src=links[index].href;img.alt=links[index].querySelector('img').alt;dialog.querySelector('[data-position]').textContent=`${index+1} / ${links.length}`;};
 links.forEach((a,i)=>a.addEventListener('click',event=>{event.preventDefault();opener=a;index=i;show(0);dialog.showModal();document.body.classList.add('modal-open');dialog.querySelector('[data-close]').focus();}));
 dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
 dialog.querySelector('[data-prev]').addEventListener('click',()=>show(-1));dialog.querySelector('[data-next]').addEventListener('click',()=>show(1));
 dialog.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();show(event.key==='ArrowLeft'?-1:1);}});
 dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');opener?.focus();});
 if(links.length<2)dialog.querySelectorAll('[data-prev],[data-next]').forEach(b=>b.hidden=true);
}
for(const box of document.querySelectorAll('[data-video]')){
 const video=box.querySelector('video'),button=box.querySelector('button'),reduce=matchMedia('(prefers-reduced-motion: reduce)');let loaded=false,wants=!reduce.matches;
 const update=()=>{button.textContent=video.paused?'Přehrát video':'Pozastavit video';};
 const play=()=>{if(!loaded){video.querySelector('source').src=video.querySelector('source').dataset.src;video.load();loaded=true;}video.play().catch(update);};
 button.hidden=false;button.addEventListener('click',()=>{wants=video.paused;if(wants)play();else video.pause();});
 video.addEventListener('play',update);video.addEventListener('pause',update);
 video.querySelector('source').addEventListener('error',()=>{button.textContent='Video není dostupné';button.disabled=true;});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();else if(wants)play();});
 reduce.addEventListener('change',event=>{wants=!event.matches;if(wants&&!document.hidden)play();else video.pause();});
 if(wants&&!document.hidden)play();
}
for(const box of document.querySelectorAll('[data-embed]')){
 const button=box.querySelector('button');button.hidden=false;let frame;
 button.addEventListener('click',()=>{if(frame){frame.remove();frame=null;box.querySelector('img').hidden=false;button.textContent='Načíst externí video';return;}frame=document.createElement('iframe');frame.src=box.dataset.src;frame.title=box.dataset.title;frame.allow='fullscreen; picture-in-picture';frame.allowFullscreen=true;box.querySelector('img').hidden=true;box.prepend(frame);button.textContent='Zavřít video';});
}
let turnstileReady;
const loadTurnstile=()=>turnstileReady ||= new Promise((resolve,reject)=>{
 if(window.turnstile){resolve(window.turnstile);return;}
 window.ccnTurnstileReady=()=>resolve(window.turnstile);
 const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?onload=ccnTurnstileReady&render=explicit';script.async=true;script.defer=true;
 script.onerror=()=>reject(new Error('Ověření proti spamu se nepodařilo načíst. Obnovte stránku nebo použijte kontaktní e-mail.'));document.head.append(script);
});
for(const form of document.querySelectorAll('[data-contact]')){
 const button=form.querySelector('button'),status=form.querySelector('[data-form-status]');
 const live=form.dataset.mode==='server';let token='',widgetId,busy=false,requestId=crypto.randomUUID(),lastFields='';
 button.hidden=false;
 if(live){
  button.disabled=true;status.textContent='Načítáme ověření proti spamu…';
  loadTurnstile().then(turnstile=>{
   widgetId=turnstile.render(form.querySelector('[data-turnstile]'),{
    sitekey:form.dataset.sitekey,action:form.dataset.formId,language:'cs',size:'flexible',
    callback:value=>{token=value;if(!busy){button.disabled=false;if(status.textContent==='Načítáme ověření proti spamu…'||status.textContent==='Obnovujeme ověření proti spamu…')status.textContent='';}},
    'expired-callback':()=>{token='';button.disabled=true;status.textContent='Obnovujeme ověření proti spamu…';turnstile.reset(widgetId);},
    'error-callback':()=>{token='';button.disabled=true;status.textContent='Ověření proti spamu se nezdařilo. Obnovte stránku nebo použijte kontaktní e-mail.';},
   });
  }).catch(error=>{status.textContent=error.message;});
 }
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy||!form.reportValidity())return;
  const data=new FormData(form);
  const fields=Object.fromEntries(['name','email','phone','message'].map(key=>[key,String(data.get(key)||'').trim()]));
  if(!fields.name||!fields.message){status.textContent='Vyplňte jméno a zprávu.';return;}
  if(form.dataset.mode==='demo'){status.textContent='Ukázka je vyplněná správně. Nic nebylo odesláno.';return;}
  if(live){
   if(!token){status.textContent='Počkejte na ověření proti spamu.';return;}
   const signature=JSON.stringify(fields);if(lastFields&&lastFields!==signature)requestId=crypto.randomUUID();lastFields=signature;
   busy=true;button.disabled=true;button.textContent='Odesíláme…';status.textContent='Odesíláme vaši zprávu…';
   let accepted=false;
   try{
    const response=await fetch(form.dataset.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...fields,formId:form.dataset.formId,requestId,token,website:String(data.get('website')||'')}),signal:AbortSignal.timeout(20_000)});
    const result=await response.json();
    if(!response.ok||!result.ok)throw new Error(result.message||'Zprávu se nepodařilo přijmout. Zkuste to znovu.');
    accepted=true;form.reset();requestId=crypto.randomUUID();lastFields='';
    status.textContent='Zprávu jsme přijali. Děkujeme, ozveme se vám.';
   }catch(error){status.textContent=error.name==='TimeoutError'||error instanceof TypeError?'Přijetí zprávy se nepodařilo potvrdit. Zkuste odeslání znovu; opakovaný pokus nevytvoří duplicitní zprávu.':error.message;}
   finally{
    busy=false;token='';button.textContent='Odeslat zprávu';
    // Preserve the result while the widget refreshes in the background.
    const message=status.textContent;
    window.turnstile?.reset(widgetId);
    status.textContent=message;
    if(accepted){button.hidden=true;form.addEventListener('input',()=>{button.hidden=false;},{once:true});}
   }
   return;
  }
  const body=`Jméno: ${fields.name}\nE-mail: ${fields.email}\nTelefon: ${fields.phone}\n\n${fields.message}`;
  window.location.href=`mailto:${form.dataset.recipient}?subject=${encodeURIComponent(form.dataset.subject)}&body=${encodeURIComponent(body)}`;
  status.textContent='Připravili jsme e-mail. Odeslání potvrďte ve své e-mailové aplikaci. Pokud se neotevřela, použijte kontaktní adresu.';
 });
}

for(const box of document.querySelectorAll('[data-map]')){
 const button=box.querySelector('button');button.hidden=false;let frame;
 button.addEventListener('click',()=>{if(frame){frame.remove();frame=null;button.textContent='Načíst mapu';return;}frame=document.createElement('iframe');frame.src=box.dataset.src;frame.title='Mapa: '+box.dataset.title;frame.referrerPolicy='no-referrer';box.prepend(frame);button.textContent='Zavřít mapu';});
}
