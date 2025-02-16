/* Script de gestion du formulaire d'inscription et envoi des données vers un webhook */

document.addEventListener('DOMContentLoaded', function() {
  // Configuration
  const maxPlacesPerGroup = 5;
  let totalPlacesAvailable = 50;
  let placesRemaining = totalPlacesAvailable;
  const placesRemainingElem = document.getElementById('placesRemaining');

  // Déclarer le bouton de soumission globalement
  const submitButton = document.getElementById('submitReservation');

  // Webhook configuration (désactivé - plus de places disponibles)
  const webhookURL = "";

  // Désactiver le formulaire dès le chargement
  document.querySelector('.form-section').style.display = 'none';

  // Mise à jour de l'affichage des places restantes
  function updatePlacesRemaining(newCount) {
    placesRemaining = newCount;
    if (placesRemainingElem) {
      placesRemainingElem.textContent = placesRemaining;
    }
  }

  // Fonction de validation d'un champ
  function validateInput(input) {
    let isValid = true;
    if (input.required && input.value.trim() === '') {
      isValid = false;
    }
    if (input.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.value.trim())) isValid = false;
    }
    if (input.type === 'tel') {
      const telVal = input.value.trim();
      if (telVal.length > 0) {
        isValid = telVal.startsWith('+33') && telVal.length === 12;
      }
    }
    return isValid;
  }

  // Met à jour les styles de validation pour chaque champ et pour chaque fieldset
  function updateValidationState() {
    document.querySelectorAll("input, select").forEach(function(input) {
      if (validateInput(input)) {
        input.classList.add("valid");
        input.classList.remove("invalid");
      } else {
        input.classList.add("invalid");
        input.classList.remove("valid");
      }
      let fieldset = input.closest("fieldset");
      if (fieldset) {
        let inputs = fieldset.querySelectorAll("input, select");
        let fieldsetValid = true;
        inputs.forEach(function(i) {
          if (!validateInput(i)) {
            fieldsetValid = false;
          }
        });
        if (fieldsetValid) {
          fieldset.classList.add("valid");
          fieldset.classList.remove("invalid");
        } else {
          fieldset.classList.add("invalid");
          fieldset.classList.remove("valid");
        }
      }
    });
    updateFormValidationState();
    // Si aucun membre n'est ajouté, s'assurer que le bouton de soumission soit visible
    if(document.querySelectorAll('.member-block').length === 0) {
      submitButton.style.display = "block";
    }
  }

  // Met à jour l'état global du formulaire (liseré vert / rouge) et active/désactive le bouton de soumission.
  // Si le fieldset des membres est vide, il est considéré comme valide.
  function updateFormValidationState() {
    let formValid = true;
    document.querySelectorAll("fieldset").forEach(function(fs) {
      if (fs.id === "membersFieldset" && document.querySelectorAll('.member-block').length === 0) {
        // Ignorer la validation de la section membres si aucun membre n'est ajouté.
        return;
      }
      if (!fs.classList.contains("valid")) {
        formValid = false;
      }
    });
    const form = document.getElementById('reservationForm');
    if (formValid) {
      form.classList.add("form-valid");
      form.classList.remove("form-invalid");
      submitButton.disabled = false;
    } else {
      form.classList.add("form-invalid");
      form.classList.remove("form-valid");
      submitButton.disabled = true;
    }
  }

  // Ajoute des écouteurs d'événements sur tous les champs pour validation live
  document.querySelectorAll("input, select").forEach(function(input) {
    input.addEventListener("input", updateValidationState);
  });
  // Appel initial de la validation
  updateValidationState();

  // Crée un bloc pour saisir les informations d'un membre
  function createMemberBlock() {
    const memberDiv = document.createElement('div');
    memberDiv.classList.add('member-block');
    memberDiv.style.border = "1px solid #ccc";
    memberDiv.style.padding = "10px";
    memberDiv.style.marginBottom = "10px";

    const nameLabel = document.createElement('label');
    nameLabel.textContent = "Nom du membre :";
    const nameInput = document.createElement('input');
    nameInput.type = "text";
    nameInput.name = "memberNom";
    nameInput.required = true;

    const prenomLabel = document.createElement('label');
    prenomLabel.textContent = "Prénom du membre :";
    const prenomInput = document.createElement('input');
    prenomInput.type = "text";
    prenomInput.name = "memberPrenom";
    prenomInput.required = true;

    const typeLabel = document.createElement('label');
    typeLabel.textContent = "Type (adulte / enfant) :";
    const typeSelect = document.createElement('select');
    typeSelect.name = "memberType";
    typeSelect.required = true;
    const optionAdult = document.createElement('option');
    optionAdult.value = "adulte";
    optionAdult.textContent = "Adulte";
    const optionEnfant = document.createElement('option');
    optionEnfant.value = "enfant";
    optionEnfant.textContent = "Enfant";
    typeSelect.appendChild(optionAdult);
    typeSelect.appendChild(optionEnfant);

    const telLabel = document.createElement('label');
    telLabel.textContent = "Téléphone (obligatoire pour adulte) :";
    const telInput = document.createElement('input');
    telInput.type = "tel";
    telInput.name = "memberTel";
    telInput.placeholder = "+33...";
    telInput.required = true;

    // Affiche ou masque le champ téléphone en fonction du type sélectionné
    typeSelect.addEventListener('change', function() {
      if (this.value === "adulte") {
        telInput.required = true;
        telLabel.style.display = "block";
        telInput.style.display = "block";
      } else {
        telInput.required = false;
        telLabel.style.display = "none";
        telInput.style.display = "none";
      }
      updateValidationState();
    });

    const removeBtn = document.createElement('button');
    removeBtn.type = "button";
    removeBtn.textContent = "Supprimer ce membre";
    removeBtn.style.backgroundColor = "#777";
    removeBtn.style.marginTop = "10px";
    removeBtn.addEventListener('click', function() {
      memberDiv.remove();
      // Réafficher le bouton "Ajouter un Membre" pour permettre d'ajouter d'autres membres
      addMemberBtn.style.display = "block";
      updateValidationState();
    });

    memberDiv.appendChild(nameLabel);
    memberDiv.appendChild(nameInput);
    memberDiv.appendChild(prenomLabel);
    memberDiv.appendChild(prenomInput);
    memberDiv.appendChild(typeLabel);
    memberDiv.appendChild(typeSelect);
    memberDiv.appendChild(telLabel);
    memberDiv.appendChild(telInput);
    memberDiv.appendChild(removeBtn);
    
    // Ajout des écouteurs de validation pour ce bloc membre
    memberDiv.querySelectorAll("input, select").forEach(function(input) {
      input.addEventListener("input", updateValidationState);
    });
    
    return memberDiv;
  }

  // Ajoute une section pour un nouveau membre et gère l'affichage du bouton de validation
  const addMemberBtn = document.getElementById('addMemberBtn');
  const membersSection = document.getElementById('membersSection');
  const membersFieldset = document.getElementById('membersFieldset');
  
  addMemberBtn.addEventListener('click', function() {
    const currentMemberCount = document.querySelectorAll('.member-block').length;
    if (currentMemberCount + 1 >= maxPlacesPerGroup) {
      alert("Vous ne pouvez pas ajouter plus de membres. Limite de " + maxPlacesPerGroup + " places par réservation.");
      return;
    }
    const memberBlock = createMemberBlock();
    membersSection.appendChild(memberBlock);
    // Afficher le bouton de validation
    submitButton.style.display = "block";
    updateValidationState();
  });

  // Validation simple pour l'email (pour le responsable)
  function isValidEmail(email) {
    const forbiddenPatterns = [/trash/i, /poubelle/i];
    for (let pattern of forbiddenPatterns) {
      if (pattern.test(email)) {
        return false;
      }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Gestion de la soumission du formulaire : envoi des données vers le webhook
  const form = document.getElementById('reservationForm');
  const confirmationDiv = document.getElementById('confirmation');

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Récupérer les informations du responsable
    const respNom = document.getElementById('respNom').value.trim();
    const respPrenom = document.getElementById('respPrenom').value.trim();
    const respEmail = document.getElementById('respEmail').value.trim();
    const respTel = document.getElementById('respTel').value.trim();

    if (!isValidEmail(respEmail)) {
      alert("Veuillez saisir une adresse email valide.");
      return;
    }
    if (!respTel.startsWith("+33")) {
      alert("Le numéro de téléphone du responsable doit commencer par +33.");
      return;
    }

    // Créer la liste de tous les participants (le responsable et les membres)
    const participants = [];
    // Responsable
    participants.push({
      Nom: respNom,
      Prénom: respPrenom,
      Téléphone: respTel,
      Email: respEmail,
      Catégorie: "adulte",
      Responsabilité: "responsable"
    });

    // Membres (le cas échéant)
    const memberBlocks = document.querySelectorAll('.member-block');
    memberBlocks.forEach(block => {
      const nom = block.querySelector("input[name='memberNom']").value.trim();
      const prenom = block.querySelector("input[name='memberPrenom']").value.trim();
      const type = block.querySelector("select[name='memberType']").value;
      let tel = "";
      let email = ""; // Les membres n'ont pas d'email dans le formulaire
      if (type === "adulte") {
        tel = block.querySelector("input[name='memberTel']").value.trim();
        if (!tel.startsWith("+33")) {
          alert("Le numéro de téléphone pour un adulte doit commencer par +33.");
          return;
        }
      }
      participants.push({
        Nom: nom,
        Prénom: prenom,
        Téléphone: tel,
        Email: email,
        Catégorie: type,
        Responsabilité: "membre"
      });
    });

    const totalRequested = participants.length;
    if (totalRequested > maxPlacesPerGroup) {
      alert("Vous ne pouvez pas réserver plus de " + maxPlacesPerGroup + " places par réservation.");
      return;
    }
    if (totalRequested > placesRemaining) {
      alert("Il ne reste pas assez de places disponibles.");
      return;
    }

    // Envoi des données vers le webhook avec mapping des champs
    const payload = {
      "payload": {
        "date": new Date().toLocaleString('fr-FR'),
        "responsable_numero": respTel,
        "reservation": {
          "membres": [
            {
              "nom": respNom,
              "prenom": respPrenom,
              "email": respEmail,
              "telephone": respTel,
              "niveau": "responsable"
            },
            ...participants
              .filter(p => p.Responsabilité === "membre")
              .map(p => ({
                "nom": p.Nom,
                "prenom": p.Prénom,
                "telephone": p.Téléphone || "-",
                "email": p.Email || "-",
                "categorie": p.Catégorie,
                "niveau": "membre"
              }))
          ]
        }
      }
    };

    fetch(webhookURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.text())
    .then(data => {
        updatePlacesRemaining(placesRemaining - totalRequested);
        confirmationDiv.classList.remove('hidden');
        console.log("Webhook response:", data);
        // Construire un tableau détaillé des participants
        let tableHTML = "<h3>Détails de la réservation :</h3>";
        tableHTML += "<table border='1' cellspacing='0' cellpadding='5'><tr>" +
                     "<th>Responsabilité</th><th>Nom</th><th>Prénom</th><th>Téléphone</th><th>Email</th></tr>";
        participants.forEach(function(participant) {
            tableHTML += "<tr>" +
                         "<td>" + participant.Responsabilité + "</td>" +
                         "<td>" + participant.Nom + "</td>" +
                         "<td>" + participant.Prénom + "</td>" +
                         "<td>" + (participant.Téléphone || "-") + "</td>" +
                         "<td>" + (participant.Email || "-") + "</td>" +
                         "</tr>";
        });
        tableHTML += "</table>";
        confirmationDiv.innerHTML = tableHTML;
        form.reset();
        membersSection.innerHTML = "";
        membersFieldset.style.height = "auto";
        updateValidationState();
    })
    .catch(err => {
      console.error("Erreur lors de l'envoi vers le webhook : ", err);
      alert("Une erreur est survenue lors de l'enregistrement de la réservation.");
    });
  });
});
