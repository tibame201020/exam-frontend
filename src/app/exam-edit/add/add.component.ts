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

    let quiz = { "quizContent": "public class Test {\n \n static String[][] arr = new String[3][];\n \n private static void doPrint() {\n //insert code here\n }\n \n public static void main(String[] args) {\n String[] class1 = {\"A\", \"B\", \"C\"};\n String[] class2 = {\"L\", \"M\", \"N\", \"O\"};\n String[] class3 = {\"I\", \"J\"};\n arr[0] = class1;\n arr[1] = class2;\n arr[2] = class3;\n Test.doPrint();\n }\n}\nWhich code fragment, when inserted at line //insert code here, enables the code to print COJ?", "chooses": ["int i = 0;\nfor (String[] sub : arr) {\n int j = sub.length - 1;\n for (String str : sub) {\n System.out.println(str[j]);\n i++;\n }\n}", "for (int i = 0; i < arr.length; i++) {\n int j = arr[i].length - 1;\n System.out.print(arr[i][j]);\n}", "int i = 0;\nfor (String[] sub : arr[][]) {\n int j = sub.length;\n System.out.print(arr[i][j]);\n i++;\n}", "for (int i = 0; i < arr.length - 1; i++) {\n int j = arr[i].length - 1;\n System.out.print(arr[i][j]);\n i++;\n}"], "correctContents": ["for (int i = 0; i < arr.length; i++) {\n int j = arr[i].length - 1;\n System.out.print(arr[i][j]);\n}"], "solution": "選項A，第10行會編譯錯誤，因為str變數的型態不是陣列。\n\n選項B，輸出二維陣列每個一維陣列元素的最後一個元素，正好是「COJ」。\n\n選項C，第7行會編譯錯誤，錯誤的foreach用法。\n\n選項D，只會輸出「C」。" } 
    this.quizzes.unshift(quiz)
    this.quizzes.unshift(quiz)
    this.quizzes.unshift(quiz)
    this.quizzes.unshift(quiz)
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
