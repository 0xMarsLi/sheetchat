const STORAGE_KEY = 'sheetchat:settings';
const RATE_LIMIT_MS = 10_000;

const DEFAULTS = {
  sound: false,
  desktop: false,
  inactivitySeconds: 10,
};

export const loadSettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
};

export const saveSettings = (settings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

export const requestDesktopPermission = async () => {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
};

let audioCtx = null;
const getAudioCtx = () => {
  if (audioCtx) return audioCtx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  audioCtx = new Ctx();
  return audioCtx;
};

const playClickSound = () => {
  const ctx = getAudioCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.13);
};

const showDesktopNotification = () => {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    const n = new Notification('未命名的試算表', {
      body: '雲端硬碟已同步更新',
      icon: 'src/favicon.svg',
      tag: 'sheetchat-update',
      silent: true,
    });
    setTimeout(() => n.close(), 4000);
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch {
    // some browsers throw if Notification constructor blocked
  }
};

let lastFiredAt = 0;

export const notifyNewMessage = () => {
  const now = Date.now();
  if (now - lastFiredAt < RATE_LIMIT_MS) return;
  lastFiredAt = now;

  const settings = loadSettings();
  if (settings.sound) playClickSound();
  if (settings.desktop) showDesktopNotification();
};
