import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-quiz-content',
  templateUrl: './quiz-content.component.html',
  styleUrls: ['./quiz-content.component.css']
})
export class QuizContentComponent implements OnInit {

  @Input() quizContent!:string; 
  @Input() isQuizContent!:boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
