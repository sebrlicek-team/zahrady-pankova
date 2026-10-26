# Společné odesílání formulářů — test a produkce

Centrální služba běží ve Workeru `ccn-web-template`, endpoint `https://template.ccn-dev.cz/api/forms`. Další weby volají stejnou službu. Příjemce se nikdy neposílá z prohlížeče.

## Testovací web na ccn-dev.cz

Turnstile widget **CCN web forms** má povolenou kořenovou doménu `ccn-dev.cz`, která podle Cloudflare automaticky pokrývá její subdomény. Backend akceptuje pouze přesné HTTPS origins bez vlastního portu; nepovolí podobně pojmenované cizí domény. Samotné povolení domény neznamená, že web má příjemce.

Při založení webu se asistent zeptá na testovací e-maily, pokud je uživatel už nedodal. Do `previewRecipients` v **centrálním** `server/forms-config.mjs` přidá pouze subdoménu a schválené příjemce:

```js
export const previewRecipients = {
  template: ['arnost.stepanek@gmail.com'],
  // 'nazev-klienta': ['schvaleny-tester@example.com'],
};
```

Ukázková zakomentovaná adresa se nesmí nasadit jako skutečný příjemce. Pro jeden web lze zadat 1–5 adres; opakované adresy se odstraní. Nenastavený web nic neodešle a nepřevezme Gmail katalogu. Nastavení testovacích adres neměňte automaticky podle veřejného kontaktního e-mailu klienta.

V klientské konfiguraci stačí `form: { "mode": "server" }`. Veřejné výchozí hodnoty v `src/lib/form-config.mjs` zajistí centrální endpoint, action `contact` a sitekey. Tajné klíče jsou jen na centrálním Workeru. Každá nová subdoména už nepotřebuje samostatné přidání v Turnstile.

Příjemce se určuje podle ověřené domény, nikoli podle uživatelem zadaného ID. Zprávy nesou `[TEST]` v předmětu, název subdomény a označení TESTOVACÍ WEB v těle. Reply-To je e-mail návštěvníka. Server vyžaduje shodu Turnstile hostname s origin a action s formulářem. Původní action `template-contact` zůstává dočasně kompatibilní pouze s katalogem pro již otevřené karty.

## Ostré spuštění

Do `productionForms` přidejte samostatný záznam s finální HTTPS doménou/doménami a klientskými adresami. Testovací záznam se nepřepisuje. Ostrý příjemce se nesmí odhadnout z testovacího příjemce.

```js
export const productionForms = {
  // 'klient-live': {
  //   origins: ['https://klient.example'],
  //   to: ['schvaleny-klient@example.com'],
  //   name: 'Klient',
  //   subject: 'Nová poptávka z webu',
  //   dailyLimit: 20,
  // },
};
```

Přidat finální hostname do Turnstile a nasadit registr. Případné www se povoluje výslovně, pokud skutečně obsluhuje formulář; přesměrované www nemusí mít formulář. Po spuštění ověřit doručení klientovi a Reply-To. Klientský web stále používá společné API a action contact. Zprávy z produkce nemají `[TEST]`; testovací subdoména si ponechá testovací příjemce. Pracovní web přesměrovat nebo ponechat oddělený s noindex podle zadání.

Odesílatel zatím zůstává `forms@ccn.cz`, mění se zobrazovaný název. Odesílání z klientovy vlastní domény je samostatná volba vyžadující její ověření v Resendu. Přesun webu na klientskou doménu nevyžaduje přesun celé služby do jeho Resend účtu.

## Provoz a limity

- Runtime secrets: `RESEND_API_KEY` (cloudflare-forms, sending_access pouze ccn.cz) a `TURNSTILE_SECRET_KEY`. Neukládat do GitHubu ani klientského JavaScriptu.
- Začáteční strop je 20 adresátů/UTC den celkem a 20 na formulář, dále 3 podání z jedné IP/10 minut. Podání se třemi příjemci spotřebuje tři jednotky denního limitu. Se zapojením dalších webů kapacitu upravit podle skutečného plánu a fakturace. Resend účet sdílí limity s fakturami.
- Před HTTP 202 se zpráva, počítadla a alarm společně uloží do Durable Object `FormsOutbox`. Potvrzení znamená přijetí, nikoli doručení do schránky.
- Dočasné chyby a 429 se opakují nejvýše osmkrát se stejným idempotency key, nejdéle 20 hodin kvůli 24hodinovému oknu Resendu. Ostatní chyby 4xx označí zprávu failed.
- Po přijetí Resendem se obsah v Cloudflare odstraní; metadata pro deduplikaci zůstávají 30 dní. Neodeslaný obsah zůstává 30 dní pro vyřešení problému. Historie v Resendu má vlastní retenci.
- Worker logs obsahují ID a kódy chyb, nikoli obsah či klíče. Hledejte `forms_sent`, `forms_delivery_failed`, `forms_delivery_expired`, `forms_request_failed`. Skutečné doručení/bounce kontrolujte v Resendu. Automatické upozornění na failed ani administrační rozhraní zatím nejsou součástí služby.
- Kopie šablony pro klienta nemá provozovat vlastní centrální registr. Použije společný endpoint a může být čistě statická: v její vlastní konfiguraci Wrangler odstranit main, durable_objects, migrations a assets.binding/run_worker_first. Centrální konfiguraci neměnit při klientských úpravách kromě požadované registrace příjemců.

## Ověření

`npm test` kontroluje sestavy, validaci, podvržené domény, Turnstile, izolaci příjemců, deduplikaci, limity a opakování. Při nasazení navíc projít skutečný formulář a potvrdit konkrétní zprávu v Resendu. Produkční klíče Turnstile nenahrazovat testovacími kvůli ověření.

Dokumentace hostname chování: https://developers.cloudflare.com/turnstile/additional-configuration/hostname-management/
