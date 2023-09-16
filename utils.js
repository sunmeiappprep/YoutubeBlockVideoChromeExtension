export async function getActiveTabURL() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

export function getVariableFromChromeStorage(variableName) {
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

export async function getObjFromLastLoadedKey() {
  const result = await getVariableFromChromeStorage("lastLoadedList");
  if (result) {
    const obj = await getVariableFromChromeStorage(result);
    return obj;
  }
}


export function retrieveListsFromStorage() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(null, results => {
      // console.log(results, "renderAllList ()");
      const listKeysArray = Object.keys(results);
      // console.log(results,"from retrieveListsFromStorage")
      resolve(listKeysArray);
    });
  });
}

export function storeVariableInChromeStorage(variableName, value) {
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

export async function addKeyToFilterWordsFun(listName, value) {
  try {
    let result = await getVariableFromChromeStorage([listName]);

    if (result) {
      if (result[value]) {
        await removeKeyFromFilterWords(listName, value);
        console.log("addDeleteProc");
      }

      result[value] = true;

      await storeVariableInChromeStorage([listName], result);

      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "refresh" }, function (response) {
          // console.log(response);
        });
      });
    }
  } catch (error) {
    // handle error here
    console.error(error);
  }
}

export async function addKeyToFilterWordsFunIncludeInAny(listName, value) {
  try {
    const result = await getVariableFromChromeStorage([listName]);

    if (result) {
      if (result[value]) {
        await removeKeyFromFilterWords(listName, value);
        console.log("addDeleteProc");
      }

      result[value] = "matchPartial";

      await storeVariableInChromeStorage([listName], result);

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "refresh" }, (response) => {
          // console.log(response);
        });
      });
    }
  } catch (error) {
    // handle error here
    console.error(error);
  }
}



export async function createList(value) {

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

}

export function deleteList(listName) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.remove([listName], () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError));
      } else {
        resolve('Item removed successfully');
        storeVariableInChromeStorage("lastLoadedList", "No List Loaded")
      }
    });
  });
}

export function removeKeyFromFilterWords(listName, value) {
  return new Promise((resolve, reject) => {
    let stored;
    getVariableFromChromeStorage(listName)
      .then(result => {
        if (result) {
          stored = result[value];
          delete result[value];
          return result;
        }
      })
      .then(updateObject => storeVariableInChromeStorage(listName, updateObject))
      .then(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            { action: "removeHiddenThumbnailsByFilterWord", value, listName: [listName], trueOrMatchPartial: stored },
            function (response) {
              console.log(response);
              resolve(); // Resolve the promise here
            }
          );
        });
      })
      .catch(err => {
        console.error(err);
        reject(err); // Reject the promise if an error occurs
      });
  });
}



export function importJSON(json, listName, callback) {
  chrome.storage.sync.set({ [listName]: json }, () => {
    if (chrome.runtime.lastError) {
      console.error(`Error storing the object "${listName}":`, chrome.runtime.lastError);
    } else {
      console.log(`Object "${listName}" stored successfully`);
    }
  });

}

