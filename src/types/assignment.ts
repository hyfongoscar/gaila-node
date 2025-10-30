import { Class } from 'types/class';
import { User } from 'types/user';

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  type?: string;
  instructions?: string;
  requirements?: number;
  rubrics?: string;
  tips?: string;
  created_by: number;
}

export interface AssignmentView extends Assignment {
  enrolled_classes: Class[];
  enrolled_students: User[];
}

export interface AssignmentTeacher {
  id: number;
  assignment_id: number;
  teacher_id: number;
}

export interface AssignmentTarget {
  id: number;
  assignment_id: number;
  class_id?: number;
  student_id?: number;
}

export type AssignmentEnrollment =
  | AssignmentEnrolledClass
  | AssignmentEnrolledStudent;
export type AssignmentEnrolledClass = {
  id: number;
  assignment_id: number;
  class_id: number;
  class_name: string;
  num_students: number;
};
export type AssignmentEnrolledStudent = {
  id: number;
  assignment_id: number;
  student_id: number;
  username: string;
  first_name: string;
  last_name: string;
};

export interface AssignmentSubmission {
  id: number;
  assignment_id: number;
  student_id: number;
  content?: string;
  submitted_at?: number;
}

export interface AssignmentSubmissionDraft {
  id: number;
  assignment_id: number;
  student_id: number;
  content?: string;
  saved_at?: number;
}

export interface AssignmentGrade {
  id: number;
  submission_id: number;
  score: number;
  score_breakdown?: any;
  feedback?: string;
  graded_at?: number;
  graded_by: number;
}
