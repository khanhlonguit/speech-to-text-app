import React from 'react';
import './App.css';
import SpeechToText from './components/SpeechToText';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Ứng dụng Speech to Text</h1>
      </header>
      <main>
        <SpeechToText />
      </main>
    </div>
  );
}

export default App;
