import { useState } from 'react';
import { useOrangeWebSocket } from './hooks/useOrangeWebSocket';
import './App.css';

function App() {
  const { isConnected, messages, sendMessage } = useOrangeWebSocket(34567);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Orange Desktop</h1>
      <div style={{ marginBottom: '10px' }}>
        Status: <span style={{ color: isConnected ? 'green' : 'red' }}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      
      <div style={{ 
        border: '1px solid #ccc', 
        padding: '10px', 
        height: '300px', 
        overflowY: 'auto',
        marginBottom: '10px',
        whiteSpace: 'pre-wrap'
      }}>
        {messages || 'No messages yet...'}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          style={{ flex: 1, padding: '5px' }}
          placeholder="Type a message..."
        />
        <button onClick={handleSend} disabled={!isConnected}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
