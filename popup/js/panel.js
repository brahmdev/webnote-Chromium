var myWindowId;
var screenShotImage;
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
            console.log("in updatecontent: ", result, " : ", result[tabs[0].url]);
            //console.log(result[tabs[0].url].note);
            if(result[tabs[0].url] !== undefined) {
                contentBox.textContent = result[tabs[0].url].note;
            } else {
                contentBox.textContent = '';
            }
            if(result[tabs[0].url] !== undefined && result[tabs[0].url].screenShot !== undefined && result[tabs[0].url].screenShot !== '') {
                var oImg = document.createElement("img");
                oImg.setAttribute('src', result[tabs[0].url].screenShot);
                oImg.setAttribute('alt', 'capture-1');
                oImg.setAttribute('height', '80px');
                oImg.setAttribute('width', '80px');
                oImg.setAttribute('style', 'margin:10px; border: 1px solid #ccc;');

                var screenShotAttachment = document.getElementById("screenShotAttachment");
                while (screenShotAttachment.firstChild) {
                    screenShotAttachment.removeChild(screenShotAttachment.firstChild);
                }
                screenShotAttachment.appendChild(oImg);    
            }
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
    chrome.tabs.query({
        windowId: myWindowId,
        active: true
    }, function(tabs) {
        screenShotImage = image;

        var oImg = document.createElement("img");
        oImg.setAttribute('src', screenShotImage);
        oImg.setAttribute('alt', 'capture-1');
        oImg.setAttribute('height', '80px');
        oImg.setAttribute('width', '80px');
        oImg.setAttribute('style', 'margin:10px; border: 1px solid #ccc;');

        var screenShotAttachment = document.getElementById("screenShotAttachment");
        while (screenShotAttachment.firstChild) {
            screenShotAttachment.removeChild(screenShotAttachment.firstChild);
        }
        screenShotAttachment.appendChild(oImg); 
    });// You can add that image HTML5 canvas, or Element.
    
  });
});
$( "#saveData" ).click(function() {
    chrome.tabs.query({
        windowId: myWindowId,
        active: true
    }, function(tabs) {
      
        chrome.storage.local.get(null, function(result) {
            let contentToStore = {};
            let content = {};
            content.note = contentBox.textContent;
            content.screenShot = screenShotImage;
            contentToStore[tabs[0].url] = content;
           // delete result[tabs[0].url];
            chrome.storage.local.set(contentToStore);
        });

        chrome.storage.local.get(null, function(result) {
            console.log(result);
        });
        
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

//DiskStorage.GetRecentFile(onGettingFile);

function onGettingFile(f) {
    file = f;

    if (!file) {
        header.querySelector('p').innerHTML = 'There is no recording present yet.';
        header.querySelector('span').innerHTML = '';
        return;
    }

    var recordingLink = document.createElement("a");
    recordingLink.setAttribute('download', file.download);
    recordingLink.setAttribute('innerHTML', file.name);
    recordingLink.setAttribute('href', URL.createObjectURL(file));
    debugger;
    document.getElementById("recordings").appendChild(recordingLink);
}