import { getActiveTabURL } from "./utils.js";
 
console.log("popup.js is running")
var loadLoadedListTitle
var contentScriptIsReady = false;

// Get the HTML element by its id
function displayWhichListIsLoaded(){
  var outputElement = document.getElementById("title");
    outputElement.textContent = ""
    outputElement.textContent = loadLoadedListTitle;
}

function setupSubmitButton() {
  const inputElement = document.getElementById("myInput");
  const submitButton = document.getElementById("submitButton");

  function submitAction() {
    const inputValue = inputElement.value;

    // Send a message to contentScript.js with the input value
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { action: "addKeyToFilterWords", value: inputValue, listName: loadLoadedListTitle }, response => {
        // Handle response if needed
        // console.log(response);
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
    chrome.tabs.sendMessage(activeTab.id, { action: "getLastLoadedListTitle" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        return;
     } 
      if (response && response.obj) {
        console.log(response,"fetchAndDisplayFilterWords")
        displayObjectAsList(response.obj);
      }
    });
  });
}

function displayObjectAsList(obj) {
  if (obj.loadLoadedListTitle) {
    obj = obj.loadLoadedListTitle
  }
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
        // console.log("Button clicked for", key);
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

function displayFilterLists(listKeysArray) {
  const dropdown = document.getElementById("dynamicDropdown");

  const dummyOption = document.createElement("option");
  dummyOption.value = "dummy"; // Set a value for the dummy option if needed
  dummyOption.text = "Select an option"; // Text for the dummy option
  dropdown.add(dummyOption);

  // Loop through the options and add them to the dropdown
  listKeysArray.forEach((optionText, index) => {
    const option = document.createElement("option");
    option.value = "option" + (index + 1); // or whatever value you want to associate with this option
    option.text = optionText;
    dropdown.add(option);


  })


}

function deleteDisplayFilterList() {
  const dropdown = document.getElementById("dynamicDropdown");
  dropdown.innerHTML = ''; // This will remove all child elements (options) from the dropdown
}


function getLastLoadedListTitle() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { action: "getLastLoadedListTitle" }, (response) => {
      // Use the response to update your list
      if (response && response.title) {
        loadLoadedListTitle = response.title
        displayWhichListIsLoaded(response.title)
      }
    });
  });
}



function setupDropdownChangeListener() {
  const dropdown = document.getElementById("dynamicDropdown");

  // Add an event listener to the dropdown
  dropdown.addEventListener('change', function () {
    const selectedText = dropdown.selectedOptions[0].text;
    loadList(selectedText);
    loadLoadedListTitle = selectedText
    console.log(loadLoadedListTitle)
    displayWhichListIsLoaded()
  });

}


function sendRemoveMessage(key) {
  // console.log("I am in sendREmove", key);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "deleteWordFromFilterList", value: key, listName: loadLoadedListTitle }, (response) => {
      // console.log(response.status);
      setTimeout(() => {
        fetchAndDisplayFilterWords()
      }, 500);
    });
  });
}

function refreshYoutube(id) {
  chrome.tabs.reload(id);
}

function exportWords() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { action: "exportWords" }, (response) => {
      console.log(response,"exportWords")
      if (response && response.filterWords) {
        console.log(response)

        // Stringifying the object to turn it into a JSON string
        const jsonStr = JSON.stringify(response.filterWords, null, 2); // Indented with 2 spaces

        // Creating a blob with the JSON string and setting its MIME type as application/json
        const blob = new Blob([jsonStr], { type: 'application/json' });

        // Creating an object URL for the blob
        const url = URL.createObjectURL(blob);

        // Creating an anchor element to trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'words.json'; // The filename for the download
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

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        // Parse the JSON content
        const data = JSON.parse(e.target.result);
        // Now you can use the data object as you need
        // For example, you might call a function to process the imported data:
        processImportedData(data);
      } catch (err) {
        console.error('Error parsing JSON:', err);
      }
    };
    reader.readAsText(file);
  }
}

function processImportedData(value,listName) {
  console.log("data run")
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];

    // Send a message to the content script in the active tab
    chrome.tabs.sendMessage(activeTab.id, { action: "importJSON", value: value, listName: loadLoadedListTitle }, function(response) {
      // Do something with the response
      console.log(response,"import");
      displayObjectAsList(response.words)
    });
  });
}

function createList() {
  const filterListNameInput = document.getElementById("filterListNameInput");
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];
    let value = filterListNameInput.value
    if(value){
      chrome.tabs.sendMessage(activeTab.id, { action: "createList", value: value });
    }
    else{
      console.log("List Name cant be empty")
    }
    cleanupDisplayList()
    // Send a message to the content script in the active tab

    loadLoadedListTitle = filterListNameInput.value
  });
}

function cleanupDisplayList(){
  setTimeout(() => {
    deleteDisplayFilterList()
    retrieveLists() 
  }, 100);
}

function loadList(dropdownText) {
  // console.log(dropdownText)
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { action: "loadOneList", value: dropdownText }, (response) => {
      // Use the response to update your list
      // console.log(response,"this")
      console.log("loadOneList", response)
      if (response && response.list) {
        displayObjectAsList(response.list)
      }
    });
  });
}



function retrieveLists() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { action: "retrieveAllLists" }, (response) => {
      if (response && response.allList) {
        var newArray = response.allList.filter(function (item) {
          return item !== "lastLoadedList" && item !== "lastLoadedListTitle" && item !== "fetchFromStorage2";
        });
        newArray.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        displayFilterLists(newArray)
      }
    });
  });
}

function deleteListButtonFunction() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { action: "deleteList", listName: loadLoadedListTitle }, (response) => {
      // Use the response to update your list
      // console.log(response,"this")
      cleanupDisplayList()
      loadLoadedListTitle = "No List Loaded"
      console.log(loadLoadedListTitle)
      displayWhichListIsLoaded()
      if (response && response.allList) {
        console.log(response, "deleteList")
        displayObjectAsList(response.allList)

      }
    });
  });
}

async function testButtonSendsMessage() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { action: "testButton" }, (response) => {
      console.log("test button clicked");
      if (response) {
        console.log(response, "testing Button");
      }
      setTimeout(() => {
        fetchAndDisplayFilterWords()
      }, 500);
    });
  });
}



function initializePopup() {
  const createFilterListNameButton = document.getElementById("createFilterListNameButton");
  createFilterListNameButton.addEventListener("click", createList);

  const exportWordsButton = document.getElementById("exportWords");
  exportWordsButton.addEventListener("click", exportWords);



  const deleteListButton = document.getElementById("DeleteFilterListNameButton");
  deleteListButton.addEventListener("click", deleteListButtonFunction);


  const testButton = document.getElementById("TestingButton");
  testButton.addEventListener("click", testButtonSendsMessage);

  // console.log("popup.js is running");
  var currentTabUrl;
  var currentTab;
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    currentTab = tabs[0]; // There should only be one in this list
    currentTabUrl = currentTab.url;

    if (currentTabUrl && currentTabUrl.includes('youtube.com')) {
      // console.log("Current tab is a YouTube page:", currentTabUrl);
      setupSubmitButton();
      fetchAndDisplayFilterWords();
    } else {
      // console.log("Current tab is not a YouTube page:", currentTabUrl);
    }

  });

}

function makeRefreshButtonFunction() {
  var currentTabUrl;
  var currentTab;
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    currentTab = tabs[0]; // There should only be one in this list
    currentTabUrl = currentTab.url;


    const refreshButton = document.getElementById("refreshButton");
    refreshButton.addEventListener("click", function () {
      refreshYoutube(currentTab.id);
    });
  });
}

// // Call the function to execute everything inside it
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.type === "CONTENT_SCRIPT_READY") {
//       console.log("Content script has loaded and is ready!");

//       // Perform any tasks that depend on the content script being ready
//   }
// });


// document.addEventListener('DOMContentLoaded', async () => {
  
  
//   const activeTab = await getActiveTabURL();

//   if (activeTab.url.includes("youtube.com")) {
    
//   console.log(activeTab)

//     getLastLoadedListTitle()
//     initializePopup();
//     displayWhichListIsLoaded()
//     retrieveLists()
//     setupDropdownChangeListener()
//     makeRefreshButtonFunction()
//     document.getElementById('importFile').addEventListener('change', handleFileSelect);
    
//   } else {
//     const container = document.getElementsByClassName("container")[0];

//     container.innerHTML = '<div class="title">This is not a youtube video page.</div>';
    
//   }
// });

let run = false

async function runIfDOMIsLoaded() {
  const activeTab = await getActiveTabURL();
  
  if (activeTab && activeTab.url && activeTab.url.includes("youtube.com")) {
      console.log(activeTab);
      
      try {
          getLastLoadedListTitle();
          initializePopup();
          displayWhichListIsLoaded();
          retrieveLists();
          setupDropdownChangeListener();
          makeRefreshButtonFunction();
          document.getElementById('importFile').addEventListener('change', handleFileSelect);
      } catch   {
          
      }
      
  } else {
      const container = document.getElementsByClassName("container")[0];
      container.innerHTML = '<div class="title">This is not a youtube video page.</div>';
  }
}


// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "myMessage") {
      // Handle the message
      console.log("Received:", message.payload);
      contentScriptIsReady = true
      // Optionally, send a response back to the content script
      sendResponse(`Message received in popup, count: ${message.payload.split('count: ')[1]}`);
  }
});

let checkInterval = setInterval(() => {
  // Assuming contentScriptIsReady is a boolean variable you've defined elsewhere
  if (contentScriptIsReady) {
    runIfDOMIsLoaded();
    clearInterval(checkInterval); // Clears the interval to stop checking
  }
}, 0); // Checks every 1 second



// document.addEventListener('DOMContentLoaded', async () => {
//     if (thumbnailsExistGlobal){
//       runIfDOMIsLoaded(); // If it's not the first time, run the function immediately
//     }
// });


