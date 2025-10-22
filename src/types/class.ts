export interface Class {
  id: number;
  name: string;
  description?: string;
  startAt?: number;
  endAt?: number;
}

export interface ClassOption {
  id: number;
  name: string;
  numStudents: number;
}

export interface ClassTeacher {
  id: number;
  class_id: number;
  teacher_id: number;
}

export interface ClassStudent {
  id: number;
  classId: number;
  studentId: number;
}

// export interface Course {
//   id: number;
//   name: string;
//   shortName?: string;
//   timeCreated?: number;
//   timeModified?: number;
//   visible?: boolean;
//   createdBy?: number;
// }

// export interface CourseEnrollment {
//   id: number;
//   userId: number;
//   courseId: number;
//   role: 'manager' | 'teacher' | 'student';
// }

// export interface CourseModule {
//   id: number;
//   courseId: number;
//   type:
//     | 'writing'
//     | 'page'
//     | 'assignment'
//     | 'file'
//     | 'discussion'
//     | 'questionnaire'
//     | 'quiz';
//   title: string;
//   description?: string;
//   orderNumber?: number;
//   visible?: boolean;
//   useChatgptPrompt?: boolean;
//   useDictionary?: boolean;
//   dueDate?: number;
// }

// export interface CourseWriting {
//   id: number;
//   courseModuleId: number;
//   topic: string;
//   useChatgptRevise?: boolean;
// }

// export interface CoursePage {
//   id: number;
//   courseModuleId: number;
//   content: string;
// }

// export interface CourseAssignment {
//   id: number;
//   courseModuleId: number;
//   content: string;
//   maxScore?: number;
// }

// export interface CourseFile {
//   id: number;
//   courseModuleId: number;
//   fileUrl: string;
// }

// export interface CourseDiscussion {
//   id: number;
//   courseModuleId: number;
//   prompt: string;
// }

// export interface CourseDiscussionPost {
//   id: number;
//   discussionId: number;
//   userId: number;
//   content: string;
//   createdAt: number;
// }

// export interface CourseQuestionnaire {
//   id: number;
//   courseModuleId: number;
//   description?: string;
// }

// export interface CourseQuestionnaireQuestion {
//   id: number;
//   questionnaireId: number;
//   questionText: string;
//   questionType: 'text' | 'short_text' | 'long_text' | 'checkbox' | 'radio';
// }

// export interface CourseQuiz {
//   id: number;
//   courseModuleId: number;
//   description?: string;
//   timeLimit?: number;
// }

// export interface CourseQuizQuestion {
//   id: number;
//   quizId: number;
//   questionText: string;
//   questionType: 'text' | 'short_text' | 'long_text' | 'checkbox' | 'radio';
//   correctAnswer?: string;
//   maxScore?: number;
// }
