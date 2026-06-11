# Publication Google Play

Cette application Next.js utilise des routes dynamiques, Supabase et du middleware. Le paquet Android doit donc charger l'application HTTPS de production, plutôt qu'un export statique embarqué.

## Prerequis

- Une URL HTTPS publique pour l'application Next.js.
- Android Studio avec le SDK Android installe.
- Une cle de signature Play App Signing ou une cle de release locale.
- Les fiches Google Play: nom, description, icone 512 x 512, captures, categorie, contact, politique de confidentialite.

## Preparation

Depuis PowerShell:

```powershell
$env:GUIDE_PARC_APP_URL="https://votre-domaine.example"
npm run build
npm run android:sync
npm run android:open
```

`GUIDE_PARC_APP_URL` doit rester en HTTPS. La configuration refuse le HTTP clair pour la version Android.

## Generation de l'AAB

Dans Android Studio, configurez la signature release, puis genereez un Android App Bundle.

Vous pouvez aussi lancer:

```powershell
$env:GUIDE_PARC_APP_URL="https://votre-domaine.example"
npm run android:sync
npm run android:build:aab
```

L'AAB de release est genere dans `android/app/build/outputs/bundle/release/`.

## Points a completer avant envoi

- Remplacer `fr.guideparc.app` dans `capacitor.config.ts` si un autre identifiant Android est souhaite. Cet identifiant ne pourra plus etre change apres publication.
- Ajouter une politique de confidentialite publique, surtout parce que l'app utilise Supabase et une zone d'administration.
- Verifier les captures Play Store sur telephone et tablette.
- Tester la connexion, le mode hors ligne, la carte et les pages dynamiques depuis l'app Android.
