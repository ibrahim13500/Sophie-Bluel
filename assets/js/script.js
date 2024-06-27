// ** Sélection des éléments DOM ** //
const gallery = document.querySelector(".gallery");
const filtersWrapper = document.querySelector(".filters");
const logMode = document.getElementById("logMode");
const adminPanel = document.querySelector(".admin-panel");
const header = document.querySelector("header");
const editButton = document.getElementById("editButton");
const modal = document.getElementById("modal");
const closeButton = document.querySelector(".js-modal-close");
const uploadNewWork = document.querySelector(".uploadNewWork");

// ** Déclaration des variables ** //
let allWorks = [];
let allCats = [];

// ** Fonction principale pour initialiser l'application ** //
async function init() {
    try {
        await loadData();
        displayWorks();
        displayCategories();
        checkLoginStatus();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
    }
}

init();

// ** Fonction pour charger les données des travaux et des catégories depuis l'API ** //
async function loadData() {
    try {
        const [worksData, catsData] = await Promise.all([getData("works"), getData("categories")]);
        allWorks = worksData;
        allCats = catsData;
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        throw error;
    }
}

// ** Fonction pour récupérer les données depuis l'API ** //
async function getData(type) {
    try {
        const response = await fetch(`http://localhost:5678/api/${type}`);
        if (!response.ok) {
            throw new Error(`Erreur ${response.status} - ${response.statusText}`);
        }
        return response.json();
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        throw error;
    }
}

// ** Fonction pour afficher les travaux dans la galerie ** //
function displayWorks(filter = 0) {
    try {
        const filteredWorks = filter === 0 ? allWorks : allWorks.filter(work => work.categoryId === filter);
        gallery.innerHTML = "";

        filteredWorks.forEach(work => {
            const workElement = createWorkElement(work);
            gallery.appendChild(workElement);
        });
    } catch (error) {
        console.error('Erreur lors de l\'affichage des travaux:', error);
    }
}

// ** Fonction pour créer un élément de travail (figure) ** //
function createWorkElement(work) {
    const workElement = document.createElement("figure");
    workElement.classList.add("work-item");
    workElement.dataset.id = work.id;

    const imgElement = document.createElement("img");
    imgElement.src = work.imageUrl;
    imgElement.alt = work.title;
    workElement.appendChild(imgElement);

    const titleElement = document.createElement("figcaption");
    titleElement.textContent = work.title;
    workElement.appendChild(titleElement);

    if (isAdminLoggedIn()) {
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Supprimer";
        deleteButton.classList.add("delete-button");
        deleteButton.addEventListener("click", async () => {
            try {
                await deleteImage(work.id);
                allWorks = allWorks.filter(item => item.id !== work.id);
                workElement.remove();
                // Supprimer également l'élément de la modale
                const modalFigure = document.getElementById(`work-${work.id}`);
                if (modalFigure) {
                    modalFigure.remove();
                }
            } catch (error) {
                console.error("Erreur lors de la suppression de l'image:", error);
            }
        });
        workElement.appendChild(deleteButton);
    }

    return workElement;
}

// ** Fonction pour afficher les catégories sous forme de boutons de filtre ** //
function displayCategories() {
    try {
        const allButton = createCategoryButton("Tous", 0);
        setActiveButton(allButton);

        filtersWrapper.appendChild(allButton);

        allCats.forEach(cat => {
            const button = createCategoryButton(cat.name, cat.id);
            filtersWrapper.appendChild(button);
        });
    } catch (error) {
        console.error('Erreur lors de l\'affichage des catégories:', error);
    }
}

// ** Fonction pour créer un bouton de catégorie ** //
function createCategoryButton(text, categoryId) {
    const button = document.createElement("button");
    button.textContent = text;
    button.classList.add("filter-btn");
    button.addEventListener("click", () => {
        setActiveButton(button);
        displayWorks(categoryId);
    });
    return button;
}

// ** Fonction pour définir le bouton actif (sélectionné) ** //
function setActiveButton(activeButton) {
    const buttons = document.querySelectorAll(".filter-btn");
    buttons.forEach(button => button.classList.remove("checked"));
    activeButton.classList.add("checked");
}

// ** Vérifie si l'administrateur est connecté ** //
function isAdminLoggedIn() {
    return localStorage.getItem("isLoggedIn") === "true";
}

// ** Vérifie l'état de connexion à partir du stockage local (localStorage) ** //
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn) {
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
logMode.addEventListener("click", function (event) {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
        localStorage.setItem("isLoggedIn", "false");
        checkLoginStatus();
        event.preventDefault();
    }
});

// ** Gère le clic sur le bouton de fermeture de la modal ** //
if (closeButton) {
    closeButton.addEventListener("click", function (event) {
        event.preventDefault();
        closeModal();
    });
} else {
    console.error("Close button not found");
}

// ** Fonction pour fermer la modal ** //
function closeModal() {
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
}

// ** Ajoute un écouteur d'événements sur le bouton "Modifier" ** //
if (editButton) {
    editButton.addEventListener("click", function () {
        if (modal) {
            fillModalWithWorks();
            modal.style.display = "flex";
            document.body.style.overflow = "hidden";
        }
    });
}

// ** Ajoute un écouteur d'événements sur la modal pour fermer si clic en dehors du contenu ** //
if (modal) {
    modal.addEventListener("click", function (e) {
        if (e.target.className === "modal") {
            closeModal();
        }
    });
}

// ** Fonction pour remplir la modal avec les travaux dynamiquement ** //
function fillModalWithWorks() {
    const modalContent = document.querySelector('.modal-wrapper__content.view');
    modalContent.innerHTML = ''; // Vider le contenu de la modal avant d'ajouter les figures

    allWorks.forEach(work => {
        const figure = createModalFigure(work);
        modalContent.appendChild(figure);
    });
}

// ** Fonction pour créer un élément de figure pour la modal ** //
function createModalFigure(work) {
    const figure = document.createElement('figure');
    figure.id = `work-${work.id}`;
    figure.dataset.id = work.id;

    const img = document.createElement('img');
    img.src = work.imageUrl;
    img.alt = work.title;

    const deleteButtonContainer = document.createElement('div');
    deleteButtonContainer.className = 'delete-button-container';

    const deleteButton = document.createElement('i');
    deleteButton.className = 'fa-solid fa-trash-can delete-button';
    deleteButton.addEventListener('click', async () => {
        try {
            await deleteImage(work.id);
            allWorks = allWorks.filter(item => item.id !== work.id);
            figure.remove();
            const galleryFigure = document.querySelector(`.work-item[data-id='${work.id}']`);
            if (galleryFigure) {
                galleryFigure.remove();
            }
        } catch (error) {
            console.error();
        }
    });

    deleteButtonContainer.appendChild(deleteButton);
    figure.appendChild(img);
    figure.appendChild(deleteButtonContainer);

    return figure;
}

// ** Fonction pour supprimer une image via l'API ** //
async function deleteImage(id) {
    try {
        const token = localStorage.getItem("authToken"); // Récupère le token depuis le localStorage
        const response = await fetch(`http://localhost:5678/api/works/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // Ajoute le token d'authentification
            },
        });
        if (!response.ok) {
            throw new Error(`Erreur ${response.status} - ${response.statusText}`);
        }
        const data = await response.json(); // Attend la réponse JSON seulement si elle existe
        console.log("Le delete a réussi:", data); // Affiche les données si disponibles
    } catch (error) {
        console.error();
        throw error;
    }
}

// Sélectionner les éléments nécessaires
const btnAddModal = document.querySelector("#first-modal .add-photo");
const modalAddPhoto = document.getElementById("second-modal");
const modalFirst = document.getElementById("first-modal");
const arrowLeft = document.querySelector("#second-modal .fa-arrow-left");
const markAdd = document.querySelector("#second-modal .js-modal-close");

// Fonction pour afficher la deuxième modal
function displayAddModal() {
    btnAddModal.addEventListener("click", () => {
        modalAddPhoto.classList.remove("hidden");
        modalFirst.classList.add("hidden");
    });

    arrowLeft.addEventListener("click", () => {
        modalAddPhoto.classList.add("hidden");
        modalFirst.classList.remove("hidden");
    });

    markAdd.addEventListener("click", () => {
        modalAddPhoto.classList.add("hidden");
        modalFirst.classList.remove("hidden");
        modal.style.display = "none"; // Fermeture de la modal principale
    });
}

// Appeler la fonction pour initialiser les événements
displayAddModal();

//**Faire la prévisualisation de l'image */
const prevImg = document.querySelector(".edit img");
const inputFile = document.querySelector(".edit input");
const labelFile = document.querySelector(".edit label");
const iconeFile = document.querySelector(".edit .fa-image"); // Ajouté le point pour sélectionner la classe correctement
const pFile = document.querySelector(".edit p");

//**Vérifier que les éléments existent avant d'ajouter l'écouteur d'événement */
if (inputFile && prevImg && labelFile && iconeFile && pFile) {
    //**Visualiser les changements sur inputFile */
    inputFile.addEventListener("change", () => {
        const file = inputFile.files[0];
        console.log(file);
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                prevImg.src = e.target.result;
                prevImg.style.display = "flex";
                labelFile.style.display = "none";
                iconeFile.style.display = "none";
                pFile.style.display = "none";
            };
            reader.readAsDataURL(file);
        }
    });
}

// ** Créer une liste de catégories dans l'input select de la deuxième modal ** //
async function displayModalCategories() {
    try {
        const select = document.querySelector("#second-modal select");
        const categories = await getData("categories"); // Récupère les catégories via l'API

        select.innerHTML = ''; // Vide les options existantes

        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erreur lors de l\'affichage des catégories dans la modal:', error);
    }
}

// Appeler la fonction pour initialiser les catégories dans la modal
displayModalCategories();


//**POST ajouter une image */

const form = document.querySelector("#second-modal form");
const title = document.querySelector("#second-modal #title");
const category = document.querySelector("#second-modal #categories"); // Correction ici pour sélectionner correctement l'élément de catégorie

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {
        title: title.value,
        categoryId: category.value,
        imageUrl: prevImg.src,
        category: {
            id: category.value,
            name: category.options[category.selectedIndex].textContent,
        },
    };

    fetch(`http://localhost:5678/api/works`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData), // Utilisation correcte de formData ici

    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            console.log("Voici l'image ajoutée", data);
            displayAddModal(); // Assurez-vous que cette fonction est définie
            displayCategories(); // Assurez-vous que cette fonction est définie
        })
        
});

function verifFormCompleted() {
    const buttonValidForm = document.querySelector(".modal-wrapper__footer .valid");
    const form = document.querySelector("#uploadNewWork");
    const title = document.querySelector("#title");
    const category = document.querySelector("#categories");
    const inputFile = document.querySelector("#getFile");

    buttonValidForm.style.backgroundColor = "rgb(167, 167, 167)"; // Couleur de fond grise par défaut

    form.addEventListener("input", () => {
        if (title.value !== "" && category.value !== "" && inputFile.files.length > 0) {
            buttonValidForm.style.backgroundColor = "#1d6154"; // Couleur de fond verte quand validé
            buttonValidForm.disabled = false;
        } else {
            buttonValidForm.style.backgroundColor = "rgb(167, 167, 167)"; // Retour à la couleur de fond grise
            buttonValidForm.disabled = true;
        }
    });
}

verifFormCompleted();
