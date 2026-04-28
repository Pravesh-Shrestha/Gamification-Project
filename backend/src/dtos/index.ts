// Student DTOs
export interface CreateStudentDTO {
  name: string;
  email: string;
  password: string;
  school: string;
  grade: string;
}

export interface UpdateStudentDTO {
  name?: string;
  school?: string;
  grade?: string;
}

export interface StudentResponseDTO {
  _id: string;
  name: string;
  email: string;
  school: string;
  grade: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  createdAt: Date;
  updatedAt: Date;
}

// Task DTOs
export interface CreateTaskDTO {
  title: string;
  description: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  pointsReward: number;
  module: string;
  dueDate: Date;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  subject?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  pointsReward?: number;
  module?: string;
  dueDate?: Date;
}

export interface TaskResponseDTO {
  _id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  pointsReward: number;
  module: string;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Progress DTOs
export interface CreateProgressDTO {
  studentId: string;
  taskId: string;
}

export interface UpdateProgressDTO {
  status?: 'not_started' | 'in_progress' | 'completed';
  completionPercentage?: number;
  pointsEarned?: number;
  attempts?: number;
  completedAt?: Date;
}

export interface ProgressResponseDTO {
  _id: string;
  studentId: string;
  taskId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completionPercentage: number;
  pointsEarned: number;
  attempts: number;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
