export default defineBackground(() => {
  const MENU_ID = 'copy-with-i-hate-mailto';

  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      id: MENU_ID,
      title: i18n.t('contextMenuCopyLink'),
      contexts: ['link'],
    });
  });

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId !== MENU_ID || !info.linkUrl || !tab?.id) return;

    browser.tabs.sendMessage(tab.id, { type: 'copy-link', href: info.linkUrl }, { frameId: info.frameId });
  });
});
