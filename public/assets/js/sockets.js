var videoData;
var setTime = false;
var socket;
async function init() {
    try {
        console.log('Creating Socket')
        socket = await io(location.hostname+":"+location.port);
        console.log('Socket Created');
        socket.on('youShouldGetAVideo', async function (data) {
            requestNewVideo();
        });
    } catch (error) {
        throw error;
    }
}

function updateVideoTime() {
    if (!setTime) {
        var vidLength = player.getDuration();
        console.log(vidLength);
        player.seekTo(vidLength - videoData.TTL);
        setTime = true;
    }
}

function requestNewVideo() {
    var YouTubeID = window.location.pathname.replace("/watch/", '');
    socket.emit("iWantAVideo", YouTubeID, async (response) => {
        videoData = response;
        console.log(`Got Video: ${JSON.stringify(response)}`);
        console.log(`Telling YouTube player to play ${response.videoID}`)
        player.loadVideoById(response.videoID, 0, "large");
    });
}