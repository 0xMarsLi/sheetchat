import { t } from './i18n.js';

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
  if (!('Notification' in window)) {
    console.warn('[sheetchat] Notification API unavailable');
    return;
  }
  if (Notification.permission !== 'granted') {
    console.warn('[sheetchat] Notification permission:', Notification.permission);
    return;
  }
  try {
    const n = new Notification(t('notify.title'), {
      body: t('notify.body'),
      icon: 'src/favicon.svg',
      silent: true,
    });
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch (err) {
    console.error('[sheetchat] Notification failed', err);
  }
};

let lastFiredAt = 0;

export const notifyNewMessage = () => {
  const now = Date.now();
  if (now - lastFiredAt < RATE_LIMIT_MS) {
    console.log('[sheetchat] notify skipped: rate-limited');
    return;
  }
  lastFiredAt = now;

  const settings = loadSettings();
  console.log('[sheetchat] notify fired, settings:', settings);
  if (settings.sound) playClickSound();
  if (settings.desktop) showDesktopNotification();
};
