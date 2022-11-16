import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-choose-wrapper',
  templateUrl: './choose-wrapper.component.html',
  styleUrls: ['./choose-wrapper.component.css']
})
export class ChooseWrapperComponent implements OnInit {

  @Input() choose!:string;
  @Input() isCorrect!:boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
