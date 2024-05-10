document.getElementById('saveTabs').addEventListener('click', saveTabs);
document.getElementById('loadTabs').addEventListener('click', loadTabs);

function saveTabs() {
  chrome.tabs.query({ currentWindow: true }, function(tabs) {
    const tabUrls = tabs.map(tab => tab.url);
    chrome.storage.local.set({ 'savedTabs': tabUrls });
  });
}

function loadTabs() {
  chrome.storage.local.get('savedTabs', function(data) {
    if (data.savedTabs) {
      data.savedTabs.forEach(url => chrome.tabs.create({ url }));
    }
  });
}
