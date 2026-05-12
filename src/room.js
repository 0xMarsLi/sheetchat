import {
  db,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from './firebase.js';
import { MOCK_THEMES, DEFAULT_THEME } from './mocks.js';
import { hashPassword } from './crypto.js';

const COLORS = [
  '#1a73e8',
  '#d93025',
  '#f9ab00',
  '#1e8e3e',
  '#9334e6',
  '#00897b',
  '#ea5e5e',
  '#5b6abf',
];

const params = new URLSearchParams(location.search);
const roomId = params.get('room');
const nickname = localStorage.getItem('sheetchat:nickname');

if (!roomId) {
  window.location.replace('index.html');
}

const gridEl = document.getElementById('grid');
const inputRowEl = document.getElementById('input-row');
const nameboxEl = document.getElementById('namebox');
const formulaEl = document.getElementById('formula');
const presenceEl = document.getElementById('presence');
const shareBtn = document.getElementById('share-btn');
const toastEl = document.getElementById('toast');

const showToast = (msg) => {
  toastEl.textContent = msg;
  toastEl.classList.add('is-visible');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toastEl.classList.remove('is-visible');
  }, 1800);
};

shareBtn.addEventListener('click', async () => {
  const url = `${location.origin}${location.pathname}?room=${roomId}`;
  try {
    await navigator.clipboard.writeText(url);
    showToast('已複製分享連結');
  } catch (_) {
    showToast(url);
  }
});

const fileMenu = document.getElementById('menu-file');
const fileDropdown = document.getElementById('menu-file-dropdown');
const editMenu = document.getElementById('menu-edit');
const editDropdown = document.getElementById('menu-edit-dropdown');
const dataMenu = document.getElementById('menu-data');
const dataDropdown = document.getElementById('menu-data-dropdown');
const editNicknameItem = document.getElementById('menu-edit-nickname');
const nicknameDialog = document.getElementById('nickname-dialog');
const nicknameInput = document.getElementById('nickname-input');
const nicknameError = document.getElementById('nickname-error');
const nicknameForm = document.getElementById('nickname-form');
const nicknameCancel = document.getElementById('nickname-cancel');

const appEl = document.querySelector('.app');
let mockTheme = localStorage.getItem('sheetchat:mockTheme') || DEFAULT_THEME;
if (!MOCK_THEMES[mockTheme]) mockTheme = DEFAULT_THEME;
let mockActive = true;
appEl.classList.add('is-mock');

const INACTIVITY_MS = 10000;
let inactivityTimer = null;

const BASE_TITLE = '未命名的試算表 - Google 試算表';
let unreadCount = 0;
let prevMessageCount = 0;

const isReadingChat = () => !document.hidden && !mockActive;

const updateTitle = () => {
  document.title = unreadCount > 0 ? `(${unreadCount}) ${BASE_TITLE}` : BASE_TITLE;
};

const resetUnread = () => {
  if (unreadCount === 0) return;
  unreadCount = 0;
  updateTitle();
};

document.addEventListener('visibilitychange', () => {
  if (isReadingChat()) resetUnread();
});

const resetInactivityTimer = () => {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    if (inputElement) inputElement.blur();
  }, INACTIVITY_MS);
};

const stopInactivityTimer = () => {
  clearTimeout(inactivityTimer);
  inactivityTimer = null;
};

const allDropdowns = [
  { menu: fileMenu, dropdown: fileDropdown },
  { menu: editMenu, dropdown: editDropdown },
  { menu: dataMenu, dropdown: dataDropdown },
];

const refreshThemeChecks = () => {
  document.querySelectorAll('.theme-item').forEach((el) => {
    el.classList.toggle('is-active', el.dataset.theme === mockTheme);
  });
};
refreshThemeChecks();

document.querySelectorAll('.theme-item').forEach((el) => {
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    const theme = el.dataset.theme;
    if (!MOCK_THEMES[theme]) return;
    mockTheme = theme;
    localStorage.setItem('sheetchat:mockTheme', theme);
    refreshThemeChecks();
    closeAllDropdowns();
    if (mockActive) renderGrid();
  });
});

const closeAllDropdowns = (except) => {
  allDropdowns.forEach(({ dropdown }) => {
    if (dropdown !== except) dropdown.classList.remove('is-open');
  });
};

allDropdowns.forEach(({ menu, dropdown }) => {
  menu.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = !dropdown.classList.contains('is-open');
    closeAllDropdowns(dropdown);
    dropdown.classList.toggle('is-open', willOpen);
  });
});

document.addEventListener('click', () => closeAllDropdowns());

const openNicknameDialog = () => {
  nicknameInput.value = nickname;
  nicknameError.textContent = '';
  nicknameDialog.showModal();
  setTimeout(() => {
    nicknameInput.focus();
    nicknameInput.select();
  }, 0);
};

editNicknameItem.addEventListener('click', (e) => {
  e.stopPropagation();
  closeAllDropdowns();
  openNicknameDialog();
});

nicknameCancel.addEventListener('click', () => nicknameDialog.close());

nicknameForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const newName = nicknameInput.value.trim();
  if (!newName) {
    nicknameError.textContent = '暱稱不能空白';
    return;
  }
  // First-time welcome flow (no existing nickname)
  if (!nickname) {
    localStorage.setItem('sheetchat:nickname', newName);
    location.reload();
    return;
  }
  if (newName === nickname) {
    nicknameDialog.close();
    return;
  }
  nicknameError.textContent = '';
  try {
    const targetRef = doc(db, 'rooms', roomId, 'users', newName);
    const targetSnap = await getDoc(targetRef);
    if (targetSnap.exists()) {
      nicknameError.textContent = '這個房間已經有人用這個暱稱';
      return;
    }
    const oldRef = doc(db, 'rooms', roomId, 'users', nickname);
    const oldSnap = await getDoc(oldRef);
    if (!oldSnap.exists()) {
      nicknameError.textContent = '找不到目前的使用者資料';
      return;
    }
    const oldData = oldSnap.data();
    await setDoc(targetRef, { ...oldData, name: newName });
    await deleteDoc(oldRef);
    localStorage.setItem('sheetchat:nickname', newName);
    nicknameDialog.close();
    location.reload();
  } catch (err) {
    console.error(err);
    nicknameError.textContent = '更新失敗：' + err.message;
  }
});

nicknameDialog.addEventListener('close', () => {
  if (!nickname) {
    window.location.href = 'index.html';
  }
});

const indexToLetter = (i) => {
  let s = '';
  let n = i + 1;
  while (n > 0) {
    n -= 1;
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
};

const letterToIndex = (s) => {
  let n = 0;
  for (const ch of s) {
    n = n * 26 + (ch.charCodeAt(0) - 64);
  }
  return n - 1;
};

const nextMidnight = () => {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return Timestamp.fromDate(d);
};

const formatTime = (ts) => {
  if (!ts || !ts.toDate) return '';
  const d = ts.toDate();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

let users = {};
let columnToUser = {};
let messages = [];
let selfColumn = null;
let inputElement = null;

const ensurePassword = async (roomDoc) => {
  if (!roomDoc.passwordHash) return true;
  const userSnap = await getDoc(doc(db, 'rooms', roomId, 'users', nickname));
  if (userSnap.exists()) return true;
  const cached = sessionStorage.getItem(`sheetchat:pwd:${roomId}`);
  if (cached && (await hashPassword(roomId, cached)) === roomDoc.passwordHash) {
    return true;
  }
  for (let i = 0; i < 3; i += 1) {
    const pwd = window.prompt('這個房間有密碼，請輸入：');
    if (pwd === null) return false;
    if ((await hashPassword(roomId, pwd)) === roomDoc.passwordHash) {
      sessionStorage.setItem(`sheetchat:pwd:${roomId}`, pwd);
      return true;
    }
    window.alert('密碼錯誤');
  }
  return false;
};

const joinRoom = async () => {
  const userRef = doc(db, 'rooms', roomId, 'users', nickname);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data();
  }
  const usersSnap = await getDocs(collection(db, 'rooms', roomId, 'users'));
  const used = new Set(usersSnap.docs.map((d) => d.data().column));
  let column = 'A';
  for (let i = 0; i < 200; i += 1) {
    const candidate = indexToLetter(i);
    if (!used.has(candidate)) {
      column = candidate;
      break;
    }
  }
  const color = COLORS[letterToIndex(column) % COLORS.length];
  const data = { column, color, name: nickname, joinedAt: serverTimestamp() };
  await setDoc(userRef, data);
  return data;
};

const sendMessage = async (text) => {
  if (!text) return;
  await addDoc(collection(db, 'rooms', roomId, 'messages'), {
    author: nickname,
    column: selfColumn,
    text,
    createdAt: serverTimestamp(),
    expiresAt: nextMidnight(),
  });
};

const buildInputRow = (numCols) => {
  const preservedText = inputElement?.value || '';
  const wasFocused = document.activeElement === inputElement;

  inputRowEl.style.setProperty('--cols', String(numCols));
  inputRowEl.innerHTML = '';
  const selfIdx = letterToIndex(selfColumn);

  const rh = document.createElement('div');
  rh.className = 'cell row-header';
  rh.id = 'input-row-header';
  rh.textContent = String(messages.length + 2);
  inputRowEl.appendChild(rh);

  for (let c = 0; c < numCols; c += 1) {
    if (c === selfIdx) {
      const cell = document.createElement('div');
      cell.className = 'input-cell';
      cell.style.gridColumn = 'span 2';
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 200;
      input.autocomplete = 'off';
      input.spellcheck = false;
      input.value = preservedText;
      cell.appendChild(input);
      inputRowEl.appendChild(cell);
      attachInputHandlers(input);
      inputElement = input;
      c += 1;
    } else {
      const ph = document.createElement('div');
      ph.className = 'cell placeholder-cell';
      inputRowEl.appendChild(ph);
    }
  }

  if (
    wasFocused ||
    (!mockActive && (!document.activeElement || document.activeElement === document.body))
  ) {
    setTimeout(() => inputElement?.focus(), 0);
  }
};

const attachInputHandlers = (input) => {
  let lastComposeEnd = 0;
  input.addEventListener('compositionend', () => {
    lastComposeEnd = Date.now();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    if (e.isComposing || e.keyCode === 229) return;
    if (Date.now() - lastComposeEnd < 200) return;
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendMessage(text).catch((err) => {
      console.error('send failed', err);
      input.value = text;
    });
  });
  input.addEventListener('input', () => {
    updateFormulaBar();
    resetInactivityTimer();
  });
  input.addEventListener('keydown', resetInactivityTimer);
  input.addEventListener('focus', () => {
    setMockActive(false);
    resetInactivityTimer();
    updateFormulaBar();
  });
  input.addEventListener('blur', () => {
    setMockActive(true);
    stopInactivityTimer();
    updateFormulaBar();
  });
};

const updateInputRowNumber = () => {
  const rh = document.getElementById('input-row-header');
  if (rh) rh.textContent = String(messages.length + 2);
  nameboxEl.textContent = `${selfColumn}${messages.length + 2}`;
};

const updateFormulaBar = () => {
  if (inputElement && document.activeElement === inputElement && inputElement.value) {
    formulaEl.textContent = inputElement.value;
    return;
  }
  if (messages.length > 0) {
    const last = messages[messages.length - 1];
    formulaEl.textContent = last.text;
  } else {
    formulaEl.textContent = '';
  }
};

const appendCell = (parent, className, gridCol, gridRow, text) => {
  const cell = document.createElement('div');
  cell.className = className;
  cell.style.gridColumn = String(gridCol);
  cell.style.gridRow = String(gridRow);
  if (text) cell.textContent = text;
  parent.appendChild(cell);
  return cell;
};

let lastNumCols = 0;

const buildContentMap = (mock) => {
  const map = new Map();
  if (mock) {
    mock.headers.forEach((h, c) => {
      map.set(`2|${c + 2}`, { text: h, classes: ['mock-header'] });
    });
    mock.rows.forEach((row, r) => {
      row.forEach((val, c) => {
        const classes = ['mock-data'];
        if (typeof val === 'string' && val.startsWith('$')) classes.push('mock-numeric');
        map.set(`${r + 3}|${c + 2}`, { text: val, classes });
      });
    });
  } else {
    messages.forEach((msg, i) => {
      const colIdx = letterToIndex(msg.column);
      map.set(`${i + 2}|${colIdx + 2}`, {
        text: msg.text,
        classes: ['message'],
        title: `${msg.author} • ${formatTime(msg.createdAt)}`,
      });
    });
  }
  return map;
};

const renderGrid = () => {
  const mock = mockActive ? MOCK_THEMES[mockTheme] : null;
  const userCount = Object.keys(columnToUser).length;
  const mockColCount = mock ? mock.headers.length : 0;
  const numCols = Math.max(userCount + 5, mockColCount + 2, 26);
  const numRows = mock
    ? Math.max(mock.rows.length + 30, 100)
    : Math.max(messages.length + 20, 100);

  const contentMap = buildContentMap(mock);

  gridEl.style.setProperty('--cols', String(numCols));
  gridEl.innerHTML = '';

  appendCell(gridEl, 'cell corner', 1, 1, '');

  for (let c = 0; c < numCols; c += 1) {
    const letter = indexToLetter(c);
    let label = letter;
    let cls = 'cell col-header';
    if (!mock) {
      const u = columnToUser[letter];
      if (u) label = u.name;
      if (letter === selfColumn) cls += ' is-self';
    }
    appendCell(gridEl, cls, c + 2, 1, label);
  }

  for (let r = 0; r < numRows; r += 1) {
    appendCell(gridEl, 'cell row-header', 1, r + 2, String(r + 1));
    for (let c = 0; c < numCols; c += 1) {
      const content = contentMap.get(`${r + 2}|${c + 2}`);
      const cls = content ? `cell ${content.classes.join(' ')}` : 'cell';
      const cell = appendCell(gridEl, cls, c + 2, r + 2, content ? content.text : '');
      if (content && content.title) cell.title = content.title;
    }
  }

  if (numCols !== lastNumCols || !inputElement) {
    buildInputRow(numCols);
    lastNumCols = numCols;
  }
  applyStealthToInput();
};

const applyStealthToInput = () => {
  const inputCell = inputRowEl.querySelector('.input-cell');
  if (inputCell) inputCell.classList.toggle('is-stealth', mockActive);
};

const setMockActive = (active) => {
  if (mockActive === active) return;
  mockActive = active;
  appEl.classList.toggle('is-mock', mockActive);
  renderGrid();
  scrollToLastDataRow();
  if (!active && !document.hidden) resetUnread();
};

const computeScrollTarget = () => {
  const wrap = document.getElementById('grid-wrap');
  if (!wrap) return 0;
  const selector = mockActive && MOCK_THEMES[mockTheme] ? '.cell.mock-data' : '.cell.message';
  const cells = gridEl.querySelectorAll(selector);
  const target = cells[cells.length - 1];
  if (!target) return 0;
  const inputHeight = 26;
  const targetBottom = target.offsetTop + target.offsetHeight;
  return Math.max(0, targetBottom + inputHeight - wrap.clientHeight);
};

const scrollToLastDataRow = () => {
  const wrap = document.getElementById('grid-wrap');
  if (wrap) wrap.scrollTop = computeScrollTarget();
};

const renderPresence = () => {
  presenceEl.innerHTML = '';
  Object.values(users)
    .sort((a, b) => letterToIndex(a.column) - letterToIndex(b.column))
    .forEach((u) => {
      const wrap = document.createElement('span');
      wrap.className = 'presence-chip';
      const dot = document.createElement('span');
      dot.className = 'presence-dot';
      dot.style.background = u.color;
      const txt = document.createElement('span');
      txt.textContent = `${u.name} (${u.column})`;
      wrap.appendChild(dot);
      wrap.appendChild(txt);
      presenceEl.appendChild(wrap);
    });
};

const recordRecentRoom = () => {
  const KEY = 'sheetchat:recentRooms';
  let rooms;
  try {
    rooms = JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    rooms = [];
  }
  rooms = rooms.filter((r) => r.id !== roomId);
  rooms.unshift({ id: roomId, joinedAt: Date.now() });
  rooms = rooms.slice(0, 5);
  localStorage.setItem(KEY, JSON.stringify(rooms));
};

const start = async () => {
  const roomSnap = await getDoc(doc(db, 'rooms', roomId));
  if (!roomSnap.exists()) {
    alert('找不到這個房間');
    window.location.replace('index.html');
    return;
  }
  const ok = await ensurePassword(roomSnap.data());
  if (!ok) {
    window.location.replace('index.html');
    return;
  }
  const me = await joinRoom();
  selfColumn = me.column;
  recordRecentRoom();

  onSnapshot(collection(db, 'rooms', roomId, 'users'), (snap) => {
    users = {};
    columnToUser = {};
    snap.forEach((d) => {
      const data = d.data();
      users[d.id] = data;
      columnToUser[data.column] = data;
    });
    renderGrid();
    renderPresence();
    updateInputRowNumber();
  });

  const wrap = document.getElementById('grid-wrap');
  let isFirstSnapshot = true;

  onSnapshot(
    query(collection(db, 'rooms', roomId, 'messages'), orderBy('createdAt', 'asc')),
    (snap) => {
      const now = new Date();
      const previousTarget = computeScrollTarget();
      const wasFollowing = wrap.scrollTop >= previousTarget - 30;

      messages = snap.docs
        .map((d) => d.data())
        .filter((m) => {
          if (!m.expiresAt || !m.expiresAt.toDate) return true;
          return m.expiresAt.toDate() > now;
        });

      const delta = Math.max(0, messages.length - prevMessageCount);
      prevMessageCount = messages.length;
      if (!isFirstSnapshot && delta > 0 && !isReadingChat()) {
        unreadCount += delta;
        updateTitle();
      }

      renderGrid();
      updateInputRowNumber();
      updateFormulaBar();

      if (isFirstSnapshot) {
        isFirstSnapshot = false;
        requestAnimationFrame(() => scrollToLastDataRow());
      } else if (wasFollowing && !mockActive) {
        requestAnimationFrame(() => scrollToLastDataRow());
      }
    },
  );
};

if (!nickname) {
  // Shared link without nickname → show welcome dialog instead of redirecting
  const titleEl = nicknameDialog.querySelector('.dialog-title');
  const hintEl = nicknameDialog.querySelector('.dialog-hint');
  if (titleEl) titleEl.textContent = '歡迎加入！';
  if (hintEl) hintEl.textContent = '請設定一個暱稱（會顯示在你的欄標題）';
  if (nicknameCancel) nicknameCancel.textContent = '回首頁';
  nicknameInput.value = '';
  nicknameError.textContent = '';
  nicknameDialog.showModal();
  setTimeout(() => nicknameInput.focus(), 0);
} else {
  start().catch((err) => {
    console.error(err);
    alert('連線失敗：' + err.message);
  });
}
