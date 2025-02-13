import React from 'react';
import ChatWidget from './components/ChatWidget/ChatWidget';

function App() {
  return (
    <div className="App">
      <h1>欢迎访问我们的网站</h1>
      <p>这是一个示例页面，AI客服小部件将显示在右下角。</p>
      <ChatWidget />
    </div>
  );
}

export default App;
