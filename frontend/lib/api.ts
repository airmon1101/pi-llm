import { Conversation, HealthStatus, Message, ModelInfo, StorageInfo, SystemInfo } from '@/types';

class ApiClient {
  private async fetch<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`);
    }
    return res.json();
  }

  async getHealth(): Promise<HealthStatus> {
    return this.fetch<HealthStatus>('/api/health');
  }

  async getModels(): Promise<{ models: ModelInfo[] }> {
    return this.fetch<{ models: ModelInfo[] }>('/api/models');
  }

  async getChats(): Promise<{ conversations: Conversation[] }> {
    return this.fetch<{ conversations: Conversation[] }>('/api/chats');
  }

  async createChat(title?: string, model?: string): Promise<Conversation> {
    return this.fetch<Conversation>('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, model }),
    });
  }

  async getChat(id: string): Promise<Conversation> {
    return this.fetch<Conversation>(`/api/chats/${id}`);
  }

  async updateChat(id: string, title: string): Promise<Conversation> {
    return this.fetch<Conversation>(`/api/chats/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
  }

  async deleteChat(id: string): Promise<void> {
    await fetch(`/api/chats/${id}`, { method: 'DELETE' });
  }

  async getMessages(chatId: string): Promise<{ messages: Message[] }> {
    return this.fetch<{ messages: Message[] }>(`/api/chats/${chatId}/messages`);
  }

  async sendMessage(
    body: {
      conversation_id: string;
      message: string;
      model?: string;
      temperature?: number;
      max_tokens?: number;
      system_prompt?: string;
    },
    signal?: AbortSignal
  ): Promise<Response> {
    return fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
  }

  async stopGeneration(conversationId: string): Promise<void> {
    await fetch('/api/chat/stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation_id: conversationId }),
    });
  }

  async getSystemInfo(): Promise<SystemInfo> {
    return this.fetch<SystemInfo>('/api/system/info');
  }

  async getStorage(): Promise<StorageInfo> {
    return this.fetch<StorageInfo>('/api/system/storage');
  }
}

export const api = new ApiClient();
