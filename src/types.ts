export type NodeStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  status: NodeStatus;
  parentId: string | null; // If null, it is a main step. If set, it's a subnode of that parent.
  checklist: ChecklistItem[];
  createdAt: string;
  dueDate?: string; // Optional deadline date string (YYYY-MM-DD)
}

export interface RoadmapPath {
  id: string;
  title: string;
  description: string;
  color: string; // e.g., 'indigo', 'emerald', 'amber', 'rose', 'sky'
  nodes: RoadmapNode[]; // Contains both main nodes (parentId is null) and subnodes
  dueDate?: string; // Optional deadline date string (YYYY-MM-DD)
}

export interface Program {
  id: string;
  title: string;
  description: string;
  paths: RoadmapPath[];
  createdAt: string;
  dueDate?: string; // Optional deadline date string (YYYY-MM-DD)
}

export interface Challenge {
  id: string;
  title: string;
  durationDays: number;
  completedDays: number[]; // list of days (e.g., [1, 2, 3, 15] for a 30-day challenge)
  createdAt: string;
}

export type AppTheme = 'cyber-gradient' | 'forest-zen' | 'sunset-glow' | 'royal-classic' | 'midnight-deep' | 'light-emerald' | 'light-royal' | 'light-warm';
export type AppMode = 'simple' | 'advanced' | 'diagram';
export type AppTab = 'roadmap' | 'challenges' | 'daily-todos' | 'programs-overview';

export interface TodoSubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  subTasks: TodoSubTask[];
  createdAt: string;
}

