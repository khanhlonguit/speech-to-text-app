import React, { useState, useRef } from 'react';
import './SpeechToText.css';

function SpeechToText() {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const [savedToExcel, setSavedToExcel] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setError('');
    setTranscript('');
    setProgress('');
    setSavedToExcel(false);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Vui lòng chọn một file audio');
      return;
    }

    setIsLoading(true);
    setError('');
    setProgress('Đang tải file lên...');
    setSavedToExcel(false);
    const formData = new FormData();
    formData.append('audio', file);

    try {
      setProgress('Đang xử lý audio...');
      const response = await fetch('http://localhost:3001/transcribe', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Lỗi khi gửi yêu cầu');
      }
      const data = await response.json();
      setTranscript(data.transcription);
      setProgress('Hoàn thành!');
      setSavedToExcel(true);
    } catch (error) {
      console.error('Lỗi:', error);
      setError('Đã xảy ra lỗi khi xử lý audio. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="speech-to-text-container">
      <h2 className="title">Chuyển đổi Audio thành Văn bản</h2>
      <div className="button-container">
        <div className="file-input" onClick={handleFileInputClick}>
          <span className="file-input-icon">📁</span>
          {file ? file.name : 'Chọn file audio (WAV, MP3, M4A)'}
          <input
            ref={fileInputRef}
            type="file"
            accept=".wav,.mp3,.m4a"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
        <button className="action-button" onClick={handleUpload} disabled={isLoading || !file}>
          {isLoading ? 'Đang xử lý...' : 'Tải lên và Chuyển đổi'}
        </button>
      </div>
      {error && <p className="error-message">{error}</p>}
      {progress && <p className="progress-message">{progress}</p>}
      {savedToExcel && <p className="success-message">Transcript đã được lưu vào file Excel!</p>}
      <div className="text-container">
        <div className="text-box">
          <h3>Văn bản được chuyển đổi:</h3>
          <p>{transcript || 'Văn bản sẽ xuất hiện ở đây...'}</p>
        </div>
      </div>
    </div>
  );
}

export default SpeechToText;
