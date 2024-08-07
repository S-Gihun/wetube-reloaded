const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const volumnRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");
const playBtnIcon = playBtn.querySelector("i");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const muteBtnIcon = muteBtn.querySelector("i");

let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;

const handlePlayClick = (event) => {
    if(video.paused) {
        video.play();
    } else {
        video.pause()
    }
    playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
}
const handleMuteClick = (event) => {
    if(video.muted){
        video.muted = false;
    } else {
        video.muted = true;
        volumnRange
    }
    muteBtnIcon.classList = video.muted
    ? "fas fa-volume-mute"
    : "fas fa-volume-up";
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

const formatTime = (seconds) => {
    return new Date(seconds * 1000).toISOString().substring(14, 19)
}

const handleLoadedMetadata = () => {
    totalTime.innerText = formatTime(Math.floor(video.duration));
    timeline.max = Math.floor(video.duration);
}

const handleTimeUpdate = () => {
    currentTime.innerText = formatTime(Math.floor(video.currentTime));
    timeline.value = Math.floor(video.currentTime);
}

const handleTimelineChange = (event) => {
    const {target: {value}}= event;
    video.currentTime = value;
}

const handleFullScreen = (event) => {
    const fullscreen = document.fullscreenElement; // fullscreen인 video가 있는 지 확인 없으면 null 반환
    if(fullscreen){
        document.exitFullscreen();
        fullScreenIcon.classList = "fas fa-expand";
    } else{
        videoContainer.requestFullscreen();
        fullScreenIcon.classList = "fas fa-compress";
    }
}

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () => { 
    if(controlsTimeout){
        clearTimeout(controlsTimeout);
        controlsTimeout = null;
    }
    if(controlsMovementTimeout){
        clearTimeout(controlsMovementTimeout);
        controlsMovementTimeout = null;
    }
    videoControls.classList.add("showing");
    controlsMovementTimeout = setTimeout(hideControls, 3000);
}

const handleMouseLeave = () => {
    controlsTimeout = setTimeout(hideControls, 3000);

}

const handelKeyDown = (event) => {
    const { key } = event;
    if(key === " " && event.target.id !== "textarea"){
        handlePlayClick();
        event.preventDefault();
    }
    if ((key === "F" || key === "f") && event.target.id !== "textarea"){
        handleFullScreen();
        
    }
}

const hanldeVideoClickPlay = () => {
    handlePlayClick();
}

const handleEnded = () => {
    const { id } = videoContainer.dataset;
    fetch(`/api/videos/${id}/view`, {
        method: "POST",
    });
}

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumnRange.addEventListener("input", handelVolumeChange);
video.addEventListener("timeupdate", handleTimeUpdate);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullScreen);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
video.addEventListener("ended", handleEnded);

document.addEventListener("keydown", handelKeyDown);
video.addEventListener("click", hanldeVideoClickPlay);

video.addEventListener("loadedmetadata", () => {
    if(video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA){
        handleLoadedMetadata();
    }
});