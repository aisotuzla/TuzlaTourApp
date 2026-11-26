# Privatnost po dizajnu i zaštita ličnih podataka

**Projekat:** Tuzla Tour Guide i povezani pilot Tuzla Quest
**Datum pregleda koda:** 26. novembar 2026.
**Status:** Radni dokument za mapiranje podataka i pripremu pravne/tehničke provjere

> **Važno:** Ovo nije pravno mišljenje, procjena uticaja na zaštitu podataka niti potvrda usklađenosti. Za službenu objavu i obradu stvarnih korisnika, odgovorno lice treba potvrditi primjenjive obaveze sa kvalifikovanim pravnim stručnjakom. Nadležni izvor propisa je [Agencija za zaštitu ličnih podataka u Bosni i Hercegovini — propisi](https://www.azlp.ba/Propisi/Default.aspx?id=5&langTag=bs-BA), koja navodi Zakon o zaštiti ličnih podataka, „Službeni glasnik BiH“ broj 12/25.

## 1. Svrha i principi

Ovaj dokument prevodi namjeru „privatnost po dizajnu“ u provjerljive tehničke i organizacione korake. Cilj je da se obrađuje samo ono što je potrebno za funkciju koju je posjetilac izabrao, uz razumljivu obavijest, ograničen pristup, definisano čuvanje i mogućnost ostvarivanja prava.

Ključna razlika: „ne traži ime ili e-mail“ ne znači „ne obrađuje lične podatke“. Pseudonimni identifikator gosta, lokacija povezana sa sesijom, IP adresa i drugi podaci koji omogućavaju izdvajanje ili povezivanje događaja mogu biti lični podaci.

## 2. Uloge i odgovornost

Amir Mulaosmanović je dostavljen kao autor i predlagač projekta. „AISO Tuzla“ je trenutno radni naziv budućeg startupa i nije registrovano pravno lice. Prije produkcijske objave, treba potvrditi ko je formalni voditelj obrade, njegov pravni identitet, adresu za kontakt, ulogu eventualnog budućeg pravnog lica i odgovornosti partnera.

Do te potvrde dokumente ne treba predstavljati kao da je AISO Tuzla već registrovan voditelj obrade ili posebna pravna osoba. Kontakt koji se trenutno navodi u projektu je `aisotuzla@proton.me`; potrebno je potvrditi da li će se koristiti za zahtjeve nosilaca podataka.

## 3. Inventar podataka prema klijentskom kodu

| Funkcija | Podaci koje klijent koristi/šalje | Svrha | Status čuvanja i otvorena provjera |
|---|---|---|---|
| Turistička mapa i navigacija | Lokacija uređaja kada je funkcija aktivna; tehnički podaci zahtjeva prema mapnim/routing servisima | Prikaz pozicije, udaljenosti i/ili rute | Klijent koristi browser Geolocation API. Provjeriti koji servis prima zahtjeve i kakva je njegova log-retencija. |
| Tuzla Quest — gost | Supabase anonimna sesija i UUID gosta; profil može dobiti generički naziv poput „Gost istraživač“ | Povezivanje napretka i sprečavanje duplih završetaka | `ensurePlayerSession` poziva anonimnu prijavu i upisuje profil. UUID je pseudonimni identifikator, a ne dokaz da podaci nisu lični. |
| Tuzla Quest — skeniranje | ID zadatka, QR vrijednost/payload i opcionalne koordinate geografske širine i dužine | Serverska provjera skeniranja i završetka zadatka | Klijent šalje vrijednosti RPC funkciji `complete_tuzla_quest`. Potrebno pregledati serversku funkciju, logove, RLS i rokove čuvanja; klijentski repozitorij ne potvrđuje koliko dugo se koordinate zadržavaju. |
| Quest napredak | Identifikator igrača, ID lokacije, XP i vrijeme završetka prema tipu podataka | Napredak i prikaz rezultata | Supabase shema tipova sadrži `profiles`, `quests` i `quest_completions`. Potvrditi stvarnu produkcijsku shemu i brisanje. |
| Kamera i QR kod | Privremeni video stream i dekodirani QR sadržaj | Skeniranje fizičkog QR koda | `html5-qrcode` koristi kameru u klijentu. Pregledani klijentski tok šalje QR vrijednost za provjeru, ne video/fotografiju. Potvrditi Android/WebView dozvole na testnim uređajima. |
| Lokalni napredak i historija | Otključane lokacije, proslavljene faze i lokalna historija skeniranja | Prikaz stanja i reset na uređaju | Capacitor Preferences koristi ključeve `tuzla_unlocked`, `tuzla_celebrated_phases` i `tuzla_scan_ledger`. |
| Plan putovanja i bilješke | Stavke itinerera, troškovi i korisničke bilješke | Lokalno planiranje putovanja | Uskladiti popis sa svim komponentama i pohranom na web/Android platformama; ne pretpostavljati da se podaci sinhronizuju. |
| Pristanak i opcionalna analitika | Izbor pristanka, verzija i vremenska oznaka; analitički/performance događaji nakon pristanka | Pamćenje izbora i mjerenje performansi | Izbor se pohranjuje lokalno. Kôd uključuje Vercel Analytics i Speed Insights kada je `performance` prihvaćen. Banner se prikazuje samo kada je jezik aplikacije bosanski; treba provjeriti ekvivalentnu obavijest na drugim jezicima. |
| Događaji i vanjski sadržaj | Tehnički podaci mrežnih zahtjeva; javni sadržaj događaja | Isporuka medija, mapa i javnih informacija | Potvrditi aktivne hosting, mapne, CDN, font, analitičke i baza-podataka pružaoce u produkciji. |

### Napomena o serverskoj validaciji

Klijentski kod poziva `complete_tuzla_quest` i predaje `p_quest_id`, `p_qr_payload`, `p_lat` i `p_lon` kada su dostupni. Kod sadrži komentar o provjeri QR vrijednosti i geografske udaljenosti, ali se ne može zaključiti iz klijentskog repozitorija da li RPC zapisuje koordinate, ulazne payload-e ili samo rezultat. Za konačnu obavijest potrebno je pregledati stvarnu SQL/Edge/RPC implementaciju, RLS politike, Postgres logove i pružaoce infrastrukture.

## 4. Minimalne garancije i granice tvrdnji

Na osnovu pregledanog klijentskog koda može se reći:

- Za gostujući Quest nije potreban unos korisničkog e-maila, telefona ili lozinke.
- Kreira se Supabase anonimna sesija i profil s generičkim prikaznim imenom.
- QR skeniranje radi kroz kameru uređaja i šalje podatke potrebne za provjeru; video stream se ne šalje u RPC pozivu.
- Kada je Quest skeniranje povezano s dostupnom lokacijom, klijent predaje koordinate serverskoj funkciji.
- Lokalni reset odjavljuje trenutnu anonimnu sesiju i briše određeno lokalno stanje; to nije isto što i brisanje starih serverskih Quest zapisa.

Ne tvrditi bez dodatne provjere:

- da je UUID gosta „šifriran“; ispravan opis je pseudonimni identifikator, uz zasebnu provjeru enkripcije u prenosu i mirovanju;
- da se lokacija nikad ne čuva ili da je nemoguće povezati je s gostom;
- da su podaci potpuno anonimni;
- da su svi pružaoci obuhvaćeni ugovorima o obradi podataka ili odgovarajućim zaštitnim mjerama za međunarodni prijenos;
- da je projekat u potpunosti usklađen sa Zakonom ili GDPR-om bez pravne procjene i dokaza iz produkcijske konfiguracije.

## 5. Kontrolne mjere privatnosti po dizajnu

### Minimizacija i ograničenje svrhe

- Ne uvoditi profilna polja, trajnu historiju kretanja ili analitiku ponašanja bez konkretne potrebe i dokumentovane svrhe.
- Lokaciju tražiti tek kada je potrebna za prikaz/navigaciju ili Quest provjeru; slati samo uz zahtjev koji je korisnik pokrenuo.
- QR obradu ograničiti na podatke potrebne za provjeru zadatka.
- U poslovnim izvještajima koristiti zbirne rezultate, bez pojedinačnih UUID-a, preciznih koordinata ili mogućnosti izdvajanja osobe.

### Transparentnost i izbor

- Prije korištenja kamere ili lokacije jasno reći zašto su potrebne, kada se aktiviraju i kako ih isključiti.
- Politiku privatnosti, obavijest o kameri/lokaciji i cookie/analytics izbor ponuditi na jeziku koji korisnik koristi.
- Odbijanje opcionalne analitike ne smije blokirati osnovni vodič.
- Ažurirati tekst nakon promjene RPC-a, sesija, analitike, hosting provajdera ili načina nagrađivanja.

### Sigurnost i pristup

- Držati serverske tajne samo na serveru; javni klijent smije koristiti samo namjenski javni ključ.
- Provjeriti RLS za svaku izloženu tabelu, identifikaciju vlasništva nad zapisima i ograničenja nad RPC funkcijama.
- Ograničiti administratorski pristup, voditi evidenciju pristupa i imati plan rotacije tajni.
- Potvrditi TLS u prenosu, enkripciju pohrane kod svakog provajdera, backup, incidentne obavijesti i podizvođače.
- Ne pohranjivati QR payload, GPS ni debug logove duže nego što je potrebno za dokumentovanu svrhu.

### Čuvanje i ostvarivanje prava

- Uvesti odobren rok čuvanja za naloge gosta, Quest završetke, logove, pristanak i lokalne podatke.
- Omogućiti postupak pristupa, ispravke i brisanja gdje je primjenjivo; povezati ga s pseudonimnim gostom bez nepotrebnog traženja identifikacionih dokumenata.
- Objasniti razliku između resetovanja lokalnog napretka i brisanja serverskog zapisa.
- Uspostaviti proces za zahtjeve, incidente, pritužbe i obavještavanje u zakonskim rokovima nakon pravne provjere.

## 6. Pravna priprema za BiH

Agencija za zaštitu ličnih podataka u BiH objavljuje [Zakon o zaštiti ličnih podataka („Službeni glasnik BiH“ broj 12/25)](https://www.azlp.ba/Propisi/Default.aspx?id=5&langTag=bs-BA). Ovaj dokument ne tumači pojedine članove niti potvrđuje da je projekat usklađen.

Prije javne isporuke, pravni pregled treba utvrditi:

1. formalni identitet voditelja obrade i kontakt za zahtjeve;
2. svrhe i pravni osnov za svaku kategoriju podataka, posebno pseudonimne Quest naloge i lokaciju;
3. obavijesti, ostvarivanje prava i rokove odgovora;
4. obaveze i ugovore s obrađivačima i podobrađivačima;
5. međunarodne prijenose podataka i odgovarajuće zaštitne mjere;
6. rokove čuvanja i sigurno brisanje, uključujući anonimne gostujuće naloge;
7. sigurnosne mjere, evidencije obrade, incidentni proces i potrebu za procjenom uticaja;
8. obaveze prema maloljetnicima i posebne situacije partnera;
9. pravilan režim kolačića/lokalne pohrane i opcionalne analitike.

Primjena GDPR-a, ako je relevantna zbog korisnika ili aktivnosti u EEA, treba se zasebno procijeniti; ne pretpostavlja se automatski niti zamjenjuje BiH pravnu analizu.

## 7. Dokumentacijske ispravke i preostali rizici

- Ranija verzija `README.md` tvrdila je zakonsku usklađenost bez dokaza; tvrdnja je uklonjena.
- Ranije, međusobno neusklađene politike zamijenjene su jednim bosanskim javnim radnim nacrtom i kratkim poveznicama iz korijenskih kopija. Prije objave potrebno je pravno potvrditi konačan tekst i stvarnu produkciju.
- Klijent šalje dostupne koordinate serverskoj RPC funkciji; javni nacrt sada ne tvrdi da se one ne čuvaju. Serversko pohranjivanje i logove ipak treba provjeriti.
- Cookie/analytics obavijest trenutno je prikazana samo na bosanskom jeziku. Potrebno je testirati i osigurati razumljivu obavijest na svim podržanim jezicima.
- In-app lokalni reset odjavljuje anonimnu sesiju i briše lokalni Quest napredak; ne briše automatski ranije serverske Quest zapise. Politika sada navodi ovu razliku, ali zahtjev za server-side brisanje još nije tehnički potvrđen.

## 8. Akcioni plan

| Prioritet | Aktivnost | Dokaz završetka | Status |
|---|---|---|---|
| P0 | Pregledati produkcijsku RPC implementaciju i logove `complete_tuzla_quest` | Inventar polja, svrhe, čuvanja i brisanja | Otvoreno |
| P0 | Utvrditi voditelja obrade i pravni kontakt | Odobreni pravni podaci u svim obavijestima | Otvoreno |
| P0 | Uskladiti englesku i bosansku politiku te javnu kopiju | Jedna verzionisana, usaglašena politika | Otvoreno |
| P0 | Definisati rokove čuvanja i proceduru za prava korisnika | Interna procedura i testni zahtjev za brisanje | Otvoreno |
| P1 | Provjeriti ugovore, podobrađivače i međunarodne prijenose | Evidencija servisa i pravne zaštite | Otvoreno |
| P1 | Proširiti razumljiv pristanak/obavijest na sve podržane jezike | Test pristanka na BS/EN/DE/TR | Otvoreno |
| P1 | Provjeriti RLS, RPC dozvole, administrativni pristup i tajne | Tehnički pregled i zapis popravki | Otvoreno |
| P2 | Razmotriti procjenu uticaja na zaštitu podataka prema stvarnom riziku | Dokumentovana odluka i, ako je potrebno, procjena | Otvoreno |

## 9. Veza s ostalim projektnim dokumentima

- [Projektni dosje i plan razvoja](./PROJEKTNI_DOSJE_TUZLA_TOUR_GUIDE.md)
- [README projekta](../README.md)
- [Politika privatnosti (engleska kopija)](../PRIVACY_POLICY.md)
- [Politika privatnosti (bosanska kopija)](../Politika%20Privatnosti%20za%20Tuzla%20Tour%20App.md)
- [Cookie politika](../COOKIE_POLICY.md)
- [Uputstvo za Tuzla Quest](../QUEST_GAME_MANUAL.md)
