import React, { useRef } from 'react';
import axios from 'axios';

function AdminPanel({ refreshLibrary }) {
  const fileInput = useRef(null);

  const handleUpload = async (e) => {
    const files = e.target.files || e.dataTransfer.files;
    const formData = new FormData();
    for (let file of files) {
      formData.append(file.type.startsWith('video/') ? 'video' : file.type === 'application/pdf' ? 'pdf' : 'text', file);
    }
    try {
      await axios.post('/content/upload', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      refreshLibrary();
      document.querySelector('.upload-panel').classList.remove('active');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal upload-panel">
      <h3>Upload Content</h3>
      <div
        className="drop-zone"
        onClick={() => fileInput.current.click()}
        onDragOver={e => {
          e.preventDefault();
          e.currentTarget.classList.add('dragover');
        }}
        onDragLeave={e => e.currentTarget.classList.remove('dragover')}
        onDrop={e => {
          e.preventDefault();
          e.currentTarget.classList.remove('dragover');
          handleUpload(e);
        }}
      >
        Drag & Drop Videos, PDFs, or Text Files
      </div>
      <input
        type="file"
        ref={fileInput}
        multiple
        accept="video/*,application/pdf,text/plain"
        onChange={handleUpload}
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default AdminPanel;