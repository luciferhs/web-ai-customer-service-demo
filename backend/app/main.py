from fastapi import FastAPI, WebSocket
from pydantic import BaseModel
from typing import List
import json
import asyncio
import os
from dotenv import load_dotenv
import aiohttp

# 加载环境变量
load_dotenv()

app = FastAPI()

# Deepseek API 配置
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

class Message(BaseModel):
    content: str
    role: str

class ChatService:
    def __init__(self):
        self.context_window = 5  # 保持最近5条对话作为上下文
        
    async def generate_response(self, 
                              query: str, 
                              conversation_history: List[Message]) -> str:
        # 构建提示词
        system_prompt = """你是一个专业的客服助手。
        请用专业、友善的语气回答用户问题。如果不确定，请诚实地表示。"""
        
        messages = [{"role": "system", "content": system_prompt}]
        
        # 添加对话历史
        for msg in conversation_history[-self.context_window:]:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
            
        # 添加当前问题
        messages.append({"role": "user", "content": query})
        
        try:
            # 调用 Deepseek API
            headers = {
                "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": "deepseek-chat",
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 500
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(DEEPSEEK_API_URL, headers=headers, json=data) as response:
                    response.raise_for_status()
                    response_data = await response.json()
                    return response_data['choices'][0]['message']['content']
            
        except Exception as e:
            print(f"Error generating response: {e}")
            return "抱歉，我现在遇到了一些问题。请稍后再试。"

chat_service = ChatService()

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    conversation_history = []
    
    try:
        while True:
            # 接收用户消息
            data = await websocket.receive_text()
            message = Message(content=data, role="user")
            conversation_history.append(message)
            
            # 生成回复
            response = await chat_service.generate_response(
                data, 
                conversation_history
            )
            
            # 保存助手回复到历史记录
            assistant_message = Message(content=response, role="assistant")
            conversation_history.append(assistant_message)
            
            # 发送回复
            await websocket.send_text(json.dumps({
                "message": response
            }))
            
    except Exception as e:
        print(f"Error: {e}")
        await websocket.close()

@app.get("/")
async def read_root():
    return {"message": "Welcome to AI Customer Service API"}
