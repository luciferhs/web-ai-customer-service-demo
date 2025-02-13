import React, { useState, useRef, useEffect } from 'react';
import './ChatWidget.css';

const ChatWidget = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [ws, setWs] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isOpen && !ws) {
            const websocket = new WebSocket('ws://localhost:8000/ws/chat');
            
            websocket.onopen = () => {
                console.log('Connected to chat server');
                // 添加欢迎消息
                setMessages(prev => [...prev, {
                    text: "您好！我是AI客服助手，请问有什么可以帮您？",
                    isUser: false
                }]);
            };
            
            websocket.onmessage = (event) => {
                const response = JSON.parse(event.data);
                setMessages(prev => [...prev, {
                    text: response.message,
                    isUser: false
                }]);
            };
            
            websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                setMessages(prev => [...prev, {
                    text: "连接出现问题，请刷新页面重试。",
                    isUser: false
                }]);
            };
            
            setWs(websocket);
        }
        
        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // 添加用户消息
        setMessages(prev => [...prev, {
            text: input,
            isUser: true
        }]);

        // 发送消息到服务器
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(input);
            setInput('');
        } else {
            setMessages(prev => [...prev, {
                text: "连接已断开，请刷新页面重试。",
                isUser: false
            }]);
        }
    };

    return (
        <div className="chat-widget">
            <button 
                className="chat-toggle"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? '关闭客服' : '在线客服'}
            </button>
            
            {isOpen && (
                <div className="chat-container">
                    <div className="chat-header">
                        <h3>AI客服助手</h3>
                    </div>
                    
                    <div className="messages-container">
                        {messages.map((msg, idx) => (
                            <div 
                                key={idx} 
                                className={`message ${msg.isUser ? 'user' : 'bot'}`}
                            >
                                {msg.text}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    <form onSubmit={handleSubmit} className="input-form">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="请输入您的问题..."
                        />
                        <button type="submit">发送</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
