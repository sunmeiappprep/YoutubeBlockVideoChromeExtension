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


// chrome.tabs.query({}, tabs => {
//   console.log(tabs)
//   for (const tab of tabs) {
//       if (tab.active) {
//           console.log(`Tab with URL ${tab.url} is active.`);
//           chrome.tabs.sendMessage(tabId,{
//             type: "run"
//           })
//       } else {
//           console.log(`Tab with URL ${tab.url} is not active.`);
//           chrome.tabs.sendMessage(tabId,{
//             type: "run"
//           })
//       }
//   }
// });
