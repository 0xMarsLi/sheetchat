import { db, doc, setDoc, getDoc, serverTimestamp } from './firebase.js';
import { hashPassword, isValidPassword } from './crypto.js';
import { VERSION } from './version.js';
import { t, applyI18n } from './i18n.js';

applyI18n();

console.log(`sheetchat ${VERSION}`);
const versionEl = document.getElementById('version');
if (versionEl) versionEl.textContent = `v${VERSION}`;

const nicknameInput = document.getElementById('nickname');
const roomIdInput = document.getElementById('room-id');
const createBtn = document.getElementById('create-btn');
const joinBtn = document.getElementById('join-btn');
const createPasswordInput = document.getElementById('create-password');
const errorEl = document.getElementById('error');
const recentSection = document.getElementById('recent-section');
const recentList = document.getElementById('recent-list');

nicknameInput.value = localStorage.getItem('sheetchat:nickname') || '';

const RECENT_KEY = 'sheetchat:recentRooms';

const readRecent = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
};

const writeRecent = (rooms) => {
  localStorage.setItem(RECENT_KEY, JSON.stringify(rooms));
};

const formatRelative = (ts) => {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return t('time.justNow');
  if (min < 60) return t('time.minAgo', { n: min });
  const hr = Math.floor(min / 60);
  if (hr < 24) return t('time.hrAgo', { n: hr });
  const day = Math.floor(hr / 24);
  return t('time.dayAgo', { n: day });
};

const renderRecent = () => {
  const rooms = readRecent();
  if (rooms.length === 0) {
    recentSection.hidden = true;
    return;
  }
  recentSection.hidden = false;
  recentList.innerHTML = '';
  rooms.forEach((r) => {
    const li = document.createElement('li');
    li.className = 'recent-item';
    li.innerHTML = `
      <span class="recent-id">${r.id}</span>
      <span class="recent-time">${formatRelative(r.joinedAt)}</span>
      <button class="recent-remove" title="${t('lobby.remove')}" data-id="${r.id}">✕</button>
    `;
    li.addEventListener('click', (e) => {
      if (e.target.closest('.recent-remove')) return;
      const name = saveNickname();
      if (!name) return;
      window.location.href = `room.html?room=${r.id}`;
    });
    li.querySelector('.recent-remove').addEventListener('click', (e) => {
      e.stopPropagation();
      const filtered = readRecent().filter((x) => x.id !== r.id);
      writeRecent(filtered);
      renderRecent();
    });
    recentList.appendChild(li);
  });
};

renderRecent();

const showError = (msg) => {
  errorEl.textContent = msg;
};

const saveNickname = () => {
  const name = nicknameInput.value.trim();
  if (!name) {
    showError(t('lobby.enterNickname'));
    nicknameInput.focus();
    return null;
  }
  localStorage.setItem('sheetchat:nickname', name);
  return name;
};

const generateRoomId = () => {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  let id = '';
  for (let i = 0; i < 6; i += 1) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
};

const goToRoom = (roomId) => {
  window.location.href = `room.html?room=${roomId}`;
};

createBtn.addEventListener('click', async () => {
  const name = saveNickname();
  if (!name) return;
  const password = createPasswordInput.value;
  if (password && !isValidPassword(password)) {
    showError(t('lobby.badPassword'));
    createPasswordInput.focus();
    return;
  }
  showError('');
  createBtn.disabled = true;
  try {
    const roomId = generateRoomId();
    const roomData = { createdAt: serverTimestamp() };
    if (password) {
      roomData.passwordHash = await hashPassword(roomId, password);
      sessionStorage.setItem(`sheetchat:pwd:${roomId}`, password);
    }
    await setDoc(doc(db, 'rooms', roomId), roomData);
    goToRoom(roomId);
  } catch (err) {
    console.error(err);
    showError(t('lobby.createFailed') + err.message);
    createBtn.disabled = false;
  }
});

const verifyRoomPassword = async (roomId, expectedHash) => {
  for (let i = 0; i < 3; i += 1) {
    const pwd = window.prompt(t('lobby.pwPrompt'));
    if (pwd === null) return false;
    const hash = await hashPassword(roomId, pwd);
    if (hash === expectedHash) {
      sessionStorage.setItem(`sheetchat:pwd:${roomId}`, pwd);
      return true;
    }
    window.alert(t('lobby.pwWrong'));
  }
  return false;
};

joinBtn.addEventListener('click', async () => {
  const name = saveNickname();
  if (!name) return;
  const roomId = roomIdInput.value.trim().toLowerCase();
  if (!roomId) {
    showError(t('lobby.enterRoomId'));
    return;
  }
  showError('');
  joinBtn.disabled = true;
  try {
    const snap = await getDoc(doc(db, 'rooms', roomId));
    if (!snap.exists()) {
      showError(t('lobby.roomNotFound'));
      joinBtn.disabled = false;
      return;
    }
    const data = snap.data();
    if (data.passwordHash) {
      const userSnap = await getDoc(doc(db, 'rooms', roomId, 'users', name));
      if (!userSnap.exists()) {
        const ok = await verifyRoomPassword(roomId, data.passwordHash);
        if (!ok) {
          joinBtn.disabled = false;
          return;
        }
      }
    }
    goToRoom(roomId);
  } catch (err) {
    console.error(err);
    showError(t('lobby.joinFailed') + err.message);
    joinBtn.disabled = false;
  }
});

roomIdInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.isComposing) joinBtn.click();
});
