function injectContentScriptOnYouTubePages() {


  // chrome.webNavigation.onCompleted.addListener(details => {
  //   console.log("chrome.webNavigation.onCompleted");
  //   console.log(details, details.url)
  //   if (details.documentLifecycle === 'active') {
  //     if (details.url && details.url.includes("youtube.com")) {
  //       let tabId = details.tabId;
  //       console.log("Everything is True for onHistoryStateUpdated")
  //       if (counter === 0) {
  //         chrome.scripting
  //           .executeScript({
  //             target: { tabId },
  //             files: ["contentScript.js"],
  //           })
  //           .then(() => console.log("script injected"));
  //       }
  //       counter ++

  //     }

  //   }
  // });


  let counter = 0; // Initialize the counter

  chrome.webNavigation.onHistoryStateUpdated.addListener(details => {
    console.log("chrome.webNavigation.onHistoryStateUpdated");
    console.log(details, details.url);
  
    if (details.documentLifecycle === 'active') {
      if (details.url && details.url === ("https://www.youtube.com/")) {
        let tabId = details.tabId;
        if (counter === 0) {
          console.log("Everything is True for onHistoryStateUpdated && counter is 0");
  
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
  
  // Background script
chrome.runtime.onConnect.addListener(port => {
  console.log("Connected to popup");
  
  // Listen for messages from the popup
  port.onMessage.addListener(message => {
    console.log("Received message from popup:", message);
    
    // Send a response back to the popup
    port.postMessage({ response: "Message received!" });
  });
});

}

injectContentScriptOnYouTubePages(); // Invoke the function immediately
