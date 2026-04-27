const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Railway koristi process.env.PORT, lokalno koristimo 3000
const PORT = process.env.PORT || 3000;

// Postavljanje EJS kao engine-a za generiranje HTML-a
app.set('view engine', 'ejs');

// Omogućuje pristup statičkim datotekama u 'public' mapi (CSS, slike, JS)
app.use(express.static('public'));

// RUTA 1: Početna stranica (Zadatak 1)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// RUTA 2: Dinamička galerija (Zadatak 3)
app.get('/slike', (req, res) => {
    const folderPath = path.join(__dirname, 'public', 'images');
    
    // Provjera postoji li mapa sa slikama
    if (!fs.existsSync(folderPath)) {
        return res.send("Greška: Mapa 'public/images' ne postoji. Kreiraj je i dodaj slike!");
    }

    // Čitanje svih datoteka iz mape 'public/images'
    const files = fs.readdirSync(folderPath);
    
    // Filtriranje datoteka (samo slike) i priprema podataka za EJS
    const images = files
        .filter(file => /\.(jpg|jpeg|png|gif|svg)$/i.test(file))
        .map((file, index) => {
            return {
                url: `/images/${file}`,
                id: `slika${index + 1}`,
                title: `Slika ${index + 1}`
            };
        });

    // Slanje liste slika u slike.ejs
    res.render('slike', { images });
});

// Pokretanje poslužitelja
app.listen(PORT, () => {
    console.log(`Server pokrenut na http://localhost:${PORT}`);
});