
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: GroundingSource[];
  isSearching?: boolean;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AuditDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  content?: string;
  uploadDate: Date;
}

export interface AuditObservation {
  title: string;
  description: string;
  reference: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  accountingStandard: string;
}

export interface AuditExperience {
  id: string;
  section: string;
  querySummary: string;
  technicalLearning: string;
  timestamp: number;
  importance: number; // 1-5 scale
}

export interface ChatSession {
  id: string;
  title: string;
  section: string;
  messages: Message[];
  lastUpdate: number;
}

// Added missing AuthUser interface for CommandRoster personnel tracking
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  picture: string;
  lastLogin: number;
}
