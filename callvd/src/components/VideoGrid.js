import React from 'react';

const VideoGrid = ({ videoGridRef, myVideoRef }) => {
    return (
        <div className="videos_group" ref={videoGridRef}>
            <video ref={myVideoRef} autoPlay playsInline muted />
        </div>
    );
};

export default VideoGrid;
