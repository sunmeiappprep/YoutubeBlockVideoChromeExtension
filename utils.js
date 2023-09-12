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

export function addKeyToFilterWordsFun(listName, value) {
  getVariableFromChromeStorage([listName])
      .then((result) => {
          if (result) {
              result[value] = true;
              return result;
          }
          return result; // Return the original result if value is not provided
      })
      .then((updatedResult) => {
          storeVariableInChromeStorage([listName],updatedResult)
      });
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
              storeVariableInChromeStorage("lastLoadedList","No List Loaded")
          }
      });
  });
}

export function removeKeyFromFilterWords(listName, value, callback) {
  getVariableFromChromeStorage(listName).then(result =>{
      console.log(result)
      if(result){
          delete result[value]
          console.log(result)
          return result
      }
  }).then(updateObject => storeVariableInChromeStorage(listName,updateObject))
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