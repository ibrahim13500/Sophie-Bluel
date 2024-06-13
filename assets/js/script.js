// ** Sélection des éléments DOM ** //
const gallery = document.querySelector(".gallery");
const filtersWrapper = document.querySelector(".filters");
const logMode = document.getElementById("logMode");
const adminPanel = document.querySelector(".admin-panel");
const header = document.querySelector("header");
const editButton = document.getElementById("editButton");
const modal = document.getElementById("modal");
const closeButton = document.querySelector(".js-modal-close");

// ** Déclaration des variables ** //
const allWorks = new Set();
const allCats = new Set();

// ** Fonction principale pour initialiser l'application ** //
async function init() {
    try {
        // ** Récupération et affichage des travaux ** //
        const works = await getData("works");
        console.log('Travaux récupérés:', works);
        works.forEach(work => allWorks.add(work));

        // ** Récupération et affichage des catégories ** //
        const cats = await getData("categories");
        console.log('Catégories récupérées:', cats);
        cats.forEach(cat => allCats.add(cat));

        // ** Affichage initial ** //
        displayWorks();
        displayCategories();

        // ** Vérification de l'état de connexion ** //
        checkLoginStatus();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
    }
}
// ** Appelle la fonction init pour initialiser l'application ** //
init();

// ** Fonction pour récupérer les données depuis l'API ** //
async function getData(type) {
    try {
        const response = await fetch(`http://localhost:5678/api/${type}`);
        if (response.ok) {
            return response.json();
        } else {
            console.error('Erreur de réponse de l\'API:', response.statusText);
            throw new Error('Erreur lors de la récupération des données depuis l\'API.');
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        throw error;
    }
}

// ** Fonction pour afficher les travaux dans la galerie ** //
function displayWorks(filter = 0) {
    try {
        console.log('Filtre actuel:', filter);
        const filteredWorks = [...allWorks].filter(work => filter === 0 || work.categoryId === filter);
        console.log('Travaux filtrés:', filteredWorks);
        gallery.innerHTML = "";
        const fragment = document.createDocumentFragment();

        filteredWorks.forEach(work => {
            const workElement = document.createElement("div");
            workElement.classList.add("work-item");
            const imgElement = document.createElement("img");
            imgElement.src = work.imageUrl;
            imgElement.alt = work.title;
            const titleElement = document.createElement("p");
            titleElement.textContent = work.title;
            workElement.appendChild(imgElement);
            workElement.appendChild(titleElement);
            fragment.appendChild(workElement);
        });

        gallery.appendChild(fragment);
    } catch (error) {
        console.error('Erreur lors de l\'affichage des travaux:', error);
    }
}

// ** Fonction pour afficher les catégories sous forme de boutons de filtre ** //
function displayCategories() {
    try {
        console.log('Affichage des catégories');
        const allButton = document.createElement("button");
        allButton.textContent = "Tous";
        allButton.classList.add("filter-btn", "checked");
        allButton.addEventListener("click", () => {
            setActiveButton(allButton);
            displayWorks();
        });
        filtersWrapper.appendChild(allButton);

        allCats.forEach(cat => {
            const button = document.createElement("button");
            button.textContent = cat.name;
            button.classList.add("filter-btn");
            button.addEventListener("click", () => {
                setActiveButton(button);
                displayWorks(cat.id);
            });
            filtersWrapper.appendChild(button);
        });

        console.log('Boutons de filtre créés:', filtersWrapper.querySelectorAll('.filter-btn'));
    } catch (error) {
        console.error('Erreur lors de l\'affichage des catégories:', error);
    }
}

// ** Fonction pour définir le bouton actif (sélectionné) ** //
function setActiveButton(activeButton) {
    const buttons = document.querySelectorAll(".filter-btn");
    buttons.forEach(button => button.classList.remove("checked"));
    activeButton.classList.add("checked");
    console.log('Bouton actif:', activeButton.textContent);
}

// ** Vérifie l'état de connexion à partir du stockage local (localStorage) ** //
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn === "true") {
        logMode.textContent = "Logout";
        logMode.href = "#";
        logMode.setAttribute("aria-hidden", "false");
        header.classList.add("connected");
        if (filtersWrapper) filtersWrapper.style.display = "none";
        if (editButton) editButton.style.display = "inline-flex";
        if (adminPanel) adminPanel.style.display = "flex";
    } else {
        logMode.textContent = "Login";
        logMode.href = "./login.html";
        logMode.setAttribute("aria-hidden", "true");
        header.classList.remove("connected");
        if (filtersWrapper) filtersWrapper.style.display = "flex";
        if (editButton) editButton.style.display = "none";
        if (adminPanel) adminPanel.style.display = "none";
    }
}

// ** Gère le clic sur le bouton de login/logout ** //
logMode.addEventListener("click", function(event) {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn === "true") {
        localStorage.setItem("isLoggedIn", "false");
        checkLoginStatus();
        event.preventDefault();
    }
});

// ** Gère le clic sur le bouton de fermeture de la modal ** //
if (closeButton) {
    closeButton.addEventListener("click", function(event) {
        event.preventDefault();
        console.log("Close button clicked");
        closeModal();
    });
} else {
    console.error("Close button not found");
}

// ** Fonction pour fermer la modal ** //
function closeModal() {
    console.log("Closing modal");
    if (modal) {
        modal.style.display = "none";
    }
}

// ** Ajoute un écouteur d'événements sur le bouton "Modifier" ** //
if (editButton) {
    editButton.addEventListener("click", function() {
        if (modal) {
            modal.style.display = "block";
        }
    });
}
