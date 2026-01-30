Firebase setup for Announcements

1) Create a Firebase project at https://console.firebase.google.com
2) In Project Settings > General, add a Web App and copy the config values.
4) In Authentication > Sign-in method, enable Google.
5) In Authentication > Authorized domains, add your hosting domain (e.g., `yourname.github.io` or `localhost`).
6) In Firestore, create a database (start in test mode while developing).
7) (Recommended) Set Firestore rules to allow writes only from the authorized email:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /announcements/{doc} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == 'jackson.lacefield07@gmail.com';
    }
  }
}
```

3) (No local config) This project previously used a local `js/firebase-config.js` file; admin UI was removed.
9) Announcements are shown on the home page automatically; they appear as a bubble.

- Notes:
- This implementation uses Firebase client-side (compat) SDK if you initialize Firebase elsewhere. For stronger security, consider a server-side admin service.
- Add any domain restrictions and tighten rules before going to production.
