console.log("popup.js is running")
var currentTabUrl
var currentTab
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  currentTab = tabs[0]; // There should only be one in this list
  currentTabUrl = currentTab.url;

  if (currentTabUrl && currentTabUrl.includes('youtube.com')) {
    console.log("Current tab is a YouTube page:", currentTabUrl);
    setupSubmitButton();
    fetchAndDisplayFilterWords();
  } else {
    console.log("Current tab is not a YouTube page:", currentTabUrl);
  }
});


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
        setTimeout(() => {
          fetchAndDisplayFilterWords()
        }, 500);

      });
    });

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

function sendRemoveMessage(key) {
  console.log("I am in sendREmove", key);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "deleteWordFromFilterList", value: key }, (response) => {
      console.log(response.status);
      setTimeout(() => {
        fetchAndDisplayFilterWords()
      }, 500);
    });
  });
}

function refreshYoutube () {
  chrome.tabs.reload(currentTab.id);
}

function exportWords() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { action: "getFilterWords" }, (response) => {
      if (response && response.filterWords) {
        // Getting all the keys from the object and joining them with a newline
        const words = Object.keys(response.filterWords).join('\n');

        // Creating a blob with the words and setting its MIME type as text/plain
        const blob = new Blob([words], { type: 'text/plain' });

        // Creating an object URL for the blob
        const url = URL.createObjectURL(blob);

        // Creating an anchor element to trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'words.txt'; // The filename for the download
        a.style.display = 'none';

        document.body.appendChild(a);
        a.click(); // This will start the download

        // Cleanup: Revoke the object URL and remove the anchor element
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    });
  });
}

const exportWordsButton = document.getElementById("exportWords");
exportWordsButton.addEventListener("click", exportWords);

const refreshButton = document.getElementById("refreshButton");
refreshButton.addEventListener("click", refreshYoutube);

