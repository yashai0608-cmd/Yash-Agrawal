
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
