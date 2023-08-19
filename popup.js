// adding a new bookmark row to the popup

function setupSubmitButton() {
    const inputElement = document.getElementById("myInput");
    const submitButton = document.getElementById("submitButton");
  
    submitButton.addEventListener("click", () => {
      const inputValue = inputElement.value;
  
      // Send a message to contentScript.js with the input value
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { action: "addKeyToFilterWords", value: inputValue }, response => {
          // Handle response if needed
          console.log(response);
        });
      });
    });
  }
  // Call the function to set up the submit button
  setupSubmitButton();
  

// document.addEventListener("DOMContentLoaded", () => {
//     const submitButton = document.getElementById("submitButton");
//     submitButton.addEventListener("click", handleSubmitButtonClick);
//     const invokeButton = document.getElementById("invokeButton");
//     invokeButton.addEventListener("click", sendMessageToContentScript);
// });
