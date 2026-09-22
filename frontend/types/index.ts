export interface Conversation {
  id: string;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface HealthStatus {
  status: string;
  version: string;
  services: ServiceStatus[];
}

export interface ServiceStatus {
  name: string;
  status: string;
  details: string | null;
}

export interface StorageInfo {
  total_gb: number;
  used_gb: number;
  free_gb: number;
  usage_percent: number;
  warning: boolean;
}

export interface SystemInfo {
  hostname: string;
  os: string;
  architecture: string;
  cpu_model: string;
  cpu_cores: number;
  ram_total_gb: number;
  ram_available_gb: number;
  storage: StorageInfo;
  lan_ip: string;
  version: string;
}

export interface ModelInfo {
  name: string;
  size: string;
  modified_at: string;
}

export interface ChatSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  theme: 'dark' | 'light' | 'system';
  autoScroll: boolean;
  compactMode: boolean;
}

export interface StreamEvent {
  type: 'token' | 'done' | 'error';
  content?: string;
  conversation_id?: string;
  message_id?: string;
  error?: string;
}
