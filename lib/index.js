import shuffle from "lodash/shuffle";
import uniq from "lodash/uniq";
import difference from "lodash/difference";

/**
*   Generates a quiz from an array of questions.
*   @example 
*   const quiz = new Quiz(HTMLElement, questions);
*   quiz.render();
*   @param {HTMLElement} HTMLElement The container element of the quiz
*   @param {Array} Array An array of question objects
*   @returns {Object} Returns a quiz object.
*/
export default class Quiz {
    constructor(element, questions) {
        this.container = element;
        this.questions = questions;
        this._inputsDisabled = false;
        this._DOMQuestionReferences = [];
    }
    render() {
        this.container.innerHTML = "";
        this._DOMQuestionReferences = [];
        const quizTree = this._questionsToNodes();
        this.container.appendChild(quizTree);
    }
    disableInputs() {
        this._inputsDisabled = true;
        [].slice.call(this.container.querySelectorAll(".generate-quiz__answer input")).forEach(input => input.disabled = true);
    }
    _questionsToNodes() {
        const quizTree = document.createDocumentFragment();
        const containerList = document.createElement("ul");

        containerList.className = "generate-quiz__question-list";
        this.questions = shuffle(this.questions);

        this.questions.forEach(question => {
            const listItem = document.createElement("li");
            const title = document.createElement("h2");
            const list = document.createElement("ul");
            const reference = {
                question: title,
                answers: []
            };

            listItem.className = "generate-quiz__question";
            title.className = "generate-quiz__question-title";
            list.className = "generate-quiz__answer-list";
            title.textContent = question.question;

            const answersWithoutDuplicates = uniq(question.answers);
            if (answersWithoutDuplicates.length !== question.answers.length) {
                const uniqAnswerIndexes = answersWithoutDuplicates.map((item, index) => index);
                const duplicateAnswers = difference(question.correctAnswers, uniqAnswerIndexes);

                question.answers = answersWithoutDuplicates;
                question.correctAnswers = question.correctAnswers.filter(answer => duplicateAnswers.indexOf(answer) === -1);

                if (console.warn) console.warn(`generate-quiz: The question "${question.question} contains duplicate answers. They have been removed for generate-quiz to work properly!"`);
            }

            shuffle(question.answers).forEach((answer) => {
                const li = document.createElement("li");
                const input = document.createElement("input");
                const label = document.createElement("label");
                const labelText = document.createTextNode(answer);

                li.className = "generate-quiz__answer";
                input.value = answer;
                input.name = question.question;
                input.type = "correctAnswer" in question ? "radio" : "checkbox";
                li.addEventListener("click", e => {
                    if (!this._inputsDisabled) {
                        if (input.type === "radio") input.checked = true;
                        else if (e.target.nodeName === "LI") input.checked = !input.checked;
                    }
                });

                reference.answers.push({
                    input,
                    label
                });
                label.appendChild(input);
                label.appendChild(labelText);
                li.appendChild(label);
                list.appendChild(li);
            });

            this._DOMQuestionReferences.push(reference);
            listItem.appendChild(title);
            listItem.appendChild(list);
            containerList.appendChild(listItem);
            quizTree.appendChild(containerList);
        });

        return quizTree;
    }
    calculateResults() {
        const results = {
            score: 0,
            totalPoints: 0
        };

        this._DOMQuestionReferences.forEach((item, index) => {
            let correctSelected = 0;
            let wrongSelected = 0;
            let question;
            results.totalPoints++;

            item.answers.forEach(answer => {
                question = this.questions[index];

                if ("correctAnswers" in question) {
                    question.correctAnswers.forEach(answerIndex => {
                        const inputChecked = answer.input.checked;
                        const eqAnswer = answer.label.textContent === question.answers[answerIndex];
                        const indexOfAnswer = question.answers.indexOf(answer.label.textContent);
                        const wrongAnswer = question.correctAnswers.indexOf(indexOfAnswer) === -1;

                        if (inputChecked && eqAnswer) correctSelected++;
                        else if (inputChecked && wrongAnswer) wrongSelected++;
                    });
                } else {
                    const inputChecked = answer.input.checked;
                    const correctAnswer = answer.label.textContent === question.answers[question.correctAnswer];

                    if (inputChecked && correctAnswer) results.score++;
                }
            });
            if (correctSelected && correctSelected === question.correctAnswers.length) {
                if (!wrongSelected) results.score++;
                correctSelected = 0;
                wrongSelected = 0;
            }
        });

        results.percentageScore = 100 / results.totalPoints * results.score;
        return results;
    }
    highlightAnswers() {
        const addClasses = (item, condition) => {
            if (condition) item.parentNode.className += ` generate-quiz__answer_correct`;
            else item.parentNode.className += ` generate-quiz__answer_wrong`;
        };

        this._DOMQuestionReferences.forEach((item, index) => {
            const question = this.questions[index];
            const hasMultipleAnswers = "correctAnswers" in question;

            item.answers.forEach(answer => {
                const label = answer.label;

                if (hasMultipleAnswers) {
                    let isCorrect = false;
                    question.correctAnswers.forEach(answerIndex => {
                        if (label.textContent === question.answers[answerIndex]) {
                            isCorrect = true;
                        }
                    });
                    addClasses(label, isCorrect);
                } else {
                    addClasses(label,
                        label.textContent === question.answers[question.correctAnswer]);
                }
            });
        });
    }
}