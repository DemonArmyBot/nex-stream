import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPanel({ refreshLibrary }) {
  const [mode, setMode] = useState('upload');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('video');
  const [textContent, setTextContent] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [contentList, setContentList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editThumbnail, setEditThumbnail] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      setUploadStatus('Uploading...');
      const data = textContent ? { textContent, thumbnail, category } : { url, title, thumbnail, category, type };
      const res = await axios.post('/content/upload', data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUploadStatus('Upload successful!');
      refreshLibrary();
      setUrl('');
      setTitle('');
      setThumbnail('');
      setCategory('');
      setTextContent('');
      setTimeout(() => document.querySelector('.upload-panel').classList.remove('active'), 1000);
    } catch (err) {
      setUploadStatus(`Upload failed: ${err.response?.data?.error || 'Server error'}`);
    }
  };

  const handleEdit = async () => {
    try {
      await axios.put(`/content/${editId}`, { title: editTitle, thumbnail: editThumbnail }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      refreshLibrary();
      setEditId(null);
      setEditTitle('');
      setEditThumbnail('');
    } catch (err) {
      console.error('Edit error:', err);
    }
  };

  useEffect(() => {
    axios.get('/content/library', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => setContentList(res.data));
  }, []);

  return (
    <div className="modal upload-panel">
      <h3>Admin Panel</h3>
      <div className="tabs">
        <button onClick={() => setMode('upload')}>Upload</button>
        <button onClick={() => setMode('edit')}>Edit</button>
      </div>
      {mode === 'upload' && (
        <form onSubmit={handleUpload}>
          <label>
            <input type="radio" checked={!textContent} onChange={() => setTextContent('')} />
            Single Link
          </label>
          <label>
            <input type="radio" checked={!!textContent} onChange={() => setTextContent('')} />
            Text File Content
          </label>
          {!textContent ? (
            <>
              <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
              <input placeholder="URL" value={url} onChange={e => setUrl(e.target.value)} required />
              <select value={type} onChange={e => setType(e.target.value)}>
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
              </select>
            </>
          ) : (
            <textarea placeholder="Enter [Title] : URL per line" value={textContent} onChange={e => setTextContent(e.target.value)} />
          )}
          <input placeholder="Thumbnail URL" value={thumbnail} onChange={e => setThumbnail(e.target.value)} />
          <input placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
          <button type="submit">Upload</button>
        </form>
      )}
      {mode === 'edit' && (
        <div>
          <ul>
            {contentList.map(item => (
              <li key={item._id}>
                {editId === item._id ? (
                  <>
                    <input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="New Title" />
                    <input value={editThumbnail} onChange={e => setEditThumbnail(e.target.value)} placeholder="New Thumbnail URL" />
                    <button onClick={handleEdit}>Save</button>
                    <button onClick={() => setEditId(null)}>Cancel</button>
                  </>
                ) : (
                  <div>
                    {item.title} ({item.type})
                    <button onClick={() => { setEditId(item._id); setEditTitle(item.title); setEditThumbnail(item.thumbnail); }}>Edit</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {uploadStatus && <p style={{ color: uploadStatus.includes('failed') ? 'red' : 'green' }}>{uploadStatus}</p>}
    </div>
  );
}

export default AdminPanel;