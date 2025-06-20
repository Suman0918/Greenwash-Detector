chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeBackgroundColor({ color: '#22c55e' });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (/hm\.com|myntra\.com|zara\.com/.test(tab.url)) {
      const isProductPage = /product|buy|item/.test(tab.url);
      chrome.action.setBadgeText({ tabId, text: isProductPage ? '🌿' : '' });
    }
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'CHECK_BACKEND_STATUS') {
    fetch('http://localhost:5000/api/health-check')
      .then(r => r.json())
      .then(data => sendResponse({ status: { online: true, model: data.ml_model } }))
      .catch(err => sendResponse({ status: { online: false, error: 'Connection failed' } }));
    return true;
  }
});
