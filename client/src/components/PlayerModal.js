import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { pdfjs } from 'pdfjs-dist';

function PlayerModal({ item, onClose }) {
  const videoRef = useRef(null);
  const pdfRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfScale, setPdfScale] = useState(1.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [annotation, setAnnotation] = useState(''); // Basic annotation

  useEffect(() => {
    if (item.type === 'video') {
      pdfRef.current.style.display = 'none';
      videoRef.current.style.display = 'block';
      if (item.url.endsWith('.m3u8') && Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(item.url);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => videoRef.current.play());
        return () => hls.destroy();
      } else {
        videoRef.current.src = item.url;
        videoRef.current.play();
      }
      videoRef.current.addEventListener('timeupdate', () => {
        setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
        setCurrentTime(formatTime(videoRef.current.currentTime));
        setDuration(formatTime(videoRef.current.duration));
      });
    } else if (item.type === 'pdf') {
      videoRef.current.style.display = 'none';
      pdfRef.current.style.display = 'block';
      pdfjs.getDocument(item.url).promise.then(doc => {
        setPdfDoc(doc);
        renderPdfPage(1);
      });
    }
    return () => {
      if (videoRef.current) videoRef.current.pause();
    };
  }, [item]);

  const renderPdfPage = (num) => {
    if (!pdfDoc) return;
    pdfDoc.getPage(num).then(page => {
      const viewport = page.getViewport({ scale: pdfScale });
      const canvas = pdfRef.current.querySelector('canvas');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      page.render({ canvasContext: canvas.getContext('2d'), viewport });
    });
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const saveAnnotation = () => {
    // Placeholder for annotation saving (extend with MongoDB call)
    console.log('Annotation saved:', annotation);
  };

  return (
    <div className="player-modal active">
      <div className="player-container">
        <button className="close-player" onClick={onClose}>&times;</button>
        <video
          ref={videoRef}
          className="video-player"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        <div ref={pdfRef} className="pdf-viewer">
          <canvas />
        </div>
        {item.type === 'video' && (
          <div className="controls">
            <button
              className="control-button"
              onClick={() => {
                if (isPlaying) videoRef.current.pause();
                else videoRef.current.play();
              }}
            >
              <span className="material-icons">{isPlaying ? 'pause' : 'play_arrow'}</span>
            </button>
            <div className="progress-container" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              videoRef.current.currentTime = percent * videoRef.current.duration;
            }}>
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="time-display">{currentTime} / {duration}</div>
            <button className="control-button" onClick={() => videoRef.current.requestPictureInPicture()}>
              <span className="material-icons">picture_in_picture_alt</span>
            </button>
            <button className="control-button" onClick={() => videoRef.current.requestFullscreen()}>
              <span className="material-icons">fullscreen</span>
            </button>
          </div>
        )}
        {item.type === 'pdf' && (
          <div className="pdf-toolbar">
            <button onClick={() => { setPdfScale(s => s + 0.25); renderPdfPage(pdfPage); }}>Zoom In</button>
            <button onClick={() => { setPdfScale(s => Math.max(1, s - 0.25)); renderPdfPage(pdfPage); }}>Zoom Out</button>
            <button onClick={() => { setPdfPage(p => Math.max(1, p - 1)); renderPdfPage(Math.max(1, pdfPage - 1)); }}>Prev Page</button>
            <button onClick={() => { setPdfPage(p => Math.min(pdfDoc.numPages, p + 1)); renderPdfPage(Math.min(pdfDoc.numPages, pdfPage + 1)); }}>Next Page</button>
            <button onClick={() => window.open(item.url, '_blank')}>Download</button>
            <input
              type="text"
              placeholder="Add annotation"
              value={annotation}
              onChange={(e) => setAnnotation(e.target.value)}
            />
            <button onClick={saveAnnotation}>Save Annotation</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerModal;