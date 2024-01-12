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

async function createList(value) {

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

    try {
        await storeVariableInChromeStorage("lastLoadedList", value);

    } catch (error) {
        console.error(error);
    }
    removeHiddenThumbnails()
}


function createDefault() {
    createList("fullOrPartial")
    createList("Default")
    createList("lastLoadedList").then(() => storeVariableInChromeStorage("lastLoadedList", "Default"));
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
    let resultObj = await getObjFromLastLoadedKey();
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

async function removeHiddenThumbnails() {
    const titleArray = await getItemsfromDOM();
    for (let i = 0; i < titleArray.length; i++) {
        let ele = titleArray[i][0];
        let titleLink = titleArray[i][1];
        if (titleLink) {
            ele.classList.remove('hidden');
        }
    }
}



async function removeHiddenThumbnailsByFilterWord(filterWord, listName, trueOrMatchPartial) {
    console.log(listName, "listname");
    const titleArray = await getItemsfromDOM();
    for (let i = 0; i < titleArray.length; i++) {
        let ele = titleArray[i][0];
        let titleLink = titleArray[i][1];
        if (titleLink) {
            let title = titleArray[i][1].getAttribute("title").toLowerCase();
            if (shouldRemoveTitle(title, { [filterWord]: trueOrMatchPartial })) {
                ele.classList.remove('hidden');
            }
        }
    }
}




function shouldRemoveTitle(title, filterWords) {
    if (!title || !filterWords) {
        return false; // Return false if title or filterWords is null or undefined
    }

    const lowerCaseTitle = title.toLowerCase();

    // Convert filter words to lowercase
    // const lowerCaseFilterWords = Object.keys(filterWords).map(word => word.toLowerCase());

    const trueKeys = [];
    const matchPartialKeys = [];

    Object.keys(filterWords).forEach(key => {
        if (filterWords[key] === true) {
            trueKeys.push(key.toLowerCase());
        } else if (filterWords[key] === "matchPartial") {
            matchPartialKeys.push(key.toLowerCase());
        }
    });


    if (matchPartialKeys.some(word => lowerCaseTitle.includes(word))) {
        return true
    };

    if (trueKeys.some(word => lowerCaseTitle.includes(word))) {
        title = cleanString(title)
        // console.log(title)
        let lowerCaseTitlesplit = title.split(" ")
        return trueKeys.some(word => lowerCaseTitlesplit.includes(word))
    };

    



    return false
}


function cleanString(str) {
    return str.replace(/[^\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af\u0410-\u044F\u0391-\u03CE\u0600-\u06FF\u0900-\u097F\u00C0-\u00FFa-zA-Z0-9 ]/g, " ").trim();
}

async function removeEleBundle() {
    // console.log("removeEleBundle is running")
    // console.log(getWindowURL())
    if (getWindowURL() === "https://www.youtube.com/" || getWindowURL().includes("youtube.com/?bp=")) {
        const titleArray = await getItemsfromDOM();
        removeEle(titleArray);
        // console.log("remove")
    }
    else if (getWindowURL().includes("watch")){

    }

}


function getWindowURL() {
    return window.location.href
}


function handleMessage(message, sender, sendResponse) {
    const { value, action, listName, trueOrMatchPartial } = message;
    // console.log(message, sender, sendResponse)
    switch (action) {
        case "testButton":
            removeHiddenThumbnails()
            // Remove the event listeners
            window.removeEventListener('scroll', throttledCheckIfBottomReachedAndExecuteScroll);
            window.removeEventListener('keydown', throttledCheckIfBottomReachedAndExecuteKey);
            sendResponse({ response: "success" });
            return true;  // Keeps the message channel open for asynchronous response
            break;
        case "some_message":
            getVariableFromChromeStorage("lastLoadedList").then(e => console.log(e))
            sendResponse({ response: "success" });
            return true;  // Keeps the message channel open for asynchronous response
            break;
        case "unhideThumbnails":
            console.log("unhideThumbnails")
            removeHiddenThumbnails()
            sendResponse({ response: "success" });
            return true;  // Keeps the message channel open for asynchronous response
            break;
        case "refresh":
            removeEleBundle();
            sendResponse({ response: "success" });
            return true;  // Keeps the message channel open for asynchronous response
            break;
        case "removeHiddenThumbnailsByFilterWord":
            console.log(value, listName, "removeHiddenThumbnailsByFilterWord", trueOrMatchPartial)
            removeHiddenThumbnailsByFilterWord(value, listName, trueOrMatchPartial)
            sendResponse({ response: "success" });
            return true;  // Keeps the message channel open for asynchronous response
        case "UnhideThumbnailAndRunEleBundle":
            console.log("UnhideThumbnailAndRunEleBundle")
            removeHiddenThumbnails().then(() => setTimeout(() => {
                removeEleBundle();
            }, 1000));
            sendResponse({ response: "success" });
            return true;  // Keeps the message channel open for asynchronous response
        default:
            console.log("default condition")
            break
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
    if(getWindowURL() === "https://www.youtube.com/"){
        removeEleBundle();
    }
    else {
        // console.log("not youtube")
    }
    
}


function CheckIfBottomReachedAndExecuteKey(event) {
    // Check if the key pressed is the down arrow (key code 40), End key (key code 35), or Page Down key (key code 34)
    if(getWindowURL() === "https://www.youtube.com/"){
        if (event.keyCode === 40 || event.keyCode === 35 || event.keyCode === 34) {
            removeEleBundle();
        }
    }
    else {
        // console.log("not youtube")
    }

}

function onClickCheckIfItIsYoutubeHomePage(event) {
    // console.log("asd?")
    // console.log(event)
    // if (console.log(event.target.baseURI) !== "https://www.youtube.com/"){
    //     removeHiddenThumbnails()
    //     // console.log("clearing")
    // }
    var element = event.target;
    
    // Traverse up the DOM to find if the clicked element is inside an <a> tag
    while (element && element.nodeName !== "A") {
        element = element.parentNode;
    }

    // if (element && element.href && element.href !=="https://www.youtube.com/") {
    //     // This is a click inside an <a> tag with an href attribute
    //     console.log("Redirecting to:", element.href);
    //         removeHiddenThumbnails()
    //         console.log("clearing")
    //     // For example, you can check if it's a YouTube link, log data, etc.
    // }
    if (element && element.href && element.href ==="https://www.youtube.com/") {
        // This is a click inside an <a> tag with an href attribute
        console.log("Redirecting to:", element.href);
        var myInterval = setInterval(() => {
            removeHiddenThumbnails();
        }, 500);
        
        setTimeout(() => {
            clearInterval(myInterval);
            removeEleBundle();
        }, 2000); // Clears the interval after 10 seconds
        
        
            console.log("clearing")
        // For example, you can check if it's a YouTube link, log data, etc.
    }
}


var throttledCheckIfBottomReachedAndExecuteScroll = throttle(checkIfBottomReachedAndExecuteScroll, 50);
var throttledCheckIfBottomReachedAndExecuteKey = throttle(CheckIfBottomReachedAndExecuteKey, 50);

function mainProgram() {
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

    // Event Listeners
    window.addEventListener('scroll', throttledCheckIfBottomReachedAndExecuteScroll);
    window.addEventListener('keydown', throttledCheckIfBottomReachedAndExecuteKey);
    window.addEventListener("click", onClickCheckIfItIsYoutubeHomePage, true);


    
    
    removeEleBundle();
    
    // Timeout to remove elements
    let count = 0;
    const intervalId = setInterval(() => {
        removeEleBundle();
        count++;
        if (count >= 10) {
            clearInterval(intervalId);
        }
    }, 250);

    // let currentWindow = getWindowURL()
    // if (currentWindow.includes("watch")){
    //     console.log("included watch")
    //     removeHiddenThumbnails()
    // }
}


(() => {
    // storeVariableInChromeStorage("fullOrPartial", "Full")
    mainProgram()
    



})()







