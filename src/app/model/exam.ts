export interface Exam {
  name: string;
  quizzes: Quiz[];
}

export interface Quiz {
  quizContent: string;
  chooses: string[];
  correctContents: string[];
  solution: string;
}
