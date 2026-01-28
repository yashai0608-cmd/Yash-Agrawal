
import { AuditExperience, ChatSession, AuthUser } from './types.ts';

const EXPERIENCE_KEY = 'auditros_experience_base';
const HISTORY_KEY = 'auditros_chat_history';
const REGISTRY_KEY = 'auditros_user_registry';
const CURRENT_USER_KEY = 'auditros_current_user';

export class AuditExperienceStore {
  static saveExperience(exp: AuditExperience) {
    const history = this.getAll();
    history.push(exp);
    const trimmed = history
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 50);
    localStorage.setItem(EXPERIENCE_KEY, JSON.stringify(trimmed));
  }

  static getAll(): AuditExperience[] {
    const data = localStorage.getItem(EXPERIENCE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static getRelevantContext(currentSection: string): string {
    const all = this.getAll();
    const relevant = all
      .filter(e => e.section === currentSection)
      .slice(0, 5)
      .map(e => `[PREVIOUS LEARNING]: ${e.technicalLearning}`)
      .join('\n');
    
    return relevant ? `INSTITUTIONAL MEMORY FEED:\n${relevant}` : "";
  }
}

export class ChatHistoryStore {
  static saveSession(session: ChatSession) {
    const sessions = this.getAll();
    const index = sessions.findIndex(s => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions));
  }

  static getAll(): ChatSession[] {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    try {
      const parsed = JSON.parse(data);
      return parsed.sort((a: ChatSession, b: ChatSession) => b.lastUpdate - a.lastUpdate);
    } catch {
      return [];
    }
  }

  static deleteSession(id: string) {
    const sessions = this.getAll().filter(s => s.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions));
  }
}

export class UserRegistryStore {
  static getRegistry(): AuthUser[] {
    const data = localStorage.getItem(REGISTRY_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveUser(user: AuthUser) {
    // Save to the global registry (In-house DB simulation)
    const registry = this.getRegistry();
    const index = registry.findIndex(u => u.email === user.email);
    const updatedUser = { ...user, lastLogin: Date.now() };
    
    if (index >= 0) {
      registry[index] = updatedUser;
    } else {
      registry.push(updatedUser);
    }
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
    
    // Set current active session
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  }

  static getCurrentUser(): AuthUser | null {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  static logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}
