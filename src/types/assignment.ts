export interface Assignment {
  id: number;
  title: string;
  createdBy: number;
  description?: string;
  dueDate?: number;
  rubric?: any;
}

export interface AssignmentTeacher {
  id: number;
  assignmentId: number;
  teacherId: number;
}

export interface AssignmentTarget {
  id: number;
  assignmentId: number;
  classId?: number;
  studentId?: number;
}

export interface AssignmentSubmission {
  id: number;
  assignmentId: number;
  studentId: number;
  content?: string;
  submittedAt?: number;
}

export interface AssignmentSubmissionDraft {
  id: number;
  assignmentId: number;
  studentId: number;
  content?: string;
  savedAt?: number;
}

export interface AssignmentGrade {
  id: number;
  submissionId: number;
  score: number;
  scoreBreakdown?: any;
  feedback?: string;
  gradedAt?: number;
  gradedBy: number;
}
