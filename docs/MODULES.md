# Katalog modulů

Všechny obsahové moduly mají `type`, jedinečné `id` a `title`. Volitelně `eyebrow` a `intro`. Texty jsou prosté řetězce, nikoli HTML. Lokální odkazy začínají `/` nebo `#`. Pořadí v `pages[].sections` je pořadím na stránce.

| Modul | Obsah / volby | Původ vzoru |
|---|---|---|
| `hero` | Nadpis H1, úvod, tlačítka; `split` nebo `cover`; obrázek, MP4 nebo externí video | všechny tři weby |
| `stats` | Čísla a popisky | Miláček, Beran, Italboats |
| `cards` | Služby, reference nebo katalog; obrázky, kategorie, hledání, odkazy | všechny tři weby |
| `split` | Obrázek + textové odstavce | všechny tři weby |
| `steps` | Očíslovaný postup spolupráce | Miláček |
| `gallery` | Náhledy, dialog, šipky a Escape | Miláček |
| `specs` | Dvojice název/hodnota | Italboats |
| `destinations` | Seznam lokalit + volitelná mapa jako obrázek | Beran |
| `faq` | Rozbalovací otázky bez závislosti na JavaScriptu | nový společný modul |
| `contact` | Adresa, telefon, e-mail, kontaktní osoby, volitelný formulář | všechny tři weby |
| `cta` | Výzva s odkazem | všechny tři weby |

Hlavička a patička jsou další dva společné komponenty, které se zobrazují na každé stránce. Hlavička podporuje mobilní menu a Escape. Obrázky kromě úvodního se načítají odloženě. Obsah je v hotovém HTML dostupný i bez JavaScriptu; vyhledávání, dialog galerie a formulář jsou postupná vylepšení.

## Služby nebo reference

```json
{
  "type": "cards",
  "id": "reference",
  "title": "Naše práce",
  "filterable": true,
  "items": [{
    "title": "Rekonstrukce domu",
    "category": "Rekonstrukce",
    "text": "Krátký popis realizace.",
    "image": {"src": "/assets/dum.jpg", "alt": "Dokončený dům"},
    "link": {"label": "Detail realizace", "href": "/realizace/dum/"}
  }]
}
```

Pro odkaz na detail přidejte odpovídající stránku do `pages` a obrázek do `public/assets/`. Služby bez fotografií mohou `image` vynechat. Sestavení odmítne neexistující lokální obrázek či detail.

## Úvodní video

V modulu `hero` použijte `media`:

```json
{
  "kind": "video",
  "src": "/assets/banner-poster.jpg",
  "alt": "Úvodní video klienta",
  "video": "/assets/banner.mp4"
}
```

`src` je náhledový obrázek, nikoli video. Přidejte oba soubory. MP4 má limit 25 MiB na soubor; kontrola při sestavení ho hlídá. Při omezeném pohybu se video samo nespustí, tlačítko dovoluje ruční přehrání. Na skryté kartě se pozastaví. Autoplay může prohlížeč blokovat; uživateli zůstává tlačítko.

Pro externí video:

```json
{
  "kind": "embed",
  "src": "/assets/banner-poster.jpg",
  "alt": "Představení společnosti",
  "embed": "https://player.vimeo.com/video/916650966"
}
```

Toto ID je příklad přehrávače z Italboats, pro nového klienta jej nahraďte jeho vlastním videem. Povoleny jsou pouze HTTPS přehrávače `player.vimeo.com` a `www.youtube-nocookie.com`. Vložení je až na kliknutí; tlačítko Zavřít přehrávač odpojí. U použití médií respektujte práva klienta a skutečné požadavky na soukromí.

## Kontakt

```json
{
  "type": "contact",
  "id": "kontakt",
  "title": "Napište nám",
  "address": "Adresa klienta",
  "email": "kontakt@example.invalid",
  "form": {"mode": "demo", "subject": "Poptávka z webu"}
}
```

`demo` nic neposílá. `mailto` připraví e-mail v aplikaci návštěvníka. `form: null` skryje formulář a ponechá kontakty. `server` odesílá přes společnou službu Cloudflare + Resend, vyžaduje `id`, `endpoint` a veřejný `sitekey`. Příjemce a předmět určuje serverový registr. Tajné klíče patří pouze do runtime nastavení centrálního Workeru. Viz [FORMS.md](FORMS.md).

## Stránky a vzhled

Každá stránka má právě jeden `hero`, vlastní `title`, `description` a cestu jako `/` nebo `/reference/dum/`. Každý modul na stránce má jiné ID. Katalog a detail se propojují běžnými odkazy. Změna `theme.accent`, `theme.ink`, `theme.paper` a `theme.serif` se projeví ve všech modulech. Po změně barev ověřte kontrast; validátor kontroluje formát barvy, nikoli všechny kontrastní kombinace.

## Další firemní moduly

Kompletní příklady jsou v `sites/showcase.json`, každý modul lze samostatně přesunout nebo vynechat.

| type | Povinné údaje | Volitelné údaje |
|---|---|---|
| location | address | hours (label/value), phone, mapQuery pro upřesnění bodu, embed: false pro vypnutí mapy |
| reviews | items: quote, name | context, source (label/href) |
| partners | items: name | image (src/alt), href |
| team | items: name, role | image (src/alt), text, phone, email |
| downloads | items: title, href | description, format, size jako zobrazený text |

Všechny moduly mají společné `id`, `title` a volitelné `intro` a `eyebrow`. Mapa používá adresu pro navigaci i vložení Google Maps. Externí mapa se načte až kliknutím a lze ji opět zavřít; bez JavaScriptu zůstane adresa a navigační odkaz. Pro nejednoznačnou adresu zadejte `mapQuery` (např. souřadnice). Zobrazené hodnocení nikdy nevydávejte za skutečné, pokud jde o ukázkový text.

Dokumenty ukládejte do `public/documents/`, href bude `/documents/nazev.pdf`. Sestavení ověří existenci lokálního souboru a limit 25 MiB. Pro externí dokumenty používejte HTTPS; odkaz je otevře, stažení závisí na serveru.

## Vzory podstránek

Showcase obsahuje `/reference/`, `/sluzba/` a `/produkt/`, propojené z karet. Zkopírujte odpovídající položku `pages`, změňte jedinečnou `path`, titulek, popis, média a obsah. Každá stránka má právě jeden hero a vlastní seznam sekcí; napojení karty se nastavuje přes `link.href`. Sitemap a canonical se vytvoří automaticky. Původní `/detail/` zůstává dostupný.
