# Korisničko uputstvo — Tuzla Tour Guide i Tuzla Quest

## 1. O aplikaciji

Tuzla Tour Guide je turistički vodič za web/PWA i Android. Sadrži informacije o gradu, atrakcijama, mapu i navigaciju, praktične informacije za putnike, audio i medijski sadržaj, prevoz, hranu, smještaj i alate za planiranje boravka. Dostupnost pojedinih funkcija zavisi od uređaja i internet veze.

## 2. Mapa i navigacija

1. Otvorite mapu iz navigacije aplikacije.
2. Izaberite tačku interesa (POI) da biste pogledali dostupne informacije.
3. Ako želite prikaz svoje pozicije ili navigaciju, dozvolite pristup lokaciji kada to preglednik ili uređaj zatraži.
4. Pokretanje navigacije može zahtijevati internet i vanjski mapni servis.

Dozvola za lokaciju nije potrebna za čitanje većine tekstualnih informacija. Isključite je u postavkama uređaja ako ne koristite funkcije koje zavise od lokacije.

## 3. Tuzla Quest

Tuzla Quest je samostalna QR potraga kroz odabrane lokacije. Korisnik prati sljedeću tačku na mapi, dolazi do fizičke lokacije i skenira zvanični Quest QR kod. Aplikacija šalje podatke potrebne za provjeru zadatka i prikazuje napredak/nagradu kada je skeniranje uspješno. Za provjeru je potrebna mrežna veza; ishod zavisi od dostupnosti serverske usluge.

### Skeniranje QR koda

1. Otvorite Quest ili tab „Napredak & QR“.
2. Izaberite dugme za pokretanje kamere.
3. Dozvolite pristup kameri i usmjerite je prema Quest QR oznaci na lokaciji.
4. Sačekajte potvrdu. Ne skenirajte kodove koji nisu dio potrage.

Kamera se koristi za skeniranje. Ako odbijete dozvolu, QR skeniranje neće raditi, ali možete pregledati druge dijelove vodiča.

### Ako kamera ne radi

- Provjerite da je dozvola kamere uključena za aplikaciju u Android postavkama ili za web-stranicu u pregledniku.
- Zatvorite druge aplikacije koje možda koriste kameru pa ponovo otvorite skener.
- U pregledniku koristite sigurnu HTTPS adresu i dozvolite kameru za tu stranicu.
- Ako je Android aplikacija instalirana prije nego što je dodana Android dozvola za kameru, testirajte tek nakon izrade i instaliranja ažurirane verzije.
- Ako se problem nastavi, navedite model telefona, verziju Androida, način instalacije i tekst greške.

### Završetak potrage i nova runda

Quest prolazi kroz faze i završava se nakon završne lokacije. Nakon završetka prikazuje se završni ekran; potraga se ne vraća automatski na prvu tačku.

Za lokalni reset otvorite tab „Napredak & QR“, pronađite historiju skeniranja i izaberite kontrolu za resetovanje/brisanje historije, a zatim potvrdite. Kod anonimne sesije aplikacija se odjavljuje i pokreće novi gostujući napredak. Ako koristite prijavljeni račun, online napredak se ne briše s uređaja.

**Važno:** Lokalni reset briše lokalni napredak i evidenciju skeniranja, ali ne garantuje brisanje prethodnih serverskih zapisa. Za zahtjev koji se odnosi na serverske podatke obratite se na [aisotuzla@proton.me](mailto:aisotuzla@proton.me).

## 4. Privatnost i dozvole

- Aplikacija ne traži e-mail, ime ili broj telefona za anonimno igranje Questa, ali koristi pseudonimni Supabase gostujući identifikator.
- QR provjera može uključiti QR vrijednost, ID zadatka i dostupne koordinate.
- Kamera služi skeniranju; klijentski zahtjev za provjeru ne šalje video stream kamere.
- Lokacija i kamera mogu se odbiti ili opozvati u postavkama uređaja, uz gubitak funkcija koje ih koriste.
- Opcionalna analitika se učitava nakon izbora pristanka; trenutna traka za pristanak prikazuje se samo na bosanskom jeziku.
- Detalji, otvorena pitanja i status nacrta nalaze se u [Politici privatnosti](../public/PRIVACY_POLICY.md) i [dokumentu o privatnosti po dizajnu](./PRIVATNOST_PO_DIZAJNU_I_ZZLP_BIH.md).

## 5. Planer i lokalne postavke

Planer, kalendar, bilješke, jezik i dio Quest napretka koriste lokalnu pohranu uređaja. Brisanje podataka aplikacije ili preglednika može ukloniti lokalne postavke i sadržaj. Pojedine mape i sadržaji mogu biti dostupni iz keša, ali navigacija, serverska QR provjera, događaji i vanjski sadržaj mogu zahtijevati internet.

## 6. Pomoć i prijava problema

Za tehnički problem navedite:

- model uređaja i verziju operativnog sistema;
- da li koristite Android aplikaciju, instalirani PWA ili web-preglednik;
- naziv funkcije i korake prije greške;
- tačan tekst greške i da li je kamera/lokacija dozvoljena.

Kontakt: [aisotuzla@proton.me](mailto:aisotuzla@proton.me).
