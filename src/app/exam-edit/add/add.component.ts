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
  public quizzes:Quiz[] = [];

  constructor(public dialog: MatDialog, private formBuilder: FormBuilder, private examService: ExamService, private examNameValidator:examNameValidator) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.quizzes = []
    this.formGroup = this.formBuilder.group({
      name:['', Validators.required, this.examNameValidator.validate.bind(this.examNameValidator)]
    })
  }

  confirmAddExam(formGroup: FormGroup) {
    Swal.fire({
      title: 'Do you want to add the exam?',
      showCancelButton: true,
      confirmButtonText: 'add exam',
      cancelButtonText:'check again'
    }).then(
      (result) => {
        if (result.isConfirmed) {
          this.addExam(formGroup)
        }
      }
    )
  }

  addExam(formGroup: FormGroup) {
    let exam:Exam = {
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

  openQuizFormDialog() {
    const dialog = this.dialog.open(
      QuizFormComponent,
      {
        width:'80rem'
      }
    ).afterClosed().subscribe(
      result => {
        if (result && result.data) {
          this.quizzes.unshift(result.data)
        }
      }
    )
  }

  removeThisQuiz(idx:number) {
    this.quizzes.splice(idx, 1);
  }

  editThisQuiz(idx: number) {
    let quiz = this.quizzes[idx];

    const dialog = this.dialog.open(
      QuizFormComponent,
      {
        width: '80rem',
        data:quiz
      }
    ).afterClosed().subscribe(
      result => {
        if (result && result.data) {
          this.quizzes[idx]=result.data;
        }
      }
    )

  }

  isCorrectAns(select:string, correctContents:string[]) {
    return correctContents.includes(select);
  }


}
