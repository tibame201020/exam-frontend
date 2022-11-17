import { Component, OnInit, } from '@angular/core';
import { ExamService } from 'src/app/services/exam.service';
import { FormBuilder, FormGroup, } from '@angular/forms';
import { Exam } from 'src/app/model/exam';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public examList:string[] = [];

  public examSolution!:Exam;

  public watchMode:boolean = false;

  public formGroup: FormGroup = this.formBuilder.group({
    keyword: ['']
  })

  constructor(private examService: ExamService, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.getExamList()
    this.formGroup.valueChanges.subscribe(
      res => {
        this.watchMode = false;

      }
    )
  }
  


  getExamList() {
    this.examService.getNameList().subscribe(
      res => this.examList=res
    )
  }

  getExamByKeyWord() {
    let rtn:string[] = [];
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

  guideToSolution(exam:string) {
    this.formGroup.patchValue({keyword:''})
    this.watchMode = true;
    this.examService.getExamByName(exam).subscribe(
      res => this.examSolution=res
    )
  }

  isCorrectAns(select: string, correctContents: string[]) {
    return correctContents.includes(select);
  }

}
