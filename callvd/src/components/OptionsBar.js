import React from 'react';

const OptionsBar = ({ myVideoStream }) => {
    const muteUnmute = () => {
        const enabled = myVideoStream.getAudioTracks()[0].enabled;
        myVideoStream.getAudioTracks()[0].enabled = !enabled;
        console.log(enabled ? "Áudio desativado" : "Áudio ativado");
    };

    const playStop = () => {
        const enabled = myVideoStream.getVideoTracks()[0].enabled;
        myVideoStream.getVideoTracks()[0].enabled = !enabled;
        console.log(enabled ? "Vídeo desativado" : "Vídeo ativado");
    };

    const handleDisconnect = () => {
        window.location.href = "https://www.google.com";
    };

    return (
        <div className="options">
            <div className="options_left">
                <div onClick={playStop} className="options_button">
                    <i className="fa fa-video-camera"></i>
                </div>
                <div onClick={muteUnmute} className="options_button">
                    <i className="fa fa-microphone"></i>
                </div>
                <div onClick={handleDisconnect} className="options_button background_red">
                    <i className="fa fa-phone"></i>
                </div>
            </div>
        </div>
    );
};

export default OptionsBar;
