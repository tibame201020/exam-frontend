import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditRouter } from './exam-edit/routing';
import { SettingRouter } from './exam-setting/routing';
import { SolutionRouter } from './exam-solution/routing';
import { TestRouter } from './exam-test/routing';

const routes: Routes = [
  { path: 'test', children: TestRouter },
  { path: 'solution', children: SolutionRouter },
  { path: 'edit', children: EditRouter },
  { path: 'setting', children: SettingRouter },
  {path:'', redirectTo:"/test/home", pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
