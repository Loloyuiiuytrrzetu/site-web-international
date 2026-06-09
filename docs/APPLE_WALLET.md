# Apple Wallet — mise en service

Le code de la carte Apple Wallet est **déjà en place**. Il s'active dès que les
variables d'environnement ci-dessous sont définies (sur Vercel). Tant qu'elles
ne le sont pas, le bouton « Ajouter à Apple Wallet » affiche « bientôt » et le
reste de l'app fonctionne normalement.

## Ce que tu obtiens une fois configuré

- Bouton **« Ajouter à Apple Wallet »** sur la carte du client.
- Une fois la carte dans le Wallet, le client **reçoit les notifications
  automatiquement** (tampon ajouté, promo, anniversaire) — **sans rien activer**.
- La carte se met à jour toute seule (points, récompense).

## Étapes (à faire une fois)

### 1. Compte Apple Developer (~99 €/an)

S'inscrire sur https://developer.apple.com/programs/ (validation Apple : 24–48 h).

### 2. Créer un Pass Type ID

Dans https://developer.apple.com/account → **Identifiers** → **+** →
**Pass Type IDs** → identifiant du type `pass.app.walletiz.loyalty`.
Note cet identifiant : c'est `APPLE_PASS_TYPE_ID`.

### 3. Générer le certificat du Pass Type ID

1. Sur ton Mac : **Trousseau d'accès** → Assistant de certification →
   « Demander un certificat à une autorité de certification » → enregistre un
   fichier `.certSigningRequest` (CSR).
2. Sur le portail Apple, sur ton Pass Type ID → **Create Certificate** →
   téléverse le CSR → télécharge `pass.cer`.
3. Double-clique `pass.cer` pour l'importer, puis dans Trousseau d'accès
   **exporte-le en `.p12`** (clé privée incluse), avec un mot de passe.

Convertis le `.p12` en PEM (certificat + clé) :

```bash
# Certificat
openssl pkcs12 -in pass.p12 -clcerts -nokeys -out signerCert.pem -passin pass:TON_MDP
# Clé privée (sans passphrase pour simplifier)
openssl pkcs12 -in pass.p12 -nocerts -nodes -out signerKey.pem -passin pass:TON_MDP
```

### 4. Certificat Apple WWDR

Télécharge le certificat intermédiaire **Apple WWDR** (G4) :
https://www.apple.com/certificateauthority/ → « Worldwide Developer Relations ».
Convertis-le en PEM :

```bash
openssl x509 -inform der -in AppleWWDRCAG4.cer -out wwdr.pem
```

### 5. Team ID

Visible dans https://developer.apple.com/account → **Membership** →
« Team ID ». C'est `APPLE_TEAM_ID`.

## Variables d'environnement à ajouter sur Vercel

> Project → Settings → Environment Variables. Pour les certificats, le plus
> simple est de coller le **contenu PEM** directement (le code accepte aussi du
> base64).

| Variable | Valeur |
|---|---|
| `APPLE_PASS_TYPE_ID` | ex. `pass.app.walletiz.loyalty` |
| `APPLE_TEAM_ID` | ton Team ID |
| `APPLE_PASS_CERT` | contenu de `signerCert.pem` |
| `APPLE_PASS_KEY` | contenu de `signerKey.pem` |
| `APPLE_PASS_KEY_PASSPHRASE` | (optionnel) passphrase de la clé |
| `APPLE_WWDR_CERT` | contenu de `wwdr.pem` |
| `NEXT_PUBLIC_BASE_URL` | l'URL publique du site (ex. `https://walletiz.app`) — nécessaire pour le service de mises à jour |

> Pour coller un PEM multiligne en base64 (plus sûr dans certains panneaux) :
> `base64 -w0 signerCert.pem` puis colle le résultat.

Après avoir ajouté les variables, **redéploie**. Le bouton « Ajouter à Apple
Wallet » devient actif.

## Test sur iPhone

1. Ouvre la carte d'un client sur l'iPhone → **Ajouter à Apple Wallet**.
2. Scanne la carte (ou +1 tampon manuel) → la carte se met à jour dans le Wallet
   et une notification apparaît.
3. Crée une campagne « Envoyer maintenant » → notification sur l'iPhone.

> Les notifications Wallet passent par APNs avec le **même certificat** que la
> signature de la passe — rien d'autre à configurer.
