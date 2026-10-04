# DIGITALNA SVADBENA POZIVNICA

## 1. Otvaranje
Najlakše:
- raspakuj ZIP
- otvori `index.html` u browseru

Za najbolji rad možeš koristiti VS Code + Live Server.

## 2. Slike
U folder `assets` ubaci:
- hero.jpg       -> naslovna fotografija
- story.jpg      -> fotografija za "Our Story"
- photo1.jpg
- photo2.jpg
- photo3.jpg
- photo4.jpg
- countdown.jpg
- final.jpg

## 3. Muzika
U `assets` ubaci:
- music.mp3

Browser ne dozvoljava da se muzika sama pokrene pre interakcije korisnika.
Kod je napravljen tako da se muzika pokrene nakon prvog dodira/klika.

## 4. Promena imena, datuma i WhatsApp-a
U `script.js` na vrhu:

const CONFIG = {
  weddingDate: "2027-06-18T18:00:00+02:00",
  rsvpWhatsApp: "",
  coupleNames: "Danijel & Aleena"
};

Promeni datum i broj telefona.

Za WhatsApp broj upiši međunarodni format bez + i bez razmaka.
Primer:
rsvpWhatsApp: "381641234567"

## 5. Promena tekstova
Sve tekstove menjaš direktno u `index.html`.

## 6. Promena boja
Boje su na početku `style.css` u `:root`.

## 7. Važno za pravi proizvod
Ova verzija je frontend demo.
Za stvarno čuvanje RSVP odgovora svih gostiju treba dodati backend/database
(npr. Firebase, Supabase, PHP/MySQL ili Django).
