
export enum MessageSender {
  USER = 'USER',
  SQUAD_MATE = 'SQUAD_MATE',
  HQ = 'HQ',
  SYSTEM = 'SYSTEM'
}

export interface Message {
  id: string;
  sender: MessageSender;
  callsign: string;
  text: string;
  timestamp: string; // Zulu Time
  tactical: boolean;
  priority?: 'LOW' | 'MED' | 'HIGH' | 'CRITICAL';
}

export interface MissionStatus {
  id: string;
  objective: string;
  location: string;
  threatLevel: string;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'ON_HOLD';
  operatives: string[];
}

export interface IntelligenceReport {
  timestamp: string;
  content: string;
  source: string;
}
