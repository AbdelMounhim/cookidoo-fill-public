# Cookidoo Recipe Filler

Outil gratuit pour ajouter automatiquement vos recettes Thermomix sur Cookidoo.fr et les retrouver sur votre robot Thermomix

## Comment ca marche ?

1. **Generez votre recette** avec ChatGPT, Claude ou Gemini (gratuit)
2. **Installez le bookmarklet** en le glissant dans vos favoris
3. **Remplissez Cookidoo** en un clic

## Utilisation

### Etape 1 : Generer la recette

Copiez le prompt depuis [la page web](https://abdelmounhim.github.io/cookidoo-fill-public/) et collez-le dans l'IA de votre choix avec le nom de votre recette.

### Etape 2 : Installer le bookmarklet

Glissez le bouton "Remplir Cookidoo" dans votre barre de favoris.

### Etape 3 : Remplir Cookidoo

1. Connectez-vous sur cookidoo.fr
2. Creez une nouvelle recette
3. Cliquez sur le bookmarklet
4. Collez le JSON genere
5. Cliquez sur "Remplir la recette"

## Format JSON

Le JSON doit suivre ce format :

```json
{
  "titre": "Nom de la recette",
  "tempsPreparation": 20,
  "tempsTotal": 50,
  "portions": 4,
  "ingredients": [
    {
      "categorie": "Pour la pate",
      "items": [
        { "nom": "farine", "quantite": 500, "unite": "g", "notes": "" },
        { "nom": "oeufs", "quantite": 3, "unite": null, "notes": "" }
      ]
    }
  ],
  "etapes": [
    {
      "numero": 1,
      "titre": "Preparation",
      "description": "Description de l'etape",
      "ingredients": ["farine", "sucre"],
      "temperature": "120°C",
      "duree": "5 min",
      "vitesse": "5",
      "details": "Petrir"
    }
  ],
  "conseils": ["Conseil 1", "Conseil 2"]
}
```

## Deploiement sur GitHub Pages

1. Creez un repo GitHub
2. Uploadez les fichiers de ce dossier
3. Activez GitHub Pages dans Settings > Pages
4. Selectionnez la branche `main` et le dossier racine

## Fichiers

- `index.html` - Page principale avec instructions
- `style.css` - Styles de la page
- `filler.js` - Script du bookmarklet (remplissage DOM)



## Regles pour les ingredients

**Unites valides :** `g`, `kg`, `ml`, `L`, `cl`, `c. a cafe`, `c. a soupe`

**Exemples de parsing :**
- "40 gr d'huile d'olive" -> `quantite: 40, unite: "g", nom: "huile d'olive"`
- "3 gousses d'ail" -> `quantite: 3, unite: null, nom: "gousses d'ail"`
- "5 bananes" -> `quantite: 5, unite: null, nom: "bananes"`
- "3 oeufs" -> `quantite: 3, unite: null, nom: "oeufs"`

**Important :** NE JAMAIS utiliser "pieces" ou "unite" comme unite. Mettre `null` et inclure le comptable dans le nom.

## Licence

MIT - Utilisez et modifiez librement.

## Avertissement

Ce projet n'est pas affilie à Vorwerk ou Cookidoo. Verifiez toujours les recettes generees par l'IA avant de cuisiner.
