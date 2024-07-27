const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const time = document.getElementById("time");
const volumnRange = document.getElementById("volume");

let volumeValue = 0.5;
video.volume = volumeValue;

const handlePlayClick = (event) => {
    if(video.paused) {
        video.play();
    } else {
        video.pause()
    }
    playBtn.innerText = video.paused ? "Play" : "Paused";
}
const handleMuteClick = (event) => {
    if(video.muted){
        video.muted = false;
    } else {
        video.muted = true;
        volumnRange
    }
    muteBtn.innerText = video.muted ? "Unmute" : "Mute";
    volumnRange.value = video.muted ? 0 : volumeValue;
}
const handelVolumeChange = (event) => {
    const { target: {value }} = event;
    if(video.muted) {
        video.muted = false;
        muteBtn.innerText="Mute";
    }
    volumeValue = value;
    video.volume = value;
}

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumnRange.addEventListener("input", handelVolumeChange);