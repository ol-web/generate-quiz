import '../scss/styles.scss';

import request from 'superagent';
import Entities from 'html-entities';
import Quiz from "../../../lib/index";

const decode = new Entities.AllHtmlEntities().decode;

request
    .get('https://opentdb.com/api.php?amount=10&difficulty=easy')
    .set('accept', 'json')
    .end((err, res) => {
        const quizBtn = document.querySelector(".generate-quiz__btn-results");
        const quizBtnReset = document.querySelector(".generate-quiz__btn-reset");
        const quizBtnChange = document.querySelector(".generate-quiz__btn-change-questions");
        const quizResults = document.querySelector(".generate-quiz__results");
        const questions = [{
            question: "Is JavaScript cool?",
            answers: [`yes`, `no`, `of course`, `yes`, `no`, `definitely`],
            correctAnswers: [0, 2, 3, 4, 5]
        }];

        if (err) quizResults.textContent = "Error loading quiz questions!";

        // converting API questions to generate-quiz format
        const APIFormatToQuizFormat = (res, questions) => {
            res.body.results.forEach(obj => {
                const question = {};
                question.question = decode(obj.question);
                question.answers = obj.incorrect_answers;
                question.answers.push(obj.correct_answer);
                question.answers = question.answers.map(answer => decode(answer));
                question.correctAnswer = question.answers.length - 1;

                questions.push(question);
            });
        };
        APIFormatToQuizFormat(res, questions);

        const quiz = new Quiz(document.querySelector(".generate-quiz"), questions);
        quiz.render();
        window.quiz = quiz;

        quizBtn.addEventListener("click", () => {
            const results = quiz.calculateResults();
            quiz.disableInputs();
            quiz.highlightAnswers();

            quizResults.textContent = `Your have received ${results.score} out of ${results.totalPoints} points. Your percentage score is ${Math.round(results.percentageScore)}%`;
        });

        quizBtnReset.addEventListener("click", () => {
            quiz.render();
            quizResults.textContent = `Quiz reset!`;
        });

        quizBtnChange.addEventListener("click", () => {
            request
                .get('https://opentdb.com/api.php?amount=3&difficulty=easy')
                .set('accept', 'json')
                .end((err, res) => {
                    const questions = [];
                    APIFormatToQuizFormat(res, questions);
                    quiz.questions = questions;
                    quiz.render();

                    quizResults.textContent = `Changed questions!`;
                });
        });

        console.info("Array of question objects", questions);
        console.info("Quiz instance", quiz);
    });