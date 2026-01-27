export interface Quiz {
    quizContent: string;
    chooses: string[];
    correctContents: string[];
    solution: string;
}

export interface Exam {
    name: string;
    quizzes: Quiz[];
}

export interface ExamModeParam {
    name: string;
    quizzesNum: number;
}

export interface ExamRecord {
    id: number;
    examName: string;
    examQuizzes: Quiz[];
    ansQuizzes: Quiz[];
    logTime: string;
}

export interface ExamRecordScore {
    id: number;
    examName: string;
    correctNums: number;
    quizNums: number;
    score: string;
    logTime: string;
}
