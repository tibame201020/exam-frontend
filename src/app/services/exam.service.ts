import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Exam } from '../model/exam';

@Injectable({
  providedIn: 'root'
})
export class ExamService {

  constructor(private http: HttpClient) { }

  saveExam(exam: Exam): Observable<boolean> {
    return this.http.post<boolean>(environment.apiUrl + 'addExam', exam);
  }

  checkExamNm(name:string): Observable<boolean> {
    return this.http.post<boolean>(environment.apiUrl + 'checkExamNm', name);
  }

  getNameList(): Observable<string[]> {
    return this.http.post<string[]>(environment.apiUrl + 'getExamList', '');
  }

  getNameListByKeyword(keyword:string): Observable<string[]> {
    return this.http.post<string[]>(environment.apiUrl + 'getExamListByKeyWord', keyword);
  }

  removeExam(name: string): Observable<boolean> {
    return this.http.post<boolean>(environment.apiUrl + 'removeExam', name);
  }

  getExamByName(name: string): Observable<Exam> {
    return this.http.post<Exam>(environment.apiUrl + 'getExamByName', name);
  }

}
