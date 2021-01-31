const video = $('#video');
const videoControls = $('#video-controls');
const playButton = $('#play');
const playbackControlButtons = document.querySelectorAll('.playback-icons use');
const timeElapsed = $('#time-elapsed');
const duration = $('#duration');
const progressBar = $('#progress-bar');
const seek = $('#seek');
const seekTooltip = $('#seek-tooltip');
const volume = $('#volume');
const volumeButton = $('#volume-button');
const volumeIcons = document.querySelectorAll('.volume-button use');
const volumeMute = $('use[href="#volume-mute"]');
const volumeLow = $('use[href="#volume-low"]');
const volumeHigh = $('use[href="#volume-high"]');
const playbackAnimation = $('#playback-animation');
const fullscreenButton = $('#fullscreen-button');
const videoContainer = $('#video-container');
const fullscreenIcons = fullscreenButton.querySelectorAll('use');
const pipButton = $('#pip-button');

// **** CHeck whether browser supports video tag

const videoSupports = !! video.canPlayType;

if(videoSupports){
    video.controls = false;
    videoControls.classList.remove('hidden');
}

// **** ALL events ***** 
document.addEventListener('DOMContentLoaded', () => {
    if (!('pictureInPictureEnabled' in document)) {
        pipButton.classList.add('hidden');
    }
})
playButton.addEventListener('click', playVideo);
video.addEventListener('click', playVideo);
video.addEventListener('click', animatePlayback);
video.addEventListener('play' , updateControlButton);
video.addEventListener('pause' , updateControlButton);
video.addEventListener('loadedmetadata', initializeVideo);
video.addEventListener('timeupdate', initializeTimeElapsed);
video.addEventListener('timeupdate', updateProgress);
seek.addEventListener('mousemove', updateSeekTooltip);
seek.addEventListener('input', skipAhead);
volume.addEventListener('input', updateVolume);
video.addEventListener('volumechange', updateVolumeButton);
volumeButton.addEventListener('click', toggleMute);
fullscreenButton.onclick =  toggleFullscreen;
videoContainer.onfullscreenchange = updateFullscreenButton;
pipButton.addEventListener('click', togglePip);
video.addEventListener('mouseenter', showControls);
video.addEventListener('mouseleave', hideControls);
videoControls.addEventListener('mouseenter', showControls);
videoControls.addEventListener('mouseleave', hideControls);
document.addEventListener('keypress', keyboardShortcuts);

// document.addEventListener('fullscreenchange', updateFullscreenButton);



// volumeButton.addEventListener('click',)


/**
 * 
 * @param {String} query 
 * @returns {document}
 */
function $(query){
    return document.querySelector(query);
}

function updateControlButton() {
    playbackControlButtons.forEach(b => b.classList.toggle('hidden'));

    if(video.paused){
        playButton.setAttribute('data-title', 'Play (k)');
        return;
    }

    playButton.setAttribute('data-title', 'Pause (k)')
}

function initializeVideo() {
    const { minutes:min, seconds:sec} = formatTime(video.duration);
    const max = Math.round(video.duration);

    progressBar.setAttribute('max', max);
    seek.setAttribute('max', max);

    duration.textContent = `${min}:${sec}`;
    duration.setAttribute('datetime' ,`${min}m:${sec}s` );
}

function formatTime(timeInSeconds) {
    const result = new Date(timeInSeconds * 1000).toISOString().substr(11, 8);
  
    return {
      minutes: result.substr(3, 2),
      seconds: result.substr(6, 2),
    };
};

function initializeTimeElapsed() {
    const { minutes:min, seconds:sec} = formatTime(video.currentTime)

    timeElapsed.textContent = `${min}:${sec}`;
    timeElapsed.setAttribute('datetime' ,`${min}m:${sec}s` );
}

function updateProgress() {
    seek.value = Math.round(video.currentTime);
    progressBar.value = Math.round(video.currentTime);
}

function playVideo() {
    if(video.paused || video.ended){
        video.play();
        return;
    }

    video.pause();
}
function updateSeekTooltip (event) {
    const skipTo = Math.round((event.offsetX / event.target.clientWidth) * parseInt(event.target.getAttribute('max'), 10));
    seek.setAttribute('data-seek', skipTo);
    const {minutes: min, seconds: sec} = formatTime(skipTo);

    seekTooltip.textContent = `${min}:${sec}`;
    const rect = video.getBoundingClientRect();
    seekTooltip.style.left = `${event.pageX - rect.left}px`;

}

function skipAhead (event) {
    const skipTo = event.target.dataset.seek ? event.target.dataset.seek : event.target.value;
    video.currentTime = skipTo;
    progressBar.value = skipTo;
    seek.value = skipTo;
}

function updateVolume() {
    if(video.muted) {
        video.muted = false;
    }
    video.volume = volume.value;
}

function updateVolumeButton() {
    volumeIcons.forEach(i => i.classList.add('hidden'));

    volumeButton.setAttribute('data-title', 'Mute (m)');

    if(video.muted || video.volume === 0){
        volumeMute.classList.remove('hidden');
        volumeButton.setAttribute('data-title', 'Unmute (m)');

    }else if(video.volume <= 0.5 && video.volume > 0){
        volumeLow.classList.remove('hidden');
    }else{
        volumeHigh.classList.remove('hidden');
    }   
}

function toggleMute() {
    video.muted = !video.muted;
  
    if (video.muted) {
      volume.setAttribute('data-volume', volume.value);
      volume.value = 0;
    } else {
      volume.value = volume.dataset.volume;
    }
  }

function animatePlayback() {
    playbackAnimation.animate([
        {
            opacity: 1,
            transform: "scale(1)"
        },
        {
            opacity: 0,
            transform: "scale(1.5)"
        }
    ], {
        duration: 600,
        easing: "ease-out"
    })
}

function toggleFullscreen () {
    if(document.fullscreenElement){
        document.exitFullscreen();
    }else if(document.webkitFullscreenElement){
        // Need this to support Safari
        document.webkitExitFullscreen();
    }
    else if(videoContainer.requestFullscreen){
        videoContainer.requestFullscreen();

    }else{
        // Need this to support Safari
        videoContainer.webkitRequestFullscreen();
    }
}

function updateFullscreenButton() {
    fullscreenIcons.forEach(icon => icon.classList.toggle('hidden'));
    
    console.log(fullscreenIcons);
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      fullscreenButton.setAttribute('data-title', 'Exit full screen (f)')
    } else {
      fullscreenButton.setAttribute('data-title', 'Full screen (f)')
    }
}

async function togglePip () {
    try {
        if( video !== document.pictureInPictureElement){
            pipButton.disabled = true;
            await video.requestPictureInPicture();
        } else {
            await document.exitPictureInPicture();
        }
    }catch(err) {
        console.log(err);
    }
    finally{
        pipButton.disabled = false;
    }
}

function hideControls () {
    if(video.paused){
        return;
    }

    videoControls.classList.add('hidden');
}

function showControls () {
    videoControls.classList.remove('hidden');
}

function keyboardShortcuts (event) {
    const {key} = event;
    switch(key) {
        case 'k':
            playVideo();
            animatePlayback();

            if(video.muted){
                showControls();
            } else {
                setTimeout(() => hideControls(), 2000)
            }
        case 'm':
            toggleFullscreen();
            break;
        case 'p':
            togglePip();
            break;
        case 'f':
            toggleFullscreen();
            break;
    }
}