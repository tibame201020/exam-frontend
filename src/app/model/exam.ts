export interface Exam {
    name:string,
    quizzes:Quiz[]
}

export interface Quiz {
    belong:string,
    quizContent:string,
    chooses:string[],
    correctContent:string,
    solution:string
}