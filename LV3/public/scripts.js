let sviFilmovi = [];
let kosarica = []; // Niz u koji spremamo odabrane filmove

document.addEventListener("DOMContentLoaded", () => {
    const csvFilePath = 'movies.csv'; 

    fetch(csvFilePath)
        .then(response => {
            if (!response.ok) throw new Error("CSV datoteka nije pronađena!");
            return response.text();
        })
        .then(csvData => {
            const parsed = Papa.parse(csvData, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true
            });

            sviFilmovi = parsed.data;
            prikaziFilmove(sviFilmovi); // Prvi prikaz svih filmova
            inicijalizirajFiltere();
            inicijalizirajKosaricu();
        })
        .catch(error => console.error("Greška pri učitavanju:", error));
});

// FUNKCIJA ZA DINAMIČKI PRIKAZ TABLICE
function prikaziFilmove(filmovi) {
    const tbody = document.querySelector("#movie-table tbody");
    tbody.innerHTML = ""; 

    if (filmovi.length === 0) {
        tbody.innerHTML = "<tr><td colspan='8' style='text-align:center;'>Nema rezultata za odabrane kriterije.</td></tr>";
        return;
    }

    filmovi.forEach((film, index) => {
        const row = document.createElement("tr");
        
        // Priprema naslova za JS parametar (rješava problem ako naslov ima apostrof)
        const naslovSiguran = film.Naslov ? film.Naslov.replace(/'/g, "\\'") : "N/A";

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${film.Naslov || 'N/A'}</td>
            <td>${film.Godina || 'N/A'}</td>
            <td>${film.Zanr || 'N/A'}</td>
            <td>${film.Trajanje_min || 'N/A'}</td>
            <td>${film.Zemlja_porijekla || 'N/A'}</td>
            <td><strong>${film.Ocjena || '0.0'}</strong></td>
            <td>
                <button class="btn-add-table" onclick="dodajUKosaricu('${naslovSiguran}', '${film.Godina}', '${film.Zanr}')">
                    Dodaj
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ZADATAK 2: FILTRIRANJE
function inicijalizirajFiltere() {
    const btnFilter = document.getElementById('btn-filter');
    const ratingRange = document.getElementById('rating-range');
    const ratingValue = document.getElementById('rating-value');

    // Ažuriranje brojke pored slidera
    ratingRange.addEventListener('input', () => {
        ratingValue.textContent = ratingRange.value;
    });

    // Klik na gumb "Filtriraj"
    btnFilter.addEventListener('click', () => {
        const searchTxt = document.getElementById('search-title').value.toLowerCase();
        const minRating = parseFloat(ratingRange.value);
        const selectedCountry = document.querySelector('input[name="country-filter"]:checked').value;

        const filtrirani = sviFilmovi.filter(film => {
            const matchTitle = film.Naslov && film.Naslov.toLowerCase().includes(searchTxt);
            const matchRating = (film.Ocjena || 0) >= minRating;
            
            let matchCountry = true;
            if (selectedCountry === "USA") {
                matchCountry = film.Zemlja_porijekla === "USA";
            } else if (selectedCountry === "other") {
                matchCountry = film.Zemlja_porijekla !== "USA";
            }

            return matchTitle && matchRating && matchCountry;
        });

        prikaziFilmove(filtrirani);
    });
}

// ZADATAK 3: LOGIKA KOŠARICE (WATCHLIST)

function dodajUKosaricu(naslov, godina, zanr) {
    // Provjera postoji li već u košarici da izbjegnemo duplikate
    if (kosarica.find(f => f.naslov === naslov)) {
        alert("Film je već u košarici!");
        return;
    }

    kosarica.push({ naslov, godina, zanr });
    azurirajPrikazKosarice();
}

function ukloniIzKosarice(naslov) {
    kosarica = kosarica.filter(f => f.naslov !== naslov);
    azurirajPrikazKosarice();
}

function azurirajPrikazKosarice() {
    const popisUl = document.getElementById('popis-kosarice');
    const countSpan = document.getElementById('kosarica-count');
    const akcijeDiv = document.getElementById('kosarica-akcije');

    // Očisti trenutni prikaz
    popisUl.innerHTML = "";
    
    // Ažuriraj broj u naslovu košarice
    countSpan.textContent = kosarica.length;

    // Generiraj listu filmova s gumbom za brisanje
    kosarica.forEach(film => {
        const li = document.createElement("li");
        li.className = "kosarica-item";
        
        const naslovSiguran = film.naslov.replace(/'/g, "\\'");
        
        li.innerHTML = `
            <span style="color: white; font-size: 0.85rem;">
                <strong>${film.naslov}</strong> (${film.godina})
            </span>
            <button class="btn-remove" onclick="ukloniIzKosarice('${naslovSiguran}')">×</button>
        `;
        popisUl.appendChild(li);
    });

    // Prikaži gumb za potvrdu samo ako košarica nije prazna
    akcijeDiv.style.display = kosarica.length > 0 ? "block" : "none";
}

function inicijalizirajKosaricu() {
    const btnPotvrdi = document.getElementById('btn-potvrdi');
    
    btnPotvrdi.addEventListener('click', () => {
        if (kosarica.length > 0) {
            alert(`Uspješno ste dodali ${kosarica.length} filma u svoju košaricu za vikend maraton!`);
            
            // Nakon potvrde prazni se košarica
            kosarica = [];
            azurirajPrikazKosarice();
        }
    });
}