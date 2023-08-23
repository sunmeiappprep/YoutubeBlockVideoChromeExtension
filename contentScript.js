chrome.runtime.sendMessage({ status: "ready" });
console.log("CS is running")
let fetchFromStorage = {}
let observer
// function storeFilterWords(updatedFilterWords) {
//     chrome.storage.sync.set({ filterWords: updatedFilterWords }, () => {
//         if (chrome.runtime.lastError) {
//             console.error('Error storing filterWords:', chrome.runtime.lastError);
//         } else {
//             console.log('filterWords stored successfully');
//         }
//     });
// }



function createEmptyObjectAndSet(objectName) {
    chrome.storage.sync.get([objectName], result => {
        if (chrome.runtime.lastError) {
            console.error(`Error retrieving "${objectName}":`, chrome.runtime.lastError);
        } else {
            const existingObject = result[objectName];
            console.log(existingObject, "exisitng obj")
            if (existingObject === undefined) {
                const emptyObject = {};
                chrome.storage.sync.set({ [objectName]: emptyObject }, () => {
                    if (chrome.runtime.lastError) {
                        console.error(`Error storing the empty object "${objectName}":`, chrome.runtime.lastError);
                    } else {
                        console.log(`Empty object "${objectName}" stored successfully`);
                    }
                });
            } else {
                console.log(`Object "${objectName}" already exists`);
            }
        }
    });
}

// Call the function to create an empty object with a specific name
//   createEmptyObjectAndSet('filterWords');

function addKeyToFilterWords(word) {
    //this get only takes objects
    chrome.storage.sync.get(['filterWords'], result => {


        if (chrome.runtime.lastError) {
            console.error('Error retrieving filterWords:', chrome.runtime.lastError);
        } else {
            //result.filterWords will give me the object that has no name?
            localFetchFromStorage = result.filterWords;
            if (localFetchFromStorage) {
                console.log(localFetchFromStorage)
                localFetchFromStorage[word] = true;
                storeFilterWords(localFetchFromStorage); // Store the modified object back
                sendResponse({ status: 'success' });
            } else {
                console.log('filterWords not found in storage');
            }
        }
    });
}


function removeKeyFromFilterWords(word) {
    //this get only takes objects
    chrome.storage.sync.get(['filterWords'], result => {


        if (chrome.runtime.lastError) {
            console.error('Error retrieving filterWords:', chrome.runtime.lastError);
        } else {
            //result.filterWords will give me the object that has no name?
            localFetchFromStorage = result.filterWords;
            if (localFetchFromStorage[word]) {
                console.log(`removed ${localFetchFromStorage[word]}`)
                delete (localFetchFromStorage[word])
                storeFilterWords(localFetchFromStorage); // Store the modified object back
            } else {
                console.log('filterWords not found in storage');
            }
        }
    });
}


//im taking in a object and saving the name of that object
function storeFilterWords(filterWords) {
    // debugger
    chrome.storage.sync.set({ filterWords }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error storing filterWords:', chrome.runtime.lastError);
        } else {
            console.log('filterWords stored successfully');
        }

    });
    retrieveFilterWords()
}

// addKeyToFilterWords("billion");
// addKeyToFilterWords("woke");
// addKeyToFilterWords("china");



function retrieveFilterWords(callback) {
    chrome.storage.sync.get(['filterWords'], result => {
        if (chrome.runtime.lastError) {
            console.error('Error retrieving filterWords:', chrome.runtime.lastError);
        } else {
            fetchFromStorage = result.filterWords;
            if (fetchFromStorage) {
                // console.log('Retrieved filterWords:', fetchFromStorage);
                // callback(fetchFromStorage,"good"); // Call the provided callback with the retrieved data
            } else {
                console.log('filterWords not found in storage');
                chrome.storage.sync.set({ filterWords: filterWords })

                // callback(null); // Call the callback with null if data not found
            }
        }
    });
}
retrieveFilterWords()


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

    const lowerCaseTitle = title.toLowerCase();
    return Object.keys(filterWords).some(word => lowerCaseTitle.includes(word));
}

async function removeEleBundle() {
    console.log("removeEleBundle is running")
    if (getWindowURL() === "https://www.youtube.com/") {
        const titleArray = await getItemsfromDOM();
        removeEle(titleArray);
    }

}

function getWindowURL() {
    return window.location.href
}


function handleMessage(message, sender, sendResponse) {
    const { type, tabId, tabURL, value, action } = message;

    switch (action) {
        case "addKeyToFilterWords":
            addKeyToFilterWords(value);
            sendResponse({ status: "success" });
            break;
        case "getFilterWords":
            sendResponse({ filterWords: fetchFromStorage });
            break;
        case "deleteWordFromFilterList":
            removeKeyFromFilterWords(message.value);
            sendResponse({ url: "success" });
            break;
        case "setupSubmitButton":
            sendResponse({ status: getWindowURL() });
            break;
        case "run":
            // Your logic here
            break;
        default:
            sendResponse({ status: "no condition is met" });
    }
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



function CheckIfBottomReachedAndExecuteKey(event) {
    // Check if the key pressed is the down arrow (key code 40), End key (key code 35), or Page Down key (key code 34)
    if ((event.keyCode === 40 || event.keyCode === 35 || event.keyCode === 34) && 
        isBottomReached()) {
        removeEleBundle();
    }
}


const throttledCheckIfBottomReachedAndExecuteScroll = throttle(checkIfBottomReachedAndExecuteScroll, 1000);
const throttledCheckIfBottomReachedAndExecuteKey = throttle(CheckIfBottomReachedAndExecuteKey, 1000);



(() => {
    chrome.runtime.onMessage.addListener(handleMessage);
  
    // Event Listeners
    window.addEventListener('scroll', throttledCheckIfBottomReachedAndExecuteScroll);
    window.addEventListener('keydown', throttledCheckIfBottomReachedAndExecuteKey);
  
    // Timeout to remove elements
    setTimeout(() => {
      removeEleBundle();
    }, 1000);
  
  })()
  






