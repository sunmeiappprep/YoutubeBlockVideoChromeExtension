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

(() => {
    console.log("removeHiddenThumbnails()")
    removeHiddenThumbnails()
})()