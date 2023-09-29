function injectContentScriptOnYouTubePages() {

  chrome.webNavigation.onHistoryStateUpdated.addListener(details => {
    if (details.url && (details.url === "https://www.youtube.com/" || details.url.includes("youtube.com/?bp="))) {
      console.log("background.js")
      let tabId = details.tabId;
      injectScript(tabId);
      
    }
  });

  function injectScript(tabId) {
    chrome.scripting.executeScript({
      target: { tabId },
      files: ["contentScript.js"],
    })
      // .then(() => chrome.tabs.sendMessage(tabId, { action: "unhideThumbnails" }))
      .catch(err => console.log("Error injecting script:", err));
  }

}

injectContentScriptOnYouTubePages(); // Invoke the function immediately
