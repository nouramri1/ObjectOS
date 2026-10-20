const startButton = document.getElementById("startCamera");
const stopBotton = document.getElementById("stopCamera");
const statusText = document.getElementById("status");
const video = document.getElementById("video");

let cameraStream = null;
let requestId = 0;

function stopCamera(){
    requestId += 1;

    if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        cameraStream = null;
    }

    video.srcObject = null;
    startButton.disabled = false;
    stopButton.disabled = true;
    statusText.textContent = "Camera off.";
}
async function startCamera(){
    const currentRequest = ++requestId;

  startButton.disabled = true;
  stopButton.disabled = false;
  statusText.textContent = "Requesting camera access...";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    // Release the camera if Stop was clicked while access was pending.
    if (currentRequest !== requestId) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    cameraStream = stream;
    video.srcObject = stream;
    await video.play();

    if (currentRequest !== requestId) return;

    statusText.textContent = "Camera on. Place your mug in view.";
  } catch (error) {
    if (currentRequest !== requestId) return;

    stopCamera();

    if (error.name === "NotAllowedError") {
      statusText.textContent =
        "Camera access was blocked. We may need a separate permission page.";
    } else if (error.name === "NotFoundError") {
      statusText.textContent = "No camera was found.";
    } else if (error.name === "NotReadableError") {
      statusText.textContent =
        "Camera unavailable. Close other camera apps and try again.";
    } else {
      statusText.textContent = `Could not start camera: ${error.message}`;
    }

    console.error(error);
  }
}
startButton.addEventListener("click", startCamera);
stopButton.addEventListener("click", stopCamera);

window.addEventListener("pagehide", stopCamera);