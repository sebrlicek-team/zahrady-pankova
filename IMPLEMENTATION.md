# Nový klientský web ze šablony CCN

Tento návod je zadání i pracovní postup pro člověka a asistenta. Zdroj: https://github.com/CCNplus/ccn-web-template. Živý katalog: https://template.ccn-dev.cz/.

## 1. Zkopírujte toto první zadání

```text
Vytvoř web pro [NÁZEV KLIENTA] ze šablony CCNplus/ccn-web-template.
Pracuj podle jejího IMPLEMENTATION.md a AGENTS.md.

Nový klientský repozitář: CCNplus/[NAZEV-WEB]. Pokud neexistuje, vytvoř ho jako soukromou kopii přes Use this template. Existující repozitář nepřepisuj; nejprve prohlédni jeho obsah a navrhni bezpečné začlenění.
Obor a nabídka: [CO KLIENT DĚLÁ].
Cíl webu a hlavní akce návštěvníka: [NAPŘ. TELEFONICKÁ POPTÁVKA].
Cíloví návštěvníci: [PRO KOHO JE WEB].
Podklady: [ODKAZY NEBO PŘILOŽENÉ SOUBORY, STÁVAJÍCÍ WEB].
Vizuální směr: [LOGO, BARVY, INSPIRACE; NEBO NAVRHNI].
Pracovní adresa: [KLIENT].ccn-dev.cz.
Finální doména: [DOMÉNA NEBO ZATÍM NEZNÁMÁ].
Kontakty a adresa provozovny: [SKUTEČNÉ ÚDAJE NEBO DOPLNÍME].
Formulář: [ANO / NE]. Testovací příjemci: [E-MAILY NEBO ZEPTEJ SE]. Ostrý příjemce u klienta: [E-MAIL NEBO DOPLNÍME PŘED SPUŠTĚNÍM].

Začni pouze iterací 1: připrav brief a návrh struktury. Neimplementuj celý web najednou. Chybějící nezásadní údaje označ k doplnění a pokračuj; otázky spoj do jednoho krátkého seznamu. Nevymýšlej skutečné reference, recenze, certifikace ani údaje o firmě. Po každé iteraci ulož stav do docs/PROJECT.md a ukaž výsledek k připomínkám. Do další iterace pokračuj až na můj pokyn. Katalog šablony a jiné klientské weby neměň.
```

Nevyplněné položky nejsou souhlas s použitím vymyšlených faktů. API klíče, hesla ani jiné přístupové údaje nevkládejte do zadání nebo repozitáře.

## 2. Postup po iteracích

### Iterace 1 — zadání a struktura

Prohlédnout zdrojovou šablonu a dodané podklady. Ověřit skutečný přístup k repozitářům; pokud chybí, popsat přesnou překážku. Zapsat brief, hlavní cíl, seznam stránek, pořadí sekcí, použité moduly, potřebná média a nevyřešené otázky do `docs/PROJECT.md`. Zaznamenat zdrojový commit šablony. Výstup: srozumitelný návrh struktury, bez domýšlení finálního designu a obsahu.

Další zadání:
```text
Strukturu schvaluji s těmito úpravami: [ÚPRAVY NEBO BEZE ZMĚN]. Pokračuj iterací 2. Připrav funkční úvodní stránku a lokální náhled.
```

### Iterace 2 — vizuální směr a úvodní stránka

V klientském repozitáři zkopírovat nejbližší sestavu do `sites/klient.json`. Vybrat barvy, typografii, hero a hlavní akci. Sestavit hlavičku, úvod, nabídku a kontakt; ukázat desktop i mobil. Ostatní stránky lze zatím vynechat, ale všechny zobrazené odkazy musí fungovat. Chybějící média jasně označit jako ilustrační. Do určení testovacích příjemců formulář `demo`; po jejich zadání společný režim `server` podle docs/FORMS.md. Indexace vypnutá. Výstup: skutečný lokální náhled, ne jen popis návrhu.

Další zadání:
```text
Vizuální směr schvaluji s těmito úpravami: [ÚPRAVY]. Pokračuj iterací 3: doplň schválené stránky, obsah a skutečné podklady.
```

### Iterace 3 — kompletní obsah a podstránky

Doplnit reference, služby, produkty a příslušné detaily. Použít jen relevantní moduly; všech 16 není povinných. Vložit dodané kontakty, média a dokumenty, ověřit adresu mapy. Dokončit navigaci, odkazy mezi stránkami, titulky a popisy. Sepsat vše, co ještě musí dodat klient. Výstup: celý průchozí web; chybějící obsah výslovně označen.

Další zadání:
```text
Pokračuj iterací 4. Otestuj celý web a nasaď pracovní náhled na [KLIENT].ccn-dev.cz. Indexaci nech vypnutou. Formulář připoj pro testování na dříve zadané testovací e-maily; pokud chybí, zeptej se.
```

### Iterace 4 — kontrola a pracovní nasazení

Spustit testy i sestavení aktivní klientské konfigurace. Ověřit mobil, klávesnici, menu, FAQ, filtry, galerii, video, mapu, dokumenty a stránku 404 podle skutečně použitých modulů. Zkontrolovat kontakty a zapojit formulář na schválené testovací adresy podle docs/FORMS.md. Subdomény ccn-dev.cz jsou povolené společně; do centrálního registru stačí přidat subdoménu a příjemce. Pokud příjemci chybí, zeptat se a nenahrazovat je kontakty klienta. Ověřit testovací doručení s předmětem [TEST]. Opravit chyby, založit samostatný Worker a připojit pracovní subdoménu. Po nasazení ověřit skutečnou živou adresu a vypnutou indexaci. Pokud není přístup do Cloudflare, předat přesné hodnoty polí a označit nasazení jako nedokončené. Výstup: odkaz na pracovní verzi a přehled zbývajících věcí.

Další zadání pro připomínky:
```text
Zapracuj pouze tyto připomínky: [SEZNAM]. Zachovej schválený zbytek webu. Ověř dotčené části a aktualizuj pracovní náhled i docs/PROJECT.md. Zatím nespouštěj ostrou doménu.
```

### Iterace 5 — ostré spuštění a předání

Spouštět až na výslovné zadání uživatele. Předem připravit a ukázat konkrétní zbývající kroky. Není nutné žádat znovu o již udělené oprávnění. Nasazení nesmí být označeno za hotové, dokud není ověřené.

Zadání:
```text
Spusť schválený web na [FINÁLNÍ DOMÉNA]. Zvol hlavní variantu [S WWW / BEZ WWW] a přesměruj druhou se zachováním cesty. Kontakt bude [BEZ FORMULÁŘE / SPOLEČNÝ SERVEROVÝ FORMULÁŘ / MAILTO]. Ostré zprávy posílej na [KLIENTSKÉ E-MAILY]; testovací adresy zachovej odděleně. Zapni indexaci ostré domény a ověř ji po nasazení. Pracovní doména nesmí zobrazovat druhou indexovatelnou kopii: navrhni a proveď v rámci autorizovaného přístupu její přesměrování nebo oddělení. Předání zapiš do docs/PROJECT.md.
```

Kontrola spuštění:
- Skutečná HTTPS doména v `url`, správný Worker a aktivní klientská konfigurace.
- `indexable: true` pouze pro finální veřejný web. Kontrola robots.txt, sitemap.xml, canonical, meta robots a X-Robots-Tag na živé adrese.
- Nahrazené ukázkové texty, adresy `.invalid`, zástupné fotografie a smyšlené recenze.
- Formulář vědomě vyřešen: `mailto` otevírá poštovní aplikaci; serverové odesílání lze zapojit podle docs/FORMS.md a je nutné ověřit doručení. Při vypnutí nastavte `form: null` a ponechte skutečné kontakty.
- Funkční HTTPS, hlavní doména a přesměrování, podstránky a 404. Při změnách DNS zachovat poštovní záznamy.
- Pracovní subdoména: `indexable` platí pro celý build, nikoli pro konkrétní hostname. Pokud obě domény ukazují na stejný Worker, nelze je tímto přepínačem odlišit. Přesměrujte pracovní adresu na finální, odpojte ji, nebo použijte samostatný preview Worker s noindex. Zkontrolujte také dostupné workers.dev/preview adresy.
- Předat umístění zdrojů, aktivní konfiguraci, postup úprav a případné nevyřešené body. Povolení indexace není záruka zařazení vyhledávačem.

## 3. Technická pravidla pro realizaci

- Klient má vlastní repozitář a Worker. Kopie nejsou automaticky synchronizované se šablonou.
- `sites/klient.json`: obsah, pořadí modulů, navigace, metadata, barvy. Nezapomenout vybrat tuto konfiguraci i v Cloudflare.
- `public/assets/`: obrázky a videa; `public/documents/`: dokumenty. Lokální soubor max. 25 MiB. Do public nikdy nepatří technické soubory ani tajné údaje.
- `src/modules/`: stávající moduly použít před psaním nového. CSS a chování měnit v klientské kopii. Změny společné šablony řešit samostatně, bez přepisování jiných klientů.
- Každá stránka má jedinečnou cestu a právě jeden hero. Při odebrání sekce opravit odkazy na její kotvu.
- Ručně neupravovat `dist/`. Nevytvářet nový framework nebo CMS bez konkrétní potřeby.
- Náhled: `npm run dev -- klient`; po úpravách znovu sestavit nebo restartovat server.
- Ověření a Cloudflare Build command: `npm test && npm run build -- klient`.
- Deploy command: `npx wrangler deploy`. Jméno projektu musí odpovídat `name` ve `wrangler.jsonc`; assets musí směřovat do `./dist`.
- Testy šablony pokrývají ukázkové sestavy. Každou novou klientskou sestavu navíc samostatně sestavit a projít; úspěšné testy samy nedokazují její správnost.
- Noindex není ochrana přístupu. Důvěrné náhledy vyžadují skutečné omezení přístupu.

## 4. Pracovní paměť projektu

Při zahájení nové zakázky vytvořte `docs/PROJECT.md` podle následující osnovy. Udržujte ji po každé iteraci; schválení zapište jen tehdy, když je uživatel skutečně poskytl.

```markdown
# Projekt: [klient]
## Zadání a zdroje
- Cíl, návštěvníci, hlavní akce:
- Zdrojový template commit:
- Klientský repozitář, aktivní konfigurace, Worker:
- Podklady a jejich původ:
- Pracovní / finální adresa:
## Struktura a zvolený vzhled
- Stránky a moduly:
- Barvy, typografie, média:
## Schválená rozhodnutí
- Co, kdy a na základě jakého pokynu:
## Aktuální iterace a hotová práce
- Iterace:
- Implementace, commit, náhled:
## Chybějící podklady a otevřené otázky
- Položka / kdo dodá / dopad:
## Ověření
- Datum, konfigurace, testy, prohlížeč a skutečný výsledek:
- Formulář: testovací subdoména a příjemci / ostrá doména a příjemci / ověřené doručení a Reply-To:
- Indexace pracovní / finální adresy:
## Další krok
- Co následuje a zda už bylo zadáno:
```

## 5. Navázání v nové konverzaci

```text
Pokračujeme na webu [KLIENT], repozitář [ODKAZ]. Přečti AGENTS.md, IMPLEMENTATION.md a docs/PROJECT.md. Shrň aktuální stav a pokračuj pouze touto iterací/úpravou: [ZADÁNÍ]. Respektuj dříve schválená rozhodnutí. Nezačínej znovu a neměň jiné klientské weby.
```

Další technické podrobnosti: [moduly](docs/MODULES.md), [nasazení](docs/DEPLOYMENT.md).

## Příprava nového klientského projektu

V samostatné klientské kopii po založení repozitáře spusťte:

```sh
npm run setup -- --slug novy-klient --name "Název klienta" --url https://novy-klient.ccn-dev.cz --from milacek
npm test
npm run build
```

`--from` vybírá výchozí sestavu (výchozí `milacek`). Slug použijte také jako název Workeru v Cloudflare. Setup vytvoří `project.json`, klientskou sestavu a `docs/PROJECT.md`; nastaví statický Worker, pracovní URL a vypnutou indexaci. Nespouští nasazení, nevytváří DNS ani nepřipojuje doménu. Ukázkový obsah je nutné nahradit. Formuláře jsou demo bez odesílání; klientská kopie nenasazuje centrální formulářový server.

Pro Cloudflare použijte build `npm test && npm run build` a deploy `npx wrangler deploy`. Nepřidávejte starý argument sestavy ani proměnnou SITE. `npm run dev` také automaticky vybere klienta. Bez `project.json` zůstává původní chování katalogu a explicitních sestav zachováno.

Setup odmítne přepsat již připravený projekt. Následné změny adresy nebo názvu proveďte shodně v `project.json` a aktivním `sites/*.json`; změnu názvu Workeru také ve `wrangler.jsonc`. Build kontroluje jejich shodu. Konfigurace Workeru vytvořená setupem je JSON bez komentářů.

Ostré spuštění je samostatný krok na výslovný pokyn: v `project.json` změňte `stage` na `production`, sjednoťte skutečnou URL a nastavte indexaci podle pravidel spuštění. Samotná změna fáze indexaci nezapíná.

## Výchozí nastavení náhledů Cloudflare

Při založení každého nového projektu vypněte `Enable Preview builds` / `Builds for Preview branches` a ponechte automatické nasazování `main`. Ověřte a zaznamenejte stav do docs/PROJECT.md. Nastavení se nekopíruje s GitHub šablonou; přesný postup a rozlišení od pracovní subdomény a indexace jsou v [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md#cloudflare-náhledy-větví-standardně-vypnuté). Formuláře kvůli této volbě neměňte.
