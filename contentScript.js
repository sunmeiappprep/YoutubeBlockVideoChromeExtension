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



// function fetchOneListFromStorageFunction(listName, callback) {
//     chrome.storage.sync.get([listName], result => {
//         if (callback) {
//             callback(result) // Call the setFunction with the retrieved value
//         }
//     });
// }



// function consoleLog(value) {
//     console.log(value)
// }



// function importJSON(json, listName, callback) {
//     chrome.storage.sync.set({ [listName]: json }, () => {
//         if (chrome.runtime.lastError) {
//             console.error(`Error storing the object "${listName}":`, chrome.runtime.lastError);
//         } else {
//             console.log(`Object "${listName}" stored successfully`);
//         }
//     });

// }

function createDefault () {
    createList("lastLoadedList");
    createList("lastLoadedListTitle");
    createList("fetchFromStorage2");
    createList("asd");
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


async function removeEle(titleArray) {
    let resultObj
    try {
        resultObj = await getObjFromLastLoadedKey();
        console.log(resultObj); // Do something with the object

    } catch (error) {
        console.error(error);
    }

    for (let i = 0; i < titleArray.length; i++) {
        let ele = titleArray[i][0];
        let titleLink = titleArray[i][1];
        if (titleLink) {
            let title = titleArray[i][1].getAttribute("title").toLowerCase();
            if (shouldRemoveTitle(title, resultObj)) {
                ele.classList.add('hidden');
            }

        }
    }
}


async function getObjFromLastLoadedKey() {
    const result = await getVariableFromChromeStorage("lastLoadedList");
    if (result) {
        const obj = await getVariableFromChromeStorage(result);
        return obj;
    }
}




function shouldRemoveTitle(title, filterWords) {
    if (!title || !filterWords) {
        return false; // Return false if title or filterWords is null or undefined
    }

    const lowerCaseTitle = title.toLowerCase();
    
    // Convert filter words to lowercase
    const lowerCaseFilterWords = Object.keys(filterWords).map(word => word.toLowerCase());

    return lowerCaseFilterWords.some(word => lowerCaseTitle.includes(word));
}


async function removeEleBundle() {
    // console.log("removeEleBundle is running")
    if (getWindowURL() === "https://www.youtube.com/" || getWindowURL().includes("youtube.com/?bp=")) {
        const titleArray = await getItemsfromDOM();
        removeEle(titleArray);
    }

}

function getWindowURL() {
    return window.location.href
}


// function addKeyToFilterWordsFun(listName, value) {
//     getVariableFromChromeStorage([listName])
//         .then((result) => {
//             if (value) {
//                 result[value] = true;
//                 let updateObject = {};
//                 updateObject[listName] = result;
//                 return updateObject; // Return the updateObject
//             }
//             return result; // Return the original result if value is not provided
//         })
//         .then((updatedResult) => {
//             storeVariableInChromeStorageAsOneObj(updatedResult)
//         });
//     // getLastLoadListTitle(getLastLoadedListAndSet, consoleLog);
// }


// function deleteList(listName) {
//     return new Promise((resolve, reject) => {
//         chrome.storage.sync.remove([listName], () => {
//             if (chrome.runtime.lastError) {
//                 reject(new Error(chrome.runtime.lastError));
//             } else {
//                 resolve('Item removed successfully');
//                 storeVariableInChromeStorage("lastLoadedList","No List Loaded")
//             }
//         });
//     });
// }



function handleMessage(message, sender, sendResponse) {
    const { value, action, listName } = message;
    // console.log(message, sender, sendResponse)
    switch (action) {
        case "addKeyToFilterWords":
            console.log("addKeyToFilterWords action triggered");
            addKeyToFilterWordsFun(listName,value)
            // addKeyToFilterWords(listName, value, consoleLog);
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
                getObjFromLastLoadedKey()
                    .then((obj) => {
                        console.log(obj); // Example usage
                        sendResponse({ status: "success", filterWords: obj });
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                    });
                return true;  // Will respond asynchronously
                break;
            
        case "testButton":
 
            getVariableFromChromeStorage("lastLoadedList").then(e => console.log(e))
            return true;  // Keeps the message channel open for asynchronous response

            break;
        case "loadOneList":
            // console.log("loadOneList action triggered");
            // storeVariableInChromeStorage("lastLoadedList",value).then(() =>{
            //     getVariableFromChromeStorage(value).then((result) => {
            //         console.log(" getVariableFromChromeStorage(value)")
            //         sendResponse({ status: "success", list: result });
            //     })
            //     return true; // This keeps the message channel open for the asynchronous response
            // })
            break
        
        case "deleteWordFromFilterList":
            console.log("deleteWordFromFilterList action triggered");
            removeKeyFromFilterWords(message.listName, message.value, consoleLog);
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
            importJSON(value, listName)
            sendResponse({ status: "success", words: value });
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



// async function testing() {
//     const tabButton = await getCurrentTab();
//     console.log("Value of tabButton:", tabButton); // Log the value of tabButton
// }

// function removeKeyFromFilterWords(listName, value, callback) {
//     getVariableFromChromeStorage(listName).then(result =>{
//         console.log(result)
//         if(result){
//             delete result[value]
//             console.log(result)
//             return result
//         }
//     }).then(updateObject => storeVariableInChromeStorage(listName,updateObject))
// }




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


// function retrieveListsFromStorage() {
//     return new Promise((resolve) => {
//         chrome.storage.sync.get(null, results => {
//             // console.log(results, "renderAllList ()");
//             const listKeysArray = Object.keys(results);
//             // console.log(results,"from retrieveListsFromStorage")
//             resolve(listKeysArray);
//         });
//     });
// }


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
    getVariableFromChromeStorage("lastLoadedList")
    .then(value => {
        if (value === undefined) {
            createDefault()
            console.log("The variable does not exist in storage.");
        } else {
            console.log("The variable exists, and its value is:", value);
        }
    })
    .catch(error => {
        console.error("An error occurred:", error);
    });



    

    chrome.runtime.onMessage.addListener(handleMessage);



    // Other content script code here



    // Event Listeners
    window.addEventListener('scroll', throttledCheckIfBottomReachedAndExecuteScroll);
    window.addEventListener('keydown', throttledCheckIfBottomReachedAndExecuteKey);

    // Timeout to remove elements
let count = 0;
const intervalId = setInterval(() => {
    removeEleBundle();
    count++;
    if (count >= 3) {
        clearInterval(intervalId);
    }
}, 1000);

})()







