

let fetchFromStorage = {}

// function storeFilterWords(updatedFilterWords) {
//     chrome.storage.sync.set({ filterWords: updatedFilterWords }, () => {
//         if (chrome.runtime.lastError) {
//             console.error('Error storing filterWords:', chrome.runtime.lastError);
//         } else {
//             console.log('filterWords stored successfully');
//         }
//     });
// }

function addKeyToFilterWords(word) {
    //this get only takes objects
    chrome.storage.sync.get(['filterWords'], result => {
        if (chrome.runtime.lastError) {
            console.error('Error retrieving filterWords:', chrome.runtime.lastError);
        } else {
            debugger
            //result.filterWords will give me the object that has no name?
            localFetchFromStorage = result.filterWords;
            if (localFetchFromStorage) {
                console.log(localFetchFromStorage)
                localFetchFromStorage[word] = true;
                storeFilterWords(localFetchFromStorage); // Store the modified object back
            } else {
                console.log('filterWords not found in storage');
            }
        }
    });
}

//im taking in a object and saving the name of that object
function storeFilterWords(filterWords) {
    debugger
    chrome.storage.sync.set({ filterWords: filterWords }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error storing filterWords:', chrome.runtime.lastError);
        } else {
            console.log('filterWords stored successfully');
        }
        
    });
    retrieveFilterWords()
}

// addKeyToFilterWords("test3");



function retrieveFilterWords(callback) {
    chrome.storage.sync.get(['bad'], result => {
        if (chrome.runtime.lastError) {
            console.error('Error retrieving filterWords:', chrome.runtime.lastError);
        } else {
            fetchFromStorage = result.filterWords;
            if (fetchFromStorage) {
                console.log('Retrieved filterWords:', fetchFromStorage);
                // callback(fetchFromStorage,"good"); // Call the provided callback with the retrieved data
            } else {
                console.log('filterWords not found in storage');
                // callback(null); // Call the callback with null if data not found
            }
        }
    });
}
retrieveFilterWords()

// chrome.storage.sync.get("filterWords", (result) => {
//     const storedFilterWords = JSON.parse(result.filterWords);
//     console.log("Stored filter words:", storedFilterWords);
// });


let observer
function isBottomReached() {
    // Calculate how far the user has scrolled down
    const scrollY = window.scrollY;
    // Calculate the height of the entire page
    const pageHeight = document.documentElement.scrollHeight;
    // Calculate the height of the visible viewport
    const viewportHeight = window.innerHeight;

    // Check if the user has scrolled close to the bottom
    return scrollY + viewportHeight >= pageHeight - pageHeight * .3; // Adjust the threshold as needed
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
    for (let i = 0; i < titleArray.length; i++) {
        let ele = titleArray[i][0];
        let title = titleArray[i][1].getAttribute("title").toLowerCase();

        if (shouldRemoveTitle(title, fetchFromStorage)) {
            ele.remove();
        }
    }
}


function shouldRemoveTitle(title, filterWords) {
    const lowerCaseTitle = title.toLowerCase();
    // console.log(lowerCaseTitle)
    return Object.keys(filterWords).some(word => lowerCaseTitle.includes(word));
}

async function removeEleBundle() {
    const titleArray = await getItemsfromDOM();
    removeEle(titleArray);
}

function setupMutationObserver(tabId) {
    observer = new MutationObserver(mutations => {
        // Handle mutations here
        removeEleBundle()
        console.log("New content appeared on the page:");
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Optionally, you can disconnect the observer when needed
    // observer.disconnect();
}

function disconnectObserver() {
    if (observer) {
        observer.disconnect();
        observer = null; // Reset the observer
        console.log("Observer disconnected");
    }
}


(() => {
    let globalTabId, localtabURL;
    let initialSetupCompleted = false;
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, tabId, tabURL } = obj;
        localTabId = tabId
        localtabURL = tabURL
        if (type === "run") {
            setupMutationObserver(tabId);
            initialSetupCompleted = true;
            console.log(window.location.href);
        }
        if (type === "disconnectObserver") {
            disconnectObserver()
        }
    })



    if (!initialSetupCompleted) {
        console.log("initialSetupCompleted")
        setupMutationObserver(globalTabId);
        initialSetupCompleted = true;
        
    }



})()



// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//     if (changeInfo.status === "complete" && tab.url.includes("https://www.youtube.com/")) {
//         // Tab has finished loading and is on YouTube
//         setupMutationObserver(tabId);
//     }
// });

