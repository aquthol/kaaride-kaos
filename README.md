# Rasmuse Kääride Kaos

Kiire juuksurisalongi mäng *Overcooked*'i vaimus. Sina oled Rasmus: jooksed mööda salongi, tassid kliente jaamade vahel ja püüad nad kassasse saada enne, kui kannatus otsa saab.

**Mängi siin:** _(link tuleb siia, kui GitHub Pages on sisse lülitatud)_
`https://<kasutajanimi>.github.io/kaaride-kaos/`

Mäng töötab brauseris, midagi ei pea installima. Kogu graafika ja heli on koodiga genereeritud — mängus pole ühtegi allalaaditud pilti ega helifaili.

## Kuidas mängida

Iga soeng on retsept: klient tuleb viia õigete jaamade kaudu õiges järjekorras ja lõpuks kassasse. Vale jaam ütleb "ei". Mida rohkem kannatust kliendil alles on, seda suurem jootraha.

| Tegevus | Rasmus (1. mängija) | Karl (2. mängija) |
| --- | --- | --- |
| Liigu | `W` `A` `S` `D` | Nooleklahvid |
| Võta klient sülle / pane maha | `Tühik` | `Enter` (ka NumpadEnter) |
| Tööta jaamas (hoia all) | `E` | `Parem Shift` |
| Söösta | `Vasak Shift` | `Numpad 0` |
| Heli sisse/välja | `M` | `M` |

Mängijate arvu (1 või 2) saab valida menüüs. Kahe mängija režiim käib ühel klaviatuuril.

### Jaamad

| Jaam | Kuidas töötab |
| --- | --- |
| **Ooteala** | Siia tulevad kliendid ja siit algab kannatuse kulumine |
| **Pesukraan** | Hoia `E` all — kiire |
| **Lõikustool** | Hoia `E` all — keskmine. Kui lahkud, siis töö peatub, aga ei kao |
| **Värvimine** | Hoia `E` all ~2 s, siis mõjub värv ise ~6 s. Vahepeal oled vaba |
| **Föön** | Vajuta `E` ja see töötab ise ~9,5 s. Ära unusta klienti ära — juuksed kõrbevad |
| **Kassa** | Klient maksab; jootraha sõltub allesjäänud kannatusest |

### Tasemed

1. **Esmaspäeva hommik** — rahulik algus: pesu, lõikus ja föön
2. **Värvipäev** — värvimisjaam avaneb, kliendid tahavad värvisoenguid
3. **Pulmapäev** — kõik jaamad töös, kiireim tempo ja pruudisoengud

Uus tase avaneb, kui eelmisel saad vähemalt ühe tähe. Tähed ja parim tulemus salvestatakse brauserisse.

## Käivitamine oma arvutis

Vajalik on [Node.js](https://nodejs.org/) (versioon 20 või uuem).

```bash
npm install     # tõmbab teegid (ainult esimesel korral)
npm run dev     # avab arendusserveri: http://localhost:5173
npm run build   # ehitab kausta dist/
npm run preview # vaatab ehitatud versiooni üle
```

### Arendaja lipud (lisa aadressi lõppu)

| Lipp | Mida teeb |
| --- | --- |
| `?fast` | 12-sekundiline voor, et lõpuekraani kiiresti näha |
| `?demo` | Täidab kõik jaamad klientidega |
| `?debug` | Näitab põrkekaste |
| `?players=2` | Alustab kohe kahe mängijaga |
| `?level=colourday` | Alustab kohe valitud tasemel (`monday`, `colourday`, `wedding`) |

## Tehniline pool

- [Vite](https://vite.dev/) + TypeScript + [Phaser 3](https://phaser.io/)
- Graafika joonistatakse koodis (`src/art/`) ja küpsetatakse tekstuurideks
- Helid sünteesitakse Web Audio API-ga (`src/audio/`) — ostsillaatorid, müra ja ümbrikud
- Tasemed, retseptid, kliendid ja tasakaalustus on andmed: `src/config/`
- Mängu tasakaalu saab muuta failis `src/config/gameConfig.ts` (ajad, kannatus, hinnad) ja `src/config/levels.ts` (tasemed, tähtede piirid)

## Litsents

Isiklik projekt. Kood on vaba kasutada ja muuta.
