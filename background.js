chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        // Run initial setup only on YouTube homepage
        if (tab.url === "https://www.youtube.com/") {
            chrome.runtime.sendMessage({ type: "run", tabId, tabURL: tab.url });
        } else {
            // Disconnect the observer on other pages
            chrome.tabs.sendMessage(tabId, { type: "disconnectObserver" });
        }
    }
});

