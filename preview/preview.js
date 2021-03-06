var video = document.querySelector('video');
var fname = document.querySelector('#file-name');
var fsize = document.querySelector('#file-size');
// var fduration = document.querySelector('#file-duration');
var header = document.querySelector('header');
var title = document.querySelector('title');
var header = document.querySelector('header');

function setVideoWidth() {
    video.style.cursor = 'pointer';
    video.style.marginTop = header.clientHeight;
    video.style.height = innerHeight - header.clientHeight;
}

window.onresize = setVideoWidth;

var file;

function onGettingFile(f) {
    file = f;

    if (!file) {
        header.querySelector('p').innerHTML = 'There is no recording present yet.';
        header.querySelector('span').innerHTML = '';
        return;
    }

    video.src = URL.createObjectURL(file);
    fname.innerHTML = fname.download = title.innerHTML = file.name;
    fname.href = video.src;
    fsize.innerHTML = bytesToSize(file.size);
    // fduration.innerHTML = file.duration || '00:00';

    setVideoWidth();
    video.onclick = function() {
        video.onclick = null;
        video.style.cursor = '';
        video.play();
    };
}
DiskStorage.GetRecentFile(onGettingFile);

var btnRecordingsListDropDown = document.querySelector('#btn-recordings-list-dropdown');
document.querySelector('#btn-recordings-list').onclick = function(e) {
    e.stopPropagation();

    if (btnRecordingsListDropDown.className === 'visible') {
        btnRecordingsListDropDown.className = '';
        btnRecordingsListDropDown.innerHTML = '';
    } else {
        btnRecordingsListDropDown.className = 'visible';

        btnRecordingsListDropDown.innerHTML = '';
        DiskStorage.GetFilesList(function(fileNames) {
            if (!fileNames.length) {
                btnRecordingsListDropDown.className = '';
                alert('You have no recordings.');
                return;
            }

            fileNames.forEach(function(fName) {
                var div = document.createElement('div');
                div.innerHTML = '<img src="images/delete.png" class="delete-icon">' + fName;
                btnRecordingsListDropDown.appendChild(div);

                div.querySelector('.delete-icon').onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!window.confirm('Are you sure you want to permanently delete the selected recording?')) {
                        return;
                    }

                    DiskStorage.RemoveFile(fName, function() {
                        location.reload();
                    });
                };

                div.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    DiskStorage.Fetch(fName, function(file) {
                        onGettingFile(file);
                    });

                    document.body.onclick();
                };
            });
        });
    }
};

document.body.onclick = function() {
    if (btnRecordingsListDropDown.className === 'visible') {
        btnRecordingsListDropDown.className = '';
    }
};
