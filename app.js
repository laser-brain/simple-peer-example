const urlParams = new URLSearchParams(window.location.search);
const initiator = location.hash === '#1';

if (initiator) {
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then(gotMedia).catch((err) => {
    console.log(err);
  })
}
else {
  gotMedia();
}
function gotMedia(stream) {
  var peer = initiator ? new SimplePeer({
    initiator: initiator,
    stream: stream,
    trickle: false,
  }) : new SimplePeer();

  peer.on('signal', data => {
    console.log('SIGNAL', data)

    const dataDiv = document.querySelector('#data')
    if(!dataDiv.textContent)
      document.querySelector('#data').textContent = JSON.stringify(data)
  })

  document.querySelector('form').addEventListener('submit', ev => {
    ev.preventDefault()
    peer.signal(JSON.parse(document.querySelector('#connection-data').value))
  })

  document.querySelector('#disconnect').addEventListener('click', ev => {
    ev.preventDefault()
    peer.destroy();
    console.log('DISCONNECTED');
  })

  peer.on('connect', () => {
    console.log('CONNECTED');
  });

  peer.on('close', () => {
    console.log('DISCONNECTED');
    const videoElement = document.querySelector('video');
    if(videoElement) {
      videoElement.src = null;
      videoElement.pause();
    }
  });

  peer.on('stream', stream => {
    // got remote video stream, now let's show it in a video tag
    var video = document.querySelector('video')

    if ('srcObject' in video) {
      video.srcObject = stream
    } else {
      video.src = window.URL.createObjectURL(stream) // for older browsers
    }

    video.play()
  })
}