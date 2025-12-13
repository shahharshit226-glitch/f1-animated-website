console.log("lets write some javascript")
let currentSong = new Audio();
let songs
let currFolder

// async function getSongs(folder) {
//   currFolder = folder

//   let a = await fetch(`http://127.0.0.1:5501/${currFolder}/ `)
//   let response = await a.text();
//   console.log(response)
//   let div = document.createElement("div")
//   div.innerHTML = response;
//   let as = div.getElementsByTagName("a")
//   console.log(as)

//   songs = []
//   for (let index = 0; index < as.length; index++) {
//     const element = as[index];
//     if (element.href.endsWith(".mp3")) {
//       songs.push(element.href.split(`/${folder}/`)[1])
//     }

//   }
//   // return songs

//    //show all songs to the playlist
//   let songUL = document.querySelector(".songlists").getElementsByTagName("ul")[0]
//   songUL.innerHTML = ""
//   for (const song of songs) {
//     songUL.innerHTML = songUL.innerHTML + `<li>
//               <img src="./svg/music.svg" alt="music" class="musicsvg">
//               <div class="info">
//                 <div>${song}</div>
//                 <div>Song Artist</div>
//               </div>
//               <div class="playnow">
//                 <span>Play Now</span>
//                 <img src="./svg/play.svg" alt="play">
//               </div>
              
//             </li>`;

//   }

// }
async function getSongs(folder) {
  currFolder = folder;

  // fetch info.json instead of folder
  let res = await fetch(`./${folder}/info.json`);
  let data = await res.json();

  songs = data.songs;

  let songUL = document.querySelector(".songlists ul");
  songUL.innerHTML = "";

  for (const song of songs) {
    songUL.innerHTML += `
      <li>
        <img src="./svg/music.svg" class="musicsvg">
        <div class="info">
          <div>${song}</div>
          <div>Song Artist</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img src="./svg/play.svg">
        </div>
      </li>
    `;
  }
}



function formatTime(seconds) {
  if(isNaN(seconds) || seconds<0){
    return "00:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  const formattedMins = mins.toString().padStart(2, '0');
  const formattedSecs = secs.toString().padStart(2, '0');

  return `${formattedMins}:${formattedSecs}`;
}


const playMusic = (track, pause = false) => {
  // let audio = new Audio("/songs/"+track)
  currentSong.src = `./${currFolder}/` + track
  play.src = "./svg/play.svg"
  if (!pause) {
    currentSong.play()
    play.src = "./svg/pause.svg"
  }
  // play.src="pause.svg"
  document.querySelector(".songinfo").innerHTML = decodeURI(track)
  document.querySelector(".songtime").innerHTML = "00:00/00:00"

 
}
async function main() {

  // let currentSong=new Audio();
  //get the list of new songs
  await getSongs("songs/ncs")
  playMusic(songs[0], true)
  console.log(songs)



  // ctrl +f =>search
  //attach an event listener to each songs

  Array.from(document.querySelector(".songlists").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", element => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML)
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
    })

  })
  //attach an event listener to play next and previous

  play.addEventListener("click", () => {
    if (currentSong.paused) {

      currentSong.play()

      play.src = "./svg/pause.svg"

    }

    else {

      currentSong.pause()

      play.src = "./svg/play.svg"

    }

  })
  //listen for time update function
  currentSong.addEventListener("timeupdate", () => {
    console.log(currentSong.currentTime, currentSong.duration)
    document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
  })

  //add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration) * percent) / 100

  })


  // add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"

  })

  //add an event listener to close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%"
  })

  //add eventlistener to previous  and next
  previous.addEventListener("click", () => {
    console.log("previous clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index !== -1 && index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    console.log("next clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index !== -1 && index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });


  //add an event to volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("input", (e) => {
    // console.log(e, e.target, e.target.value)/100
    console.log("setting volume to", e.target.value, "/100")
    currentSong.volume = parseInt(e.target.value) / 100


  })

  //load the playlist whenever the card is clicked
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      console.log(item.target, item.currentTarget.dataset)
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
      // item.dataset.folder 4:17:26

    })

  });

  //mute unmute button

  document.querySelector(".volume > img").addEventListener("click", e => {
        if (e.target.src.includes("./svg/volume.svg")) {
            e.target.src = e.target.src.replace("./svg/volume.svg", "./svg/mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("./svg/mute.svg", "./svg/volume.svg");
            currentSong.volume = 0.2;
            document.querySelector(".range input").value = 20;
        }
    });

}

main()

