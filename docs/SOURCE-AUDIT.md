# Analýza zdrojových webů · 8. 10. 2026

Zdrojové repozitáře byly pouze čteny. Přesné identifikátory jejich stromů jsou v `sources.json`.

| Web | Zjištění | Využití ve společném základu |
|---|---|---|
| CCNplus/milacek-web | HTML/CSS/JS v hlavní složce; desítky detailů referencí; filtry, hledání bez diakritiky, dialog galerie, MP4 banner, kontaktní formulář mailto | karty s hledáním a kategoriemi, galerie, postup, video s omezením pohybu |
| CCNplus/beran-web | Úvodní stránka je v hlavní složce i dist; MP4 banner; nabídka služeb, vozový park, čísla, destinace; odkazy na původní abberan.cz | služby, statistiky, destinace, přehledný kontakt |
| CCNplus/italboats-web | Hotový web v dist; úvodní Vimeo, produktové řady a detaily parametrů; formulář otevře mailto | externí video na kliknutí, katalogové karty, parametry, detaily |

## Co sjednocujeme

- Jediný zdroj obsahu v `sites`, společné moduly v `src`, média v `public` a odvozené `dist`. Žádné ručně udržované dvojice index.html/dist/index.html.
- Publikování pouze dist. Kontrola technických souborů a limitu média před nasazením.
- Jedna obsluha navigace, filtrů a galerie. Skripty inicializují jen moduly přítomné na stránce.
- Srozumitelné chování formuláře: žádné falešné potvrzení odeslání při mailto.
- Explicitní vývojový režim noindex. URL, kontakty a klientské texty nejsou zadrátované ve společných modulech.

## Co tato verze nepřenáší automaticky

Původní fotografie, videa, loga, všechny detailní stránky a jejich grafické úpravy nejsou součástí šablony. Ukázkové sestavy zachycují strukturu a některé názvy obsahu, nikoli úplný obsah klientů. To umožňuje bezpečně založit další web bez omylem zkopírovaných ostrých kontaktů. Výchozí grafika je nově vytvořená ilustrační SVG.

Původní weby mají odlišný charakter. Návrat šablony do existujícího projektu je samostatná migrace s porovnáním stránek a přesměrováním původních URL. Použití šablony pro nový web tuto migraci nevyžaduje.

## Další iterace

1. Vybrat jednu reálnou stránku jako pilot pro vizuální doladění modulů.
2. Dodat vlastní klientské fotografie a ověřit skutečné video v mobilních prohlížečích.
3. Samostatně doplnit sdílené serverové formuláře CCN/Resend, až to bude zadáno.
4. Změny šablony verzovat; pro existující klienty provádět cílené aktualizace přes PR.
