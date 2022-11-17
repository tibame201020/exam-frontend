import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { ExamRecordScore } from 'src/app/model/exam';
import { ExamService } from 'src/app/services/exam.service';
import { ExamModeService } from 'src/app/services/exam-mode.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {

  public examRecordScores: ExamRecordScore[] = [];

  public formGroup: FormGroup = this.formBuilder.group({
    keyword: ['']
  })

  constructor(private formBuilder: FormBuilder, private router: Router, private examService:ExamService, private examModeService:ExamModeService) { }

  ngOnInit(): void {
    this.getExamRecordScores(this.formGroup.value.keyword);
    this.formGroup.valueChanges.subscribe((value) => {
      this.getExamRecordScores(value.keyword);
    });
  }

  getExamRecordScores(keyword:string) {
    if (!keyword) {
      keyword = "getScoreByKeyword";
    }

    this.examModeService.getRecordScoreByKeyword(keyword).subscribe(
      res => {
        this.examRecordScores = res;
      }
    )
  }

  refreshList(refresh: string) {
    this.getExamRecordScores(this.formGroup.value.keyword);
  }

}
