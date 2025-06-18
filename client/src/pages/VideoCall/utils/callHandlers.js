export const handleJoinCall = async (callId) => {
  try {
    // Request both audio and video permissions
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    });

    // Check if screen sharing is supported
    if (navigator.mediaDevices.getDisplayMedia) {
      // Screen sharing is available
      console.log('Screen sharing is supported');
    }

    return {
      stream,
      error: null
    };
  } catch (err) {
    console.error('Error accessing media devices:', err);
    return {
      stream: null,
      error: {
        message: err.message,
        name: err.name
      }
    };
  }
};

export const handleLeaveCall = (stream, callback) => {
  try {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
    }
    if (callback) callback();
  } catch (err) {
    console.error('Error leaving call:', err);
  }
};

export const handleScreenShare = async () => {
  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: "always"
      },
      audio: false
    });

    return {
      stream: screenStream,
      error: null
    };
  } catch (err) {
    console.error('Error sharing screen:', err);
    return {
      stream: null,
      error: {
        message: err.message,
        name: err.name
      }
    };
  }
};

export const handleToggleAudio = (stream, enabled) => {
  if (stream) {
    stream.getAudioTracks().forEach(track => {
      track.enabled = enabled;
    });
  }
};

export const handleToggleVideo = (stream, enabled) => {
  if (stream) {
    stream.getVideoTracks().forEach(track => {
      track.enabled = enabled;
    });
  }
};