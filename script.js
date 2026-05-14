// Endpoint utama PokeAPI
const API_URL = "https://pokeapi.co/api/v2/pokemon?limit=300";

// Mengambil elemen HTML
const pokemonContainer = document.getElementById("pokemonContainer");
const messageBox = document.getElementById("messageBox");
const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");
const refreshButton = document.getElementById("refreshButton");

const totalPokemon = document.getElementById("totalPokemon");
const currentFilter = document.getElementById("currentFilter");

const detailModal = document.getElementById("detailModal");
const closeModal = document.getElementById("closeModal");
const modalBody = document.getElementById("modalBody");

const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const pageInfo = document.getElementById("pageInfo");

const randomButton = document.getElementById("randomButton");
const compareButton = document.getElementById("compareButton");

const compareModal = document.getElementById("compareModal");
const closeCompareModal = document.getElementById("closeCompareModal");
const firstPokemonSelect = document.getElementById("firstPokemonSelect");
const secondPokemonSelect = document.getElementById("secondPokemonSelect");
const startCompareButton = document.getElementById("startCompareButton");
const compareResult = document.getElementById("compareResult");

// Menyimpan semua data Pokémon dari API
let allPokemon = [];
let filteredPokemon = [];
let currentPage = 1;
const itemsPerPage = 12;

// Menampilkan pesan loading atau error
function showMessage(message, type = "info") {
    messageBox.style.display = "block";
    messageBox.textContent = message;

    if (type === "error") {
        messageBox.style.background = "rgba(248, 113, 113, 0.14)";
        messageBox.style.color = "#fecaca";
        messageBox.style.border = "1px solid rgba(248, 113, 113, 0.35)";
    } else {
        messageBox.style.background = "rgba(250, 204, 21, 0.12)";
        messageBox.style.color = "#fde68a";
        messageBox.style.border = "1px solid rgba(250, 204, 21, 0.28)";
    }
}

// Menyembunyikan pesan
function hideMessage() {
    messageBox.style.display = "none";
}

// Mengambil data Pokémon dari PokeAPI
async function fetchPokemonData() {
    try {
        showMessage("Memuat data Pokémon dari PokeAPI...");

        pokemonContainer.innerHTML = "";
        allPokemon = [];
        filteredPokemon = [];
        currentPage = 1;

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Gagal mengambil daftar Pokémon.");
        }

        const data = await response.json();

        // Mengambil detail setiap Pokémon
        const pokemonDetails = await Promise.all(
            data.results.map(async (pokemon) => {
                const detailResponse = await fetch(pokemon.url);

                if (!detailResponse.ok) {
                    throw new Error("Gagal mengambil detail Pokémon.");
                }

                return await detailResponse.json();
            })
        );

        allPokemon = pokemonDetails;
        filteredPokemon = allPokemon;

        totalPokemon.textContent = filteredPokemon.length;
        currentFilter.textContent = "All";

        fillCompareSelects();
        hideMessage();
        displayPokemonWithPagination();

    } catch (error) {
        pokemonContainer.innerHTML = "";
        pageInfo.textContent = "Page 0 of 0";
        prevButton.disabled = true;
        nextButton.disabled = true;

        showMessage(
            "Maaf, data Pokémon gagal dimuat. Periksa koneksi internet atau coba lagi nanti.",
            "error"
        );
    }
}

// Menampilkan daftar Pokémon dengan pagination
function displayPokemonWithPagination() {
    pokemonContainer.innerHTML = "";

    if (filteredPokemon.length === 0) {
        showMessage("Pokémon tidak ditemukan.", "error");
        totalPokemon.textContent = "0";
        pageInfo.textContent = "Page 0 of 0";
        prevButton.disabled = true;
        nextButton.disabled = true;
        return;
    }

    hideMessage();

    totalPokemon.textContent = filteredPokemon.length;

    const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage);

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const currentPokemon = filteredPokemon.slice(startIndex, endIndex);

    currentPokemon.forEach((pokemon) => {
        const pokemonCard = document.createElement("div");
        pokemonCard.classList.add("pokemon-card");

        const pokemonTypes = pokemon.types.map(item => item.type.name);

        pokemonCard.innerHTML = `
            <p class="pokemon-number">#${formatNumber(pokemon.id)}</p>

            <div class="pokemon-image">
                <img 
                    src="${getPokemonImage(pokemon)}" 
                    alt="${pokemon.name}"
                >
            </div>

            <h3 class="pokemon-name">${pokemon.name}</h3>

            <div class="type-list">
                ${pokemonTypes.map(type => `
                    <span class="type-badge ${type}">${type}</span>
                `).join("")}
            </div>

            <div class="card-footer">
                <span>Height: ${pokemon.height / 10} m</span>
                <span>Weight: ${pokemon.weight / 10} kg</span>
            </div>
        `;

        pokemonCard.addEventListener("click", () => {
            showPokemonDetail(pokemon);
        });

        pokemonContainer.appendChild(pokemonCard);
    });

    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
}

// Mengambil gambar Pokémon yang lebih bagus
function getPokemonImage(pokemon) {
    return pokemon.sprites.other["official-artwork"].front_default
        || pokemon.sprites.front_default;
}

// Membuat nomor Pokémon menjadi 3 digit
function formatNumber(number) {
    return String(number).padStart(3, "0");
}

// Search dan filter Pokémon
function filterPokemon() {
    const searchText = searchInput.value.toLowerCase();
    const selectedType = typeFilter.value;

    filteredPokemon = allPokemon.filter((pokemon) => {
        const nameMatch = pokemon.name.toLowerCase().includes(searchText);

        const typeMatch =
            selectedType === "all" ||
            pokemon.types.some(item => item.type.name === selectedType);

        return nameMatch && typeMatch;
    });

    currentPage = 1;

    currentFilter.textContent =
        selectedType === "all" ? "All" : capitalizeText(selectedType);

    displayPokemonWithPagination();
}

// Menampilkan detail Pokémon dalam modal
function showPokemonDetail(pokemon) {
    const pokemonTypes = pokemon.types.map(item => item.type.name);
    const abilities = pokemon.abilities.map(item => item.ability.name).join(", ");

    modalBody.innerHTML = `
        <div class="modal-pokemon">
            <div class="modal-image">
                <img 
                    src="${getPokemonImage(pokemon)}" 
                    alt="${pokemon.name}"
                >
            </div>

            <div class="modal-info">
                <p class="pokemon-number">#${formatNumber(pokemon.id)}</p>
                <h2>${pokemon.name}</h2>

                <div class="type-list">
                    ${pokemonTypes.map(type => `
                        <span class="type-badge ${type}">${type}</span>
                    `).join("")}
                </div>

                <div class="modal-meta">
                    <div>
                        <span>Height</span>
                        <strong>${pokemon.height / 10} m</strong>
                    </div>

                    <div>
                        <span>Weight</span>
                        <strong>${pokemon.weight / 10} kg</strong>
                    </div>

                    <div>
                        <span>Abilities</span>
                        <strong>${abilities}</strong>
                    </div>
                </div>

                <h3>Base Stats</h3>

                ${pokemon.stats.map(stat => `
                    <div class="stat-row">
                        <div class="stat-label">
                            <span>${formatStatName(stat.stat.name)}</span>
                            <span>${stat.base_stat}</span>
                        </div>

                        <div class="stat-track">
                            <div 
                                class="stat-fill" 
                                style="width: ${getStatPercentage(stat.base_stat)}%"
                            ></div>
                        </div>
                    </div>
                `).join("")}
            </div>
        </div>
    `;

    detailModal.classList.add("show");
}

// Mengubah nama stat agar lebih rapi
function formatStatName(statName) {
    if (statName === "hp") return "HP";
    if (statName === "special-attack") return "Sp. Attack";
    if (statName === "special-defense") return "Sp. Defense";

    return statName.replace("-", " ");
}

// Mengatur lebar stat bar
function getStatPercentage(value) {
    const maxStat = 180;
    const percentage = (value / maxStat) * 100;

    return percentage > 100 ? 100 : percentage;
}

// Huruf pertama menjadi kapital
function capitalizeText(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// ===============================
// FITUR RANDOM SCANNER DAN COMPARE
// ===============================

// Menampilkan Pokémon secara acak
function scanRandomPokemon() {
    if (allPokemon.length === 0) {
        showMessage("Data Pokémon belum tersedia.", "error");
        return;
    }

    const randomIndex = Math.floor(Math.random() * allPokemon.length);
    const randomPokemon = allPokemon[randomIndex];

    showPokemonDetail(randomPokemon);
}

// Mengisi pilihan Pokémon pada fitur compare
function fillCompareSelects() {
    firstPokemonSelect.innerHTML = `<option value="">Pilih Pokémon Pertama</option>`;
    secondPokemonSelect.innerHTML = `<option value="">Pilih Pokémon Kedua</option>`;

    allPokemon.forEach((pokemon) => {
        const optionOne = document.createElement("option");
        optionOne.value = pokemon.id;
        optionOne.textContent = `#${formatNumber(pokemon.id)} - ${capitalizeText(pokemon.name)}`;

        const optionTwo = document.createElement("option");
        optionTwo.value = pokemon.id;
        optionTwo.textContent = `#${formatNumber(pokemon.id)} - ${capitalizeText(pokemon.name)}`;

        firstPokemonSelect.appendChild(optionOne);
        secondPokemonSelect.appendChild(optionTwo);
    });
}

// Membuka modal compare
function openCompareModal() {
    compareResult.innerHTML = "";
    compareModal.classList.add("show");
}

// Menutup modal compare
function closeCompareLab() {
    compareModal.classList.remove("show");
}

// Memulai perbandingan Pokémon
function startCompare() {
    const firstId = Number(firstPokemonSelect.value);
    const secondId = Number(secondPokemonSelect.value);

    if (!firstId || !secondId) {
        compareResult.innerHTML = `
            <div class="compare-warning">
                Silakan pilih dua Pokémon terlebih dahulu sebelum membandingkan.
            </div>
        `;
        return;
    }

    if (firstId === secondId) {
        compareResult.innerHTML = `
            <div class="compare-warning">
                Pilih dua Pokémon yang berbeda agar perbandingan lebih valid.
            </div>
        `;
        return;
    }

    const firstPokemon = allPokemon.find(pokemon => pokemon.id === firstId);
    const secondPokemon = allPokemon.find(pokemon => pokemon.id === secondId);

    showCompareResult(firstPokemon, secondPokemon);
}

// Menampilkan hasil compare Pokémon
function showCompareResult(firstPokemon, secondPokemon) {
    const firstTypes = firstPokemon.types.map(item => item.type.name);
    const secondTypes = secondPokemon.types.map(item => item.type.name);

    compareResult.innerHTML = `
        <div class="compare-cards">
            <div class="compare-pokemon-card">
                <img src="${getPokemonImage(firstPokemon)}" alt="${firstPokemon.name}">
                <h3>${firstPokemon.name}</h3>

                <div class="type-list">
                    ${firstTypes.map(type => `
                        <span class="type-badge ${type}">${type}</span>
                    `).join("")}
                </div>
            </div>

            <div class="versus-box">VS</div>

            <div class="compare-pokemon-card">
                <img src="${getPokemonImage(secondPokemon)}" alt="${secondPokemon.name}">
                <h3>${secondPokemon.name}</h3>

                <div class="type-list">
                    ${secondTypes.map(type => `
                        <span class="type-badge ${type}">${type}</span>
                    `).join("")}
                </div>
            </div>
        </div>

        <div class="compare-table">
            ${compareRow("Height", firstPokemon.height / 10, secondPokemon.height / 10, "m")}
            ${compareRow("Weight", firstPokemon.weight / 10, secondPokemon.weight / 10, "kg")}
            ${compareStatRow("HP", firstPokemon, secondPokemon, "hp")}
            ${compareStatRow("Attack", firstPokemon, secondPokemon, "attack")}
            ${compareStatRow("Defense", firstPokemon, secondPokemon, "defense")}
            ${compareStatRow("Speed", firstPokemon, secondPokemon, "speed")}
        </div>
    `;
}

// Membuat baris perbandingan umum
function compareRow(label, firstValue, secondValue, unit = "") {
    const firstWinner = firstValue > secondValue ? "winner" : "";
    const secondWinner = secondValue > firstValue ? "winner" : "";

    return `
        <div class="compare-row">
            <div class="compare-value ${firstWinner}">${firstValue} ${unit}</div>
            <div class="compare-label">${label}</div>
            <div class="compare-value ${secondWinner}">${secondValue} ${unit}</div>
        </div>
    `;
}

// Membuat baris perbandingan khusus stat
function compareStatRow(label, firstPokemon, secondPokemon, statName) {
    const firstStat = getPokemonStat(firstPokemon, statName);
    const secondStat = getPokemonStat(secondPokemon, statName);

    return compareRow(label, firstStat, secondStat);
}

// Mengambil nilai stat Pokémon
function getPokemonStat(pokemon, statName) {
    const stat = pokemon.stats.find(item => item.stat.name === statName);
    return stat ? stat.base_stat : 0;
}

// ===============================
// EVENT LISTENER
// ===============================

// Event search
searchInput.addEventListener("input", filterPokemon);

// Event filter type
typeFilter.addEventListener("change", filterPokemon);

// Event refresh
refreshButton.addEventListener("click", fetchPokemonData);

// Event pagination previous
prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        displayPokemonWithPagination();

        window.scrollTo({
            top: document.getElementById("explorer").offsetTop,
            behavior: "smooth"
        });
    }
});

// Event pagination next
nextButton.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage);

    if (currentPage < totalPages) {
        currentPage++;
        displayPokemonWithPagination();

        window.scrollTo({
            top: document.getElementById("explorer").offsetTop,
            behavior: "smooth"
        });
    }
});

// Menutup modal detail
closeModal.addEventListener("click", () => {
    detailModal.classList.remove("show");
});

// Menutup modal detail jika klik area luar modal
detailModal.addEventListener("click", (event) => {
    if (event.target === detailModal) {
        detailModal.classList.remove("show");
    }
});

// Event random scanner
randomButton.addEventListener("click", scanRandomPokemon);

// Event membuka compare lab
compareButton.addEventListener("click", openCompareModal);

// Event menutup compare lab
closeCompareModal.addEventListener("click", closeCompareLab);

// Event mulai compare
startCompareButton.addEventListener("click", startCompare);

// Menutup compare modal jika klik area luar modal
compareModal.addEventListener("click", (event) => {
    if (event.target === compareModal) {
        closeCompareLab();
    }
});

// Menjalankan aplikasi saat halaman pertama kali dibuka
fetchPokemonData();