import { TransSignComponent } from './../../share/trans-sign/trans-sign.component';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ValidationErrors, FormControl } from '@angular/forms';
import { Exam, Quiz } from 'src/app/model/exam';
import { QuizFormComponent } from '../quiz-form/quiz-form.component';
import { ExamService } from 'src/app/services/exam.service';
import Swal from 'sweetalert2';
import { examNameValidator } from 'src/app/validators/exam-validator';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css']
})
export class AddComponent implements OnInit {

  public formGroup: FormGroup = new FormGroup({});
  public quizzes: Quiz[] = [];
  selectedFile: any;

  constructor(public dialog: MatDialog, private formBuilder: FormBuilder, private examService: ExamService, private examNameValidator: examNameValidator) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.quizzes = []
    this.formGroup = this.formBuilder.group({
      name: ['', Validators.required, this.examNameValidator.validate.bind(this.examNameValidator)]
    })
  }

  confirmAddExam(formGroup: FormGroup) {
    Swal.fire({
      title: 'Do you want to add the exam?',
      showCancelButton: true,
      confirmButtonText: 'add exam',
      cancelButtonText: 'check again'
    }).then(
      (result) => {
        if (result.isConfirmed) {
          this.addExam(formGroup)
        }
      }
    )
  }

  addExam(formGroup: FormGroup) {
    let exam: Exam = {
      name: formGroup.value.name,
      quizzes: this.quizzes
    }

    this.examService.saveExam(exam).subscribe(
      res => {
        if (res) {
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'the exam has successfully add',
            showConfirmButton: false,
            timer: 800
          })
          this.initForm();
        } else {
          Swal.fire({
            icon: 'error',
            text: 'Something went wrong!',
          })
        }
      }
    )
  }

  openWrapperDialog() {
    const dialog = this.dialog.open(TransSignComponent, {
      width: '70rem'
    })
  }

  openQuizFormDialog() {
    const dialog = this.dialog.open(
      QuizFormComponent,
      {
        width: '80rem'
      }
    ).afterClosed().subscribe(
      result => {
        if (result && result.data) {
          this.quizzes.unshift(result.data)
        }
      }
    )
  }

  removeThisQuiz(idx: number) {
    this.quizzes.splice(idx, 1);
  }

  editThisQuiz(idx: number) {
    let quiz = this.quizzes[idx];

    const dialog = this.dialog.open(
      QuizFormComponent,
      {
        width: '80rem',
        data: quiz
      }
    ).afterClosed().subscribe(
      result => {
        if (result && result.data) {
          this.quizzes[idx] = result.data;
        }
      }
    )

  }

  isCorrectAns(select: string, correctContents: string[]) {
    return correctContents.includes(select);
  }

  onFileChanged(event: any) {
    this.selectedFile = event.target.files[0];
    event.target.name = '';
    const fileReader = new FileReader();
    fileReader.readAsText(this.selectedFile, 'UTF-8');
    fileReader.onload = () => {
      try {
        let upload_quizzes = JSON.parse(JSON.stringify(fileReader.result));
        let quizs = JSON.parse(upload_quizzes);
        quizs.forEach((element: any) => {
          this.quizzes.unshift(element);
        });
      } catch (err) {
        let upload_quizzes = JSON.stringify(fileReader.result);
        this.wrapperFileToQuizzes(upload_quizzes).forEach((element: any) => {
          this.quizzes.unshift(element);
        });
      }
    };
    fileReader.onerror = (error) => {
      Swal.fire({
        icon: 'error',
        text: JSON.stringify(error),
      });
    };
  }

  wrapperFileToQuizzes(upload_quizzes: string) {
    let rtn: Quiz[] = [];
    let quizzesArray = upload_quizzes.split('@@@#');
    quizzesArray.forEach((upload_quiz: string) => {
      let quiz = this.wrapperStrToQuiz(upload_quiz);
      if (quiz && quiz.solution) {
        rtn.push(quiz);
      }
    });
    return rtn;
  }

  wrapperStrToQuiz(upload_quiz: string) {
    let contentIdx = upload_quiz.indexOf('quizContent=');
    if (contentIdx == -1) {
      return;
    }
    let choosesIdx = upload_quiz.indexOf('chooses=');
    let correctIdx = upload_quiz.indexOf('correctContents=');
    let solutionIdx = upload_quiz.indexOf('solution=');

    let quizContent = upload_quiz
      .substring(contentIdx, choosesIdx - 4)
      .replace('quizContent=', '')
      .substring(4);
    let chooses = upload_quiz
      .substring(choosesIdx, correctIdx - 4)
      .replace('chooses=', '')
      .substring(4);
    let correct = upload_quiz
      .substring(correctIdx, solutionIdx - 4)
      .replace('correctContents=', '')
      .substring(4);
    let solution = upload_quiz
      .substring(solutionIdx)
      .replace('solution=', '')
      .substring(4);

    let quizStr = '{';
    quizStr = quizStr + '"quizContent":"' + quizContent + '",';
    quizStr = quizStr + '"chooses":' + this.wrapperToArray(chooses) + ',';
    quizStr =
      quizStr + '"correctContents":' + this.wrapperToArray(correct) + ',';
    quizStr = quizStr + '"solution":"' + solution + '"}';

    console.log(quizStr);
    return JSON.parse(quizStr.replace('""', '"'));
  }

  wrapperToArray(str: string) {
    let rtnStr = '[';
    str.split('##').forEach((select: string) => {
      if (select && select.length) {
        rtnStr = rtnStr + '"' + select + '", ';
      }
    });
    rtnStr = rtnStr.substring(0, rtnStr.lastIndexOf(',')) + ']';
    return rtnStr;
  }


}
