import { NgModule } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { AddComponent } from './add/add.component';
import { QuizFormComponent } from './quiz-form/quiz-form.component';
import { ShareModule } from '../share/share.module';

@NgModule({
  declarations: [HomeComponent, AddComponent, QuizFormComponent],
  imports: [ShareModule],
})
export class ExamEditModule {}
