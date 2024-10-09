'use strict';

(async () => {
    const vx_button_path = "M 18.36 5.64 c -1.95 -1.96 -5.11 -1.96 -7.07 0 l -1.41 1.41 l -1.42 -1.41 l 1.42 -1.42 c 2.73 -2.73 7.16 -2.73 9.9 0 c 2.73 2.74 2.73 7.17 0 9.9 l -1.42 1.42 l -1.41 -1.42 l 1.41 -1.41 c 1.96 -1.96 1.96 -5.12 0 -7.07 z m -2.12 3.53 z m -12.02 0.71 l 1.42 -1.42 l 1.41 1.42 l -1.41 1.41 c -1.96 1.96 -1.96 5.12 0 7.07 c 1.95 1.96 5.11 1.96 7.07 0 l 1.41 -1.41 l 1.42 1.41 l -1.42 1.42 c -2.73 2.73 -7.16 2.73 -9.9 0 c -2.73 -2.74 -2.73 -7.17 0 -9.9 z m 1 5 l 1.2728 -1.2728 l 2.9698 1.2728 l -1.4142 -2.8284 l 1.2728 -1.2728 l 2.2627 6.2225 l -6.364 -2.1213 m 4.9497 -4.9497 l 3.182 1.0607 l 1.0607 3.182 l 1.2728 -1.2728 l -0.7071 -2.1213 l 2.1213 0.7071 l 1.2728 -1.2728 l -3.182 -1.0607 l -1.0607 -3.182 l -1.2728 1.2728 l 0.7071 2.1213 l -2.1213 -0.7071 l -1.2728 1.2728",
        download_button_path = "M 12 17.41 l -5.7 -5.7 l 1.41 -1.42 L 11 13.59 V 4 h 2 V 13.59 l 3.3 -3.3 l 1.41 1.42 L 12 17.41 zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z",
        Settings = await getSettings();

    // Fallbacks for when button cannot be found
    let fallbackButton;

    class Tweet { // Tweet functions
        static addVXButton(article) {
            try {
                article.setAttribute('usy', '');
                const a = Tweet.anchor(article);
                a.after(Button.newButton(a, vx_button_path, () => Tweet.vxButtonCallback(article)));
            } catch {article.removeAttribute('usy');}
        }

        static addVideoButton(videoComponent) {
            try {
                videoComponent.setAttribute('usy', '');
                const article = Tweet.nearestTweet(videoComponent), a = Tweet.anchor(article), quote_tweet = article.querySelector('div[id] > div[id]');
                if (!(quote_tweet != null && quote_tweet.contains(videoComponent)) && !article.querySelector('.usybuttonclickdiv[usy-video]')) {
                    a.after(Button.newButton(a, download_button_path, () => Tweet.videoButtonCallback(article), "usy-video"));
                }
            } catch {videoComponent.removeAttribute('usy')}
        }

        static anchor(article) {
            const anchor = article.querySelector('button[aria-label="Share post"]:not([usy])').parentElement.parentElement;
            if (!fallbackButton) fallbackButton = anchor;
            return anchor;
        }

        static anchorWithFallback(article) {
            try {return Tweet.anchor(article);} catch {return fallbackButton;}
        }

        static url(article) {
            for (const a of article.querySelectorAll('a')) if (a.querySelector('time')) return a.href.replace(/\/history$/, "");
            throw new TypeError("No URL Found");
        }

        static nearestTweet(elem) {
            let anchor;
            while (elem) {
                anchor = elem.querySelector('article');
                if (anchor) return anchor;
                elem = elem.parentElement;
            }
        }

        static vxButtonCallback(article) {
            try {navigator.clipboard.writeText(URL.vxIfy(Tweet.url(article))).then(() => {Notification.create('Copied URL to clipboard');});}
            catch {Notification.create('Failed to copy url, please report the issue along with the current url to twitter improvements');}
        }

        static videoButtonCallback(article) {
            Notification.create('Saving Tweet Video(s)');
            chrome.runtime.sendMessage({type: 'video', url: Tweet.url(article), cobalt_url: Settings.preference.cobalt_url}).then((r) => {
                if (r.status === 'success') Notification.create('Successfully Downloaded Video(s)');
                else {
                    navigator.clipboard.writeText(r.copy);
                    Notification.create('Copied file name to clipboard, use cobalt website to download or update cobalt API url');
                }
            });
        }
    }

    class Image { // Image element functions
        static addImageButton(image) {
            try {
                image.setAttribute('usy', '');
                image.after(Button.newButton(Tweet.anchorWithFallback(Tweet.nearestTweet(image)), download_button_path, (e) => Image.imageButtonCallback(e, image)));
            } catch {image.removeAttribute('usy')}
        }

        static respectiveURL(image) {
            let url;
            while (image) {
                url = image.href;
                if (url) return url;
                image = image.parentElement;
            }
            url = window.location.href;
            if (url.includes('/photo/')) return url;
        }

        static imageButtonCallback(e, image) {
            e.preventDefault();
            Notification.create('Saving Image');
            chrome.runtime.sendMessage({type: 'image', url: Image.respectiveURL(image), sourceURL: image.src});
        }
    }

    class URL { // URL modification functions
        static vxIfy(url) {
            return `https://${Settings.preference.url_prefix === 'vx' ? 'fixv' : 'fixup'}x.com/${url.substring(14)}`;
        }
    }

    class Button { // Button functions
        static newButton(shareButton, path, clickCallback, attribute) {
            shareButton = shareButton.cloneNode(true);
            shareButton.classList.add('usybuttonclickdiv');
            if (attribute != null) shareButton.setAttribute(attribute, "");
            shareButton.querySelector('button[aria-label="Share post"]').setAttribute('usy', '');
            shareButton.querySelector('path').setAttribute("d", path);
            const bc = shareButton.querySelector('button').firstElementChild;
            shareButton.addEventListener('mouseover', () => Button.onhover(bc));
            shareButton.addEventListener('mouseout', () => Button.stophover(bc));
            shareButton.addEventListener('click', clickCallback);
            return shareButton;
        }

        static onhover(bc) {
            bc.classList.add('r-1cvl2hr');
            bc.style.color = "";
            bc.firstElementChild.firstElementChild.classList.replace('r-1niwhzg', 'r-1peqgm7');
        }

        static stophover(bc) {
            bc.classList.remove('r-1cvl2hr');
            bc.style.color = "rgb(113, 118, 123)";
            bc.firstElementChild.firstElementChild.classList.replace('r-1peqgm7', 'r-1niwhzg');
        }

        static showHidden(b) {
            if (b.innerText === 'Show' || b.innerText === 'View') b.click();
        }
    }

    class Notification {
        static create(text) {
            document.querySelectorAll('div.usyNotificationOuter').forEach((e) => e.remove());
            const outer = document.createElement('div');
            const inner = document.createElement('div');
            outer.appendChild(inner);
            outer.classList.add('usyNotificationOuter');
            inner.classList.add('usyNotificationInner');
            inner.textContent = text;
            document.body.appendChild(outer);
            setTimeout(() => {
                inner.classList.add('usyFadeOut');
                inner.addEventListener('transitionend', () => {
                    outer.remove();
                });
            }, 5000);
        }
    }

    const observer = {
        observer: null,
        start: () => {
            if (Settings.tweetObservingEnabled()) { // Run the extension
                const observerSettings = {subtree: true, childList: true},
                    callbackMappings = {
                        vx_button: [{s: 'article:not([usy])', f: Tweet.addVXButton}],
                        video_button: [{s: 'div[data-testid="videoComponent"]:not([usy])', f: Tweet.addVideoButton}],
                        image_button: [{s: 'img[src*="https://pbs.twimg.com/media/"]:not([usy])', f: Image.addImageButton}],
                        show_hidden: [{s: 'button[type="button"]', f: Button.showHidden}],
                        hide_notifications: [{s: 'a[href="/notifications"]', style: true}],
                        hide_messages: [{s: 'a[href="/messages"]', style: true}],
                        hide_grok: [{s: 'a[href="/i/grok"]', style: true}],
                        hide_jobs: [{s: 'a[href="/jobs"]', style: true}],
                        hide_lists: [{s: 'a[href*="/lists"]', style: true}],
                        hide_communities: [{s: 'a[href*="/communities"]', style: true}],
                        hide_premium: [{s: 'a[href="/i/premium_sign_up"]', style: true}, {s: 'aside[aria-label="Subscribe to Premium"]', style: true}],
                        hide_verified_orgs: [{s: 'a[href="/i/verified-orgs-signup"]', style: true}],
                        hide_monetization: [{s: 'a[href="/settings/monetization"]', style: true}],
                        hide_ads_button: [{s: 'a[href*="https://ads.x.com"]', style: true}],
                        hide_whats_happening: [{s: 'div[aria-label="Timeline: Trending now"]', style: true}],
                        hide_who_to_follow: [{s: 'aside[aria-label="Who to follow"]', style: true}, {s: 'aside[aria-label="Relevant people"]', style: true}],
                    }, getCallback = () => {
                        const callbacks = [];
                        const style = {
                            style: '',
                            hideSelector: (selector) => style.style += `${selector} {display:none;}`,
                            applyStyle: () => {
                                if (style.style.length > 0) {
                                    const s = document.createElement('style');
                                    s.setAttribute('usyStyle', '');
                                    s.appendChild(document.createTextNode(style.style));
                                    document.head.appendChild(s);
                                }
                            }
                        }
                        for (const m in callbackMappings) if (Settings.setting[m]) for (const cb of callbackMappings[m]) {
                            if (cb.style) style.hideSelector(cb.s);
                            else callbacks.push(cb);
                        }
                        style.applyStyle();
                        for (const i of callbacks) for (const a of document.body.querySelectorAll(i.s)) i.f(a);
                        if (callbacks.length > 0) {
                            return (_, observer) => {
                                observer.disconnect();
                                for (const i of callbacks) for (const a of document.body.querySelectorAll(i.s)) i.f(a);
                                observer.observe(document.body, observerSettings);
                            }
                        }
                        return (_, observer) => observer.disconnect();
                    };
                this.observer = new MutationObserver(getCallback());
                this.observer.observe(document.body, observerSettings);
            }
        },
        stop: () => {
            if (this.observer != null) this.observer.disconnect();
        }
    }

    observer.start();

    chrome.storage.onChanged.addListener(async (_, namespace) => {
        if (namespace === 'local') {
            await Settings.loadSettings()
            observer.stop();
            document.querySelectorAll('style[usyStyle]').forEach((e) => e.remove());
            observer.start();
        }
    });

    async function getSettings() { // Setting handling
        class Settings {
            setting = {
                vx_button: true,
                video_button: !/Android/i.test(navigator.userAgent),
                image_button: !/Android/i.test(navigator.userAgent),
                show_hidden: false,
                hide_notifications: false,
                hide_messages: false,
                hide_grok: false,
                hide_jobs: false,
                hide_lists: false,
                hide_communities: false,
                hide_premium: false,
                hide_verified_orgs: false,
                hide_monetization: false,
                hide_ads_button: false,
                hide_whats_happening: false,
                hide_who_to_follow: false,
            }

            preference = {
                cobalt_url: 'https://api.cobalt.tools/api/json',
                url_prefix: 'vx'
            }

            tweetObservingEnabled() {
                for (const s in this.setting) if (this.setting[s]) return true;
            }

            async loadSettings() {
                const data = await Settings.getStorage();
                for (const s in this.setting) if (data[s] != null) this.setting[s] = data[s];
                for (const s in this.preference) if (data[s] != null) this.preference[s] = data[s];
            }

            static async getStorage() {
                return await chrome.storage.local.get();
            }
        }

        const set = new Settings();
        await set.loadSettings();
        return set;
    }
})();