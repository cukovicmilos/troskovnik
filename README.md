# Troškovnik

Aplikacija za praćenje mesečnih troškova sa vizuelnim prikazom raspodele i naprednim funkcijama za upravljanje budžetom.

## Mogućnosti

### Upravljanje troškovima
- **Kategorije** - Organizujte troškove po kategorijama sa emoji ikonama (Stanovanje, Komunalije, Digital, Prevoz, itd.)
- **Stavke** - Dodajte, uređujte i brišite pojedinačne troškove
- **Napomene** - Opcione beleške za svaku stavku
- **Premeštanje** - Premestite stavku iz jedne kategorije u drugu

### Praćenje datuma isteka

#### Datum završetka troška
- Za rate kredita, odložena plaćanja i slične troškove koji imaju krajnji datum
- Zelena ikona kalendara označava stavke sa datumom završetka
- **"Oslobađanje sredstava"** panel - prikazuje koliko novca se oslobađa po mesecima
- Automatski grupiše troškove koji ističu istog meseca

#### Kraj ugovorene obaveze
- Za ugovorne obaveze (kablovska, telefon, internet)
- Narandžasta ikona sertifikata označava stavke sa ugovorom
- **Upozorenje mesec dana ranije** - stavka postaje crvena sa belim tekstom
- Poruka: "Ugovor ističe ovog/sledećeg meseca! - Pregovarajte o novom ugovoru!"

### Vizualizacija
- **Pie chart** - Grafički prikaz raspodele troškova po kategorijama
- **Pregled** - Ukupni prihodi, rashodi i koliko ostaje za život
- **Boje** - Automatsko dodeljivanje boja kategorijama

### Tema
- Svetla i tamna tema
- Automatsko pamćenje izbora

### Istorija
- Evidencija svih promena (dodavanje, brisanje, izmene)
- Vremenske oznake za svaku akciju

## Tehnologije

- **Frontend**: Alpine.js, Tailwind CSS, Chart.js
- **Backend**: Node.js, Express
- **Storage**: Markdown fajl (bez baze podataka)
- **Ikone**: Tabler Icons

## Instalacija

```bash
# Klonirajte repozitorijum
git clone https://github.com/cukovicmilos/troskovnik.git
cd troskovnik

# Instalirajte zavisnosti
npm install

# Pokrenite server
npm start
```

Aplikacija će biti dostupna na `http://localhost:3000`

## Struktura projekta

```
troskovnik/
├── server.js           # Express server
├── package.json        # Zavisnosti
├── data/
│   └── troskovnik.md   # Podaci (gitignore)
└── public/
    ├── index.html      # Glavna stranica
    ├── js/
    │   ├── app.js      # Alpine.js aplikacija
    │   └── chart.js    # Chart.js konfiguracija
    └── css/
        └── style.css   # Dodatni stilovi
```

## Format podataka

Podaci se čuvaju u Markdown formatu:

```markdown
# Troškovnik

## Podešavanja
- Plata: 228150
- Tema: dark

## Kategorije
- 🏠 Stanovanje
- ⚡ Komunalije

## Troškovi
### 🏠 Stanovanje
- Struja | 13000 | napomena | 2025-08 | 2025-06
```

Format stavke: `naziv | iznos | napomena | datumZavrsetka | krajUgovora`

## Licenca

MIT
