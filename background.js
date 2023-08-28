var readyTabs = {};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.status === "ready") {
    readyTabs[sender.tab.id] = true;
  }
});

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   console.log(tabId, changeInfo, tab);
//   console.log(tab.url);

// });

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (changeInfo.status === 'complete' && tab.url && tab.url.includes('youtube.com/watch')) {
//     console.log('Navigated to a YouTube video:', tab.url);
//     chrome.scripting.executeScript({
//       target: { tabId: tabId },
//       files: ['contentScript.js']
//     }, () => {
//       console.log('Content script injected into YouTube video page');
//     });
//   }
// });

