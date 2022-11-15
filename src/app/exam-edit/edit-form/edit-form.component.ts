import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Exam, Quiz } from 'src/app/model/exam';
import { ExamService } from 'src/app/services/exam.service';
import Swal from 'sweetalert2';
import { QuizFormComponent } from '../quiz-form/quiz-form.component';

@Component({
  selector: 'app-edit-form',
  templateUrl: './edit-form.component.html',
  styleUrls: ['./edit-form.component.css']
})
export class EditFormComponent implements OnInit {

  public formGroup: FormGroup = new FormGroup({});
  public quizzes: Quiz[] = [];

  constructor(private formBuilder: FormBuilder, public dialogRef: MatDialogRef<EditFormComponent>, @Inject(MAT_DIALOG_DATA) public data: Exam, public dialog: MatDialog, private examService: ExamService) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.quizzes = this.data.quizzes
    this.formGroup = this.formBuilder.group({
      name: [this.data.name, Validators.required]
    })
  }

  confirmSaveExam(formGroup: FormGroup) {
    Swal.fire({
      title: 'Do you want to save the exam?',
      showCancelButton: true,
      confirmButtonText: 'save change',
      cancelButtonText: 'check again'
    }).then(
      (result) => {
        if (result.isConfirmed) {
          this.saveExam(formGroup)
        }
      }
    )
  }

  saveExam(formGroup: FormGroup) {
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
          this.dialogRef.close();
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

  removeThisQuiz(idx: number) {
    this.quizzes.splice(idx, 1);
  }

  isCorrectAns(select: string, correctContents: string[]) {
    return correctContents.includes(select);
  }

}
