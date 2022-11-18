import { Component, OnInit } from '@angular/core';
import { ExamModeService } from 'src/app/services/exam-mode.service';
import { FormBuilder, FormGroup, } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ExamRecordScore, Quiz } from 'src/app/model/exam';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit {

  examRecord!:any;
  base_examQuizzes:any=[];
  base_ansQuizzes:any=[];
  examQuizzes:Quiz[]=[];
  ansQuizzes:Quiz[]=[];

  examRecordScore:ExamRecordScore = {
    id: 0,
    examName: '',
    correctNums: 0,
    quizNums: 0,
    score: '',
    logTime: new Date()
  };

  public formGroup: FormGroup = this.formBuilder.group({
    visiable: ['unCorrect']
  })

  constructor(private examModeService: ExamModeService, private router: Router, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.getRecord();
    if (this.examRecord) {
      this.base_examQuizzes=this.examRecord.examQuizzes;
      this.base_ansQuizzes=this.examRecord.ansQuizzes;
      this.getExamRecordScore();
    }
  }

  getRecord() {
    if (!this.examModeService.examRecord) {
      this.notHaveRecordInfo();
    } else {
      this.examRecord = this.examModeService.examRecord;
      this.examModeService.examRecord = null;
    }
  }

  notHaveRecordInfo() {
    Swal.fire({
      position: 'center',
      icon: 'error',
      title: "doesn't have a exam-record info",
      showConfirmButton: false,
      timer: 1200
    })
    this.router.navigate(['test/home'])
  }

  getExamRecordScore() {
    this.examModeService.getRecordScoreById(this.examRecord.id).subscribe(
      res => {
        this.examRecordScore = res;
      }
    )
  }

  isCorrectAns(select: string, correctContents: string[]) {
    return correctContents.includes(select);
  }

  isChooseAns(select: string, quizIdx:number) {
    let userChooseList = this.ansQuizzes[quizIdx].correctContents;
    return userChooseList.includes(select);
  }

  isCorrect(quizIdx: number) {

    if (this.formGroup.value.visiable == 'unCorrect') {
        return false;
    }

    if (this.formGroup.value.visiable == 'correct') {
      return true;
    }

    let correctList = this.examRecord.examQuizzes[quizIdx].correctContents.sort();
    let userChooseList = this.examRecord.ansQuizzes[quizIdx].correctContents.sort();

    return JSON.stringify(correctList) == JSON.stringify(userChooseList);
  }

  isCorrectAnsChoose(quizIdx: number) {
    let correctList = this.examRecord.examQuizzes[quizIdx].correctContents.sort();
    let userChooseList = this.examRecord.ansQuizzes[quizIdx].correctContents.sort();

    return JSON.stringify(correctList) == JSON.stringify(userChooseList);
  }

  wrapperList() {
    let rtn:Quiz[] = [];
    this.examQuizzes = [];
    this.ansQuizzes = [];
    switch (this.formGroup.value.visiable) {
      case 'all' :
        this.examQuizzes = this.base_examQuizzes;
        this.ansQuizzes = this.base_ansQuizzes;
        rtn = this.examRecord.examQuizzes;
        break;
      case 'unCorrect':
        this.examRecord.examQuizzes.forEach( (quiz: Quiz, index:number) => {
          if (!this.isCorrectAnsChoose(index)) {
            this.examQuizzes.push(quiz)
            this.ansQuizzes.push(this.base_ansQuizzes[index]);
            rtn.push(quiz)
          }
        })
        break;
      case 'correct':
        this.examRecord.examQuizzes.forEach((quiz: Quiz, index: number) => {
          if (this.isCorrectAnsChoose(index)) {
            this.examQuizzes.push(quiz)
            this.ansQuizzes.push(this.base_ansQuizzes[index]);
            rtn.push(quiz)
          }
        })
        break;
    }

    return rtn;
  }

}
