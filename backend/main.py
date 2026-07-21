import os
from typing import List, Literal, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_groq import ChatGroq

load_dotenv()

SYSTEM_PROMPT = (
    "You are a ai assistant. Ans always in short and easy word in (5 to 10 sentence)"
)

if not os.getenv("GROQ_API_KEY"):
    raise RuntimeError("Server not found")

model = ChatGroq(model="llama-3.1-8b-instant")

app = FastAPI(title="Chat API")

ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://novachat-psi-plum.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: Literal["user", "ai"]
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]


class ChatResponse(BaseModel):
    content: str


@app.get('/')
def health_check():
    return {"status" : "ok"}


@app.post('/chat')
def chat(request: ChatRequest):
    if not request.messages:
        raise HTTPException(status_code=400, details="messages must not be empty")

    lc_messages = [SystemMessage(content=SYSTEM_PROMPT)]
    for msg in request.messages:
        if msg.role == "user":
            lc_messages.append(HumanMessage(content=msg.content))
        else:
            lc_messages.append(AIMessage(content=msg.content))

    try:
        result = model.invoke(lc_messages)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Groq request failed: {exc}")


    return ChatResponse(
        content=result.content,
    )