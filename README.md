# Improvements for Twitter
<h1><img src="https://github.com/usyless/twitter-improvements/blob/main/src/icons/icon.svg?raw=true" alt="logo" width="64" height="64"> Improvements for Twitter</h1>

A simple web extension which brings a few quality of life features to twitter/X.  

**Screenshots available on the Mozilla addons page**

## Features

- Copy as VX/FX/Custom Button
	- Each tweet will display a button to copy the link to the tweet directly using VXTwitter, FXTwitter, or a custom prefix to allow for better embedding when sending on other platforms.
- Image Save Button
	- Shows a download button in the top left corner of each image, which saves the image in the highest quality available and with a file name that can lead you back to the original tweet.
- Image Download History
	- Can keep track of downloaded files, and even prevent you from re-saving them if enabled!
	- Can import previously downloaded files to keep track, and export downloaded files list to re-import
- Video Download Button
	- Displays next to the Copy as VX button on each tweet with a video or a gif, and clicking it allows you to save all media in that tweet with the same good naming scheme!
    - Downloads videos locally with a fallback to opening them in a cobalt.tools tab if it fails.
- Auto unspoiler hidden media
	- For if twitter once again introduces forced spoilers
- Hide various unnecessary buttons or tabs (such as premium, verified orgs, etc.)
- **All of the above are togglable with the extensions settings**
- Saved Image/Video Reversing
	- Allows you to upload any image or video saved by this extension and retrieve the original tweet it was saved from.
- Save Image Context Menu
	- A right click context menu for all images on Twitter to save them, just like with the button

## Installation

- **Firefox Desktop/Mobile (or Fennec)**
	- Install extension through the [Mozilla addons page](https://addons.mozilla.org/en-GB/firefox/addon/improvements-for-twitter/)
- **Chrome or other chromium based browsers**
	- Download the "Chromium" ZIP from the [latest release](https://github.com/usyless/twitter-improvements/releases/latest)
	- Unzip it into a known directory
	- Visit chrome://extensions in your browser
	- Enable developer mode (There should be a toggle present on the page)
	- Press "Load Unpacked" or equivalent, select the unzipped folder
