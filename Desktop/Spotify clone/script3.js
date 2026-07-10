console.log("Let's write some JavaScript");

// =======================
// Global Variables
// =======================
let currentSong = new Audio();
let songs;
let currFolder;
let currentIndex = 0;

// =======================
// Fetch Songs for a Folder
// =======================
async function getSongs(folder) {
    currFolder = folder;

    // Fetch folder listing
    let res = await fetch(`http://127.0.0.1:5501/${currFolder}/`);
    let response = await res.text();
    console.log(response);

    // Parse HTML
    let div = document.createElement("div");
    div.innerHTML = response;
    let links = div.getElementsByTagName("a");
    console.log(links);

    // Extract .mp3 files
    songs = [];
    for (let link of links) {
        if (link.href.endsWith(".mp3")) {
            songs.push(link.href.split(`/${folder}/`)[1]);
        }
    }

    // Display playlist
    let songUL = document.querySelector(".songlists ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `
            <li>
                <img src="music.svg" alt="music" class="musicsvg">
                <div class="info">
                    <div>${song}</div>
                    <div>Song Artist</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img src="play.svg" alt="play">
                </div>
            </li>`;
    }

    return songs;
}

// =======================
// Format Time MM:SS
// =======================
function formatTime(seconds) {
    if(isNaN(seconds) || seconds<0){
        return "00:00"
    }
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

// =======================
// Play a Track
// =======================
function playMusic(track, pause = false) {
    currentIndex = songs.indexOf(track);
    currentSong.src = `/${currFolder}/` + track;
    play.src = "play.svg";

    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayalbums() {
    let res = await fetch(`http://127.0.0.1:5501/songs/`);
    let response = await res.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");
    let albumsContainer = document.querySelector(".albums");
    albumsContainer.innerHTML = ""; // clear old albums

    for (let e of anchors) {
        if (e.href.includes("/songs/") && !e.href.endsWith("/songs/")) {
            let folder = e.href.split("/").slice(-2)[0];

            // Try to get album info.json (optional)
            let info = { title: folder, description: "Unknown album", cover: "music.svg" };
            try {
                let resInfo = await fetch(`http://127.0.0.1:5501/songs/${folder}/info.json`);
                if (resInfo.ok) {
                    info = await resInfo.json();
                }
            } catch (err) {
                console.warn(`No info.json found for ${folder}`);
            }

            // Create album card
            let card = document.createElement("div");
            card.classList.add("card");
            card.dataset.folder = folder;
            card.innerHTML = `
                <div class="cardimg">
                    <img src="/songs/${folder}/${info.cover}" alt="${info.title}" style="width:100%; height:100%; object-fit:contain;">
                </div>
                <div class="cardinfo">
                    <h3>${info.title}</h3>
                    <p>${info.description}</p>
                </div>
            `;
            albumsContainer.appendChild(card);
        }
    }

    // Add click event to each card
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async item => {
            let folderName = item.currentTarget.dataset.folder;
            console.log("Album clicked:", folderName);
            songs = await getSongs(`songs/${folderName}`);
            playMusic(songs[0], true);
        });
    });
}



// =======================
// Main Function
// =======================
async function main() {
    // Load initial playlist
    await getSongs("songs/ncs");
    playMusic(songs[0], true);
    console.log(songs);

    //display all the albums on the page
     displayalbums();


    // Click to play a song from playlist
    Array.from(document.querySelectorAll(".songlists li")).forEach(li => {
        li.addEventListener("click", () => {
            const trackName = li.querySelector(".info div").innerHTML.trim();
            playMusic(trackName);
        });
    });

    // Play/Pause button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    // Update time and seek bar
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seek bar click
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Hamburger menu toggle
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    });

    // Previous/Next buttons
    previous.addEventListener("click", () => {
        if (currentIndex > 0) {
            playMusic(songs[currentIndex - 1]);
        }
    });

    next.addEventListener("click", () => {
        if (currentIndex < songs.length - 1) {
            playMusic(songs[currentIndex + 1]);
        }
    });

    // Volume control
    document.querySelector(".range input").addEventListener("input", e => {
        currentSong.volume = parseInt(e.target.value) / 100;
        console.log("Volume set to", e.target.value, "/100");
    });

    // Album card click → Load songs
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async item => {
            let folderName = item.currentTarget.dataset.folder;
            console.log("Album clicked:", folderName);
            songs = await getSongs(`songs/${folderName}`);

        });
    });

    // Mute/Unmute button
    document.querySelector(".volume > img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.2;
            document.querySelector(".range input").value = 20;
        }
    });
}

// Run the app
main();
