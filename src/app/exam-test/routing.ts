import { Routes } from '@angular/router';
import { ExamModeComponent } from './exam-mode/exam-mode.component';
import { HistoryComponent } from './history/history.component';
import { HomeComponent } from './home/home.component';
import { ResultComponent } from './result/result.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'exam', component: ExamModeComponent },
  { path: 'record-history', component: HistoryComponent },
  { path: 'result', component: ResultComponent },
];

export const TestRouter = routes;
