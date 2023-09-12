import { getActiveTabURL } from "./utils.js";
import { getVariableFromChromeStorage } from "./utils.js";
import { getObjFromLastLoadedKey } from "./utils.js";
import { retrieveListsFromStorage } from "./utils.js";
import { storeVariableInChromeStorage } from "./utils.js";
import { addKeyToFilterWordsFun } from "./utils.js";
import { createList } from "./utils.js";
import { deleteList } from "./utils.js";
import { removeKeyFromFilterWords } from "./utils.js";
import { importJSON } from "./utils.js";



console.log("popup.js is running")
var loadLoadedListTitle
var contentScriptIsReady = false;

// Get the HTML element by its id
function displayWhichListIsLoaded(e) {
  var outputElement = document.getElementById("title");
  outputElement.textContent = ""
  outputElement.textContent = e;
}

function setupSubmitButton() {
  const inputElement = document.getElementById("myInput");
  const submitButton = document.getElementById("submitButton");

  function submitAction() {
    const inputValue = inputElement.value;
    // Send a message to contentScript.js with the input value
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        getVariableFromChromeStorage("lastLoadedList").then((listName) => 
        {
          addKeyToFilterWordsFun(listName,inputValue)
        })
        // console.log(response);
        setTimeout(() => {
          fetchAndDisplayFilterWords()
        }, 500);

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
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    getVariableFromChromeStorage("lastLoadedList").then(e => loadList(e)) // Assume this function is async and returns a promise
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
    getVariableFromChromeStorage("lastLoadedList").then(e => displayWhichListIsLoaded(e))
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
    displayWhichListIsLoaded(selectedText)
  });

}


function sendRemoveMessage(key) {
  // console.log("I am in sendREmove", key);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    getVariableFromChromeStorage("lastLoadedList")
    .then(listName => removeKeyFromFilterWords(listName,key))
      setTimeout(() => {
        fetchAndDisplayFilterWords()
      }, 500);
    });
}

function refreshYoutube(id) {
  chrome.tabs.reload(id);
}

function exportWords() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        getObjFromLastLoadedKey().then(obj => {
          const jsonStr = JSON.stringify(obj, null, 2); // Indented with 2 spaces

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
        }).catch((error) => {
          console.error("Error:", error);
        });
      

        // Stringifying the object to turn it into a JSON string
        
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

function processImportedData(value) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];
    getVariableFromChromeStorage("lastLoadedList")
    .then((listName) => {
      importJSON(value, listName)
    })
    // Send a message to the content script in the active tab
      // Do something with the response
      getObjFromLastLoadedKey().then(obj => {
        displayObjectAsList(obj)
      })
    });
}

function createListFun() {
  const filterListNameInput = document.getElementById("filterListNameInput");
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];
    let value = filterListNameInput.value
    createList(value)
    getLastLoadedListTitle()
    cleanupDisplayList()
    // Send a message to the content script in the active tab

    loadLoadedListTitle = filterListNameInput.value
  });
}

function cleanupDisplayList() {
  setTimeout(() => {
    deleteDisplayFilterList()
    retrieveLists()
  }, 100);
}

function loadList(dropdownText) {
  // console.log(dropdownText)
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    storeVariableInChromeStorage("lastLoadedList", dropdownText)
      .then(() => {
        getVariableFromChromeStorage(dropdownText).then(list => displayObjectAsList(list))
      })
  });
}



function retrieveLists() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    retrieveListsFromStorage().then((list) => {
      var newArray = list.filter(function (item) {
        return item !== "lastLoadedList" && item !== "lastLoadedListTitle" && item !== "fetchFromStorage2";
      });
      newArray.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
      displayFilterLists(newArray)
    })
  });
}

function deleteListButtonFunction() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    getVariableFromChromeStorage("lastLoadedList")
    .then(listName => deleteList(listName)
    .then(() => retrieveLists())
    .then(() => cleanupDisplayList())
    .then(() => {
      let empty = {}
      displayObjectAsList(empty)
    }))
    displayWhichListIsLoaded("No List Loaded")
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
  createFilterListNameButton.addEventListener("click", createListFun);

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

let run = false

async function runIfDOMIsLoaded() {
  const activeTab = await getActiveTabURL();

  if (activeTab && activeTab.url && activeTab.url.includes("youtube.com")) {
    console.log(activeTab);

    try {
      getLastLoadedListTitle();
      initializePopup();
      retrieveLists();
      setupDropdownChangeListener();
      makeRefreshButtonFunction();
      document.getElementById('importFile').addEventListener('change', handleFileSelect);
    } catch {

    }

  } else {
    const container = document.getElementsByClassName("container")[0];
    container.innerHTML = '<div class="title">This is not a youtube video page.</div>';
  }
}




document.addEventListener('DOMContentLoaded', async () => {
  runIfDOMIsLoaded(); // If it's not the first time, run the function immediately
});


