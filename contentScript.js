
console.log("CS is running")

var fetchFromStorage = {}
var lastLoadedListTitle;
function getLastLoadListTitle(setFunction,callback) {
    chrome.storage.sync.get("lastLoadedList", result => {
        const value = result.lastLoadedList;
        storeVariableInChromeStorage("lastLoadedListTitle", value)
        lastLoadedListTitle = value;
        if (setFunction) {
            setFunction(value,callback); // Call the setFunction with the retrieved value
        }
    });
}         

function storeVariableInChromeStorage(variableName, value) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({ [variableName]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(`Stored ${variableName}`);
        }
      });
    });
  }

  function storeVariableInChromeStorageAsOneObj(obj) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set(obj, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(`Stored ${variableName}`);
        }
      });
    });
  }

function getVariableFromChromeStorage(variableName) {
return new Promise((resolve, reject) => {
    chrome.storage.sync.get(variableName, (result) => {
    if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
    } else {
        resolve(result[variableName]);
    }
    });
});
}

// storeVariableInChromeStorage('fetchFromStorage2', fetchFromStorage)
//   .then(() => getVariableFromChromeStorage('fetchFromStorage2'))
//   .then(data => console.log(data,'fetchFromStorage2'))
//   .catch(err => {
//     console.log('An error occurred:', err);
//   });




function fetchOneListFromStorageFunction (listName,callback) {
    chrome.storage.sync.get([listName], result => {
        if (callback) {
            callback(result) // Call the setFunction with the retrieved value
        }
    });
}

function fetchOneListFromStorageFunction2 (listName,setCallback) {
    chrome.storage.sync.get([listName], result => {
        if (result[listName]) {
            setCallback(result[listName])// Call the setFunction with the retrieved value
        }
    });
}

function getCurrentListFromStorage(callback) {
    chrome.storage.sync.get("listThatWillBeRendered", result => {
        if (callback && result) {
            consoleLog("getting from Storage")
            callback(result); // Call the callback function with the retrieved value
        }
        else{
            chrome.storage.sync.set({ "listThatWillBeRendered": undefined }, result => {
                if (result) {
                    consoleLog("created empty obj")
                    callback(result); // Call the callback function with the result of set
                }
            });
        }
    });
}

function setListToStorage(value, callback) {
    chrome.storage.sync.set({ "listThatWillBeRendered": value }, result => {
        if (callback) {
            consoleLog("setting to Storage")
            callback(result); // Call the callback function with the result of set
        }
    });
}




function getLastLoadedListAndSet(lastListName,callback) {
    console.log(lastListName)
    chrome.storage.sync.get([lastListName], result => {
        storeVariableInChromeStorage("fetchFromStorage2",result[lastListName])
        fetchFromStorage = result[lastListName]
        if (callback) callback(result)
        // ...
    });
}

getLastLoadListTitle(getLastLoadedListAndSet,consoleLog);


function consoleLog (value){
    console.log(value)
}

function createList(value) {

    chrome.storage.sync.set({ [value]: {} }, () => {
        if (chrome.runtime.lastError) {
            console.error(`Error storing the empty object "${value}":`, chrome.runtime.lastError);
        } else {
            console.log(`Empty object "${value}" stored successfully`);
        }
    });

    chrome.storage.sync.set({ lastLoadedList: [value] }, () => {
        if (chrome.runtime.lastError) {
            console.error(`Error storing the empty object "${value}":`, chrome.runtime.lastError);
        } else {
            console.log(`Empty object "${value}" stored successfully`);
        }
    });

    fetchOneListFromStorageFunction([value],setFetchFromStorageFunction)
}

function setFetchFromStorageFunction (obj) {
    storeVariableInChromeStorage("fetchFromStorage2",obj)
    fetchFromStorage = obj
}

function importJSON(json, listName,callback) {
    chrome.storage.sync.set({ [listName]: json }, () => {
        if (chrome.runtime.lastError) {
            console.error(`Error storing the object "${listName}":`, chrome.runtime.lastError);
        } else {
            console.log(`Object "${listName}" stored successfully`);
        }
    });

}




function isBottomReached() {
    // Calculate how far the user has scrolled down
    const scrollY = window.scrollY;
    // Calculate the height of the entire page
    const pageHeight = document.documentElement.scrollHeight;
    // Calculate the height of the visible viewport
    const viewportHeight = window.innerHeight;

    // Check if the user has scrolled close to the bottom
    return scrollY + viewportHeight >= pageHeight - pageHeight * .5; // Adjust the threshold as needed
}

function getItemsfromDOM() {
    return new Promise((resolve, reject) => {
        // Perform asynchronous operations like DOM querying here
        const gridArray = document.getElementsByClassName("ytd-rich-item-renderer");
        const titleArray = Array.from(gridArray).map(ele => {
            const titleLink = ele.querySelector("a#video-title-link");
            return [ele, titleLink];
        });
        resolve(titleArray); // Resolve the promise with the result
    });
}


function removeEle(titleArray) {
    // console.log(fetchFromStorage,"this is fetchFromStorage")
    for (let i = 0; i < titleArray.length; i++) {
        let ele = titleArray[i][0];
        let titleLink = titleArray[i][1];
        if (titleLink) {
            let title = titleArray[i][1].getAttribute("title").toLowerCase();

            if (shouldRemoveTitle(title, fetchFromStorage)) {
                ele.classList.add('hidden');
                // ele.remove();
            }
        }

    }
}


function shouldRemoveTitle(title, filterWords) {
    if (!title || !filterWords) {
        return false; // Return false if title or filterWords is null or undefined
    }

    const lowerCaseTitle = title.toLowerCase();
    return Object.keys(filterWords).some(word => lowerCaseTitle.includes(word));
}


async function removeEleBundle() {
    // console.log("removeEleBundle is running")
    if (getWindowURL() === "https://www.youtube.com/") {
        const titleArray = await getItemsfromDOM();
        removeEle(titleArray);
    }

}

function getWindowURL() {
    return window.location.href
}


function addKeyToFilterWords(listName,value,callback){
    chrome.storage.sync.get([listName], result => {
        fetchFromStorage = result[listName];
        if (value) {
             fetchFromStorage[value] = true;
            // Save the modified object back to chrome.storage.sync
            let updateObject = {};
            updateObject[listName] = fetchFromStorage; // Prepare the object with the right key
            chrome.storage.sync.set(updateObject, () => {
                if (chrome.runtime.lastError) {
                    console.error('Error while updating the storage:', chrome.runtime.lastError);
                } else {
                    if (callback) callback(fetchFromStorage);
                }
            });
        }
    });
    getLastLoadListTitle(getLastLoadedListAndSet,consoleLog);
}

function addKeyToFilterWordsFun(listName, value,callback) {
    getVariableFromChromeStorage([listName])
        .then((result) => {
            if (value) {
                result[value] = true;
                let updateObject = {};
                updateObject[listName] = result;
                return updateObject; // Return the updateObject
            }
            return result; // Return the original result if value is not provided
        })
        .then((updatedResult) => {
            storeVariableInChromeStorageAsOneObj(updatedResult)
        });
        getLastLoadListTitle(getLastLoadedListAndSet,consoleLog);
}


function deleteList(listName) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.remove([listName], () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError));
        } else {
          resolve('Item removed successfully');
        }
      });
    });
  }
  
  

function handleMessage(message, sender, sendResponse) {
    const {value, action,listName } = message;
    // console.log(message, sender, sendResponse)
    switch (action) {
        case "addKeyToFilterWords":
            console.log("addKeyToFilterWords action triggered");
            addKeyToFilterWords(listName,value,consoleLog);
            sendResponse({ status: "success" });
            break;
        case "deleteList":
            console.log("deleteList action triggered");
            deleteList(listName)
            .then(() => {
              return retrieveListsFromStorage(); // Returning a promise to chain the next then
            })
            .then(allList => {
              sendResponse({ status: "success", allList: allList });
            })
            .catch(error => {
              console.error(error); // Handling any errors that might occur in the chain
            });
            break;
        case "retrieveAllLists":
            console.log("retrieveLists action triggered");
            retrieveListsFromStorage().then(allList => {
                sendResponse({ status: "success", allList: allList });
            });
            return true; // This keeps the message channel open for the asynchronous response
            break
        case "exportWords":
            // console.log("getFilterWords action triggered");
            sendResponse({ filterWords: fetchFromStorage });
            break;
        case "testButton":
            getVariableFromChromeStorage('fetchFromStorage2')
            .then(data => {
              console.log(data, 'fetchFromStorage2');
              sendResponse({ filterWords: data });  // Sending the data here
            })
            .catch(err => {
              console.log('An error occurred:', err);
              sendResponse({ error: 'An error occurred:' + err });  // Sending error here
            });

            getVariableFromChromeStorage('lastLoadedListTitle')
            .then(data => {
              console.log(data, 'lastLoadedListTitle');
              sendResponse({ lastLoadedTitle: data });  // Sending the data here
            })
            .catch(err => {
              console.log('An error occurred:', err);
              sendResponse({ error: 'An error occurred:' + err });  // Sending error here
            });

            addKeyToFilterWordsFun("w2","eight",getLastLoadListTitle)

            
          return true;  // Keeps the message channel open for asynchronous response
          
            break;
        case "loadOneList":
            console.log("loadOneList action triggered");
            loadOneList(value,consoleLog).then(list => {
                let response = list[value];
                chrome.storage.sync.set({ lastLoadedList:value }, () => {
                    if (chrome.runtime.lastError) {
                    } else {
                    }
                });
                sendResponse({ status: "success2", list: response,obj:fetchFromStorage });
            });
            return true; // This keeps the message channel open for the asynchronous response
            break
        case "getLastLoadedListTitle":
            // console.log(fetchFromStorage,"reload")
            if (lastLoadedListTitle){
                sendResponse({ status: "success", title: lastLoadedListTitle, obj:fetchFromStorage });
            }
            else{
                sendResponse({ status: "fail", title: "No List Set" })
            }
            return true;
        case "deleteWordFromFilterList":
            console.log("deleteWordFromFilterList action triggered");
            removeKeyFromFilterWords(message.listName,message.value,consoleLog);
            sendResponse({ url: "success" });
            break;
        case "setupSubmitButton":
            console.log("setupSubmitButton action triggered");
            sendResponse({ status: getWindowURL() });
            break;
        case "createList":
            console.log("createList action triggered");
            createList(value)
            // retrieveListsFromStorage().then(allList => {
            //     sendResponse({ status: "success", allList: allList });
            // });
            break;
        case "importJSON":
            console.log("importJSON action triggered");
            debugger
            importJSON(value,listName)
            sendResponse({ status: "success",words:value });
            break;
        case "NAVIGATION_UPDATED":
            console.log("NAVIGATION_UPDATED triggered");
            break;
        default:
            console.log("Default case reached: no condition is met");
            sendResponse({ status: "no condition is met" });
            removeEleBundle() 
            break
    }
}



async function testing(){
    const tabButton = await getCurrentTab();
    console.log("Value of tabButton:", tabButton); // Log the value of tabButton
}

function removeKeyFromFilterWords(listName, value, callback) {
    chrome.storage.sync.get([listName], result => {
        storeVariableInChromeStorage("fetchFromStorage2",result[listName])
        fetchFromStorage = result[listName];
        debugger;
        if (fetchFromStorage[value]) {
            delete fetchFromStorage[value];
            
            // Save the modified object back to chrome.storage.sync
            let updateObject = {};
            updateObject[listName] = fetchFromStorage; // Prepare the object with the right key
            chrome.storage.sync.set(updateObject, () => {
                if (chrome.runtime.lastError) {
                    console.error('Error while updating the storage:', chrome.runtime.lastError);
                } else {
                    if (callback) callback(fetchFromStorage);
                }
            });
        }
    });
    getLastLoadListTitle(getLastLoadedListAndSet,consoleLog);
}




function throttle(func, limit) {
    let inThrottle;
    return function () {
        const context = this, args = arguments;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function checkIfBottomReachedAndExecuteScroll() {
    if (isBottomReached()) {
        removeEleBundle();
    }
}


function retrieveListsFromStorage() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(null, results => {
        // console.log(results, "renderAllList ()");
        const listKeysArray = Object.keys(results);
        // console.log(results,"from retrieveListsFromStorage")
        resolve(listKeysArray);
      });
    });
  }

function loadOneList(listName,callback) {
    console.log("loadOneList")
    return new Promise((resolve) => {
    // console.log(listName,"loadOnelist")
    chrome.storage.sync.get([listName], results => {
    console.log(results)
    fetchFromStorage = results[listName]
    storeVariableInChromeStorage("fetchFromStorage2",results[listName])
    storeVariableInChromeStorage("lastLoadedListTitle",listName)
    callback(fetchFromStorage)
    callback(results[listName])
    resolve(results);
    });
});
}

function CheckIfBottomReachedAndExecuteKey(event) {
    // Check if the key pressed is the down arrow (key code 40), End key (key code 35), or Page Down key (key code 34)
    if ((event.keyCode === 40 || event.keyCode === 35 || event.keyCode === 34) &&
        isBottomReached()) {
        removeEleBundle();
    }
}


var throttledCheckIfBottomReachedAndExecuteScroll = throttle(checkIfBottomReachedAndExecuteScroll, 1000);
var throttledCheckIfBottomReachedAndExecuteKey = throttle(CheckIfBottomReachedAndExecuteKey, 1000);


(() => {
    chrome.runtime.onMessage.addListener(handleMessage);

    document.addEventListener("DOMContentLoaded", () => {
        // Notify the background script that the content script is ready

        chrome.runtime.sendMessage({ type: "CONTENT_SCRIPT_READY" });

      });
      
      // Other content script code here
      
    

    // Event Listeners
    window.addEventListener('scroll', throttledCheckIfBottomReachedAndExecuteScroll);
    window.addEventListener('keydown', throttledCheckIfBottomReachedAndExecuteKey);

    // Timeout to remove elements
    setTimeout(() => {
        removeEleBundle();
    }, 1000);

})()







