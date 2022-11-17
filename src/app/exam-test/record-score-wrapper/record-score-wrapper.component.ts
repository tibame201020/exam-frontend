import { Component, EventEmitter, Input, OnInit,Output } from '@angular/core';
import { ExamRecordScore } from 'src/app/model/exam';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { ExamModeService } from 'src/app/services/exam-mode.service';

@Component({
  selector: 'app-record-score-wrapper',
  templateUrl: './record-score-wrapper.component.html',
  styleUrls: ['./record-score-wrapper.component.css']
})
export class RecordScoreWrapperComponent implements OnInit {

  @Input() examRecordScore!:ExamRecordScore;
  @Output() newItemEvent = new EventEmitter<string>();

  constructor(private router:Router, private examModeService:ExamModeService) { }

  ngOnInit(): void {
  }

  deleteExamRecord(examRecordScore:ExamRecordScore) {
    Swal.fire({
      title: 'Do you want remove this exam: ' + examRecordScore.examName + '?' ,
      showCancelButton: true,
      confirmButtonText: 'yes',
      cancelButtonText: 'no'
    }).then(
      (result) => {
        if
          (result.isConfirmed) {
          this.delete(examRecordScore.id);
        }
      }
    )
  }

  delete(id:number) {
    this.examModeService.deleteRecordScore(id).subscribe(
      res => {
        if (res) {
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'the exam-record has successfully delete',
            showConfirmButton: false,
            timer: 800
          })
          this.newItemEvent.emit('refresh');
        } else {
          Swal.fire({
            icon: 'error',
            text: 'Something went wrong!',
          })
        }
      }
    )
  }

  guideToResult() {
    this.examModeService.getExamRecordById(this.examRecordScore.id).subscribe(
      res => {
        this.examModeService.examRecord = res;
        this.router.navigate(['test/result'])
      }
    )

  }

}
