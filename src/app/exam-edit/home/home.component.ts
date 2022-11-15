import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Exam } from 'src/app/model/exam';
import { ExamService } from 'src/app/services/exam.service';
import Swal from 'sweetalert2';
import { EditFormComponent } from '../edit-form/edit-form.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  examList:string[] = []

  constructor(private examService:ExamService, public dialog:MatDialog) { }

  ngOnInit(): void {
    this.getExamList();
  }

  getExamList() {
    this.examService.getNameList().subscribe(
      res => this.examList = res
    )
  }

  removeExamCofirm(name:string) {
    Swal.fire({
      title: 'Do you want remove the exam -' + name + ' ?',
      showCancelButton: true,
      confirmButtonText: 'delete it',
      cancelButtonText: 'check again'
    }).then(
      (result) => {
        if (result.isConfirmed) {
          this.removeExam(name)
        }
      }
    )
  }

  getExamByNameConfirm(name: string) {
    Swal.fire({
      title: 'Do you want edit the exam -' + name + ' ?',
      showCancelButton: true,
      confirmButtonText: 'yes',
      cancelButtonText: 'no'
    }).then(
      (result) => {
        if (result.isConfirmed) {
          this.getExamByName(name);
        }
      }
    )
  }

  getExamByName(name:string) {
    this.examService.getExamByName(name).subscribe(
      res => {
        if (res) {
          this.openEditDialog(res);       
        }
      }
    )
  }

  openEditDialog(exam:Exam) {
    const dialog = this.dialog.open(
      EditFormComponent,
      {
        width:'90rem',
        height:'50rem',
        data: exam
      }
    ).afterClosed().subscribe(
      result => {
        this.getExamList();
      }
    )
  }

  removeExam(name: string) {
    this.examService.removeExam(name).subscribe(
      res => {
        if (res) {
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'the exam has successfully delete',
            showConfirmButton: false,
            timer: 800
          })
          this.getExamList();
        } else {
          Swal.fire({
            icon: 'error',
            text: 'Something went wrong!',
          })
        }
      }
    )
  }

}
