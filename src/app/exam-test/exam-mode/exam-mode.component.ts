import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, } from '@angular/forms';
import { Exam, ExamModeParam, ExamRecord, Quiz } from 'src/app/model/exam';
import { ExamModeService } from 'src/app/services/exam-mode.service';
import { ExamService } from 'src/app/services/exam.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-exam-mode',
  templateUrl: './exam-mode.component.html',
  styleUrls: ['./exam-mode.component.css']
})
export class ExamModeComponent implements OnInit {

  examModeParam!:ExamModeParam;

  exam!: Exam;
  examRecord:ExamRecord = {
    id: 0,
    examName: '',
    examQuizzes: [],
    ansQuizzes: [],
    logTime: new Date()
  };

  public formGroup: FormGroup = new FormGroup({});

  constructor(private router: Router, private examService: ExamService, private formBuilder: FormBuilder, private examModeService: ExamModeService) { }

  ngOnInit(): void {
    this.getParam();
    if (this.examModeParam.name) {
      this.initExam();
      this.initForm();
    } else {
      Swal.fire({
            position: 'center',
            icon: 'error',
            title: "doesn't have a exam info",
            showConfirmButton: false,
            timer: 800
          })
          this.router.navigate(['test/home'])
    }
  }

  getParam(){
    this.examModeParam = this.examModeService.examModeParam;
  }

  initExam() {
    this.examModeService.getExamModeQuizzes(this.examModeParam).subscribe(
      res => {
        this.examRecord = res;
      }
    )
  }

  initForm() {
    this.formGroup = this.formBuilder.group({
      id: [this.examRecord.id],
      quizzes: [this.examRecord.ansQuizzes]
    })
  }

  chooseOrNot(choose:string, quizIdx:number) {
    let userChooseList = this.examRecord.ansQuizzes[quizIdx].correctContents;
    if (userChooseList.includes(choose)) {
      return true;
    } else {
      return false;
    }
  }

  isNotAns(quizIdx: number) {
    let userChooseList = this.examRecord.ansQuizzes[quizIdx].correctContents;
    if (userChooseList.length) {
      return false;
    } else {
      return true;
    }
  }

  changeChoose(choose: string, quizIdx: number) {
    let userChooseList = this.examRecord.ansQuizzes[quizIdx].correctContents;
    if (userChooseList.includes(choose)) {
      userChooseList.splice(userChooseList.indexOf(choose), 1);
    } else {
      userChooseList.push(choose);
      this.examRecord.ansQuizzes[quizIdx].correctContents = userChooseList;
    }
  }

  commitExam() {
    let message;
    if (this.checkAns()){
      message = 'Do you want end this exam?'
    } else {
      message = 'there some quiz still not ans, continue?'
    }

    Swal.fire({
      title: message,
      showCancelButton: true,
      confirmButtonText: 'yes',
      cancelButtonText: 'no'
    }).then(
      (result) => {
        if (result.isConfirmed) {
          this.commitEndExam();
        }
      }
    )
  }

  checkAns() {
    let flag = true;
    this.examRecord.ansQuizzes.forEach(function (quiz) {
      let userChooseList = quiz.correctContents;
      if (!userChooseList.length) {
        flag = false;
      }
    })
    return flag;
  }

  commitEndExam() {
    this.examModeService.commitAns(this.examRecord).subscribe(
      res => {
        this.examModeService.examRecord = res;
        this.guideToResult();
      }
    )
  }

  guideToResult() {
    Swal.fire({
      position: 'center',
      icon: 'success',
      title: "guide to this exam-result",
      showConfirmButton: false,
      timer: 800
    })
    this.router.navigate(['test/result'])
  }


}

