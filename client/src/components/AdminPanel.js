import React, { useRef, useState } from 'react';
import axios from 'axios';

function AdminPanel({ refreshLibrary }) {
  const fileInput = useRef(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleUpload = async (e) => {
    const files = e.target.files || e.dataTransfer.files;
    if (!files.length) {
      setUploadStatus('No files selected');
      return;
    }

    const formData = new FormData();
    for (let file of files) {
      formData.append(file.type.startsWith('video/') ? 'video' : file.type === 'application/pdf' ? 'pdf' : 'text', file);
    }
    try {
      setUploadStatus('Uploading...');
      await axios.post('/content/upload', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUploadStatus('Upload successful!');
      refreshLibrary();
      document.querySelector('.upload-panel').classList.remove('active');
    } catch (err) {
      setUploadStatus(`Upload failed: ${err.response?.data?.error || 'Server error'}`);
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
      {uploadStatus && <p style={{ color: uploadStatus.includes('failed') ? 'red' : 'green' }}>{uploadStatus}</p>}
    </div>
  );
}

export default AdminPanel;