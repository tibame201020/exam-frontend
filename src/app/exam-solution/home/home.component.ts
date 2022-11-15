import { Component, OnInit } from '@angular/core';
import { ExamService } from 'src/app/services/exam.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public examList:string[] = [];

  public keyword:string = '';

  constructor(private examService:ExamService) { }

  ngOnInit(): void {
    this.getExamList()
  }

  getExamList() {
    this.examService.getNameList().subscribe(
      res => this.examList=res
    )
  }

  getExamByKeyWord() {
    let rtn:string[] = [];
    if (this.keyword) {
      this.examList.forEach(element => {
        if (element.includes(this.keyword)) {
          rtn.push(element);
        }
      });
      
    } else {
      rtn = this.examList;
    }
    return rtn;
  }

  guideToSolution(exam:string) {
    console.log(exam)
  }

}
