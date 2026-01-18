/**
 * Cookidoo Recipe Filler - Browser Version
 * Remplit automatiquement le formulaire de recette sur Cookidoo.fr
 *
 * Ce script fonctionne directement dans le navigateur (pas de Puppeteer)
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    typingDelay: 20,
    actionDelay: 300,
    longDelay: 1000
  };

  /**
   * Helper pour créer des délais
   */
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Helper pour attendre qu'un sélecteur soit présent
   */
  function waitForSelector(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkInterval = setInterval(() => {
        const element = document.querySelector(selector);
        if (element) {
          clearInterval(checkInterval);
          resolve(element);
        } else if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          reject(new Error(`Timeout: ${selector} non trouvé`));
        }
      }, 100);
    });
  }

  /**
   * Simule la frappe de texte dans un élément
   */
  async function typeText(element, text, charDelay = CONFIG.typingDelay) {
    element.focus();
    element.textContent = '';

    for (const char of text) {
      element.textContent += char;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      await delay(charDelay);
    }

    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * Simule la frappe clavier
   */
  async function simulateKeyboard(text, charDelay = CONFIG.typingDelay) {
    for (const char of text) {
      document.execCommand('insertText', false, char);
      await delay(charDelay);
    }
  }

  /**
   * Parse la durée au format "X min" ou "X sec"
   */
  function parseDuration(dureeStr) {
    if (!dureeStr) return { minutes: 0, seconds: 0 };

    const minMatch = dureeStr.match(/(\d+)\s*min/);
    const secMatch = dureeStr.match(/(\d+)\s*sec/);

    return {
      minutes: minMatch ? parseInt(minMatch[1]) : 0,
      seconds: secMatch ? parseInt(secMatch[1]) : 0
    };
  }

  /**
   * Parse la température
   */
  function parseTemperature(tempStr) {
    if (!tempStr) return null;
    const match = tempStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Parse la vitesse
   */
  function parseSpeed(vitesseStr) {
    if (!vitesseStr) return null;
    if (vitesseStr.toLowerCase().includes('mijot')) return 'soft';
    const match = vitesseStr.match(/(\d+\.?\d*)/);
    return match ? match[1] : null;
  }

  /**
   * Met à jour le titre de la recette
   */
  async function updateTitle(titre) {
    updateStatus('Mise à jour du titre...');

    const titleField = document.querySelector('textarea[name="name"]');
    if (!titleField) {
      console.warn('Champ titre non trouvé');
      return;
    }

    titleField.click();
    await delay(CONFIG.actionDelay);

    titleField.select();
    titleField.value = titre;
    titleField.dispatchEvent(new Event('input', { bubbles: true }));
    titleField.dispatchEvent(new Event('change', { bubbles: true }));

    // Confirmer
    const confirmBtn = document.querySelector('button.core-inline-input__confirm[type="submit"]');
    if (confirmBtn) {
      confirmBtn.click();
      await delay(CONFIG.longDelay);
    }

    console.log(`Titre: ${titre}`);
  }

  /**
   * Configure les temps de préparation et total
   */
  async function setRecipeTimes(prepTime, totalTime) {
    updateStatus('Configuration des temps...');

    // Ouvrir le modal en cliquant sur la tuile
    const prepTile = document.querySelector('.cr-recipe-settings-tiles__item:nth-child(1)');
    if (!prepTile) {
      console.warn('Tuile temps non trouvée');
      return;
    }

    prepTile.click();
    await delay(CONFIG.longDelay);

    // Temps de préparation
    const prepHours = Math.floor(prepTime / 60);
    const prepMinutes = prepTime % 60;

    if (prepHours > 0) {
      const hoursInput = document.querySelector('div[role="tabpanel"][id="prepTime-tab"]:not([hidden]) input[unit="hours"]');
      if (hoursInput) {
        hoursInput.value = prepHours;
        hoursInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    if (prepMinutes > 0) {
      const minutesInput = document.querySelector('div[role="tabpanel"][id="prepTime-tab"]:not([hidden]) input[unit="minutes"]');
      if (minutesInput) {
        minutesInput.value = prepMinutes;
        minutesInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    console.log(`Temps préparation: ${prepTime} min`);

    // Passer à l'onglet temps total
    const totalTab = document.querySelector('button[role="tab"][id="totalTime"]');
    if (totalTab) {
      totalTab.click();
      await delay(CONFIG.actionDelay);
    }

    const totalHours = Math.floor(totalTime / 60);
    const totalMinutes = totalTime % 60;

    if (totalHours > 0) {
      const hoursInput = document.querySelector('div[role="tabpanel"][id="totalTime-tab"]:not([hidden]) input[unit="hours"]');
      if (hoursInput) {
        hoursInput.value = totalHours;
        hoursInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    if (totalMinutes > 0) {
      const minutesInput = document.querySelector('div[role="tabpanel"][id="totalTime-tab"]:not([hidden]) input[unit="minutes"]');
      if (minutesInput) {
        minutesInput.value = totalMinutes;
        minutesInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    console.log(`Temps total: ${totalTime} min`);

    // Confirmer
    const confirmBtn = document.querySelector('button.button--primary[action="confirm"]');
    if (confirmBtn) {
      confirmBtn.click();
      await delay(CONFIG.longDelay);
    }
  }

  /**
   * Configure le nombre de portions
   */
  async function setServings(portions) {
    updateStatus('Configuration des portions...');

    const servingsTile = document.querySelector('.cr-recipe-settings-tiles__item:nth-child(3)');
    if (!servingsTile) {
      console.warn('Tuile portions non trouvée');
      return;
    }

    servingsTile.click();
    await delay(CONFIG.longDelay);

    // Onglet recipeYield
    const yieldTab = document.querySelector('button[role="tab"][id="recipeYield"]');
    if (yieldTab) {
      yieldTab.click();
      await delay(CONFIG.actionDelay);
    }

    const portionsInput = document.querySelector('div[role="tabpanel"][id="recipeYield-tab"]:not([hidden]) input[type="number"]');
    if (portionsInput) {
      portionsInput.value = portions;
      portionsInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    console.log(`Portions: ${portions}`);

    // Confirmer
    const confirmBtn = document.querySelector('button.button--primary[action="confirm"]');
    if (confirmBtn) {
      confirmBtn.click();
      await delay(CONFIG.longDelay);
    }
  }

  /**
   * Active TM7 en plus de TM6
   */
  async function enableAllDevices() {
    updateStatus('Activation TM7...');

    try {
      const editTrigger = document.querySelector('.devices-edit-trigger button');
      if (!editTrigger) return;

      editTrigger.click();
      await delay(CONFIG.longDelay);

      // Vérifier si TM7 est activé
      const tm7Input = document.querySelector('input[value="TM7"]');
      if (!tm7Input) {
        console.warn('Toggle TM7 non trouvé');
        return;
      }

      const toggle = tm7Input.closest('core-chip-toggle');
      if (toggle && toggle.getAttribute('aria-checked') !== 'true') {
        toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        console.log('TM7 activé');
        await delay(CONFIG.actionDelay);
      }

      // Sauvegarder
      const confirmBtn = document.querySelector('core-modal[trigger-class="devices-edit-trigger"] button.button--primary[action="confirm"]');
      if (confirmBtn) {
        confirmBtn.click();
        await delay(CONFIG.longDelay);
      }
    } catch (e) {
      console.warn('Erreur activation appareils:', e.message);
    }
  }

  /**
   * Ajoute les ingrédients
   */
  async function addIngredients(recipe) {
    updateStatus('Ajout des ingrédients...');

    // Préparer la liste des ingrédients
    const allIngredients = [];

    recipe.ingredients.forEach(category => {
      allIngredients.push(`--- ${category.categorie} ---`);
      category.items.forEach(item => {
        let text = '';
        if (item.quantite) text += `${item.quantite} `;
        if (item.unite) text += `${item.unite} `;
        text += item.nom;
        if (item.notes) text += ` (${item.notes})`;
        allIngredients.push(text.trim());
      });
    });

    // Ajouter chaque ingrédient
    for (let i = 0; i < allIngredients.length; i++) {
      const ingredient = allIngredients[i];
      updateStatus(`Ingrédient ${i + 1}/${allIngredients.length}...`);

      const fields = document.querySelectorAll('cr-manage-ingredients cr-text-field[contenteditable="true"]');
      const field = fields[fields.length - 1];

      if (!field) {
        console.warn('Champ ingrédient non trouvé');
        continue;
      }

      field.click();
      field.focus();
      await delay(CONFIG.actionDelay);

      // Vider et remplir le champ
      field.textContent = '';
      field.innerHTML = '';

      // Simuler la frappe
      for (const char of ingredient) {
        document.execCommand('insertText', false, char);
        await delay(10);
      }

      await delay(CONFIG.actionDelay);

      // Entrée pour valider (sauf le dernier)
      if (i < allIngredients.length - 1) {
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          bubbles: true
        });
        field.dispatchEvent(enterEvent);
        await delay(500);
      }

      console.log(`Ingrédient ${i + 1}: ${ingredient.substring(0, 40)}...`);
    }

    console.log('Tous les ingrédients ajoutés');
  }

  /**
   * Ajoute les paramètres de cuisson à une étape
   */
  async function addCookingParameters(etape) {
    try {
      // Cliquer sur le bouton paramètres
      const ttsButton = document.querySelector('li.cr-manage-list__item[active="true"] .cr-text-field-actions__tts');
      if (!ttsButton) return;

      ttsButton.click();
      await delay(800);

      // Durée
      if (etape.duree) {
        const { minutes, seconds } = parseDuration(etape.duree);

        if (minutes > 0) {
          const minInput = document.querySelector('cr-tts-time input[aria-describedby="minutes"]');
          if (minInput) {
            minInput.value = minutes;
            minInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }

        if (seconds > 0) {
          const secInput = document.querySelector('cr-tts-time input[aria-describedby="seconds"]');
          if (secInput) {
            secInput.value = seconds;
            secInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      }

      // Température
      if (etape.temperature) {
        const temp = parseTemperature(etape.temperature);
        if (temp) {
          // Ouvrir section si repliée
          const tempExpand = document.querySelector('cr-tts-temperature core-expand[isexpanded="false"]');
          if (tempExpand) {
            const expandBtn = tempExpand.querySelector('button.core-expand__header');
            if (expandBtn) expandBtn.click();
            await delay(300);
          }

          const tempLabel = document.querySelector(`label[for="temperature-radio-${temp}"]`);
          if (tempLabel) tempLabel.click();
        }
      }

      // Vitesse
      if (etape.vitesse) {
        const speed = parseSpeed(etape.vitesse);
        if (speed) {
          // Ouvrir section si repliée
          const speedExpand = document.querySelector('cr-tts-speed core-expand[isexpanded="false"]');
          if (speedExpand) {
            const expandBtn = speedExpand.querySelector('button.core-expand__header');
            if (expandBtn) expandBtn.click();
            await delay(300);
          }

          // Sens inverse
          if (etape.details && etape.details.includes('Inverse')) {
            const reverseLabel = document.querySelector('label[for="direction-radio-CCW"]');
            if (reverseLabel) reverseLabel.click();
            await delay(300);
          }

          const speedLabel = document.querySelector(`label[for="speed-radio-${speed}"]`);
          if (speedLabel) speedLabel.click();
        }
      }

      // Sauvegarder
      const saveBtn = document.querySelector('button.cr-popover-modal__save[type="submit"]');
      if (saveBtn) {
        saveBtn.click();
        await delay(500);
      }

    } catch (e) {
      console.warn('Erreur paramètres cuisson:', e.message);
    }
  }

  /**
   * Ajoute les ingrédients à une étape
   */
  async function addStepIngredients(ingredients) {
    if (!ingredients || ingredients.length === 0) return;

    for (const ingredient of ingredients) {
      try {
        const ingredientBtn = document.querySelector('li.cr-manage-list__item[active="true"] .cr-text-field-actions__ingredient');
        if (!ingredientBtn) continue;

        ingredientBtn.click();
        await delay(500);

        // Attendre le modal
        await waitForSelector('.cr-ingredient-modal__add-tabpanel', 5000);
        await delay(300);

        // Remplir le champ
        const inputDiv = document.querySelector('div[aria-describedby="add-description"]');
        if (inputDiv) {
          inputDiv.textContent = '';
          inputDiv.focus();
          await delay(200);

          for (const char of ingredient) {
            document.execCommand('insertText', false, char);
            await delay(10);
          }
          await delay(400);

          // Cliquer sur +
          const plusBtn = document.querySelector('button.cr-ingredient-modal__plus-button');
          if (plusBtn) {
            plusBtn.click();
            await delay(800);
          }
        }
      } catch (e) {
        console.warn(`Erreur ajout ingrédient étape: ${ingredient}`, e.message);
      }
    }
  }

  /**
   * Ajoute les étapes de préparation
   */
  async function addSteps(recipe) {
    updateStatus('Ajout des étapes...');

    for (let i = 0; i < recipe.etapes.length; i++) {
      const etape = recipe.etapes[i];
      const description = `${etape.titre} : ${etape.description}`;

      updateStatus(`Étape ${i + 1}/${recipe.etapes.length}...`);

      const fields = document.querySelectorAll('cr-manage-list[trigger-id="add-steps"] cr-text-field[contenteditable="true"]');
      const field = fields[fields.length - 1];

      if (!field) {
        console.warn('Champ étape non trouvé');
        continue;
      }

      field.click();
      field.focus();
      await delay(CONFIG.actionDelay);

      // Vider et remplir
      field.textContent = '';
      field.innerHTML = '';

      for (const char of description) {
        document.execCommand('insertText', false, char);
        await delay(5);
      }

      // Ajouter espace à la fin
      document.execCommand('insertText', false, ' ');
      await delay(CONFIG.actionDelay);

      // Scroll et focus pour afficher les boutons
      field.scrollIntoView({ block: 'center' });
      field.click();
      await delay(500);

      // Positionner curseur à la fin
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(field);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      await delay(300);

      // Paramètres de cuisson
      await addCookingParameters(etape);

      // Re-focus
      field.focus();
      await delay(300);

      // Ingrédients de l'étape
      if (etape.ingredients && etape.ingredients.length > 0) {
        await addStepIngredients(etape.ingredients);
      }

      // Entrée pour passer à l'étape suivante (sauf dernière)
      if (i < recipe.etapes.length - 1) {
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          bubbles: true
        });
        field.dispatchEvent(enterEvent);
        await delay(800);
      }

      console.log(`Étape ${i + 1} complétée`);
    }

    console.log('Toutes les étapes ajoutées');
  }

  /**
   * Ajoute les conseils
   */
  async function addTips(conseils) {
    if (!conseils || conseils.length === 0) return;

    updateStatus('Ajout des conseils...');

    try {
      // Scroll vers la section
      const section = document.querySelector('#tips-section');
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await delay(500);

      const tipsField = document.querySelector('textarea[name="hints"]');
      if (!tipsField) return;

      tipsField.click();
      await delay(500);

      tipsField.value = conseils.join('\n\n');
      tipsField.dispatchEvent(new Event('input', { bubbles: true }));
      tipsField.dispatchEvent(new Event('change', { bubbles: true }));
      await delay(500);

      // Confirmer
      const confirmBtn = document.querySelector('#tips-section button.core-inline-input__confirm[type="submit"]');
      if (confirmBtn) {
        confirmBtn.click();
        await delay(CONFIG.longDelay);
      }

      console.log('Conseils ajoutés');
    } catch (e) {
      console.warn('Erreur ajout conseils:', e.message);
    }
  }

  /**
   * Met à jour le statut dans l'UI
   */
  function updateStatus(message) {
    const statusEl = document.getElementById('cookidoo-filler-status');
    if (statusEl) {
      statusEl.textContent = message;
    }
    console.log(`[Cookidoo Filler] ${message}`);
  }

  /**
   * Crée l'interface modale
   */
  function createModal() {
    // Supprimer modal existant
    const existing = document.getElementById('cookidoo-filler-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'cookidoo-filler-modal';
    modal.innerHTML = `
      <style>
        #cookidoo-filler-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        #cookidoo-filler-modal .modal-content {
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        #cookidoo-filler-modal h2 {
          margin: 0 0 16px 0;
          color: #333;
          font-size: 1.5rem;
        }
        #cookidoo-filler-modal textarea {
          width: 100%;
          height: 200px;
          padding: 12px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-family: monospace;
          font-size: 12px;
          resize: vertical;
          box-sizing: border-box;
        }
        #cookidoo-filler-modal textarea:focus {
          border-color: #00a97f;
          outline: none;
        }
        #cookidoo-filler-modal .buttons {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }
        #cookidoo-filler-modal button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        #cookidoo-filler-modal .btn-primary {
          background: #00a97f;
          color: white;
          flex: 1;
        }
        #cookidoo-filler-modal .btn-primary:hover {
          background: #008c69;
        }
        #cookidoo-filler-modal .btn-primary:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        #cookidoo-filler-modal .btn-secondary {
          background: #f5f5f5;
          color: #333;
        }
        #cookidoo-filler-modal .btn-secondary:hover {
          background: #e5e5e5;
        }
        #cookidoo-filler-modal .status {
          margin-top: 12px;
          padding: 12px;
          background: #f0f9f6;
          border-radius: 8px;
          color: #00a97f;
          font-weight: 500;
          display: none;
        }
        #cookidoo-filler-modal .status.visible {
          display: block;
        }
        #cookidoo-filler-modal .status.error {
          background: #fef2f2;
          color: #dc2626;
        }
        #cookidoo-filler-modal .help {
          margin-top: 16px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
          font-size: 0.9rem;
          color: #666;
        }
        #cookidoo-filler-modal .help a {
          color: #00a97f;
        }
      </style>
      <div class="modal-content">
        <h2>Remplir la recette Cookidoo</h2>
        <textarea id="cookidoo-filler-json" placeholder='Collez ici le JSON de votre recette...'></textarea>
        <div class="buttons">
          <button class="btn-secondary" id="cookidoo-filler-cancel">Annuler</button>
          <button class="btn-primary" id="cookidoo-filler-fill">Remplir la recette</button>
        </div>
        <div class="status" id="cookidoo-filler-status"></div>
        <div class="help">
          <strong>Comment obtenir le JSON ?</strong><br>
          Copiez le prompt depuis la page d'instructions et collez-le dans ChatGPT, Claude ou Gemini avec le nom de votre recette.
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Events
    document.getElementById('cookidoo-filler-cancel').onclick = () => modal.remove();
    document.getElementById('cookidoo-filler-fill').onclick = () => startFilling();

    // Fermer en cliquant en dehors
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    // Focus sur le textarea
    document.getElementById('cookidoo-filler-json').focus();
  }

  /**
   * Démarre le remplissage
   */
  async function startFilling() {
    const jsonInput = document.getElementById('cookidoo-filler-json');
    const fillBtn = document.getElementById('cookidoo-filler-fill');
    const statusEl = document.getElementById('cookidoo-filler-status');

    const jsonText = jsonInput.value.trim();

    if (!jsonText) {
      showStatus('Veuillez coller le JSON de la recette', true);
      return;
    }

    let recipe;
    try {
      recipe = JSON.parse(jsonText);
    } catch (e) {
      showStatus(`JSON invalide: ${e.message}`, true);
      return;
    }

    // Valider la structure
    if (!recipe.titre || !recipe.ingredients || !recipe.etapes) {
      showStatus('JSON incomplet: titre, ingredients et etapes sont requis', true);
      return;
    }

    // Désactiver les contrôles
    fillBtn.disabled = true;
    jsonInput.disabled = true;

    showStatus('Démarrage du remplissage...');

    try {
      // Déterminer sur quelle page on est
      const currentUrl = window.location.href;
      const recipeIdMatch = currentUrl.match(/\/created-recipes\/fr-FR\/([A-Z0-9]+)/);

      if (!recipeIdMatch) {
        throw new Error('Vous devez être sur la page d\'édition d\'une recette Cookidoo');
      }

      const recipeId = recipeIdMatch[1];
      console.log(`Recipe ID: ${recipeId}`);

      // Si on est sur la page principale d'édition
      if (currentUrl.includes('/edit') && !currentUrl.includes('ingredients-and-preparation')) {
        // Mettre à jour le titre
        await updateTitle(recipe.titre);

        // Activer TM7
        await enableAllDevices();

        // Configurer temps
        await setRecipeTimes(recipe.tempsPreparation || 20, recipe.tempsTotal || 40);

        // Configurer portions
        await setServings(recipe.portions || 4);

        // Ajouter conseils
        if (recipe.conseils) {
          await addTips(recipe.conseils);
        }

        showStatus('Page principale remplie ! Allez maintenant sur la page des ingrédients/étapes.');
      }
      // Si on est sur la page des ingrédients
      else if (currentUrl.includes('active=ingredients')) {
        await addIngredients(recipe);
        showStatus('Ingrédients ajoutés ! Allez maintenant sur la page des étapes.');
      }
      // Si on est sur la page des étapes
      else if (currentUrl.includes('active=steps')) {
        await addSteps(recipe);
        showStatus('Étapes ajoutées ! La recette est complète.');
      }
      else {
        showStatus('Naviguez vers: page principale, ingrédients ou étapes pour continuer.');
      }

    } catch (error) {
      console.error('Erreur:', error);
      showStatus(`Erreur: ${error.message}`, true);
    }

    // Réactiver les contrôles
    fillBtn.disabled = false;
    jsonInput.disabled = false;
  }

  /**
   * Affiche un message de statut
   */
  function showStatus(message, isError = false) {
    const statusEl = document.getElementById('cookidoo-filler-status');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.classList.add('visible');
      statusEl.classList.toggle('error', isError);
    }
  }

  /**
   * Point d'entrée
   */
  function init() {
    // Vérifier qu'on est sur Cookidoo
    if (!location.hostname.includes('cookidoo')) {
      alert('Ce bookmarklet fonctionne uniquement sur cookidoo.fr\n\nAllez sur cookidoo.fr, créez une recette, puis cliquez à nouveau sur le bookmarklet.');
      return;
    }

    // Vérifier qu'on est sur une page de recette
    if (!location.href.includes('created-recipes')) {
      alert('Allez sur une page de création/édition de recette.\n\nCliquez sur "Créer une recette" sur Cookidoo, puis utilisez ce bookmarklet.');
      return;
    }

    createModal();
  }

  // Démarrer
  init();
})();
