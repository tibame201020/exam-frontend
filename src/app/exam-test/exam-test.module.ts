import { NgModule } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { ShareModule } from '../share/share.module';
import { ExamModeComponent } from './exam-mode/exam-mode.component';
import { HistoryComponent } from './history/history.component';
import { ResultComponent } from './result/result.component';
import { RecordScoreWrapperComponent } from './record-score-wrapper/record-score-wrapper.component';



@NgModule({
  declarations: [
    HomeComponent,
    ExamModeComponent,
    HistoryComponent,
    ResultComponent,
    RecordScoreWrapperComponent
  ],
  imports: [
    ShareModule
  ]
})
export class ExamTestModule { }
