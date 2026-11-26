# Projektni dosje: Tuzla Tour Guide

**Radni dokument za Grad Tuzlu, turističke ustanove i potencijalne partnere**
**Pripremljeno:** 26. novembar 2026.
**Nosilac prijedloga:** Amir Mulaosmanović, samostalno; „AISO Tuzla“ je radni naziv budućeg, još neregistrovanog startupa.

> Ovaj dokument opisuje projekat i predlaže naredne korake. Ne predstavlja potvrdu pravne usklađenosti, ugovor o partnerstvu, odobren budžet niti garanciju komercijalnih rezultata.

## 1. Sažetak

Tuzla Tour Guide je višejezični turistički vodič dostupan kroz web/PWA i Android aplikaciju. Povezuje informacije o gradu, turističkim atrakcijama, mapu i navigaciju, audio sadržaj, praktične informacije za putnike i alat za planiranje boravka.

Tuzla Quest je interaktivni modul koji posjetioce vodi do odabranih javnih turističkih atrakcija. Pilot se oslanja na navigaciju, fizičke QR kodove i digitalni napredak. U budućnosti se, uz saglasnost partnera, mogu razmotriti dodatne lokacije i pogodnosti. Uvrštavanje u aplikaciju samo po sebi ne znači da je neka ustanova ili firma partner.

## 2. Cilj i vrijednost

### Za posjetioca

- Brže pronalaženje lokalnih atrakcija i korisnih informacija.
- Mapa, navigacija, audio vodiči i turistički sadržaj na jednom mjestu.
- Samostalno istraživanje grada kroz Tuzla Quest.
- Alati za planiranje puta, bilješke, kalendar i evidenciju troškova.

### Za Grad i turističke ustanove

- Dodatni digitalni kanal za predstavljanje grada i javnih atrakcija.
- Mogućnost zajedničkog pilot-projekta i evaluacije iskustva posjetilaca.
- Mogućnost usmjeravanja posjetilaca između znamenitosti i gradskih usluga.
- Prijedlog besplatnog ustupanja aplikacije Gradski Parking Tuzla Gradu, pod uslovima koji se tek trebaju dogovoriti.

### Za lokalne poslovne subjekte

- Mogućnost da posjetilac pronađe lokaciju, vidi osnovne informacije i pokrene navigaciju.
- Mogućnost da se, uz poseban dogovor, turistička priča poveže s posjetom lokaciji.
- Mogućnost QR kampanje ili pogodnosti koju finansira i definiše partner.

Ove koristi su ciljevi za pilot, a ne obećani broj posjeta, prodaja ili povrat ulaganja.

## 3. Funkcije aplikacije

| Modul | Šta pruža |
|---|---|
| Početna stranica | Ulaz u glavne dijelove vodiča, odabrani sadržaj i galeriju |
| Interaktivna mapa | Pregled atrakcija i usluga, lokacija korisnika, mape i navigacijski prikazi |
| Tuzla Quest | Faze potrage, lokacije, QR skeniranje, napredak i nagrade |
| Gradski vodič | Historijski i turistički sadržaj o Tuzli i njenim atrakcijama |
| Praktične informacije | Informacije o dolasku, autobusima, ulasku u zemlju, zdravlju, SIM karticama i novcu |
| Prevoz | Informacije i poveznice za gradski prevoz, parking, taksi i druge usluge |
| Hrana i smještaj | Informativni imenici i poveznice prema pružaocima usluga |
| Audio i mediji | Audio naracije i odabrani video/panoramski sadržaji |
| Planiranje putovanja | Trodnevni plan, kalendar događaja, bilježnica, troškovi i lične bilješke |
| Offline karta | Lokalni PMTiles podaci i offline prikaz karte u podržanim scenarijima; ne znači da su sve funkcije dostupne bez interneta |
| Gradski Parking Tuzla | Vanjska aplikacija dostupna putem poveznice; nije dio istog aplikacijskog paketa |

Interfejs je projektovan za bosanski, engleski, njemački i turski jezik. Pokrivenost i ažurnost prevoda treba provjeravati po modulu.

## 4. Tuzla Quest: rad i pilot

Quest je organizovan u faze koje vode kroz ukupno 12 odabranih lokacija. Igrač otvara kartu, bira sljedeću atrakciju, koristi navigaciju, dolazi do lokacije i skenira fizički QR kod.

Klijentska aplikacija koristi anonimnu gostujuću Supabase sesiju bez obaveznog unosa e-maila, imena ili broja telefona. U sesiji postoji pseudonimni identifikator gosta. Klijent poziva serversku funkciju za provjeru završetka zadatka; kod također može poslati ID atrakcije, QR vrijednost i dostupne koordinate. Nije utvrđeno iz samog klijentskog repozitorija koliko dugo serverska funkcija čuva svako polje. To treba provjeriti u serverskoj implementaciji i konfiguraciji prije objave konačne politike privatnosti.

Quest se sada koristi kao pilot s javnim turističkim atrakcijama. Uključivanje poslovnih lokacija ili popusta zahtijeva prethodni dogovor: ko je odgovoran za QR oznaku, sadržaj, uslove nagrade, sprečavanje zloupotrebe i troškove.

## 5. Tehnologije

| Sloj | Tehnologije koje koristi projekat |
|---|---|
| Korisnički interfejs | React 18, TypeScript, Vite |
| Stilovi i animacije | Tailwind CSS, Framer Motion, Lucide |
| Mape | MapLibre GL, Geoapify servisi, PMTiles |
| Backend za Quest | Supabase Auth, PostgreSQL/PostGIS i RPC funkcije |
| QR skeniranje | `html5-qrcode` preko kamere uređaja |
| Mobilna aplikacija | Capacitor 8, Android |
| PWA/offline podrška | Vite PWA plugin i Workbox |
| Lokalna pohrana | Capacitor Preferences i web pohrana, zavisno od platforme |
| Hosting i opcionalna analitika | Vercel; analitika/Speed Insights se učitavaju uz pristanak u implementiranom toku |

Korištenje vanjskih servisa može prenijeti tehničke podatke o mrežnoj vezi tim pružaocima. Pojedinačni servis, lokaciju obrade, ugovor i rokove čuvanja treba potvrditi prema aktivnoj produkcijskoj konfiguraciji.

## 6. Privatnost i sigurnost

Projektna namjera je da posjetilac može koristiti turistički vodič bez kreiranja klasičnog naloga i bez dostavljanja direktnih kontaktnih podataka. Lokacija i kamera koriste se za konkretne funkcije uz dozvolu uređaja. Kamera služi QR skeniranju; aplikacija ne treba slati snimak kamere na server.

Quest ipak obrađuje pseudonimni identifikator gosta, evidenciju nagrada i podatke potrebne za serversku provjeru. Ako se koordinate pošalju, one su lični podaci ili mogu biti lični podaci kada se mogu povezati s identifikatorom gosta. Tačan serverski tok i rok čuvanja treba potvrditi.

Detaljan inventar podataka, rizici, otvorena pitanja i plan provjere nalaze se u [Privatnost po dizajnu i zaštita ličnih podataka BiH](./PRIVATNOST_PO_DIZAJNU_I_ZZLP_BIH.md).

## 7. Nacrtni plan razvoja

Ovo je predloženi redoslijed, a ne odobren raspored ili obaveza isporuke.

### Korak A — Stabilizacija pilota

- Potvrditi rad kamere/QR skeniranja na podržanim Android uređajima i web preglednicima.
- Testirati navigaciju, mapu, offline režim i ključne tokove pristanka.
- Uskladiti projektni README, korisničke upute, politiku privatnosti i stvarni serverski tok.
- Potvrditi ko upravlja nalozima, podacima, domenom, hostingom i podrškom.
- Dogovoriti prvi skup javnih atrakcija i odgovorne osobe za ažurnost sadržaja.

### Korak B — Partnerstva i izmјereni pilot

- Pozvati atrakcije, Pannonicu, hotele, restorane i druge zainteresovane subjekte na prezentaciju.
- Uključiti poslovnu lokaciju ili pogodnost samo nakon pisanog dogovora.
- Zabilježiti početno stanje i izabrati agregatne pokazatelje koje je moguće prikupiti zakonito i transparentno.
- Tražiti odobrenje prije objave logotipa, fotografija ili promotivnih materijala partnera.

### Korak C — Održivost i širenje

- Procijeniti troškove hostinga, sadržaja, SMS-a, održavanja i korisničke podrške nakon pilot-perioda.
- Razmotriti prijenos ili licenciranje aplikacije GradskiParkingTuzla Gradu, ako Grad prihvati ponudu.
- Proširiti lokacije i sadržaje prema interesu i kapacitetima za održavanje.
- O budućim funkcijama odlučivati prema rezultatima pilota, povratnim informacijama i procjeni privatnosti.

## 8. GradskiParkingTuzla — prijedlog besplatnog ustupanja

Amir Mulaosmanović navodi da je autor i održavalac aplikacije GradskiParkingTuzla i nudi da je besplatno ustupi Gradu Tuzli. Trenutna hosting platforma je Vercelov besplatni plan, koji se prema dostavljenom podatku može koristiti naredna tri mjeseca. Slanje SMS poruka oslanja se na BHTelecom SIM karticu.

Ponuda uključuje tri mjeseca održavanja ili duži period po dogovoru. Prije preuzimanja potrebno je pisano urediti:

- obim prava korištenja ili prijenosa izvornog koda i intelektualnog vlasništva;
- prijenos domene, hosting računa, pristupa i konfiguracije;
- ko snosi trošak SIM kartice, SMS poruka, kredita i eventualnih naknada;
- šta se dešava po isteku besplatnog hosting-perioda;
- obim, vrijeme odziva i naknadu za buduće održavanje;
- odgovornost za tačnost zona, naplatu, privatnost, sigurnost i podršku građanima;
- postupak prenosa ili brisanja postojećih podataka, ako postoje.

Besplatno ustupanje rada ne znači automatski da su pružanje infrastrukture, SMS poruke, održavanje nakon dogovorenog perioda ili zakonske obaveze besplatni.

## 9. Troškovi, finansiranje i upravljanje

Dosadašnji razvoj i utrošena sredstva za alate i pretplate finansirao je Amir Mulaosmanović lično. AISO Tuzla je radni naziv budućeg startupa i trenutno nije registrovano pravno lice.

Za Grad je predložena donacija aplikacije GradskiParkingTuzla bez naknade, uz gore navedene uslove. Za turističku platformu i privatne partnere nije utvrđen konačan cjenovnik. Iznos od približno **2.000 KM** je preliminarna procjena osnivača za planiranje; nije potvrđena tržišna vrijednost, ponuda s ugovornim karakterom ni ukupan operativni trošak.

Finansijski modeli za Grad i privatni sektor trebaju zasebno navesti:

- razvojni rad i jednokratne troškove;
- hosting, domenu, SMS i druge treće strane;
- unos i ažuriranje sadržaja, fotografije i prijevode;
- održavanje, podršku i sigurnosne nadogradnje;
- eventualne troškove promocije i fizičkih QR oznaka;
- poreze, ugovorni model i nosioca troška.

Za poređenje s tržištem potrebno je navesti izvor, datum, valutu, period naplate i obim svake ponude. Cijene „na upit“ ne predstavljati kao javni cjenovnik. Prije konačne ponude potvrditi iznose i obim s osnivačem i potencijalnim naručiocem.

## 10. Uslov za korištenje brenda partnera

Ako Grad, Pannonica, hotel, trgovina ili drugi subjekt prihvati razgovor o partnerstvu, prije korištenja njihovog logotipa, fotografija, naziva u promotivnom kontekstu ili drugih zaštićenih materijala tražit će se njihovo prethodno odobrenje. Odobrenje treba definisati svrhu, format, kanal i period korištenja. Prikaz informativnog podatka o lokaciji ne smije se predstavljati kao potvrda partnerstva.

## 11. Izvori i status navoda

- Tehničke funkcije i tehnologije: repozitorij aplikacije, `README.md`, `package.json`, korisnički priručnik i implementacija komponenti.
- Finansiranje, hosting-period, održavanje i prijedlog za GradskiParkingTuzla: informacije dostavio Amir Mulaosmanović; potrebno potvrditi pisanim dogovorom.
- Metrike korisnika, posjeta, lead-ova, prodaje i povrata ulaganja: nisu dostavljene.
- Pravna usklađenost: nije procijenjena niti potvrđena; vidi [dokument o privatnosti](./PRIVATNOST_PO_DIZAJNU_I_ZZLP_BIH.md).

## Prijedlozi za razgovor

- [Prijedlog saradnje s Gradom Tuzla](./PONUDA_PARTNERSTVO_GRAD_TUZLA.md)
- [Poziv na partnerstvo privatnom sektoru](./PONUDA_PARTNERSTVO_PRIVATNI_SEKTOR.md)
- [Politika privatnosti — radni nacrt za aplikaciju](../public/PRIVACY_POLICY.md)
