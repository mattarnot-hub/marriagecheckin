# Marriage Check-In

A private, no-backend weekly check-in app built from our therapy goals and Gottman Relationship Checkup.

## Privacy model
- The repo and GitHub Pages site contain **only app code and generic content**, never personal answers.
- Answers are encrypted in the browser (PBKDF2-SHA256, 600k iterations, then AES-GCM-256) and stored only in that browser's localStorage.
- Strict Content-Security-Policy: no network requests, no third-party scripts, no analytics.
- Sign-in needs an email address AND a passphrase. Only two addresses are accepted (stored as SHA-256 hashes, not in plain text) and the address decides who is signed in. Each email gets its own vault on a device, keyed from email + passphrase.
- First sign-in on a device uses a starter passphrase that only opens an empty vault and immediately forces you to create your own (10+ characters). The starter passphrase is in the public code, so never enter data before setting your own.
- "Forgot passphrase" never sends email and sends nothing anywhere: data is encrypted with the passphrase and can't be recovered, so it erases that device's vault so you can start over and restore from an encrypted export.
- Auto-locks after 5 minutes idle. There is **no passphrase recovery**.
- Share between phones with **encrypted export/import** (Settings). Give the passphrase separately. Exports are git-ignored.

## Run locally
ES modules and WebCrypto need http(s) (or localhost):

    python -m http.server 8080

then open http://localhost:8080.

## Deploy
Push to `main` in a GitHub repo, then Settings > Pages > Source: **GitHub Actions**. Consider making the repo private (Pages from private repos needs a paid plan; a public repo is fine because it holds no personal data).

## Customize
Edit `js/content.js` (goals, tools, decks) after each goal review with your therapist.
