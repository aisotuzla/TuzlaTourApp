# Politika Privatnosti — Tuzla Tour Guide

**Zadnje ažuriranje:** 21. novembar 2026.  
**Primjenjuje se na:** Tuzla Tour Guide web aplikaciju, Progressive Web App (PWA) i Capacitor Android aplikaciju.

Ova Politika privatnosti objašnjava kako **Tuzla Tour Guide** ("mi", "naš", "aplikacija") obrađuje vaše podatke. Posvećeni smo zaštiti vaše privatnosti i razvoju softvera koji poštuje načelo privatnosti po dizajnu (Privacy by Design).

---

## 1. Voditelj obrade podataka i kontakt

- **Projekat:** Tuzla Tour Guide / AISO Tuzla
- **Lokacija:** Tuzla, Bosna i Hercegovina
- **Email kontakt:** [aisotuzla@proton.me](mailto:aisotuzla@proton.me)
- **Predmet upita za privatnost:** `Zahtjev za privatnost — Tuzla Tour Guide`

---

## 2. Naša ključna načela privatnosti

1. **Privatnost bez registracije**: Za korištenje turističkog vodiča i igranje Tuzlanske potrage (Tuzla Quest) nije potrebno kreirati nalog, unositi ime, email adresu niti broj telefona.
2. **Bez praćenja u pozadini**: GPS lokacija se koristi isključivo dok aktivno koristite funkcije zasnovane na lokaciji (pregled pozicije na mapi, taktički kompas ili skeniranje QR koda). Vaša historija kretanja se nikada ne bilježi niti pohranjuje u pozadini.
3. **Bez oglašavanja i komercijalnih kolačića**: Aplikacija ne sadrži reklame, ne prodaje podatke trećim stranama i ne koristi marketinške pratioce (kao što su Google AdSense, Meta Pixel ili komercijalni brokeri podataka).
4. **Prednost lokalnoj pohrani**: Vaše zabilješke, plan putovanja, offline mape i historija skeniranja pohranjuju se lokalno na vašem uređaju.

---

## 3. Informacije koje obrađujemo

### 3.1 Podaci o lokaciji (GPS i senzori orijentacije)
- **Kako se koriste**:
  - Za prikaz vaše trenutne pozicije na 3D mapi grada.
  - Za izračunavanje smjera kretanja i udaljenosti do spomenika na taktičkom kompasu.
  - Za provjeru fizičke prisutnosti unutar dozvoljene zone (20–25 metara od spomenika) prilikom skeniranja QR koda u potrazi.
- **Tok podataka**:
  - Kompas i navigacija se računaju lokalno na vašem uređaju.
  - Prilikom skeniranja QR koda, jednokratni par koordinata `(geografska širina, geografska dužina)` se šalje putem šifrovane TLS veze na Supabase server. Server koristi PostGIS prostorne funkcije isključivo kako bi potvrdio da se nalazite unutar radijusa lokacije. Koordinate se ne pohranjuju kao historija vašeg kretanja.
- **Vaša kontrola**: Pristup lokaciji zahtijeva vašu izričitu dozvolu i može se u svakom trenutku isključiti u postavkama telefona.

### 3.2 Pristup kameri i skeniranje QR kodova
- **Kako se koristi**:
  - Isključivo za prepoznavanje i očitavanje fizičkih QR kodova na lokacijama potrage.
- **Tok podataka**:
  - Video stream kamere se obrađuje u realnom vremenu u radnoj memoriji uređaja putem biblioteke `html5-qrcode`.
  - Fotografije, video zapisi ili lica se ne snimaju, ne spremaju i ne prenose na servere.
- **Vaša kontrola**: Dozvola za kameru se traži samo prilikom otvaranja skenera. Odbijanje dozvole onemogućava samo skeniranje zadataka, dok sve ostale funkcije (mapa, audio vodič, planer) ostaju potpuno funkcionalne.

### 3.3 Sesije igrača i napredak u potrazi
- **Anonimna prijava gosta**:
  - Za dodjelu XP bodova i evidenciju faza potrage, aplikacija koristi anonimnu sesiju gosta putem Supabase Auth (`signInAnonymously()`).
  - Ova sesija ne sadrži lične podatke (nema emaila, imena niti lozinke).
- **Pohranjeni podaci o potrazi**:
  - Baza podataka bilježi: Anonimni ID igrača, ID zadatka, osvojene XP bodove i datum završetka.
  - Otključani zadaci se također čuvaju lokalno na uređaju radi offline rada.

### 3.4 Audio vodiči i multimedijalni sadržaj
- Audio zapisi se preuzimaju sa našeg hosting servera. Standardni tehnički podaci veze (IP adresa i tehnički podaci preglednika) prenose se u svrhu isporuke sadržaja.
- Aplikacija ne koristi i ne traži pristup mikrofonu.

### 3.5 Neobavezna analitika (Vercel Analytics & Speed Insights)
- Koristimo minimalnu analitiku performansi radi praćenja stabilnosti, brzine učitavanja i uklanjanja grešaka.
- Ova analitika **ne prati korisnike između različitih web stranica** i **aktivira se isključivo ako je korisnik izričito prihvati** na traci za pristanak.

---

## 4. Pružaoci usluga treće strane

| Pružalac | Svrha | Pravila privatnosti |
| :--- | :--- | :--- |
| **Supabase** | Sigurna baza podataka, PostGIS geofencing, anonimne sesije | [Supabase Pravila](https://supabase.com/privacy) |
| **Geoapify** | Izračunavanje pješačkih ruta i 3D stil mape | [Geoapify Pravila](https://www.geoapify.com/privacy-policy) |
| **Vercel** | Hosting web aplikacije i opciona analitika | [Vercel Pravila](https://vercel.com/legal/privacy) |

---

## 5. Brisanje podataka i vaša prava

- **Lokalni podaci**: Možete u svakom trenutku obrisati sve lokalno pohranjene podatke i historiju skeniranja jednostavnim čišćenjem memorije aplikacije u postavkama telefona ili klikom na opciju "Obriši historiju" na profilu.
- **Podaci na serveru**: Budući da su zapisi u bazi vezani za anonimni identifikator gosta, možete zatražiti brisanje zapisa slanjem vašeg anonimnog ID-a na našu kontakt adresu.

---

## 6. Kontakt

Za sva pitanja u vezi privatnosti obratite nam se na:

**AISO Tuzla — Tuzla Tour Guide**  
Email: [aisotuzla@proton.me](mailto:aisotuzla@proton.me)  
Tuzla, Bosna i Hercegovina
