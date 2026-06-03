const SUPPORTED = ['zh-TW', 'en'];
const FALLBACK = 'en';
const STORAGE_KEY = 'sheetchat:locale';

const detect = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;
  } catch {
    /* ignore */
  }
  const raw = (navigator.language || FALLBACK).toLowerCase();
  if (raw.startsWith('zh')) return 'zh-TW';
  return 'en';
};

export const LOCALE = detect();

export const setLocale = (locale) => {
  if (!SUPPORTED.includes(locale)) return;
  if (locale === LOCALE) return;
  localStorage.setItem(STORAGE_KEY, locale);
  location.reload();
};

document.documentElement.lang = LOCALE === 'zh-TW' ? 'zh-Hant' : 'en';

const DICT = {
  // ───── Browser tab title
  'doc.title': {
    'zh-TW': '未命名的試算表 - Google 試算表',
    en: 'Untitled spreadsheet - Google Sheets',
  },
  'doc.titleName': {
    'zh-TW': '未命名的試算表',
    en: 'Untitled spreadsheet',
  },

  // ───── Titlebar icons
  'tb.star': { 'zh-TW': '加上星號', en: 'Star' },
  'tb.move': { 'zh-TW': '移至', en: 'Move' },
  'tb.saved': {
    'zh-TW': '已將所有變更儲存到雲端硬碟',
    en: 'All changes saved in Drive',
  },
  'tb.history': { 'zh-TW': '顯示編輯記錄', en: 'Show edit history' },
  'tb.chat': { 'zh-TW': '開啟對話', en: 'Open chat' },
  'tb.meet': { 'zh-TW': '加入會議', en: 'Join meeting' },
  'tb.share': { 'zh-TW': '共用', en: 'Share' },
  'tb.shareTitle': { 'zh-TW': '複製分享連結', en: 'Copy share link' },
  'tb.home': { 'zh-TW': '回到首頁', en: 'Back to home' },

  // ───── Menu bar
  'menu.file': { 'zh-TW': '檔案', en: 'File' },
  'menu.edit': { 'zh-TW': '編輯', en: 'Edit' },
  'menu.view': { 'zh-TW': '查看', en: 'View' },
  'menu.insert': { 'zh-TW': '插入', en: 'Insert' },
  'menu.format': { 'zh-TW': '格式', en: 'Format' },
  'menu.data': { 'zh-TW': '資料', en: 'Data' },
  'menu.tools': { 'zh-TW': '工具', en: 'Tools' },
  'menu.extensions': { 'zh-TW': '擴充功能', en: 'Extensions' },
  'menu.help': { 'zh-TW': '說明', en: 'Help' },

  // ───── File menu
  'file.home': { 'zh-TW': '回到首頁', en: 'Back to home' },
  'file.settings': { 'zh-TW': '設定', en: 'Settings' },
  'file.new': { 'zh-TW': '新增', en: 'New' },
  'file.open': { 'zh-TW': '開啟', en: 'Open' },
  'file.makeCopy': { 'zh-TW': '建立副本', en: 'Make a copy' },
  'file.download': { 'zh-TW': '下載', en: 'Download' },
  'file.language': { 'zh-TW': '語言', en: 'Language' },

  // ───── Edit menu
  'edit.undo': { 'zh-TW': '復原', en: 'Undo' },
  'edit.redo': { 'zh-TW': '重做', en: 'Redo' },
  'edit.cut': { 'zh-TW': '剪下', en: 'Cut' },
  'edit.copy': { 'zh-TW': '複製', en: 'Copy' },
  'edit.paste': { 'zh-TW': '貼上', en: 'Paste' },
  'edit.findReplace': { 'zh-TW': '尋找與取代', en: 'Find and replace' },
  'edit.nickname': { 'zh-TW': '編輯暱稱', en: 'Edit nickname' },

  // ───── Data menu
  'data.applyTemplate': { 'zh-TW': '套用範本', en: 'Apply template' },
  'data.expense': { 'zh-TW': '報銷明細', en: 'Expense report' },
  'data.hiring': { 'zh-TW': '招聘進度追蹤', en: 'Hiring tracker' },
  'data.ar': { 'zh-TW': '應收帳款', en: 'Accounts receivable' },
  'data.sortRange': { 'zh-TW': '排序範圍', en: 'Sort range' },
  'data.createFilter': { 'zh-TW': '建立篩選器', en: 'Create a filter' },
  'data.validation': { 'zh-TW': '資料驗證', en: 'Data validation' },

  // ───── Toolbar
  'tool.searchMenu': { 'zh-TW': '搜尋選單', en: 'Search the menus' },
  'tool.print': { 'zh-TW': '列印', en: 'Print' },
  'tool.paintFormat': { 'zh-TW': '複製格式', en: 'Paint format' },
  'tool.fmtCurrency': { 'zh-TW': '格式設為貨幣', en: 'Format as currency' },
  'tool.fmtPercent': { 'zh-TW': '格式設為百分比', en: 'Format as percent' },
  'tool.fmtDecDec': { 'zh-TW': '減少小數位數', en: 'Decrease decimal places' },
  'tool.fmtDecInc': { 'zh-TW': '增加小數位數', en: 'Increase decimal places' },
  'tool.fmtMore': { 'zh-TW': '更多格式', en: 'More formats' },
  'tool.fontDefault': { 'zh-TW': '預設 (Arial)', en: 'Default (Arial)' },
  'tool.fontDec': { 'zh-TW': '縮小字型', en: 'Decrease font size' },
  'tool.fontInc': { 'zh-TW': '放大字型', en: 'Increase font size' },
  'tool.bold': { 'zh-TW': '粗體', en: 'Bold' },
  'tool.italic': { 'zh-TW': '斜體', en: 'Italic' },
  'tool.strike': { 'zh-TW': '刪除線', en: 'Strikethrough' },
  'tool.textColor': { 'zh-TW': '文字顏色', en: 'Text color' },
  'tool.fillColor': { 'zh-TW': '填滿色彩', en: 'Fill color' },
  'tool.borders': { 'zh-TW': '框線', en: 'Borders' },
  'tool.mergeCells': { 'zh-TW': '合併儲存格', en: 'Merge cells' },
  'tool.hAlign': { 'zh-TW': '水平對齊', en: 'Horizontal align' },
  'tool.vAlign': { 'zh-TW': '垂直對齊', en: 'Vertical align' },
  'tool.wrap': { 'zh-TW': '自動換行', en: 'Text wrapping' },
  'tool.rotate': { 'zh-TW': '文字旋轉', en: 'Text rotation' },
  'tool.more': { 'zh-TW': '更多', en: 'More' },

  // ───── Footer
  'footer.addSheet': { 'zh-TW': '新增工作表', en: 'Add sheet' },
  'footer.allSheets': { 'zh-TW': '所有工作表', en: 'All sheets' },
  'footer.sheet1': { 'zh-TW': '工作表 1', en: 'Sheet1' },

  // ───── Settings dialog
  'settings.title': { 'zh-TW': '偏好設定', en: 'Settings' },
  'settings.sectionNotifications': { 'zh-TW': '通知', en: 'Notifications' },
  'settings.sound': {
    'zh-TW': '音效（新訊息時播放）',
    en: 'Sound (play on new message)',
  },
  'settings.desktop': { 'zh-TW': '桌面通知', en: 'Desktop notifications' },
  'settings.desktopHint': {
    'zh-TW': '第一次啟用時瀏覽器會要求權限。通知內容會偽裝成試算表協作通知。',
    en: 'Browser will ask for permission the first time. Notification content is disguised as a spreadsheet collaboration alert.',
  },
  'settings.sectionDisguise': { 'zh-TW': '偽裝', en: 'Disguise' },
  'settings.autoHide': { 'zh-TW': '閒置自動隱藏', en: 'Auto-hide after idle' },
  'settings.seconds': { 'zh-TW': '秒', en: 'sec' },
  'common.cancel': { 'zh-TW': '取消', en: 'Cancel' },
  'common.save': { 'zh-TW': '儲存', en: 'Save' },

  // ───── Nickname dialog
  'nickname.editTitle': { 'zh-TW': '編輯暱稱', en: 'Edit nickname' },
  'nickname.editHint': {
    'zh-TW': '會更新你在這個房間的欄標題，舊訊息的作者名稱不變。',
    en: "Updates your column header in this room. Author names on past messages won't change.",
  },
  'nickname.welcomeTitle': { 'zh-TW': '歡迎加入！', en: 'Welcome!' },
  'nickname.welcomeHint': {
    'zh-TW': '請設定一個暱稱（會顯示在你的欄標題）',
    en: 'Choose a nickname (shown as your column header)',
  },
  'nickname.backHome': { 'zh-TW': '回首頁', en: 'Back to home' },
  'nickname.empty': { 'zh-TW': '暱稱不能空白', en: "Nickname can't be empty" },
  'nickname.taken': {
    'zh-TW': '這個房間已經有人用這個暱稱',
    en: 'Someone in this room is already using that nickname',
  },
  'nickname.noUser': {
    'zh-TW': '找不到目前的使用者資料',
    en: "Can't find your user record",
  },
  'nickname.updateFailed': { 'zh-TW': '更新失敗：', en: 'Update failed: ' },

  // ───── Lobby
  'lobby.nickname': { 'zh-TW': '暱稱', en: 'Nickname' },
  'lobby.nicknamePh': {
    'zh-TW': '你的名字（會出現在欄標題）',
    en: 'Your name (shown in the column header)',
  },
  'lobby.createRoom': { 'zh-TW': '建立新房間', en: 'Create new room' },
  'lobby.pwPh': {
    'zh-TW': '房間密碼（選填，4-8 字）',
    en: 'Room password (optional, 4-8 chars)',
  },
  'lobby.createBtn': { 'zh-TW': '建立並進入', en: 'Create and enter' },
  'lobby.joinTitle': {
    'zh-TW': '或加入現有房間',
    en: 'Or join an existing room',
  },
  'lobby.roomIdPh': { 'zh-TW': '輸入房間碼', en: 'Enter room code' },
  'lobby.joinBtn': { 'zh-TW': '加入', en: 'Join' },
  'lobby.recent': { 'zh-TW': '最近加入', en: 'Recent' },
  'lobby.remove': { 'zh-TW': '移除', en: 'Remove' },
  'lobby.enterNickname': {
    'zh-TW': '請先輸入暱稱',
    en: 'Enter a nickname first',
  },
  'lobby.badPassword': {
    'zh-TW': '密碼長度須為 4-8 字',
    en: 'Password must be 4–8 characters',
  },
  'lobby.createFailed': {
    'zh-TW': '建立房間失敗：',
    en: 'Failed to create room: ',
  },
  'lobby.enterRoomId': {
    'zh-TW': '請輸入房間碼',
    en: 'Enter a room code',
  },
  'lobby.roomNotFound': {
    'zh-TW': '找不到這個房間',
    en: 'Room not found',
  },
  'lobby.joinFailed': { 'zh-TW': '加入失敗：', en: 'Failed to join: ' },
  'lobby.pwPrompt': {
    'zh-TW': '這個房間有密碼，請輸入：',
    en: 'This room is password-protected. Enter password:',
  },
  'lobby.pwWrong': { 'zh-TW': '密碼錯誤', en: 'Wrong password' },

  // ───── Toast / runtime
  'toast.linkCopied': { 'zh-TW': '已複製分享連結', en: 'Share link copied' },
  'toast.connectFailed': {
    'zh-TW': '連線失敗：',
    en: 'Connection failed: ',
  },
  'msg.image': { 'zh-TW': '[圖片]', en: '[Image]' },
  'msg.openImage': { 'zh-TW': '點擊開啟圖片', en: 'Click to open image' },
  'msg.imageTooLarge': {
    'zh-TW': '圖片太大，請改傳較小的圖',
    en: 'Image too large, try a smaller one',
  },
  'msg.imageLoadFailed': {
    'zh-TW': '圖片載入失敗',
    en: 'Image failed to load',
  },
  'msg.imageSendFailed': {
    'zh-TW': '圖片傳送失敗',
    en: 'Failed to send image',
  },

  // ───── Relative time
  'time.justNow': { 'zh-TW': '剛剛', en: 'just now' },
  'time.minAgo': { 'zh-TW': '{n} 分鐘前', en: '{n} min ago' },
  'time.hrAgo': { 'zh-TW': '{n} 小時前', en: '{n} hr ago' },
  'time.dayAgo': { 'zh-TW': '{n} 天前', en: '{n} d ago' },

  // ───── Desktop notification
  'notify.title': { 'zh-TW': '未命名的試算表', en: 'Untitled spreadsheet' },
  'notify.body': {
    'zh-TW': '雲端硬碟已同步更新',
    en: 'Drive sync complete',
  },
};

export const t = (key, params) => {
  const entry = DICT[key];
  if (!entry) return key;
  let str = entry[LOCALE] || entry[FALLBACK] || key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(`{${k}}`, v);
    }
  }
  return str;
};

const applyAttr = (root, attr, setter) => {
  root.querySelectorAll(`[data-i18n-${attr}]`).forEach((el) => {
    const key = el.getAttribute(`data-i18n-${attr}`);
    setter(el, t(key));
  });
};

export const applyI18n = (root = document) => {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  applyAttr(root, 'title', (el, v) => el.setAttribute('title', v));
  applyAttr(root, 'placeholder', (el, v) => el.setAttribute('placeholder', v));
  applyAttr(root, 'html', (el, v) => (el.innerHTML = v));

  document.title = t('doc.title');
};
