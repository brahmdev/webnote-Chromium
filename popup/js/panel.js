var myWindowId;
const contentBox = document.querySelector("#content");
var isNoAudio = false;
var recorder;
var isRecording = false;
var bitsPerSecond = 0;
var isChrome = true; // used by RecordRTC

var enableTabCaptureAPI = false;

var enableScreen = true;
var enableMicrophone = false;
var enableCamera = false;
var cameraStream = false;

var enableSpeakers = true;

var videoCodec = 'Default';
var videoMaxFrameRates = '';

var isRecordingVOD = false;
var startedVODRecordedAt = (new Date).getTime();

var videoPlayers = [];
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
    if (isRecordingVOD) {
            stopVODRecording();
            return;
        }

        if (recorder && recorder.streams) {
            recorder.streams.forEach(function(stream, idx) {
                stream.getTracks().forEach(function(track) {
                    track.stop();
                });

                if (idx == 0 && typeof stream.onended === 'function') {
                    stream.onended();
                }
            });
            recorder.streams = null;
            return;
        }

        chrome.browserAction.setIcon({
            path: '../../icons/webnote.png'
        });

        if (enableTabCaptureAPI) {
            captureTabUsingTabCapture();
            return;
        }

        var screenSources = ['screen', 'window', 'audio'];

        if (enableSpeakers === false) {
            screenSources = ['screen', 'window'];
        }

    chrome.desktopCapture.chooseDesktopMedia(screenSources, onAccessApproved);
});


function onAccessApproved(chromeMediaSourceId, opts) {
    if (!chromeMediaSourceId || !chromeMediaSourceId.toString().length) {
        setDefaults();
        chrome.runtime.reload();
        return;
    }

    var constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: chromeMediaSourceId
            },
            optional: []
        }
    };

    if (videoMaxFrameRates && videoMaxFrameRates.toString().length) {
        videoMaxFrameRates = parseInt(videoMaxFrameRates);

        // 30 fps seems max-limit in Chrome?
        if (videoMaxFrameRates /* && videoMaxFrameRates <= 30 */ ) {
            constraints.video.maxFrameRate = videoMaxFrameRates;
        }
    }

    constraints.video.mandatory.maxWidth = 3840;
    constraints.video.mandatory.maxHeight = 2160;

    constraints.video.mandatory.minWidth = 3840;
    constraints.video.mandatory.minHeight = 2160;

    if (opts.canRequestAudioTrack === true) {
        constraints.audio = {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: chromeMediaSourceId,
                echoCancellation: true
            },
            optional: []
        };
    }

    navigator.webkitGetUserMedia(constraints, function(stream) {
        initVideoPlayer(stream);
        gotStream(stream);
    }, function(e) {console.log(e)});
}


function initVideoPlayer(stream) {
    var videoPlayer = document.createElement('video');
    videoPlayer.muted = !enableTabCaptureAPI;
    videoPlayer.volume = !!enableTabCaptureAPI;
    videoPlayer.src = URL.createObjectURL(stream);

    videoPlayer.play();

    videoPlayers.push(videoPlayer);
}
