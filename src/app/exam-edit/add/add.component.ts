import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ValidationErrors, FormControl } from '@angular/forms';
import { Quiz } from 'src/app/model/exam';
import { QuizFormComponent } from '../quiz-form/quiz-form.component';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css']
})
export class AddComponent implements OnInit {

  public formGroup: FormGroup = new FormGroup({});
  public quizzes:Quiz[] = [];

  constructor(public dialog:MatDialog, private formBuilder: FormBuilder,) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.formGroup = this.formBuilder.group({
      name:['', Validators.required]
    })
  }

  addExam(formGroup: FormGroup) {
    console.log(formGroup.value)
    console.log(this.quizzes)
  }

  openQuizFormDialog() {
    const dialog = this.dialog.open(
      QuizFormComponent,
      {
        width:'80rem'
      }
    )
  }

}
