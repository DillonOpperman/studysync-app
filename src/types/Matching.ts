// src/types/Matching.ts
export interface MatchRecommendation {
  id: number;
  title: string;
  matchPercentage: number | null;
  memberInfo: string;
  schedule: string;
  focus: string;
  location: string;
  action: string;
  suggested: boolean;
  explanation: string;
  compatibility: {
    subject: number;
    schedule: number;
    learningStyle: number;
    performance: number;
  };
}

export interface StudyGroup {
  id: string;
  title: string;
  subject: string;
  description: string;
  schedule: string;
  location: string;
  maxMembers: number;
  currentMembers: number;
  members: GroupMember[];
  leader: string;
  createdAt: string;
  meetingTimes: string[];
}

export interface GroupMember {
  id: string;
  name: string;
  major: string;
  role: 'leader' | 'member';
}

export interface JoinedGroup {
  group: StudyGroup;
  joinedAt: string;
  status: 'active' | 'pending' | 'archived';
}