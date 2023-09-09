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