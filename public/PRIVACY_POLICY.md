# Politika privatnosti — Tuzla Tour Guide

**Radni nacrt; posljednji pregled koda:** 26. novembar 2026.
**Primjenjuje se na:** web aplikaciju/PWA i podržanu Android aplikaciju Tuzla Tour Guide.

> **Obavijest o statusu:** Ovo je nacrt zasnovan na pregledu klijentskog repozitorija, a ne pravno mišljenje, procjena uticaja niti potvrda usklađenosti. Prije javnog korištenja voditelj obrade treba potvrditi svoj puni pravni identitet, produkcijske tokove, pružaoce usluga, rokove čuvanja i postupke za prava korisnika. Detaljniji radni dokument o privatnosti po dizajnu nalazi se u projektnoj dokumentaciji.

## 1. Ko upravlja aplikacijom?

Projekat se u aplikaciji i dokumentaciji naziva **Tuzla Tour Guide / AISO Tuzla**. Amir Mulaosmanović je predlagač projekta, a „AISO Tuzla“ je radni naziv budućeg startupa i trenutno nije registrovano pravno lice. Formalni voditelj obrade, njegova puna adresa i odgovornosti moraju se potvrditi prije objave konačne pravne obavijesti.

Za pitanja i zahtjeve u vezi s privatnošću možete pisati na [aisotuzla@proton.me](mailto:aisotuzla@proton.me) sa naslovom „Zahtjev za privatnost — Tuzla Tour Guide“. Nemojte slati lozinke, tajne ključeve ni nepotrebne identifikacione dokumente.

## 2. Koje podatke aplikacija obrađuje?

Podaci zavise od funkcije koju koristite, dozvola uređaja i aktivne produkcijske konfiguracije.

### Lokacija i navigacija

Kada koristite funkciju zasnovanu na lokaciji i odobrite pristup, aplikacija može koristiti lokaciju uređaja za prikaz na mapi, udaljenost ili navigaciju. Quest klijent uz zahtjev za provjeru skeniranja može poslati dostupne koordinate geografske širine i dužine. Klijentski repozitorij sam po sebi ne utvrđuje da li se te koordinate, ulazni zahtjevi ili povezani logovi čuvaju na serveru niti koliko dugo.

Možete odbiti ili opozvati dozvolu u postavkama preglednika ili uređaja. Odbijanje može onemogućiti funkcije koje zavise od lokacije.

### Kamera i QR kodovi

Kamera se koristi kada otvorite QR skener. Klijentska aplikacija dekodira QR kod radi identifikacije Quest zadatka, a zahtjev za provjeru šalje podatke o zadatku i QR vrijednost. Pregledani klijentski tok ne šalje video stream kamere tom zahtjevu. Kamera nije potrebna za pregled većine ostalih sadržaja.

### Gostujuća sesija i Quest napredak

Za Quest aplikacija koristi Supabase anonimnu autentifikaciju. Ne traži se unos e-maila, lozinke, imena ni broja telefona, ali se kreira pseudonimni identifikator gosta. Pseudonimni identifikator nije isto što i potpuno anonimni podatak.

Klijent šalje podatke potrebne za serversku provjeru Quest zadatka, uključujući ID zadatka, QR vrijednost i dostupne koordinate. Supabase shema projekta sadrži podatke o profilima i završecima zadataka. Tačan opseg zapisa, serversko logovanje i rok čuvanja moraju se potvrditi prema aktivnoj produkcijskoj bazi i RPC implementaciji.

### Lokalni podaci

Aplikacija pohranjuje odabrane postavke i funkcionalne podatke na uređaju, zavisno od platforme. To može uključivati jezik, pristanak, lokalni napredak i evidenciju skeniranja, planer ili bilješke. Brisanje podataka aplikacije ili preglednika može ukloniti lokalne podatke. Lokalno brisanje **ne garantuje** brisanje ranijih serverskih Quest zapisa.

### Tehnički i mrežni podaci

Za isporuku aplikacije, mapa, ruta i medija, hosting, baza, mapni ili drugi vanjski pružaoci mogu primiti standardne tehničke podatke kao što su IP adresa, vrijeme zahtjeva, traženi resurs i zaglavlja preglednika/uređaja. Tačan skup podataka, lokacija obrade i rokovi zavise od servisa i njegove konfiguracije.

### Opcionalna analitika

Klijentska aplikacija može učitati Vercel Analytics i Speed Insights kada je opcionalna analitika prihvaćena. Trenutna traka za pristanak prikazuje se samo na bosanskom jeziku. Dok se obavijest ne obezbijedi na svim podržanim jezicima, taj tok treba doraditi i pravno provjeriti; nemojte pretpostaviti da je trenutni prikaz dovoljan za svaku publiku.

## 3. Svrhe i pravni osnov

Podaci se mogu obrađivati radi prikaza odabrane funkcije, Quest provjere, rada aplikacije, sigurnosti i opcionalne analitike. Konačan pravni osnov za svaku svrhu, obavezni tekst obavijesti i mogućnost povlačenja izbora treba potvrditi za produkciju prema primjenjivom pravu.

Dozvola operativnog sistema za kameru ili lokaciju tehnički kontroliše pristup uređaju; sama po sebi nije zamjena za potpunu pravnu obavijest o obradi podataka.

## 4. Pružaoci usluga i prijenosi

Prema tehnologijama i pozivima vidljivim u projektu, mogu se koristiti:

- **Supabase** za anonimnu autentifikaciju, bazu i Quest RPC;
- **Vercel** za hosting i opcionalnu analitiku;
- **Geoapify** i drugi mapni/route pružaoci za odabrane mapne funkcije;
- vanjski pružaoci sadržaja, CDN-a, fontova ili događaja, zavisno od funkcije.

Tačan spisak aktivnih pružalaca, njihove uloge, podobrađivači, lokacije obrade, ugovori i zaštitne mjere za prijenos izvan BiH moraju se provjeriti prije objave konačne politike. Za informacije o njihovoj obradi pogledajte njihove objavljene politike privatnosti.

## 5. Čuvanje, brisanje i korisnička prava

Za sada nisu potvrđeni jedinstveni rokovi čuvanja za serverske Quest zapise, tehničke logove i sigurnosne kopije. Rokovi i postupak sigurnog brisanja moraju se odrediti i objaviti prije produkcijske upotrebe.

Možete zatražiti informacije o podacima, pristup ili ispravku/brisanje gdje su takva prava primjenjiva. Obratite se na [aisotuzla@proton.me](mailto:aisotuzla@proton.me). Ako znate pseudonimni identifikator gosta, možete ga navesti radi lakšeg pronalaska zapisa; nemojte slati više podataka nego što je potrebno.

Resetovanje lokalne historije ili aplikacije nije isto što i zahtjev za brisanje serverskih podataka. Trenutna implementacija ne potvrđuje automatsko brisanje svih cloud zapisa prilikom lokalnog reseta.

## 6. Sigurnost

Aplikacija koristi vanjske hosting i backend servise. Sigurnost zavisi od konfiguracije aplikacije, pružalaca usluga, pristupnih kontrola, baza i uređaja. Projekat treba završiti pregled produkcijskih RLS/RPC pravila, logovanja, tajni, enkripcije, backup-a i pristupa prije javne tvrdnje o konkretnim garancijama.

## 7. Zakon i nadzor

U Bosni i Hercegovini relevantan je Zakon o zaštiti ličnih podataka, „Službeni glasnik BiH“ broj 12/25, naveden na stranici [Agencije za zaštitu ličnih podataka u BiH — propisi](https://www.azlp.ba/Propisi/Default.aspx?id=5&langTag=bs-BA). Ova politika ne potvrđuje usklađenost. Zahtjevi i prava zavise od primjenjivog zakona; možete se obratiti nadležnoj Agenciji ili kvalifikovanom pravnom savjetniku.

## 8. Izmjene politike

Politiku je potrebno ažurirati kada se promijene funkcije, Quest serverski tok, pružaoci usluga, svrhe obrade ili rokovi čuvanja. Prije javne objave, odgovorno lice treba potvrditi da tekst odgovara stvarnoj produkcijskoj konfiguraciji.

## Povezani dokumenti

- [Politika kolačića i lokalne pohrane](./COOKIE_POLICY.md)
