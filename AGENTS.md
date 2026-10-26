# Pokyny pro práci se šablonou CCN

## Indexace při spuštění webu

Při každém ostrém spuštění klientského webu povinně zkontrolujte indexaci. Tento krok nesmí zůstat opomenutý.

- Katalog template.ccn-dev.cz a pracovní náhledy ponechte s `indexable: false`.
- Při uživatelem požadovaném ostrém spuštění veřejného klientského webu nastavte v aktivní konfiguraci `sites/*.json` skutečnou HTTPS doménu v `url` a `indexable: true`, pokud uživatel výslovně nechce web neindexovat.
- Před zapnutím nahraďte ukázkový obsah a kontakty a vyřešte demo formulář podle docs/DEPLOYMENT.md.
- Po nasazení ověřte na skutečné doméně robots.txt, sitemap.xml, canonical, meta robots a HTTP hlavičku X-Robots-Tag. Ostrý indexovatelný web nesmí obsahovat noindex ani zákaz procházení.
- V předání uveďte, zda byla indexace zapnutá a ověřená. Pokud není možné ověření, výslovně to označte jako zbývající krok.
- Povolení indexace nezaručuje zařazení do výsledků vyhledávání. Noindex není ochrana důvěrných dat.


## Nové klientské projekty a iterace

Při tvorbě klientského webu z tohoto základu postupujte podle IMPLEMENTATION.md. Založte a udržujte docs/PROJECT.md se zadáním, schválenými rozhodnutími, aktivní konfigurací, stavem ověření a dalším krokem. Respektujte uživatelem zadaný rozsah iterace; nepovažujte podklady nebo návrhy za schválení. Klientské úpravy provádějte v jeho kopii, nikoli v katalogu šablony.

## Formuláře: testovací a ostrý provoz

- Používejte centrální odesílání podle docs/FORMS.md. V klientském webu stačí form.mode=server; výchozí endpoint, sitekey a action contact jsou společné.
- Pro testovací weby pod ccn-dev.cz je Turnstile povolen společně. Při přípravě formuláře zjistěte testovací příjemce: použijte už zadané adresy, jinak se zeptejte. Nevymýšlejte je a nepřebírejte automaticky příjemce katalogu ani kontakty klienta.
- Do previewRecipients v centrálním CCNplus/ccn-web-template přidejte subdoménu a schválené e-maily. Příjemce nikdy neurčuje prohlížeč. Neznámý web nemá výchozího příjemce. Testovací zprávy mají [TEST].
- Při ostrém spuštění ověřte finální doménu a klientské příjemce, založte oddělený productionForms záznam a povolte finální doménu v Turnstile. Zachovejte testovací nastavení odděleně. Ověřte doručení a Reply-To; zapište výsledky do docs/PROJECT.md.
- Odesílatel zůstává forms@ccn.cz, pokud nebyla zvlášť dohodnuta a ověřena klientská odesílací doména. Změna příjemce nevyžaduje nový Resend účet.

## Automatická příprava klienta

V nové klientské kopii použijte `npm run setup -- --slug klient --name "Název klienta" --url https://klient.ccn-dev.cz --from milacek` podle IMPLEMENTATION.md. Nevytvářejte ručně odlišná jména Workeru a sestavy. Pro klienta s project.json používejte build bez argumentu a bez starého SITE. Setup neopakujte v rozpracovaném projektu a nepoužívejte jej v centrálním katalogu.

## Výchozí nastavení náhledů Cloudflare

Při založení každého nového projektu vypněte `Enable Preview builds` / `Builds for Preview branches` a ponechte automatické nasazování `main`. Ověřte a zaznamenejte stav do docs/PROJECT.md. Nastavení se nekopíruje s GitHub šablonou; přesný postup a rozlišení od pracovní subdomény a indexace jsou v [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md#cloudflare-náhledy-větví-standardně-vypnuté). Formuláře kvůli této volbě neměňte.
