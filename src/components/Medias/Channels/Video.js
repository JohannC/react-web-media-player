import React, { Component } from 'react';
import { connect } from 'react-redux';
import { isIE } from '../../../services/Utils';
const FLOAT_IMPRECISION = 0.1;

class Video extends Component {

    isPlaying = () => {
        return !this.video.paused;
    }

    getCurrentTime = () => this.video.currentTime;

    load = () => {
        this.video.load();
    };

    play = () => {
        if (!this.isPlaying()) {
            let playPromise = this.video.play();
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    // Automatic playback started!
                }).catch(_ => {
                    // Auto-play was prevented
                });
            }
        }
    }

    changeTime = (time) => {
        this.video.currentTime = time;
    };

    pause = () => {
        if (this.isPlaying()) this.video.pause();
    };

    stop = () => {
        if (this.isPlaying()) this.video.pause();
        this.video.currentTime = this.props.duration;
    };

    timeRangeBuffered = (time) => {
        for (let i = 0; i < this.video.buffered.length; i++) {
            let portionStartTime = this.video.buffered.start(i);
            let portionEndTime = this.video.buffered.end(i);
            if (time >= portionStartTime && time <= portionEndTime) {
                return portionEndTime
            }
        }
        return time;
    };

    displayVideo = () => {
        let width, height;
        if (this.props.isFullscreenActivated) {
            width = window.screen.width;
            height = window.screen.height;
        } else {
            width = this.props.width;
            height = this.props.height;
        }
        this.video.width = width;
        this.video.height = height;
    };

    setVolume = (volume) => {
        this.video.volume = volume;
    };

    mute = () => {
        this.video.muted = true;
    }

    unMute = () => {
        this.video.muted = false;
    }

    getDuration = () => {
        return this.video.duration;
    }

    handleWaiting = () => {
        if (!isIE() && this.video.currentTime < (this.video.duration - FLOAT_IMPRECISION))
            this.props.dispatch({ type: 'VIDEO_IS_NOT_READY' });
    }

    handleCanPlayThrough = () => {
        this.props.dispatch({ type: 'VIDEO_IS_READY' });
    }

    handleLoadedMetaData = () => {
        let duration = this.video.duration;
        this.props.dispatch({ type: 'UPDATE_DURATION', payload: { duration: duration } });
        this.props.dispatch({ type: 'UPDATE_VIDEO_WIDTH', payload: { videoWidth: this.video.videoWidth } });
        this.props.dispatch({ type: 'UPDATE_VIDEO_HEIGHT', payload: { videoHeight: this.video.videoHeight } });
    }

    handleSeeking = () => {
        if (isIE() && (this.video.currentTime < (this.video.duration - FLOAT_IMPRECISION) && Math.round(this.video.currentTime*100)/100 !== 0))
            this.props.dispatch({ type: 'VIDEO_IS_NOT_READY' });
    }

    handleSeeked = () => {
        if (isIE())
            this.props.dispatch({ type: 'VIDEO_IS_READY' });
    }

    handlePlay = () => {
        if (isIE()){
            this.props.dispatch({ type: 'VIDEO_IS_READY' });
        }
    }

    adaptImageToWidth = (width, ) => {
        return {
            marginTop: (this.props.fullscreenHeight - this.props.videoHeight / this.props.videoWidth * this.props.fullscreenWidth) / 2,
            width: width,
            height: (this.props.videoHeight / this.props.videoWidth * this.props.fullscreenWidth),
        }
    };

    adaptImageToHeight = (height) => {
        return {
            marginLeft: (this.props.fullscreenWidth - this.props.videoWidth / this.props.videoHeight * this.props.fullscreenHeight) / 2,
            height: height,
            width: (this.props.videoWidth / this.props.videoHeight * this.props.fullscreenHeight),
        }
    };

    componentDidMount = () => {
        if(this.props.muted)
            this.mute();
    }

    shouldComponentUpdate = (nextProps) => {
        //player props changed
        if (this.props.initTime !== nextProps.initTime) this.load();
        return true;
    }

    render = () => {
        let dimensions;
        if (this.props.isFullscreenActivated) {
            if (this.props.videoWidth >= this.props.videoHeight) {
                if (this.props.videoHeight / this.props.videoWidth * this.props.fullscreenWidth <= this.props.fullscreenHeight) {
                    dimensions = this.adaptImageToWidth(this.props.fullscreenWidth);
                } else {
                    dimensions = this.adaptImageToHeight(this.props.fullscreenHeight);
                }
            } else {
                if (this.props.videoHeight / this.props.videoWidth * this.props.fullscreenWidth <= this.props.fullscreenHeight) {
                    dimensions = this.adaptImageToWidth(this.props.fullscreenWidth);
                } else {
                    dimensions = this.adaptImageToHeight(this.props.fullscreenHeight);
                }
            }
        } else {
            dimensions = {
                width: this.props.width,
                height: this.props.height,
            }
        }
        return (

            <video
                width={dimensions.width}
                style={{ marginLeft: dimensions.marginLeft, marginTop: dimensions.marginTop }}
                ref={video => (this.video = video)}
                height={dimensions.height}
                onLoadedMetadata={this.handleLoadedMetaData}
                onWaiting={this.handleWaiting}
                onCanPlayThrough={this.handleCanPlayThrough}
                onSeeked={this.handleSeeked}
                onSeeking={this.handleSeeking}
                onPlay={this.handlePlay}
                onEnded={this.handleEnded}
            >
                <source src={this.props.video} />
            </video>
        );
    }
}

const mapStateToProps = (state: IState) => {
    return {
        isPlaying: state.isPlaying,
        fullscreenWidth: window.innerWidth,
        fullscreenHeight: window.innerHeight,
        videoHeight: state.videoHeight,
        videoWidth: state.videoWidth,
        isFullscreenActivated: state.isFullscreenActivated,
        duration: state.duration,
        video: state.video,
        width: state.width,
        height: state.height,
        isReadingTerminated: state.isReadingTerminated,
        muted: state.muted,
        initTime: state.initTime
    };
};

export default connect(mapStateToProps, null, null, { forwardRef: true })(Video);