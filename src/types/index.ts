// SecondMe 用户信息
export interface SecondMeUser {
  id: string;
  name: string;
  avatar: string;
  shades?: Shade[];
  softMemory?: SoftMemory;
}

export interface Shade {
  id: string;
  name: string;
  description?: string;
}

export interface SoftMemory {
  memories?: string[];
  preferences?: Record<string, any>;
}

// 剧本
export interface Script {
  id: string;
  title: string;
  description?: string;
  sourceEvent?: string;
  scriptType: string;
  difficulty: number;
  duration: number;
  background?: ScriptBackground;
  roles: Role[];
  scenes: Scene[];
  endings: Ending[];
  coverImage?: string;
}

export interface ScriptBackground {
  time: string;
  location: string;
  socialContext: string;
}

export interface Role {
  id: string;
  name: string;
  age: number;
  occupation: string;
  personality: string[];
  coreGoal: string;
  secret: string;
  initialState: string;
}

export interface Scene {
  id: string;
  name: string;
  location: string;
  participants: string[];
  mood: string;
  description?: string;
}

export interface Ending {
  id: string;
  name: string;
  triggerCondition: string;
  description: string;
}

// 房间
export interface Room {
  id: string;
  scriptId: string;
  script?: Script;
  status: 'waiting' | 'ready' | 'playing' | 'ended';
  members: RoomMember[];
  createdAt: string;
  updatedAt: string;
  currentUserId?: string;
}

export interface RoomMember {
  id: string;
  roomId: string;
  userId: string;
  user?: SecondMeUser;
  roleId?: string;
  roleName?: string;
  isReady: boolean;
  isDemo: boolean;
  joinedAt: string;
}

// 聊天消息
export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  roleName?: string;
  content: string;
  type: 'text' | 'action' | 'thought' | 'system';
  createdAt: string;
}

// OAuth Token
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}
