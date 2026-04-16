# Edubudy Mobile

App iPhone/Android — assistant scolaire et bien-être pour enfants.

## Lancer avec Expo Go (le plus simple)

1. **Installer Expo Go** sur l'iPhone depuis l'App Store
2. **Cloner** ce repo et aller dans `mobile/`
3. **Installer les dépendances** :
   ```bash
   cd mobile
   npm install
   ```
4. **Démarrer** :
   ```bash
   npx expo start
   ```
5. **Scanner le QR code** avec l'app Expo Go (ou depuis l'app Appareil photo iOS)

L'app s'ouvre directement — pas besoin de compte Apple Developer ni de l'App Store.

## Configuration (première ouverture)

L'app lance un wizard de configuration en 5 étapes :

1. Accueil
2. **Clés API** :
   - `ANTHROPIC_API_KEY` — [console.anthropic.com](https://console.anthropic.com)
   - `OPENAI_API_KEY` — [platform.openai.com](https://platform.openai.com) (pour la voix)
3. **Profil enfant** — prénom, âge, niveau scolaire, matières
4. **Code PIN parent** — protège l'espace parent
5. **Personnalisation** — mascotte, couleur, vitesse de voix

## Fonctionnalités

- 🎤 **Voix native iOS** — enregistrement → Whisper → Claude
- 📚 **Méthode socratique** — jamais de réponse directe, guide par questions
- 📖 **Programme officiel** — RAG sur les Bulletins Officiels par niveau (CP → Terminale)
- 🧠 **Support émotionnel** — basé sur CNV, psychologie positive, intelligence émotionnelle
- 🚨 **Alertes parent immédiates** — harcèlement, agression, idéation suicidaire, violence
- 📱 **Notification push** — alerte le parent sur le même téléphone
- 🎨 **Personnalisable** — 4 mascottes, 4 thèmes, vitesse de voix

## Coût estimé

| Service | Usage | Coût estimé |
|---|---|---|
| Claude Sonnet 4.6 | ~1 question | ~0,002 € |
| Whisper (voix) | ~30 sec | ~0,003 € |
| **Total / question vocale** | | **~0,005 €** |
