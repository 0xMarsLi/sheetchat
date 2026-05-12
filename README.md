# sheetchat

A real-time chat that looks exactly like Google Sheets. When your boss walks by, it's still a spreadsheet.

## Features

- **Pixel-perfect Google Sheets disguise**: title bar, menus, toolbar, formula bar, column/row headers, sheet tab — even the browser tab title says "未命名的試算表 - Google 試算表"
- **Real-time multi-user chat**: each friend is auto-assigned a column (A, B, C…); messages stack chronologically
- **Boss-key auto-disguise**:
  - Defaults to fake spreadsheet data (expense report / hiring tracker / accounts receivable — pick from Data menu)
  - Click the input → fake data fades out, real conversation appears
  - 10 seconds of inactivity → input auto-blurs back to disguise
  - Click anywhere outside (menu, button) → instantly back to disguise
- **Rooms**:
  - Create a room → 6-char short code in URL
  - "Share" button copies the invite link
  - Friends opening the link without a nickname get a welcome dialog inline (no detour through the lobby)
  - Lobby shows the 5 most recently joined rooms
- **Formula bar shows the latest message** when not typing — mirrors Sheets' "fx shows current cell" behavior
- **Editable nickname**: Edit menu → Edit nickname
- **Daily auto-clear at midnight** via Firestore TTL — only messages clear; the room and user assignments persist (same link, same column tomorrow)
- **IME-safe input**: Chinese/Japanese/Korean composition is fully respected; pressing Enter mid-composition won't accidentally send
- **Cells wrap text and grow row height** when content overflows

## Quick start

You'll need a free Firebase project.

```bash
# 1. Clone
git clone <this-repo>
cd sheetchat

# 2. Copy the config templates and fill in your Firebase values
cp src/firebase-config.example.js src/firebase-config.js
cp .firebaserc.example .firebaserc
# Edit both files with your Firebase project's config + project ID

# 3. Run locally
python3 -m http.server 8000
# Open http://localhost:8000

# 4. Deploy to Firebase Hosting
npm install -g firebase-tools  # first time only
firebase login
firebase deploy
```

## Firebase one-time setup

In the [Firebase Console](https://console.firebase.google.com):

1. Create a new project
2. Enable **Firestore Database** (production mode)
3. **Firestore → Rules** — paste:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /rooms/{roomId} {
         allow read, write: if true;
         match /{document=**} {
           allow read, write: if true;
         }
       }
     }
   }
   ```
4. **Firestore → TTL** — create policy on collection group `messages`, field `expiresAt` (auto-clears messages daily)
5. **Project settings → Your apps** — register a Web app, paste the SDK config into `src/firebase-config.js`

## How it works

- Pure static site (HTML / CSS / vanilla JS) — no build step
- Firebase Firestore for real-time sync
- Firestore TTL handles the daily message wipe
- localStorage for nickname, recent rooms, and selected disguise theme
- Firebase Web SDK `apiKey` is public by design — security is enforced via Firestore Rules

## Data model

```
rooms/{roomId}                    # room (persists)
  └─ users/{nickname}             # user (persists, remembers column + color)
  └─ messages/{auto-id}           # messages (auto-deleted at midnight)
       ├─ author
       ├─ column: 'A' | 'B' | ...
       ├─ text
       ├─ createdAt
       └─ expiresAt: next 00:00
```
