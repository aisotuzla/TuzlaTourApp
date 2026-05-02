# PRIJEDLOG PROJEKTA

## „Tuzla Tour Guide" – Digitalna platforma za obogaćivanje turističke ponude grada Tuzle

---

**Za:** Turistička zajednica grada Tuzle, Turistički ured  
**Predmet:** Predstavljanje inovativnog turističkog proizvoda u kontekstu Javnog poziva za finansiranje/sufinansiranje projekata i manifestacija koje doprinose obogaćivanju turističke ponude na području grada Tuzle (broj: 04-227/26 od 24.03.2026.)  
**Datum:** April 2026.

---

### Uvod

Poštovani,

Obraćam Vam se kao građanin Tuzle i autor digitalne platforme „Tuzla Tour Guide" – sveoubhvatne mobilne i web aplikacije koja objedinjuje kompletan turistički doživljaj grada Tuzle u jednom digitalnom rješenju.

Svjestan sam da, u skladu sa članom VI. navedenog Javnog poziva, fizička lica nemaju pravo prijave. Međutim, ovaj prijedlog Vam dostavljam iz dva razloga:

1. **Informativni:** Da Turističku zajednicu grada Tuzle upoznam s gotovim, funkcionalnim proizvodom koji direktno odgovara na prioritetna područja definisana Javnim pozivom — posebno tačke **3.3. „Stvaranje novih inovativnih turističkih proizvoda"**, **2.1. „Promocija kulturno-historijskog i prirodnog naslijeđa"** i **1.1. „Očuvanje i stvaranje prepoznatljivog i privlačnog turističkog ambijenta"**.

2. **Poziv na saradnju:** Da ponudim partnerstvo s Turističkom zajednicom ili sa bilo kojim pravnim subjektom (neprofitnom organizacijom ili d.o.o.) koji ispunjava formalne uslove prijave, a prepoznaje vrijednost ovog projekta. Spreman sam ustupiti tehnologiju, know-how i potpunu podršku u realizaciji u periodu od **1. maja do 31. avgusta 2026. godine**, kako je predviđeno Javnim pozivom.

---

### Opis projekta

**„Tuzla Tour Guide"** je potpuno razvijena, funkcionalna aplikacija dostupna kao Progressive Web App (PWA) za mobilne uređaje i web preglednike, te kao nativna Android aplikacija. Aplikacija objedinjuje sljedeće module:

#### 1. Interaktivna Mapa Grada (MapView)

- Otvorena mapa grada Tuzle sa prikazom turističkih kapaciteta.
- Prikaz iz 3D perspektive koristeći Jawg Maps/MapLibre GL tehnologiju.
- Offline režim rada — mapa funkcioniše i bez internet konekcije, što je ključno za strane turiste bez data roaminga.

#### 2. „Tuzla Quest" — Gamifikacija turističkog obilaska (MapQuestView)

- Interaktivna igra u kojoj turisti fizički obilaze lokacije u gradu, skenirajući QR kodove postavljene na ključnim turističkim tačkama.
- Lokacije uključuju(do sada): **Spomenik Kralja Tvrtka**, **Spomenik Meše Selimovića**, **Panonika**, **Slapovi**, **Galerija**, i druge.
- Svaka lokacija sadrži:
  - GPS navigaciju do cilja
  - Vizualni sadržaj o kulturno-historijskom naslijeđu
- **Nagradni sistem za ljeto 2026:** Turisti koji obiđu sve lokacije osvajaju ekskluzivnu digitalnu kolekciju — NFT sličice reprezentacije Bosne i Hercegovine za Svjetsko prvenstvo u fudbalu 2026. Ove digitalne kolekcije mogu služiti i kao kuponi za popuste na hranu i piće u lokalnim ugostiteljskim objektima tokom ljetnih večeri praćenja utakmica u zamjenu za marketing.

#### 3. Digitalni novčanik (Digital Wallet) - Budući razvoj

- Integrisani sistem za digitalna plaćanja unutar aplikacije preko TON (The Open Network) Blockchaina.
- Mogućnost budućeg povezivanja sa lokalnim ugostiteljskim i turističkim objektima.
- Siguran pristup putem PIN koda i enkripcije.

#### 4. Pametni parking (SMS Parking)

- Mapirani pregled parking zona u gradu
- Mogućnost SMS plaćanja parkinga jednostavno unosom registarske tablice i odabirom zone, sa odbrojavanjem i notifikacijom o isteku vremena.
- Smanjenje nepotrebnog kretanja vozila kroz centar grada — direktan doprinos ekološkoj održivosti.

#### 5. Višejezični sadržaj o kulturno-historijskom naslijeđu

-Primarno Engleski i Bosanski jezik, u planu dorade Njemački i Turski jezik.

#### 6. Informacije za turiste

- Pregled najbližih hotela sa ocjenama, kontakt podacima i Virtual Tour mogućnošću.
- Pregled restorana i kafića sa mogućnošću direktnog poziva ili posjete web stranice.
- Vremenska prognoza u realnom vremenu.
- Jednostavan poziv taksi službe

---

### Usklađenost sa prioritetnim područjima Javnog poziva

| Prioritetno područje (Javni poziv) | Modul aplikacije | Opis usklađenosti |
|---|---|---|
| **1.1.** Očuvanje i stvaranje prepoznatljivog turističkog ambijenta | Interaktivna mapa, Galerija | Digitalna prezentacija grada kao modernog, tehnološki naprednog odredišta |
| **2.1.** Promocija kulturno-historijskog i prirodnog naslijeđa | Tuzla Quest, AR Vodič, 360° panorame | Direktna promocija spomenika, parkova i kulturnih institucija kroz gamifikaciju |
| **2.2.** Manifestacije sportskog značaja | NFT kolekcija SP 2026, Ljetne večeri | Povezivanje Svjetskog prvenstva 2026. sa turističkom ponudom grada |
| **3.1.** Podizanje kvaliteta turističkih usluga | Smart Parking, Digitalni novčanik | Digitalizacija osnovnih turističkih servisa |
| **3.2.** Razvoj posebnih oblika turizma | Quest, AR, Virtual Tour | Digitalni/iskustveni turizam kao rastući segment |
| **3.3.** Stvaranje novih inovativnih turističkih proizvoda | **Cijela platforma** | Jedinstven proizvod na nivou regije — sve u jednoj aplikaciji |
Placeholder za AI asistenta kao i mogučnost optimizacije "čitanja" aplikacije za AI agente.

---

### Tehnička implementacija (Postojeće stanje)

Aplikacija je **u potpunosti razvijena** i funkcionalna. Nije u fazi koncepta — radi se o gotovom proizvodu.

**Korištene tehnologije:**

- **Frontend:** React 18, TypeScript, Vite, Framer Motion
- **Mape:** MapLibre GL JS, Jawg Maps (jawg-streets i jawg-lagoon stilovi)
- **AR/VR:** Pannellum (360° panorame), HTML5 QR Scanner
- **Blockchain:** TON (NFT kolekcija i digitalna plaćanja putem TON Connect protokola)
- **Mobilna aplikacija:** Capacitor (Android APK)
- **Hosting:** Vercel (PWA), offline-capable sa Service Worker-om

**Trenutno aktivne lokacije u Quest modulu:**

1. Irish Pub (44.53521, 18.68835)
2. Galerija (44.535552, 18.688320)
3. Banja (44.536846, 18.688140)
4. Pannonica Ured (44.539775, 18.682692)
5. Slapovi (44.540088, 18.681577)
6. Gradski Park I spomenik Kralja Tvrtka I (uključuje 360° panoramski virtual tour)
7. Meša Selimović (Spomenik, uključuje video sadržaj)

---

### Budžetski okvir

S obzirom na to da je aplikacija već razvijena, eventualna sredstva Turističke zajednice (u okviru od 1.000 do 5.000 KM) bila bi usmjerena na:

| Stavka | Procijenjeni trošak |
|---|---|
| Štampa i postavljanje QR kodova na lokacijama | 100 KM |
| Promocija aplikacije (digitalni marketing, društvene mreže) | 1.000 KM |
| Hosting i serverski troškovi (2026.) | 200 KM |
| Dizajn i štampa promotivnih materijala | 200 KM |
| Koordinacija sa ugostiteljskim objektima za NFT popuste | 500 KM |
| Nepredviđeni troškovi | 500 KM |
| **UKUPNO** | **2.500 KM** |

---

### Potencijal projekta

- **Jedinstvenost:** Ne postoji sličan proizvod u Bosni i Hercegovini, niti u širem regionu Zapadnog Balkana. Tuzla bi bila prvi grad u regiji sa ovako integrisanom digitalnom turističkom platformom.
- **Skalabilnost:** Platforma se može prilagoditi za bilo koji drugi grad u BiH ili regiji.
- **EU usklađenost:** Projekat je u potpunosti usklađen sa **Interreg Europe „Smart Tour"** inicijativom i **EU Transition Pathway for Tourism (TPT)** — što otvara vrata za buduće značajnije EU fondove.
- **Svjetsko prvenstvo 2026.:** FIFA Svjetsko prvenstvo u fudbalu (juni-juli 2026.) predstavlja jedinstvenu priliku za promociju — NFT kolekcija reprezentacije BiH je prvi takav proizvod u zemlji.
- **Period realizacije:** Projekat je odmah spreman za implementaciju u periodu od 1. maja do 31. avgusta 2026. godine, upravo kako je predviđeno Javnim pozivom.

---

### Zaključak

Ovaj prijedlog dostavljam u dobroj vjeri, s uvjerenjem da „Tuzla Tour Guide" predstavlja izuzetan doprinos turističkoj ponudi grada Tuzle. Ukoliko postoji interes za saradnju — bilo kroz partnerstvo sa pravnim subjektom koji ispunjava formalne uslove prijave, bilo kroz direktan aranžman sa Turističkom zajednicom — stojim na raspolaganju za prezentaciju aplikacije uživo, uključujući demonstraciju svih modula na mobilnom uređaju.

Kontakt za prezentaciju i dodatne informacije:

**[Amir Mulaosmanović]**  
**[icptuzla@gmail.com]**  
**[+38762441092]**  
**[Web adresa aplikacije: tuzla-tour-guide.vercel.app]**

---

*Prilog: Screenshotovi aplikacije (dostupni na zahtjev ili putem live demonstracije)*
