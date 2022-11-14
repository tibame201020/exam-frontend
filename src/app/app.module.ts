import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarsModule } from './bars/bars.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BarsModule, AppRoutingModule, CommonModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
