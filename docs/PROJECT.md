# Projekt: Zahradní centrum Kumburský Újezd / Ing. Lucie Pánková

## Zadání a zdroje
- Datum iterace 1: 26. 10. 2026.
- Rozsah zadání: pouze průzkum, brief a návrh struktury. Tento dokument je návrh k připomínkám, nikoli schválená struktura nebo finální obsah.
- Klient: Zahradní centrum Kumburský Újezd / Ing. Lucie Pánková – realizace zahrad.
- Navržený cíl: usnadnit návštěvu zahradního centra a získat relevantní telefonické poptávky návrhů a realizací zahrad.
- Navržení návštěvníci: lidé vybírající rostliny a zahradnické potřeby z okolí Nové Paky; vlastníci zahrad; firmy a veřejní zadavatelé zeleně. Přesnou obsluhovanou oblast klient potvrdí.
- Hlavní akce podle záměru: „Jak k nám“ / „Zavolat do zahradního centra“ a „Poptat zahradu“ / „Zavolat pro realizaci“. Zatím bez odesílání formuláře.
- Zdroj: https://github.com/CCNplus/ccn-web-template
- Zdrojový commit: 680b459c32b09ffd9cff88324e42560e869ac522; tree 927e7a55f029b740e62f86841d5a3ffaa4ed904e.
- Skutečný přístup ověřen čtením AGENTS.md, IMPLEMENTATION.md, docs/MODULES.md, setup skriptu a kompletních 56 zdrojových souborů na uvedeném commitu.
- Klientský repozitář: https://github.com/CCNplus/zahrady-pankova – existující soukromý repozitář byl před zápisem ověřen jako prázdný. Kopie se plní skutečnými soubory šablony prostřednictvím GitHub API; nejde o přepis vzhledu ani fork. Use this template nebylo použito, protože cílový repozitář už existoval.
- Aktivní konfigurace: sites/zahrady-pankova.json; project.json; Worker zahrady-pankova; stage preview.
- Pracovní URL: https://zahrady-pankova.ccn-dev.cz
- Kandidát finální domény podle starého webu: https://www.zahrady-pankova.cz – potvrdit hlavní variantu s/bez www, nyní nic nepřepojovat.

### Prohlédnuté podklady a zjištění
Podklady byly nalezeny podle názvu klienta a přečteny 26. 10. 2026. Starý web je identifikovaný zdroj, jeho aktuální obchodní údaje musí potvrdit klient.
1. https://www.zahrady-pankova.cz/ – současné rozcestí, představení činnosti, sezónní zprávy, informace o parkování a nábor. O nás je součást úvodu; /uvodni-stranka.htm přesměrovává na úvod.
2. https://www.zahrady-pankova.cz/zahradni-centrum.htm – rostliny, dřeviny, ovocné stromky, doplňky, substráty a hnojiva; rozsáhlé fotografie; sezónní prodej včetně vánočních stromků. Navrhujeme přehled kategorií, nikoli e-shop nebo příslib aktuální skladovosti.
3. https://www.zahrady-pankova.cz/realizace-zahrad.htm – návrhy a realizace soukromé, firemní a veřejné zeleně; trávníky, jezírka, výsadby, kameny a navazující péče. Podmíněnou nabídku návrhu zdarma zatím nepřebírat bez potvrzení.
4. https://www.zahrady-pankova.cz/fotogalerie.htm – podzimní fotografie rostlin. Neoznačovat je automaticky jako reference dokončených zahrad; chybí názvy, lokality a popisy zakázek.
5. https://www.zahrady-pankova.cz/kontakt.htm – oddělené kontakty pro centrum a realizace; fakturační údaje a původní formulář. Centrum: +420 608 155 402, prodejna@zahrady-pankova.cz. Realizace: +420 608 155 480, pankova@zahradypankova.cz (druhá e-mailová doména je bez pomlčky; nezaměňovat).
   - Fakturační sídlo podle zdroje: Ing. Lucie Pánková, Nová Ves nad Popelkou 16, 512 71; IČ 74480448, DIČ CZ8053203466. Odlišit od adresy provozovny.
   - Starý rozpis uvádí hlavní sezónu březen–prosinec denně 8–18 a zavřeno 24. 12.–28. 2.; překryv v prosinci a přestupný únor vyžadují potvrzení přesných pravidel.
6. https://www.zahrady-pankova.cz/gdpr-ochrana-osobnich-udaju.htm – existující text ochrany údajů je podklad k nové revizi podle skutečného řešení. Nepřenášet automaticky uvedené externí služby a marketingové účely.
- Doplňkový zdroj adresy provozovny: https://www.firmy.cz/detail/12847668-zahradni-centrum-ing-lucie-pankova-nova-paka-kumbursky-ujezd.html uvádí Kumburský Újezd 93, 509 01 Nová Paka. Před vložením mapy ověřit správný vjezd a bod provozovny.
- Mezi stránkami starého webu se liší letní/podzimní sezónní titulky. Aktuality i nábor před převzetím potvrdit. Starý blok EET navrhujeme nepřebírat; fakturační údaje ponechat samostatně.

## Struktura a zvolený vzhled
Následující pořadí je návrh, realizace stránek začne až po pokynu k iteraci 2. Společné header a footer převezmeme ze šablony.

| Stránka / cesta | Pořadí obsahu | Moduly šablony |
| --- | --- | --- |
| Úvod / | Jeden úvod se dvěma cestami → rozcestník centrum/realizace → krátká sezónní informace → představení Lucie Pánkové → výběr skutečných fotografií → návštěva a rychlé kontakty | hero, cards, split, split, gallery, location, contact |
| Zahradní centrum /zahradni-centrum/ | Úvod a návštěva → otevírací doba → kategorie sortimentu → sezónní nabídka → galerie centra → dotaz na dostupnost telefonem | hero, location, cards, split, gallery, contact |
| Návrhy a realizace /realizace-zahrad/ | Úvod a poptávka → přehled služeb → postup spolupráce → fotografie realizací → kontakty pro realizace | hero, cards, steps, gallery, contact |
| Fotogalerie /fotogalerie/ | Úvod → zahradní centrum a rostliny → samostatná galerie realizací, pokud bude doložená → kontakt | hero, gallery, gallery (podmíněně), cta |
| Kontakt /kontakt/ | Úvod → jasně oddělené kontakty centrum/realizace → provozovna a navigace, otevírací doba → fakturační údaje | hero, contact, location, specs |
| Ochrana osobních údajů /ochrana-osobnich-udaju/ | Úvod → revidovaný text podle skutečného provozu webu | hero, split |

- Navigace: Zahradní centrum, Návrhy a realizace, Fotogalerie, Kontakt; logo vede na úvod. O nás zatím jako sekce úvodu, ochrana údajů v patičce.
- Každá stránka bude mít právě jeden hero, vlastní titulek, popis a jednoznačná ID sekcí.
- Postup spolupráce je zatím obsahový záměr: konzultace → návrh → realizace → péče. Skutečné kroky a dostupnost péče potvrdí klient.
- Galerie realizací se objeví až s doloženými zakázkami. Samostatné detaily referencí nejsou součástí základního návrhu; lze doplnit po dodání podkladů.
- FAQ, recenze, číselné statistiky a loga partnerů zatím nenavrhujeme bez ověřeného obsahu.
- Aktuality lze obsloužit modulem split a obsahem v JSON; není navržen nový CMS. Neaktuální sezónní blok musí jít snadno vypnout.
- Vzhled není v iteraci 1 vybraný. Barvy, typografii a hero navrhneme v iteraci 2 po ověření značky. Výchozí milacek je pouze technická výchozí sestava.

### Média a migrace
- Potřebujeme čisté logo (ideálně SVG), fotografii centra pro úvod, 6–12 vybraných snímků sortimentu/areálu a 6–12 fotografií skutečných realizací s krátkými popisy. Portrét Lucie Pánkové pouze pokud jej dodá nebo schválí.
- Starý banner obsahuje vložený text a telefon. Pro nový responzivní hero preferujeme původní fotografii bez vložených nápisů. Podzimní fotografie jsou k dispozici na starém webu; soubory a jejich oprávněné použití ověřit při převzetí.
- Prohlédnuté příklady médií:
  - https://www.zahrady-pankova.cz/pool/vzor/banners/banner_zahradnictvi_pankova_leto_25587.jpg
  - https://www.zahrady-pankova.cz/pool/vzor/upload/chryzantemy_jicin.jpg
- V iteraci 1 se média nestahovala do klientského public. Budoucí obrázky patří do public/assets/, dokumenty do public/documents/; max. 25 MiB na soubor.
- Návrh přesměrování pro ostré spuštění: /uvodni-stranka.htm → /; /zahradni-centrum.htm → /zahradni-centrum/; /realizace-zahrad.htm → /realizace-zahrad/; /fotogalerie.htm → /fotogalerie/; /kontakt.htm → /kontakt/; /gdpr-ochrana-osobnich-udaju.htm → /ochrana-osobnich-udaju/. Před spuštěním projít úplný seznam starých URL a schválit mapu 301.

## Schválená rozhodnutí
Zadání uživatele z 26. 10. 2026:
- Použít skutečnou samostatnou kopii šablony, zachovat moduly, sites/*.json a Cloudflare assets z dist.
- Měnit pouze CCNplus/zahrady-pankova, nikoli šablonu ani ostatní klienty.
- Provést pouze iteraci 1 a potom počkat na připomínky.
- Pracovní adresa zahrady-pankova.ccn-dev.cz musí mít vypnutou indexaci.
- Formulář zatím nesmí odesílat e-maily. Pozdější instrukce šablony o testovacím serverovém formuláři nepovažovat za povolení k odesílání.
Struktura, obsah a vzhled navržené výše dosud schválené nejsou.

## Aktuální iterace a hotová práce
- Iterace 1: průzkum a návrh struktury dokončené, čeká na připomínky.
- Získána celá šablona z pevně zaznamenaného commitu, zachovány její kód a moduly.
- V klientské kopii jednorázově spuštěno:
  npm run setup -- --slug zahrady-pankova --name "Zahradní centrum Kumburský Újezd / Ing. Lucie Pánková" --url https://zahrady-pankova.ccn-dev.cz --from milacek
- Vygenerovány project.json, sites/zahrady-pankova.json, klientský wrangler.jsonc a tento projektový dokument.
- Konfigurace zatím obsahuje ukázkový obsah výchozí sestavy; nejde o návrh klientského designu nebo publikovatelnou verzi. Celý web se neimplementoval.
- Uložení: commit s názvem „Initialize client copy and document iteration 1“ (SHA je dohledatelná v historii repozitáře).
- Lokální build je pouze technická kontrola základu. Žádný pracovní web nebyl nasazen ani doména připojena.

## Chybějící podklady a otevřené otázky
1. Uživatel/klient: potvrdit navrženou strukturu a zda mají centrum a realizace stejnou prioritu.
2. Klient: potvrdit provozovnu, vjezd/mapový bod, kontakty, fakturační údaje a přesnou sezónní otevírací dobu.
3. Klient: potvrdit platnost návrhu zdarma, nabídky údržby, obsluhované oblasti, náboru a sezónních zpráv.
4. Klient: dodat logo a vybrat skutečné fotografie; pro reference doplnit názvy, popisy a souhlas s publikací.
5. Uživatel/klient před ostrým spuštěním: potvrdit finální doménu a variantu www, řešení formuláře a příjemce, obsah ochrany údajů.
- Testovací e-maily nyní nejsou nutné: odesílání je výslovně zakázáno. Nevytvářet previewRecipients ani productionForms bez navazujícího zadání a schválených adres.

## Ověření
- 26. 10. 2026: přístup ke zdrojové šabloně a prázdnému soukromému cíli ověřen přes GitHub.
- npm test: 26/26 testů prošlo; externí odesílání nebylo zkoušeno, testy formulářů používají simulované služby.
- npm run build: úspěch; aktivní zahrady-pankova, 2 ukázkové stránky. Nepotvrzuje dokončení navržených klientských stránek.
- Konfigurace a vygenerované SEO: indexable false, stage preview; pracovní URL v project.json a aktivním sites JSON shodná.
- Formulář: demo bez odesílání; žádní schválení testovací ani ostrí příjemci, doručení a Reply-To neověřeny.
- Prohlížeč a mobilní zobrazení klientského webu: zatím neověřeno; patří k iteraci 2 a dalším.
- Pracovní adresa: nenasazená, živá kontrola indexace neprovedena. Finální doména: beze změny.
- Cloudflare projekt se v iteraci 1 nezakládal. Enable Preview builds / Builds for Preview branches: zatím nenastaveno a neověřeno; při založení vypnout, ponechat automatické buildy main. preview_urls ve Wrangleru není stejná volba.
- Budoucí Cloudflare: build npm test && npm run build; deploy npx wrangler deploy; Worker zahrady-pankova; assets ./dist. Nepoužívat starý SITE ani argument sestavy, dist ručně neměnit.
- Při publikaci ověřit robots.txt, sitemap.xml, canonical, meta robots a X-Robots-Tag na pracovní URL s vypnutou indexací.
- Při výslovně zadaném ostrém spuštění nejdříve vyřešit formulář, skutečné příjemce a doručení/Reply-To; sjednotit finální URL, stage production, indexable true. Po nasazení ověřit robots.txt, sitemap.xml, canonical, meta robots a X-Robots-Tag na skutečné doméně. Pracovní doménu přesměrovat nebo izolovat, aby nevznikla druhá indexovatelná kopie.

## Další krok
Počkat na připomínky ke struktuře. Iterace 2 není zadaná a nezačíná automaticky.
Teprve na pokyn připravit vizuální směr a funkční úvodní stránku s lokálním náhledem pro desktop i mobil; indexace zůstane vypnutá a formulář demo bez odesílání.
