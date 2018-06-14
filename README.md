# generate-quiz

Generates a quiz from an array of questions. Supports multiple correct answers, multiple quizes on one page, randomizing the order of questions and answers, highlighting correct and incorrect answers. Made for a school project.

* * *

### Installation:

`npm install --save generate-quiz`
You can play around with the demo example too! It picks questions from https://opentdb.com/
`npm run example`  

* * *
### Lazy documentation and usage:
```javascript
    const questions = [
		 {
	      question: "What's 2 + 2?",
	      answers: [`4`,`2`,`1`],
	      correctAnswer: 0 // index of the correct answer in the answers array
	     },
	     {
	      question: "Is JavaScript cool?",
	      answers: [`yes`,`no`,`of course`,`yes, it is`,`yep`,`definitely`],
	      correctAnswers: [0,2,3,4] // multiple correct answers, make sure to differentiate between correctAnswer and correctAnswers
	     },
    ];

    const  quiz  =  new  Quiz(document.querySelector(".generate-quiz"), questions);
    
    quiz.render(); // resets the quiz container and renders it in randomized order
    
    const resultsObj = quiz.calculateResults(); // returns an object with point score, percentage score and total points

	quiz.disableInputs(); // user won't be able to click inputs anymore

    quiz.highlightAnswers(); // applies .generate-quiz__answer_wrong class to wrong answers and .generate-quiz__answer_correct to correct answers
```
* * *
### Is there something wrong?

Please tell me!
