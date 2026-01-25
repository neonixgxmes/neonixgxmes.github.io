Server-side ID token verification (recommended)

Overview
- When you use Google Identity on the client, Google issues an ID token (JWT). To trust that token, verify it server-side using Google's libraries or the token introspection endpoint. Client-side decoding is convenient for UI but not secure by itself.

Why verify server-side
- Prevent spoofing: an attacker could craft a fake JWT and set arbitrary claims client-side.
- Ensure token is valid (signature + expiry + audience + issuer).

Node.js (example using `google-auth-library`)

1. Install:

```bash
npm install google-auth-library
```

2. Verify ID token:

```js
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client('127008606660-n9opcdf867at13ieec30p7ch65mptu8e.apps.googleusercontent.com');

async function verifyIdToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: '127008606660-n9opcdf867at13ieec30p7ch65mptu8e.apps.googleusercontent.com'
  });
  const payload = ticket.getPayload();
  // payload contains email, name, picture, sub (user id)
  return payload;
}
```

Python (example using `google-auth`)

1. Install:

```bash
pip install google-auth
```

2. Verify ID token:

```python
from google.oauth2 import id_token
from google.auth.transport import requests

def verify_id_token(token):
    CLIENT_ID = '127008606660-n9opcdf867at13ieec30p7ch65mptu8e.apps.googleusercontent.com'
    try:
        id_info = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)
        # id_info now contains email, name, picture, sub
        return id_info
    except ValueError:
        # Invalid token
        return None
```

Server considerations
- Verify the `aud` matches your client ID.
- Check `exp` (expiry) and `iat` timestamps.
- Consider storing the user `sub` (Google user ID) for account mapping.
- Use HTTPS and protect your server endpoints.

Optional: Revoke tokens / sign-out
- You can call Google's token revocation endpoints if you manage refresh tokens.

References
- Google Identity documentation: https://developers.google.com/identity
- google-auth-library (Node): https://www.npmjs.com/package/google-auth-library
- google-auth (Python): https://pypi.org/project/google-auth/
