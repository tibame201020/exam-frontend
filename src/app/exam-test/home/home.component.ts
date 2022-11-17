import { Component, OnInit, } from '@angular/core';
import { ExamService } from 'src/app/services/exam.service';
import { FormBuilder, FormGroup, } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { ExamModeService } from 'src/app/services/exam-mode.service';
import { ExamModeParam } from 'src/app/model/exam';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public examList: string[] = [];

  public optionMode: boolean = false;

  private tempSelectExam:string = "";

  public formGroup: FormGroup = this.formBuilder.group({
    keyword: [''],
    selectExam:[],
    quizzes_num:["0"]
  })

  constructor(private examService: ExamService, private formBuilder: FormBuilder, private router: Router, private examModeService: ExamModeService) { }

  ngOnInit(): void {
    this.getExamList();
    this.formGroup.valueChanges.subscribe(
      value => {
        if (value.keyword != this.tempSelectExam) {
          this.optionMode = false;
        }
      }
    )
  }

  getExamList() {
    this.examService.getNameList().subscribe(
      res => this.examList = res
    )
  }

  getExamByKeyWord() {
    let rtn: string[] = [];
    if (this.formGroup.value.keyword) {
      this.examList.forEach(element => {
        if (element.includes(this.formGroup.value.keyword)) {
          rtn.push(element);
        }
      });

    } else {
      rtn = this.examList;
    }
    return rtn;
  }

  guideToExam(exam:string) {
    this.formGroup.patchValue({ keyword: exam, selectExam: exam })
    this.tempSelectExam = exam;
    this.optionMode = true;
  }

  startToExam(){
    Swal.fire({
      title: 'Do you want start the exam?',
      showCancelButton: true,
      confirmButtonText: 'start',
      cancelButtonText: 'cancel'
    }).then(
      (result) => {
        if
         (result.isConfirmed) {
          let examModeParam:ExamModeParam = {
            name: this.formGroup.value.selectExam,
            quizzesNum: +this.formGroup.value.quizzes_num
          }
          this.examModeService.examModeParam = examModeParam;

          this.router.navigate(['/test/exam'])
        }
      }
    )
  }


}
