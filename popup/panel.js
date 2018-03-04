var myWindowId;
const contentBox = document.querySelector("#content");

/**
 * Make the content box editable as soon as the user mouses over the sidebar.
*/
window.addEventListener("mouseover", () => {
    contentBox.setAttribute("contenteditable", true);
});

/**
 * When the user mouses out, save the current contents of the box.
*/
window.addEventListener("mouseout", () => {
    contentBox.setAttribute("contenteditable", false);
    chrome.tabs.query({
        windowId: myWindowId,
        active: true
    }, function(tabs) {
        let contentToStore = {};
            contentToStore[tabs[0].url] = contentBox.textContent;
            console.log("contentToStore value is: ", contentToStore);
            chrome.storage.local.set(contentToStore);
    });
});

/**
 * Update the sidebar's content.

1) Get the active tab in this sidebar's window.
2) Get its stored content.
3) Put it in the content box.
*/
function updateContent() {
    chrome.tabs.query({
        windowId: myWindowId,
        active: true
    }, function(tabs) {
        chrome.storage.local.get(null, function(result) {
            var dataMap = result[Object.keys(result)];
            contentBox.textContent = result[tabs[0].url];
        });

    });
}

/**
 * Update content when a new tab becomes active.
*/
chrome.tabs.onActivated.addListener(updateContent);

/**
 * Update content when a new page is loaded into a tab.
*/
chrome.tabs.onUpdated.addListener(updateContent);

/**
 * When the sidebar loads, get the ID of its window,
 * and update its content.
*/
chrome.windows.getCurrent(function(win) {
        // Should output an array of tab objects to your dev console.
        myWindowId = win.id;
        updateContent();
});
