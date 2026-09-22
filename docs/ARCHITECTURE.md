# PiLLM Architecture

## System Overview

PiLLM is a private, local AI chat server designed specifically for the Raspberry Pi 5. It provides a web-based interface to interact with language models running locally via Ollama.

```ascii
+-------------------------------------------------------------+
|                        User Device                          |
|  (Laptop, Phone, Tablet on same Local Area Network)         |
|                                                             |
|  [ Web Browser ] <--- HTTP/WS ---> [ raspberrypi.local ]    |
+-------------------------------------------------------------+
                              |
                     (LAN Only - No Internet)
                              |
+-------------------------------------------------------------+
|                     Raspberry Pi 5                          |
|                                                             |
|  +-----------------+                +--------------------+  |
|  |     UFW Firewall|                |    Avahi (mDNS)    |  |
|  |  (Allows Port 80|                | (raspberrypi.local)|  |
|  |   from LAN only)|                +--------------------+  |
|  +-----------------+                                        |
|         |                                                   |
|  +-------------------------------------------------------+  |
|  |                     Nginx (Port 80)                   |  |
|  +-------------------------------------------------------+  |
|         |                                      |            |
|    (Reverse Proxy)                      (Reverse Proxy)     |
|         |                                      |            |
|  +---------------+                      +---------------+   |
|  |    Next.js    |                      |   FastAPI     |   |
|  | (127.0.0.1:3000|                     | (127.0.0.1:8000|   |
|  +---------------+                      +---------------+   |
|         |                                      |            |
|         |                                      |            |
|         |                               +---------------+   |
|         +-------------------------------| SQLite (Data) |   |
|                                         +---------------+   |
|                                                |            |
|                                         +---------------+   |
|                                         |    Ollama     |   |
|                                         |(127.0.0.1:11434|   |
|                                         +---------------+   |
+-------------------------------------------------------------+
```

## Network Topology (LAN Only)
PiLLM is strictly airgapped from the public internet. The UFW firewall ensures that traffic is only allowed from the local subnet (e.g., 192.168.1.0/24). The Ollama API is bound to `127.0.0.1` and is never exposed directly.

## Streaming Architecture
To provide a responsive UI, the system uses Server-Sent Events (SSE).
1. Next.js Client sends POST to Next.js API route.
2. Next.js API route sends POST to FastAPI.
3. FastAPI calls Ollama via HTTP streaming.
4. FastAPI streams tokens back to Next.js API route using SSE.
5. Nginx disables buffering for `/api/` to ensure tokens are sent immediately to the client.

## Component Responsibilities
- **Nginx**: Security headers, static file caching, streaming-friendly reverse proxy.
- **Next.js**: Frontend UI, markdown rendering, code highlighting, state management.
- **FastAPI**: Backend logic, database interaction, session management, Ollama proxying.
- **Ollama**: Local LLM execution engine.
- **SQLite**: Stores chat history, settings, and metadata.

## Database Schema
- **Conversations**: id, title, created_at, updated_at
- **Messages**: id, conversation_id, role, content, created_at
- **Settings**: key, value
