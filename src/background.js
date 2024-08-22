

function clipboard_write(text) {
    navigator.clipboard.writeText(text);
}

chrome.action.onClicked.addListener((tab) => {
    const tab_url = tab.url;
    // chrome.scripting.executeScript({
    //     target: { tabId: tab.id },
    //     func: clipboard_write,
    //     args: [tab_url]
    // });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['action.js']
    });
});