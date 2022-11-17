import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ExamRecord, ExamRecordScore, Quiz } from '../model/exam';
import { ExamModeParam } from '../model/exam';

@Injectable({
  providedIn: 'root'
})
export class ExamModeService {

  examModeParam:ExamModeParam = {
    name: '',
    quizzesNum: 0
  };

  examRecord?:any;

  constructor(private http: HttpClient) { }

  getExamModeQuizzes(examModeParam: ExamModeParam): Observable<ExamRecord> {
    return this.http.post<ExamRecord>(environment.apiUrl + 'getExamModeQuizzes', examModeParam);
  }

  commitAns(examRecord:ExamRecord) :Observable<ExamRecord>{
    return this.http.post<ExamRecord>(environment.apiUrl + 'commitAnsToRecord', examRecord);
  }

  getRecordScoreById(id:number):Observable<ExamRecordScore> {
    return this.http.post<ExamRecordScore>(environment.apiUrl + 'getScoreById', id);
  }

  getRecordScoreByKeyword(keyword: string): Observable<ExamRecordScore[]> {
    return this.http.post<ExamRecordScore[]>(environment.apiUrl + 'getScoreByKeyword', keyword);
  }

  deleteRecordScore(id: number): Observable<boolean> {
    return this.http.post<boolean>(environment.apiUrl + 'deleteRecordScore', id);
  }

  getExamRecordById(id: number): Observable<ExamRecord> {
    return this.http.post<ExamRecord>(environment.apiUrl + 'getExamRecordById', id);
  }

  
  
  
}
