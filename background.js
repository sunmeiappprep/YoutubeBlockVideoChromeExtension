function injectContentScriptOnYouTubePages() {

  let counter = 0; // Initialize the counter

  chrome.webNavigation.onHistoryStateUpdated.addListener(details => {
  
    if (details.documentLifecycle === 'active') {
      if (details.url && details.url === ("https://www.youtube.com/" || details.url.includes("youtube.com/?bp="))) {
      console.log("background.js")  
      let tabId = details.tabId;
        if (counter === 0) {
          chrome.runtime.sendMessage({message: "some_message"}, function(response) {
            if (chrome.runtime.lastError) {
              // If there is an error sending the message, inject the script
              console.log("Error sending message, injecting script", chrome.runtime.lastError);
              injectScript(tabId);
            } else {
              console.log("Message sent successfully", response);
            }
          });
  
          counter++;  // Increment counter after injecting script for the first time
        }
        
      }
    }
  });
  
  function injectScript(tabId) {
    chrome.scripting.executeScript({
      target: { tabId },
      files: ["contentScript.js"],
    })
    .then(() => console.log("script injected",counter))
    .catch(err => console.log("Error injecting script:", err));
  }
  
}

injectContentScriptOnYouTubePages(); // Invoke the function immediately
