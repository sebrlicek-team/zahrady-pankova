# CCN Web Template · 0.1

Společná stavebnice statických klientských webů. Stránky se skládají z dat a 16 obsahových modulů, společné hlavičky a patičky. Výsledkem je běžné HTML, CSS a JavaScript pro Cloudflare Workers Static Assets.

První verze vychází z analýzy repozitářů **Miláček, Beran a Italboats**. Je to nový společný základ, nikoli automatická migrace stávajících webů nebo jejich přesná grafická kopie. Původní weby zůstávají samostatné. Ukázky používají ilustrační grafiku. Katalog showcase má skutečný kontaktní formulář; ostatní ukázkové sestavy zůstávají demo. Viz docs/FORMS.md.

## Rychlý start

Potřebujete Node.js 22 nebo novější. Sestavení nemá externí závislosti.

```sh
npm test
npm run dev
```

Otevřete `http://127.0.0.1:4173`. Lokální server při spuštění sestaví web; po úpravě dat jej znovu spusťte. Není zde automatický hot reload.

Další sestavy:

```sh
npm run dev -- milacek
npm run dev -- beran
npm run dev -- italboats
```

Pouhé vytvoření HTML:

```sh
npm run build
npm run build -- milacek
```

## Co se kde upravuje

| Místo | Účel |
|---|---|
| `sites/*.json` | Texty, kontakty, navigace, pořadí modulů, stránky a barvy |
| `src/modules/` | Samostatné renderery modulů |
| `src/page.mjs` | Společná stránka a metadata |
| `public/assets/` | Obrázky, videa, společné CSS a chování modulů |
| `scripts/build.mjs` | Sestavení, kontrola souborů a interních odkazů |
| `dist/` | Automaticky vytvořený web; nikdy neupravovat ručně |
| `wrangler.jsonc` | Jméno Workeru a publikování pouze `dist/` |
| `docs/` | Katalog, srovnání zdrojů a postup nasazení |

## Nový klient

Začněte [implementačním postupem](IMPLEMENTATION.md): obsahuje úvodní zadání ke zkopírování, pět iterací, kontrolu spuštění a předání stavu mezi konverzacemi.

1. Na GitHubu použijte **Use this template → Create a new repository**.
2. Zkopírujte nejbližší sestavu do `sites/klient.json`.
3. Upravte jméno, kontakty, navigaci, barvy, texty a stránky. Zkontrolujte kontakty i na detailech.
4. Přidejte vlastní média do `public/assets/`; odkazy v datech začínají `/assets/`.
5. V `wrangler.jsonc` změňte `name` na název nového Workeru. Nepřipojujte nového klienta ke Workeru šablony.
6. V Cloudflare zvolte build příkaz `npm test && npm run build -- klient`, deploy příkaz `npx wrangler deploy`.
7. Ověřte náhled a připojte doménu. Postup je v [nasazení](docs/DEPLOYMENT.md).
8. Při ostrém spuštění nastavte skutečné `url` a `indexable: true`. Ukázkové adresy ani demo formuláře nesmí zůstat na produkčním webu. Zvolte ověřený režim `server` podle docs/FORMS.md, `mailto`, nebo formulář vypněte (`form: null`).

Změna pořadí objektů v `pages[].sections` mění pořadí modulů. Odstraněním objektu modul vypnete. Při odstranění sekce aktualizujte také navigaci a tlačítka, jinak sestavení správně ohlásí neplatnou kotvu. Typ každého modulu má vlastní vstupní data; katalog obsahuje příklady.

## Hranice první verze

- Žádný CMS ani vizuální editor; obsah je v JSON.
- Karty služeb, referencí a produktů používají společný renderer; detail je samostatná stránka složená z modulů.
- Režimy formuláře: `demo` (nic neodesílá), `mailto` (otevře aplikaci návštěvníka) a `server` (společná služba Cloudflare + Resend podle docs/FORMS.md).
- Video: lokální MP4 s náhledovým obrázkem, nebo Vimeo/YouTube až po kliknutí. Žádný externí přehrávač se nenačítá před aktivací.
- Vzorové kontakty používají `.invalid`. Před zveřejněním je nahraďte.
- Nejsou vloženy automaticky vygenerované právní texty ani analytika. Doplňují se podle skutečných služeb webu.
- Kopie z GitHub template jsou samostatné. Opravy společného základu se do klientských repozitářů nepřenášejí automaticky; přenášejte je cílenými PR.

## Kvalita a ověření

`npm test` ověřuje všechny sestavy, escaping textů, nepovolené URL, chybějící soubory a kotvy, zdrojové soubory v médiích, hranici 25 MiB a ochranu před omylem publikovaným demo formulářem. Před publikací navíc projděte mobil, klávesnici, kontakty, formulář ve zvoleném režimu a reálná videa. `noindex` není přístupové zabezpečení; důvěrné náhledy chraňte Cloudflare Access.

Viz [katalog modulů](docs/MODULES.md), [analýza tří webů](docs/SOURCE-AUDIT.md) a [nasazení](docs/DEPLOYMENT.md).

Nově: mapa a provozovna, hodnocení, partneři, tým, dokumenty a tři vzory detailu. Příklady konfigurace viz [moduly](docs/MODULES.md).

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
