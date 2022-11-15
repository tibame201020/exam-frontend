import { Component, Inject, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Quiz } from 'src/app/model/exam';

@Component({
  selector: 'app-quiz-form',
  templateUrl: './quiz-form.component.html',
  styleUrls: ['./quiz-form.component.css'],
})
export class QuizFormComponent implements OnInit {

  public formGroup: FormGroup = new FormGroup({});

  public selectsArray:string[] = [];

  constructor(private formBuilder: FormBuilder, public dialogRef: MatDialogRef<QuizFormComponent>, @Inject(MAT_DIALOG_DATA) public data: Quiz,) { }

  ngOnInit(): void {
    if (this.data) {
      this.editForm();
    } else {
      this.initForm();
    }
  }

  editForm() {
    this.selectsArray = this.data.chooses;
    this.formGroup = this.formBuilder.group({
      quizContent: [this.data.quizContent, Validators.required],
      solution: [this.data.solution, Validators.required],
      correctContents: [this.data.correctContents, Validators.required],
      tempSelect: [''],
      removeSelect: ['']
    })
  }

  initForm() {
    this.formGroup = this.formBuilder.group({
      quizContent:['',Validators.required],
      solution:['',Validators.required],
      correctContents: ['', Validators.required],
      tempSelect:[''],
      removeSelect:['']
    })
  }

  addQuiz(formGroup: FormGroup) {
    let quiz:Quiz = {
      quizContent: formGroup.value.quizContent,
      chooses: this.selectsArray,
      correctContents: formGroup.value.correctContents,
      solution: formGroup.value.solution
    }
    this.dialogRef.close(
      {data:quiz}
    )
  }

  addTempSelectToSelects(){
    let tempSelect = this.formGroup.value.tempSelect;
    if (!tempSelect || this.selectsArray.includes(tempSelect)) {
      return;
    }
    this.selectsArray.push(tempSelect);
  }

  removeSelectFromChooses(){
    let removeSelect = this.formGroup.value.removeSelect;
    if (!removeSelect) {
      return;
    }
    if (this.selectsArray.includes(removeSelect)) {
      this.selectsArray.splice(this.selectsArray.findIndex(item => item == removeSelect), 1);
    }

  }

}
