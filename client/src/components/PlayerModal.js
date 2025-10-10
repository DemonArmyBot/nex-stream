import React, { useEffect, useRef, useState } from 'react';
import { Viewer, Worker, AnnotationLayer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import Hls from 'hls.js';

function PlayerModal({ item, onClose }) {
  const videoRef = useRef(null);
  const viewerRef = useRef(null);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState({ text: '', page: 1 });

  useEffect(() => {
    if (item.type === 'video') {
      viewerRef.current.style.display = 'none';
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
    } else if (item.type === 'pdf') {
      videoRef.current.style.display = 'none';
      viewerRef.current.style.display = 'block';
    }
    return () => videoRef.current?.pause();
  }, [item]);

  const handleAnnotationSubmit = () => {
    setAnnotations([...annotations, { ...newAnnotation, id: Date.now() }]);
    setNewAnnotation({ text: '', page: 1 });
    // Extend with backend save if needed
  };

  return (
    <div className="player-modal active">
      <div className="player-container">
        <button className="close-player" onClick={onClose}>&times;</button>
        <video
          ref={videoRef}
          className="video-player"
          controls
        />
        <div ref={viewerRef} className="pdf-viewer" style={{ display: 'none' }}>
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer
              fileUrl={item.url}
              plugins={[defaultLayoutPluginInstance]}
              renderAnnotationLayer={props => <AnnotationLayer {...props} />}
              renderPage={props => (
                <div>
                  {props.canvasLayer.children}
                  {annotations
                    .filter(a => a.page === props.pageIndex + 1)
                    .map(a => (
                      <div key={a.id} style={{ position: 'absolute', left: '10px', top: '10px', background: 'yellow', padding: '5px' }}>
                        {a.text}
                      </div>
                    ))}
                </div>
              )}
            />
          </Worker>
          <div>
            <input
              type="number"
              value={newAnnotation.page}
              onChange={e => setNewAnnotation({ ...newAnnotation, page: parseInt(e.target.value) })}
              min="1"
            />
            <input
              type="text"
              value={newAnnotation.text}
              onChange={e => setNewAnnotation({ ...newAnnotation, text: e.target.value })}
              placeholder="Annotation text"
            />
            <button onClick={handleAnnotationSubmit}>Add Annotation</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerModal;