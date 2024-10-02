async function getWorks(filter) {
  document.querySelector(".gallery").innerHTML = "";
  document.querySelector(".modal-gallery").innerHTML = "";

  const url = "http://localhost:5678/api/works";
  try { //vérification de la réponse
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();//format JSON en un objet JavaScript
     
    if (filter) { //Filtrage
      const filtered = json.filter((data) => data.categoryId === filter);
      for (let i = 0; i < filtered.length; i++) { 
        setFigure(filtered[i]);
        setFigureModal(filtered[i]);
      }
    } else {//Cas sans filtre
      for (let i = 0; i < json.length; i++) {
        setFigure(json[i]);
        setFigureModal(json[i]);
      }
    }
    //Delete
    const trashCans = document.querySelectorAll(".fa-trash-can");
    trashCans.forEach((e) =>//Parcourt chaque élément sélectionné
      e.addEventListener("click", (event) => deleteWork(event))
    );
  } catch (error) {
    console.error(error.message);
  }
}
getWorks();


//Pour la gallerie
function setFigure(data) {
  const figure = document.createElement("figure");
  figure.innerHTML = `<img src=${data.imageUrl} alt=${data.title}>
                    <figcaption>${data.title}</figcaption>`;

  document.querySelector(".gallery").append(figure);
}
//Pour la Modal
function setFigureModal(data) {
  const figure = document.createElement("figure");
  figure.innerHTML = `<div class="image-menudo">
        <img src="${data.imageUrl}" alt="${data.title}">
        <i id=${data.id} class="fa-solid fa-trash-can overlay-icon"></i> </div>`;

  document.querySelector(".modal-gallery").append(figure);
}

// API FILTRES
async function getCategories() {
  const url = "http://localhost:5678/api/categories";
  try {//vérification de la réponse
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    for (let i = 0; i < json.length; i++) {
      setFilter(json[i]);
    }
  } catch (error) {
    console.error(error.message);
  }
}
getCategories();

// Fonction pour les filtres
function setFilter(data) {
  const div = document.createElement("div");
  div.className = data.id;
  div.addEventListener("click", () => getWorks(data.id));//Affiche les travaux par catégories
  div.addEventListener("click", (event) => toggleFilter(event));// pour enlever le vert de tous
  document.querySelector(".todo").addEventListener("click", (event) => toggleFilter(event));//remettre le vert sur Tous
  div.innerHTML = `${data.name}`;document.querySelector(".div-menudo").append(div);
}
//l'apparence visuelle
function toggleFilter(event) {
  const menudo = document.querySelector(".div-menudo");
  Array.from(menudo.children).forEach((child) => child.classList.remove("active-filtra"));
  event.target.classList.add("active-filtra");
}
document.querySelector(".todo").addEventListener("click", () => getWorks());

//Mode édition + Logout
function displayAdminMode() {
  if (sessionStorage.authToken) {
    document.querySelector(".div-menudo").style.display = "none";
    document.querySelector(".ava-modal-2").style.display = "block";
    document.querySelector(".gallery").style.margin = "30px 0 0 0";
    const editBanner = document.createElement("div");
    editBanner.className = "edit";
    editBanner.innerHTML ='<p><a href="#modal1" class="ava-modal"><i class="fa-regular fa-pen-to-square"></i>Mode édition</a></p>';
    document.body.prepend(editBanner);
    document.querySelector(".boton").textContent = "logout";
    document.querySelector(".boton").addEventListener("click", () => {sessionStorage.removeItem("authToken");
    });
  }
}
displayAdminMode();

//Ouvrir la modale

const focusableSelector = "button, a, input, textarea";//pour clavier
let focusables = []; //Un tableau qui contiendra les éléments interactifs trouvés dans la modale.

const openModal = function (e) {
  e.preventDefault();
  modal = document.querySelector(e.target.getAttribute("href"));
  focusables = Array.from(modal.querySelectorAll(focusableSelector));//récupère tous les éléments focusables dans la modale
  focusables[0].focus();//Le premier élément focusable de la modale reçoit immédiatement le focus
  modal.style.display = null;
  modal.removeAttribute("aria-hidden");
  modal.setAttribute("aria-modal", "true");
  modal.addEventListener("click", closeModal);
  modal.querySelectorAll(".ava-modal-cerrar")
    .forEach((e) => e.addEventListener("click", closeModal));
  modal
    .querySelector(".ava-modal-para")
    .addEventListener("click", stopPropagation);
};

const closeModal = function (e) {
  if (modal === null) return;
  e.preventDefault();
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  modal.removeAttribute("aria-modal");
  modal.removeEventListener("click", closeModal);
  modal
    .querySelector(".ava-modal-cerrar")
    .removeEventListener("click", closeModal);
  modal
    .querySelector(".ava-modal-para")
    .removeEventListener("click", stopPropagation);
  modal = null;
};

const stopPropagation = function (e) {
  e.stopPropagation();
};
document.querySelectorAll(".ava-modal").forEach((a) => {
  a.addEventListener("click", openModal);
});

//Function pour supprimer  dans la modale
async function deleteWork(event) {
  event.stopPropagation();
  const id = event.srcElement.id; // id l'identifiant de la ressource à supprimer.
  const deleteApi = "http://localhost:5678/api/works/";
  const token = sessionStorage.authToken;
  let response = await fetch(deleteApi + id, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,//permettant au serveur de vérifier l'identité de l'utilisateur
    },
  });
  if (response.status == 401 || response.status == 500) {
    const errorBox = document.createElement("div");
    errorBox.className = "error-login";
    errorBox.innerHTML = "Il y a eu une erreur";
    document.querySelector(".modal-button-menudo").prepend(errorBox);
  } else {
    console.log("Suppression réussie");

    // Fermer la modale (si elle est ouverte)
    closeModal(event);

    // Rediriger vers la page principale (index.html)
    window.location.href = "index.html";
  }
}

//Les deux modales
const addfotoButton = document.querySelector(".agrega-foto-button");
const backButton = document.querySelector(".ava-modal-atras");

addfotoButton.addEventListener("click", toggleModal);
backButton.addEventListener("click", toggleModal);

function toggleModal() {
  const galleryModal = document.querySelector(".gallery-modal");
  const addModal = document.querySelector(".agrega-modal");

  if (
    galleryModal.style.display === "block" ||
    galleryModal.style.display === ""
  ) {
    galleryModal.style.display = "none";
    addModal.style.display = "block";
  } else {
    galleryModal.style.display = "block";
    addModal.style.display = "none";
  }
}

// Ajouter foto
let img = document.createElement("img");
let file;//stocker le fichier sélectionné

document.querySelector("#file").style.display = "none";
document.getElementById("file").addEventListener("change", function (event) {
  file = event.target.files[0]; // Assignez le fichier à une variable globale
  if (file && (file.type === "image/jpeg" || file.type === "image/png")) { 
    const reader = new FileReader();//permet de lire le contenu des fichiers de manière asynchrone
    reader.onload = function (e) {//Une fonction est déclenchée une fois la lecture du fichier terminée
      img.src = e.target.result;
      img.alt = "Uploaded foto";// texte alternatif 
      document.getElementById("foto-menudo").appendChild(img);
    };
    reader.readAsDataURL(file);
    document.querySelectorAll(".picture-carga").forEach((e) => (e.style.display = "none"));
  } else {
    alert("Veuillez sélectionner une image au format JPG ou PNG.");
  }
});

// Titre et category

const titleInput = document.getElementById("title");
let titleValue = "";

let selectedValue = "1";

document.getElementById("category").addEventListener("change", function () {
  selectedValue = this.value;
});

titleInput.addEventListener("input", function () {
  titleValue = titleInput.value;
  console.log("Titre actuel :", titleValue); 
});
const addPictureForm = document.getElementById("picture-forma");


addPictureForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const hasImage = document.querySelector("#foto-menudo").firstChild;//Vérifie s'il y a une image déjà téléchargée
  if (hasImage && titleValue) {
    // Créez un nouvel objet FormData
    const formData = new FormData();

    formData.append("image", file);
    formData.append("title", titleValue);
    formData.append("category", selectedValue);

    const token = sessionStorage.authToken;

    if (!token) {
      console.error("Token d'authentification manquant.");
      return;
    }
//l'envoi de nouvelles images à l'API
    let response = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: formData,
    });
    if (response.status !== 201) {
      const errorText = await response.text();
      console.error("Erreur : ", errorText);
      const errorBox = document.createElement("div");
      errorBox.className = "error-login";
      errorBox.innerHTML = `Il y a eu une erreur : ${errorText}`;
      document.querySelector("form").prepend(errorBox);
    } else {
      let result = await response.json();
      console.log(result);
      getWorks();
      window.location.href = "index.html"; //page principale
    }
    console.log("hasImage and titleValue is true");
  } else {
    alert("Veuillez remplir tous les champs");
  }
  
});