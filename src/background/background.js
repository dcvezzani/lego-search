// Set up context menu
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'searchLegoBrick',
        title: 'Search for Lego brick: %s',
        contexts: ['selection']
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'searchLegoBrick') {
        // Open popup with pre-filled search
        chrome.storage.local.set({ 'lastSearch': info.selectionText }, () => {
            chrome.action.openPopup();
        });
    }
}); 