import { catchError, map, Observable, of, tap } from 'rxjs';
import { Injectable, Input } from '@angular/core';
import { AbstractControl, AsyncValidator, ValidationErrors } from '@angular/forms';
import { ExamService } from '../services/exam.service';
@Injectable({ providedIn: 'root' })

export class examNameValidator implements AsyncValidator {
    constructor(private examService: ExamService) { }

    validate(
        control: AbstractControl
    ): Observable<ValidationErrors | null> {
        return this.examService.checkExamNm(control.value).pipe(
            map(isTaken => (isTaken ? { isOK: true } : null)),
            catchError(() => of({ serverError: `the server error, plz contact manager` }))
        );
    }
}