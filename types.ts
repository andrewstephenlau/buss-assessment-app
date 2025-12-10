
export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
  correctOptionId: string;
}

export interface Assessment {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  questions: Question[];
  isActive: boolean;
}

export interface ResultLog {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  studentName: string;
  agentCode: string;
  location: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  timestamp: string;
  missedQuestionIds: string[];
  answers: Record<string, string>; // Stores questionId -> optionId selected
}

export interface ActiveSession {
  studentName: string;
  agentCode: string;
  location: string;
  assessmentId: string;
  currentQuestionIndex: number;
  answers: Record<string, string>; // questionId -> optionId
  startTime: string;
}
