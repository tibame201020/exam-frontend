import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarsModule } from './bars/bars.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ExamEditModule } from './exam-edit/exam-edit.module';
import { ExamSettingModule } from './exam-setting/exam-setting.module';
import { ExamTestModule } from './exam-test/exam-test.module';
import { ExamSolutionModule } from './exam-solution/exam-solution.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BarsModule, AppRoutingModule, CommonModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
