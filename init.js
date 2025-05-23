const userid = config.userid;
let acts = [];

const getPfpUrl = (id, discrim, avatar) => {
    if(avatar && avatar !== null) {
        return `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`;
    }
    if(discrim && discrim !== null && discrim !== "0") {
        return `https://cdn.discordapp.com/embed/avatars/${parseInt(discrim) % 5}.png`;
    }
    return `https://cdn.discordapp.com/embed/avatars/${id.substr(id.length - 1)}.png`;
}

let title = "loading...";
let titlei = 1;
let wait = 0;

setInterval(() => {
  document.title = title.substring(0, titlei);

  if(titlei == title.length) {
    if(wait == 3) {
      titlei = 1;
      wait = 0;
    }
    wait++;
  } else {
    titlei++;
  }
}, 400)

const load = () => {
    // backdrop from config
    const root = document.querySelector(":root");
    root.style.setProperty("--backdrop-url", `url("${config.profile_backdrop_url}")`);
    root.style.setProperty("--website-background", `url("${config.website_background_url}")`);
    
    // init avatar in case it doesn't work
    const avaElem = document.getElementById("avatar");
    avaElem.src = getPfpUrl(userid, undefined, undefined);
    // set display name link
    const displayElem = document.getElementById("display");
    displayElem.href = `https://discord.com/users/${userid}`;
    console.log("Page init");
    
    lanyard({
        userId: userid,
        socket: true,
        onPresenceUpdate: update
    });
    console.log("Lanyard init");
}

const update = data => {
    acts = data.activities;
    console.log(data);
    draw(data);
}

const draw = data => {
    if(title === "loading...") {
        title = `${data.discord_user.display_name}'s Discord Status`;
        // Set favicon to user's avatar
        const faviconElem = document.getElementById("favicon");
        faviconElem.href = getPfpUrl(data.discord_user.id, data.discord_user.discrim, data.discord_user.avatar);
    }
    
    const displayNameElem = document.getElementById("display");
    displayNameElem.innerText = data.discord_user.global_name;

    const nameElem = document.getElementById("username");
    nameElem.innerText = data.discord_user.username;

    const statusElem = document.getElementById("status");
    const statusEmojiElem = document.getElementById("status-emoji");
    const statusTextElem = document.getElementById("status-text");
    
    const avaElem = document.getElementById("avatar");
    avaElem.src = getPfpUrl(data.discord_user.id, data.discord_user.discrim, data.discord_user.avatar);
    
    const userinfo = document.getElementById("margin");
    const actsWrapper = document.querySelector(".activities");
    let toRemove = [];
    actsWrapper.childNodes.forEach(node => {
        if(acts.filter(act => act.id == node).length === 0) toRemove.push(node);
    });
    toRemove.forEach(node => actsWrapper.removeChild(node));

    acts.forEach(act => {
        if(act.type === 4) {
            if(act.state || act.emoji) {
                statusTextElem.innerText = `${act.state ? act.state : ""}`;
                if(act.emoji) {
                    if(act.emoji.id) {
                        statusEmojiElem.src = `https://cdn.discordapp.com/emojis/${act.emoji.id}`;
                        statusEmojiElem.alt = " ";
                    } else {
                        statusEmojiElem.src = "";
                        statusEmojiElem.alt = act.emoji.name;
                    }
                }
            } else {
                statusElem.innerText = "";
            }
        } else {
            const isSpotify = act.id === "spotify:1" && data.spotify;

            // <div class="activity" id="00">
            const actElem = document.createElement("div");
            actElem.classList.add("activity");
            actElem.id = act.id;

            // <div class="act-images">
            const actImageWrapper = document.createElement("act-images");
            actImageWrapper.classList.add("act-images");
            
            // <img class="largeimage" draggable="false" width="64" height="64" src="" />
            const largeImageElem = document.createElement("img");
            largeImageElem.classList.add("largeimage");
            largeImageElem.draggable = false;
            largeImageElem.width = largeImageElem.height = 64;
            // spotify
            if(isSpotify) {
                largeImageElem.src = data.spotify.album_art_url;
            } else {
                if(act.assets) {
                    if(act.assets.large_image) {
                        let imageUrl;
                        if(act.assets.large_image.startsWith('mp:')) {
                            // Handle external images
                            imageUrl = act.assets.large_image.substring(3);
                        } else if (act.assets.large_image.startsWith('external/')) {
                            // Direct external URL
                            imageUrl = act.assets.large_image;
                        } else {
                            // Standard Discord CDN URL
                            imageUrl = `https://cdn.discordapp.com/app-assets/${act.application_id}/${act.assets.large_image}.png`;
                        }
                        largeImageElem.src = imageUrl;
                    }
                } else {
                    // Fallback to app icon
                    largeImageElem.src = `https://dcdn.dstn.to/app-icons/${act.application_id}`;
                    largeImageElem.onerror = () => {
                        // If the app icon fails, remove the image element
                        actImageWrapper.removeChild(largeImageElem);
                    };
                }
            }
            actImageWrapper.appendChild(largeImageElem);

            if(act.assets && act.assets.small_image) {
                const smallImageElem = document.createElement("img");
                smallImageElem.classList.add("smallimage");
                smallImageElem.draggable = false;
                smallImageElem.width = smallImageElem.height = 32;
                
                let imageUrl;
                if(act.assets.small_image.startsWith('mp:')) {
                    // Handle external images
                    imageUrl = act.assets.small_image.substring(3);
                } else if (act.assets.small_image.startsWith('external/')) {
                    // Direct external URL
                    imageUrl = act.assets.small_image;
                } else {
                    // Standard Discord CDN URL
                    imageUrl = `https://cdn.discordapp.com/app-assets/${act.application_id}/${act.assets.small_image}.png`;
                }
                smallImageElem.src = imageUrl;
                actImageWrapper.appendChild(smallImageElem);
            }

            // add class="act-images" to class="activity"
            actElem.appendChild(actImageWrapper);

            // <span class="act-name">placeholder name</span>
            const nameSpan = document.createElement("span");
            nameSpan.classList.add("act-name");
            // <span class="act-details">placeholder details</span>
            const detailsSpan = document.createElement("span");
            detailsSpan.classList.add("act-details");
            // <span class="act-state">placeholder state</span>
            const stateSpan = document.createElement("span");
            stateSpan.classList.add("act-state");
            
            if(isSpotify) {
                nameSpan.innerText = `${data.spotify.song}`;
                detailsSpan.innerText = `on ${data.spotify.album}`;
                stateSpan.innerText = `by ${data.spotify.artist}`;
            } else {
                nameSpan.innerText = act.name ? act.name : "";
                if(act.timestamps) {
                    const start = act.timestamps.start;
                    const exp_time = Math.floor(Date.now() / 1000);
                    const diff = (exp_time * 1000) - start;
                    const timestamp = formatTime(diff);
                    detailsSpan.innerText = act.details ? act.details : timestamp;
                    stateSpan.innerText = act.state ? act.state : "";
                }
            }
            
            actElem.appendChild(nameSpan);
            actElem.appendChild(detailsSpan);
            actElem.appendChild(stateSpan);

            // add class="activity" to activities
            actsWrapper.appendChild(actElem);
        }
    });

    userinfo.style.marginBottom = actsWrapper.children.length === 0 ? "0" : "1em";
}

const formatTime = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    const hours = Math.floor((ms / 1000 / 3600) % 60);

    if(hours > 0) {
        return `for ${hours} hour(s)`;
    }
    if(minutes > 0) {
        return `for ${minutes} minute(s)`;
    }
    if(seconds > 0) {
        return `for ${seconds} second(s)`;
    }
}

// start the websocket to automatically fetch the new details on presence update
window.addEventListener("load", load);










