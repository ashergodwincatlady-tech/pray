# Connect your PYN accounts and community

This package includes the app, the 255-lesson course, Google sign-in, profile setup, real member discovery, and shared age-group chat. No real Google account or database is created by downloading it. The Firebase project is yours to configure.

## 1. Create your Firebase project

Open https://console.firebase.google.com/ and create or select your project. Register a Web app from Project settings > Your apps. Copy that app's public configuration into `firebase-config.js`: apiKey, authDomain, projectId, and appId. Do not use a service-account JSON file or private key. These web settings identify your project; Firestore rules protect access.

## 2. Enable Google sign-in

In Authentication > Sign-in method, enable Google and supply the support email requested by Firebase. In Authentication > Settings > Authorized domains, add `we-pray.vercel.app` and any other domain where you actually deploy this build. For local testing, explicitly add `localhost` if it is absent. Configure the associated OAuth consent screen if Google requests it. While an OAuth application is in testing, add the accounts you use as test users if required by your Google project settings.

## 3. Create and protect Firestore

Create a Cloud Firestore database in production mode. In its Rules tab, replace the rules with the complete contents of `firestore.rules` and publish them. Do not use open test-mode rules. You can alternatively deploy these rules with Firebase CLI using `firebase deploy --only firestore:rules --project YOUR_PROJECT_ID` from this folder after authenticating the CLI. `firebase.json` supplies the rules path.

The app uses these collections:

- `profiles`: private username and entered age, readable by the owner only.
- `members`: username and age group, readable by signed-in members of the same age group.
- `usernames`: case-insensitive username reservations.
- `rooms/{ageBand}/messages`: shared messages accessible only to the matching age group.
- `rates`: server-enforced message cooldown state, one message per three-second interval.
- `reports`: message reports, readable through the console by the project owner or by an authenticated administrator with an `admin` custom claim.

No composite index is required by the included queries. If you add different filters or sorting later, Firestore may ask you to create one.

## 4. Upload the app

Upload all files in this folder to the repository used by your Vercel site. Replace the old app files and include the new files: `course.js`, `firebase-config.js`, and `community.js`. Commit the changes and let Vercel redeploy. This static build does not need an npm build command.

For a local preview, run `python -m http.server 8000` in this folder, then open http://localhost:8000. Use a local server or HTTPS deployment; do not open index.html directly with a file:// URL because browser modules and authentication need a supported web origin.

## 5. Test your two accounts

1. Open the deployed app in your normal browser and choose Continue with Google.
2. Select the first Google account. Choose a unique username and enter that user's age.
3. Open a separate browser profile or private window and sign in using the other Google account. Complete its username and age.
4. If both entered ages fall in the same age group, each account should see the other under Community > Members in your group. Different age groups are deliberately separate.
5. Send a message from one account. The other should receive it without refreshing. Wait at least three seconds between messages.
6. Test signing out and back in, username collision handling, blocking, reporting, and deletion of your own message.

Age groups are 6–12, 13–15, 16–17, 18–20, and 21+. They are calculated from the entered age, not assigned randomly. Google sign-in authenticates the Google account; it does not independently verify a person's age. Exact ages and Google emails do not appear in community listings. Ages and usernames are fixed after profile creation in this build; the project owner must manage account corrections together with the corresponding member and username records.

## What is ready and what remains

Google authentication and community data use Firebase, not local mock accounts. Learning progress, personal project code, colors, avatars, and local blocks remain saved per account on each device. They do not yet sync between devices. Existing local-only prototype profiles are not silently converted into Google accounts.

The chat is a shared age-group room, not a private messaging service. The live member list shows registered members, not verified online presence. Blocking hides a member and their messages on this device. It does not prevent that member from reading the shared room. Reports are stored for manual owner review; there is no automatic review service or push notification. This package does not include a moderator dashboard, verified ages, parental-consent flows, or an account-deletion interface. Before opening a child-focused community to the public, the owner needs to configure the appropriate consent and moderation operation.

If the Firebase config is empty, Google sign-in remains disabled with an honest setup message. You can still preview the lessons locally. No fake account or simulated message is created.

## Troubleshooting

- Unauthorized domain: add the actual deployed hostname in Firebase Authentication settings.
- Popup blocked: allow the Google popup and select Continue with Google again.
- Permission denied during setup: publish the complete supplied rules; ensure all files use the same Firebase project.
- Permission denied when sending: wait three seconds, then retry. The cooldown is checked on the server.
- The other account is absent: check that both completed profiles exist in Firestore, both browsers use this same deployment/configuration, and the ages fall in the same group.
- No Google connection: confirm all four values in firebase-config.js and that the Google provider is enabled.

Official guides:
https://firebase.google.com/docs/web/setup
https://firebase.google.com/docs/auth/web/google-signin
https://firebase.google.com/docs/firestore/security/rules-conditions
