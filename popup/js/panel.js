var myWindowId;
const contentBox = document.querySelector("#content");
var runtimePort = chrome.runtime.connect({
    name: location.href.replace(/\/|:|#|\?|\$|\^|%|\.|`|~|!|\+|@|\[|\||]|\|*. /g, '').split('\n').join('').split('\r').join('')
});

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


$( "#addScreenShot" ).click(function() {
  chrome.tabs.captureVisibleTab(null, {}, function (image) {
     // You can add that image HTML5 canvas, or Element.
     var oImg = document.createElement("img");
     oImg.setAttribute('src', image);
     oImg.setAttribute('alt', 'capture-1');
     oImg.setAttribute('height', '80px');
     oImg.setAttribute('width', '80px');
     oImg.setAttribute('style', 'margin:10px; border: 1px solid #ccc;');

     var screenShotAttachment = document.getElementById("screenShotAttachment");
     screenShotAttachment.appendChild(oImg);
  });
});

$( "#addRecording" ).click(function() {
chrome.storage.sync.set({
        enableTabCaptureAPI: 'false',
        enableMicrophone: 'false',
        enableCamera: 'false',
        enableScreen: 'true', // TRUE
        isRecording: 'true', // TRUE
        enableSpeakers: 'true' // TRUE
    }, function() {
        runtimePort.postMessage({
            messageFromContentScript1234: true,
            startRecording: true
        });
    });

});
