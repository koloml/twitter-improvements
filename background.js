const requestMap = {
    image: saveImage,
    video: download_cobalt
}

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
    const f = requestMap[request.type];
    if (f) f(request.url, request.sourceURL, request.cobalt_url, sendResponse);
    return true;
});

chrome.contextMenus.create(
    {
        id: "save-image",
        title: "Save Image",
        contexts: ["image", "link"],
        documentUrlPatterns: ['https://x.com/*'],
        targetUrlPatterns: ['https://pbs.twimg.com/*']
    }
);

chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === "save-image") saveImage(getCorrespondingUrl(info), info.srcUrl);
});

function getCorrespondingUrl(info) {
    if (info.linkUrl == null) return info.pageUrl;
    else return info.linkUrl;
}

function download(url, name) {
    chrome.downloads.download({url: url, filename: name});
}

function saveImage(url, sourceURL) {
    download(sourceURL.replace(/name=[^&]*/, "name=orig"), getFileName(url) + "." + getImageFileType(sourceURL));
}

function getFileName(url) { // [twitter] <Username> - <Tweet ID> - <Number>
    url = url.split("/");
    let id = url[7];
    if (id == null) id = '';
    return "[twitter] " + url[3] + " - " + url[5] + " - " + id;
}

function getImageFileType(sourceURL) {
    return sourceURL.match(/format=(\w+)/)[1];
}

function getVideoFileType(url) {
    if (url.includes(".mp4")) return ".mp4";
    else return ".gif";
}

async function download_cobalt(url, count=0, cobalt_url, sendResponse) {
    const data = {
        vQuality: "max",
        filenamePattern: "nerdy",
        twitterGif: true,
        url: url
    }, requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
    };
    const filename = getFileName(url);
    try {
        const response = await fetch(cobalt_url, requestOptions);
        if (response.status === 200) {
            const json = await response.json();
            let picker = json.picker;
            if (!picker) picker = [{url: json.url}];
            let id = 1;
            for (const d of picker) {
                download(d.url, filename + id + getVideoFileType(d.url));
                ++id;
            }
            sendResponse({status: 'success'});
        } else {
            if (count < 5) setTimeout(() => download_cobalt(url, ++count), 100);
        }
    } finally {
        sendResponse({status: 'newpage', copy: filename});
        chrome.tabs.create({
            url: `https://cobalt.tools/#${url}`
        });
    }
}
