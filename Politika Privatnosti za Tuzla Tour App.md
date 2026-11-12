# Politika Privatnosti za Tuzla Tour Aplikaciju

**Posljednji put ažurirano:** Novembar 2026. godine  
**Verzija:** 3.0  
**Usklađenost:** Zakon o zaštiti ličnih podataka BiH & EU GDPR (Uredba 2016/679)

---

## 1. Uvod

Dobrodošli u **Tuzla Tour App** ("mi", "naš" ili "Aplikacija"). Posvećeni smo maksimalnoj zaštiti vaše privatnosti i osiguravanju sigurnog rukovanja vašim podacima u skladu sa najvišim standardima privatnosti po dizajnu (*Privacy by Design*).

Ova Politika privatnosti objašnjava kako aplikacija pristupa podacima, kako ih obrađuje i štiti, te je u potpunosti usklađena sa:
- **Zakonom o zaštiti ličnih podataka Bosne i Hercegovine**
- **Opštom uredbom o zaštiti podataka Evropske unije (GDPR)**
- **Direktivom o e-Privatnosti (ePrivacy Directive)**

---

## 2. Ko je kontrolor podataka?

**Kontrolor podataka:** AISO Tuzla (Razvojni tim Tuzla Tour Guide)  
**Sjedište:** Tuzla, Bosna i Hercegovina  
**Kontakt e-mail:** aisotuzla@proton.me  

**Infrastrukturni hosting provajderi:** Vercel Inc. i Netlify Inc. (isporuka statičkih PWA web aplikacija).

---

## 3. Podaci koje obrađujemo i kako ih koristimo

Naša osnovna filozofija je **lokalna obrada na uređaju korisnika (Client-Side Edge Processing)**. Vaši senzorski podaci ne putuju na naše servere.

### A. Podaci o lokaciji i geofencing obavijesti (Perimetar od 25 metara)

- **Svrha:**
  - Izračunavanje pješačke rute i udaljenosti do tačaka interesa (POI), restorana, hotela i partnera.
  - Slanje **lokalnih push notifikacija na uređaju kada se približite na 25 metara od znamenitosti ili partnerske radnje** ("Blizu ste! Otvorite AR vodič").
  - Geografska validacija napretka u Tuzla Quest potrazi (verifikacija prisustva).
- **Obrada:**
  - Podaci o GPS koordinatama se obrađuju **isključivo lokalno na čipu vašeg telefona**.
  - Aplikacija **NE prati** vašu lokaciju u pozadini kada je aplikacija zatvorena.
  - Koordinate se **NE pohranjuju** na eksterne servere i **NE dijele** sa marketinškim mrežama.
  - Notifikacije na 25 metara generiše operativni sistem telefona (Local Notifications API) bez slanja vaše lokacije na internet.
- **Pravni osnov:** Vaš izričiti pristanak (član 6(1)(a) GDPR).

### B. Pristup kameri i AR usmjeravanje visoke preciznosti (Mikro-radijus od 5 metara)

- **Svrha:**
  - Prikaz 3D elemenata proširene stvarnosti (AR) preko stvarnog grada.
  - **Aktivacija optičkog ciljanja kamerom na 5 metara od odredišta:** kamera visoke preciznosti pomaže korisniku da u milimetar precizno locira ulaz u lokalnu radnju ili spomenik.
  - Skeniranje fizičkih QR kodova postavljenih u partnerskim lokalima i na znamenitostima.
- **Obrada:**
  - Video stream kamere se obrađuje **isključivo u radnoj memoriji (RAM) vašeg uređaja** preko HTML5 Canvas i WebAssembly engine-a (`html5-qrcode`).
  - Aplikacija **NE snima fotografije**, **NE snima video zapise** i **NE vrši prepoznavanje lica**.
  - Nakon analize QR koda ili zatvaranja AR ekrana, memorijski bafer kamere se momentalno prazni. Niti jedan piksel se ne šalje na server.
- **Pravni osnov:** Izričiti pristanak korisnika (član 6(1)(a) GDPR).

### C. Verifikacija fizičkog prisustva u lokalnim radnjama ("Proof-of-Footprint") i Popusti

- **Svrha:**
  - Omogućavanje turistima i građanima ostvarivanje **20% trenutnog popusta** na račune u lokalnim restoranima, kafićima, zanatskim radnjama i partnerskim objektima (npr. Palačinkara Bagi, Bingo City Centar).
  - Garancija privrednicima da je gost zaista fizički ušao u objekat (sprečavanje lažnih i zlonamjernih online zloupotreba kupona).
- **Obrada:**
  - Skeniranjem fizičkog QR koda na kasi ili stolu, aplikacija lokalno verificira vaš "footprint".
  - **Bez dijeljenja profila:** Lokalni biznis NE dobija vaš broj telefona, ime, prezime ili podatke o plaćanju. Verifikacija se vrši anonimno.
- **Pravni osnov:** Izvršenje zatražene usluge i legitimni interes zaštite partnera od zloupotrebe kupona (član 6(1)(b) i 6(1)(f) GDPR).

### D. Web3 Novčanik (Solana)

- **Svrha:** Preuzimanje digitalnih kolekcionarskih NFT sličica ("Zmajevi BiH" / Tuzla Quest trofeji) na Solana Devnet mreži.
- **Obrada:** Aplikacija pristupa samo vašoj javnoj adresi novčanika. Nikada ne tražimo i nemamo pristup vašim privatnim ključevima ili seed frazama.

### E. Lokalna pohrana i postavke (Capacitor Preferences)

- Čuva odabrani jezik (bosanski, engleski, njemački, turski), otključane etape potrage, PIN novčanika (lokalno enkriptovan) i postavke štednje baterije. Podaci se brišu deinstalacijom aplikacije.

---

## 4. Da li dijelimo vaše podatke?

**Ne.** Vaši podaci se ne prodaju, ne iznajmljuju niti dijele za oglašavanje. Analitički podaci (Google Analytics, Vercel Analytics) su potpuno anonimni, agregirani i mogu se u svakom trenutku odbiti putem bannera za kolačiće.

---

## 5. Vaša prava prema Zakonu o zaštiti ličnih podataka BiH i GDPR-u

Kao korisnik imate pravo na:
1. **Pristup i informisanje:** Pravo uvida u to kako aplikacija obrađuje podatke.
2. **Povlačenje pristanka:** U bilo kojem trenutku možete isključiti dozvolu za lokaciju ili kameru u postavkama telefona.
3. **Pravo na zaborav:** Deinstalacija aplikacije ili brisanje keša telefona briše sve vaše podatke bez traga.
4. **Pritužbu nadzornom organu:** Pravo obraćanja *Agenciji za zaštitu ličnih podataka u Bosni i Hercegovini*.

---

## 6. Kontakt

Za sva pitanja u vezi privatnosti obratite se našem timu:  
📧 **E-mail:** aisotuzla@proton.me  
📍 **Lokacija:** Tuzla, Bosna i Hercegovina
