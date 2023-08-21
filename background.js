// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//     console.log(tabId, changeInfo, tab)
//     if (changeInfo.status === "complete") {
//         // Run initial setup only on YouTube homepage
//         if (tab.url !== "https://www.youtube.com/") {
//             chrome.tabs.sendMessage(tabId, { action: "disconnectObserver" });
//         }
//     }
// });


// chrome.tabs.query({active: true, currentWindow: true},function(tabs) {
//     chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
//         console.log(response);
//     });
//   }); 

// Object to keep track of ready tabs
var readyTabs = {};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.status === "ready") {
    // console.log("true");
    // Mark the tab as ready
    readyTabs[sender.tab.id] = true;
  }
});

// chrome.webNavigation.onHistoryStateUpdated.addListener(
//   function (details) {
//     const tabId = details.tabId;
//     // If the tab is marked as ready and the URL is not YouTube's homepage, disconnect the observer
//     if (readyTabs[tabId] && details.url !== "https://www.youtube.com/") {
//       chrome.tabs.sendMessage(tabId, { action: "disconnectObserver" });
//     }
//     else if (readyTabs[tabId] && details.url === "https://www.youtube.com/") { // Change this condition
//         chrome.tabs.sendMessage(tabId, { action: "run" });
//       }
//   },
//   { url: [{ hostEquals: "www.youtube.com" }] } // Filter to only receive events from YouTube
// );


// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   // console.log(tabId, changeInfo, tab);
//   if (tab.url !== "https://www.youtube.com/") {
//     // Check if the tab is marked as ready
//     if (readyTabs[tabId]) {
//       chrome.tabs.sendMessage(tabId, { action: "disconnectObserver" });
//     } else {
//       // console.log("Tab is not ready");
//     }
//   }
//   else if (tab.url === "https://www.youtube.com/") {
//     // Check if the tab is marked as ready
//     if (readyTabs[tabId]) {
//       chrome.tabs.sendMessage(tabId, { action: "run" });
//     } else {
//       // console.log("Tab is not ready");
//     }
//   }
// });

