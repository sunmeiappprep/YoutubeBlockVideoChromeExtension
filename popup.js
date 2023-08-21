// adding a new bookmark row to the popup

function setupSubmitButton() {
    const inputElement = document.getElementById("myInput");
    const submitButton = document.getElementById("submitButton");

    function submitAction() {
        const inputValue = inputElement.value;
    
        // Send a message to contentScript.js with the input value
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
          const activeTab = tabs[0];
          chrome.tabs.sendMessage(activeTab.id, { action: "addKeyToFilterWords", value: inputValue }, response => {
            // Handle response if needed
            console.log(response);
          });
        });
        fetchAndDisplayFilterWords()

      }
    
      // Add the existing click listener to the submit button
      submitButton.addEventListener("click", submitAction);
    
      // Add a keyup listener to the input element to listen for the Enter key
      inputElement.addEventListener("keyup", event => {
        if (event.key === "Enter") {
          submitAction(); // Call the same function as the click event
        }
      });
}
// Call the function to set up the submit button
setupSubmitButton();

function fetchAndDisplayFilterWords() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { action: "getFilterWords" }, (response) => {
            // Use the response to update your list
            console.log(response)
            if (response && response.filterWords) {
                displayObjectAsList(response.filterWords);
              }
        });
    });
}

function displayObjectAsList(obj) {
    const container = document.getElementById("listOfFilterWord");
  
    // Clear previous content
    container.innerHTML = "";
  
    // Create an unordered list element
    const ul = document.createElement("ul");
  
    // Loop through the object's keys and values to create list items
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const li = document.createElement("li");
        li.textContent = key;
  
        // Create a button element
        const button = document.createElement("button");
        button.textContent = "Remove"; // You can set the button text to whatever you like
  
        // Optional: Add an event listener to the button
        button.addEventListener("click", () => {
          console.log("Button clicked for", key);
          sendRemoveMessage(key)
        });
  
        // Append the button to the list item
        li.appendChild(button);
  
        // Append the list item to the unordered list
        ul.appendChild(li);
      }
    }
  
    // Append the list to the container
    container.appendChild(ul);
  }

  function sendRemoveMessage(key){
    console.log("I am in sendREmove",key);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "deleteWordFromFilterList", value: key }, (response) => {
        console.log(response.status);
      });
    });
  }
  
  
  

fetchAndDisplayFilterWords();

// document.addEventListener("DOMContentLoaded", () => {
//     const submitButton = document.getElementById("submitButton");
//     submitButton.addEventListener("click", handleSubmitButtonClick);
//     const invokeButton = document.getElementById("invokeButton");
//     invokeButton.addEventListener("click", sendMessageToContentScript);
// });
