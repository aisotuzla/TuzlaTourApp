# Politika kolačića i lokalne pohrane

**Posljednji pregled koda:** 26. novembar 2026.

Ova politika objašnjava upotrebu kolačića, browser pohrane i sličnih tehnologija u Tuzla Tour Guide. Radni je dokument, a ne pravno mišljenje. Prije javne objave treba potvrditi produkcijsku konfiguraciju i pružaoce usluga.

## 1. Kolačići i lokalna pohrana

Aplikacija koristi browser `localStorage` ili Capacitor Preferences, zavisno od platforme, za pamćenje odabranih postavki i funkcionalnog stanja. U pregledanom kodu odluka o pristanku čuva se pod ključem `tuzla_cookie_consent`. Ostale vrijednosti mogu uključivati jezik, Quest napredak i evidenciju skeniranja. Supabase SDK može lokalno čuvati podatke anonimne sesije.

Lokalna pohrana nije isto što i serverska pohrana. Brisanje lokalnih postavki ili historije ne potvrđuje brisanje prethodnih serverskih Quest zapisa.

## 2. Pristanak i opcionalna analitika

Opcionalni Vercel Analytics i Speed Insights učitavaju se kroz aplikacijski tok samo kada je odabrana opcionalna analitika. Odluka se pamti lokalno; nakon brisanja lokalnih podataka može se ponovo tražiti izbor.

Trenutna komponenta prikazuje traku za pristanak samo kada je jezik aplikacije bosanski (`bs`). To znači da jezička pokrivenost pristanka nije potpuna za sve podržane jezike. Prije oslanjanja na ovaj tok za produkcijsku obavijest, potrebno je dodati odgovarajuće prijevode i provjeriti ponašanje na svim platformama.

## 3. Vanjski sadržaj i tehnički podaci

Za isporuku aplikacije, mapa, ruta, fontova, medija i drugih vanjskih resursa mogu se slati standardni mrežni zahtjevi pružaocima hostinga, CDN-a, mapa i sadržaja. Takvi zahtjevi mogu pružaocu otkriti IP adresu, vrijeme i tehnička zaglavlja potrebna za isporuku resursa.

Tačan spisak aktivnih servisa, njihova konfiguracija, logovi i rokovi čuvanja trebaju se potvrditi prema produkcijskoj postavci.

## 4. Upravljanje i reset

Pristanak i lokalne postavke možete resetovati brisanjem podataka web-stranice u pregledniku. Na Android uređaju brisanje pohrane ili ponovna instalacija može ukloniti lokalne postavke i napredak. Efekti se mogu razlikovati po platformi.

Reset uređaja ne mora obrisati podatke koji su ranije poslani na server. Za zahtjev koji se odnosi na serverske podatke pišite na [aisotuzla@proton.me](mailto:aisotuzla@proton.me).

## 5. Kontakt i povezani dokumenti

Za pitanja pišite na [aisotuzla@proton.me](mailto:aisotuzla@proton.me).

- [Politika privatnosti](./PRIVACY_POLICY.md)
