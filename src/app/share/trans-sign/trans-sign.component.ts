import { Component } from '@angular/core';

@Component({
  selector: 'app-trans-sign',
  templateUrl: './trans-sign.component.html',
  styleUrls: ['./trans-sign.component.css']
})
export class TransSignComponent {

  public transStr='';

  getStr() {
    return JSON.stringify(this.transStr)
  }
}
