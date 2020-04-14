let currentQuestion;

let countOfQuestions = 5;
let currentQuestionIndex = 0;
let correctAnswers = 0;

class Question {
    constructor(formula, answer) {
        this.formula = formula;
        this.answer = answer;
    }
}

function createQuestion() {
    currentQuestion = generateQuestion();
    document.getElementById('formula').innerHTML = currentQuestion.formula;
}

function next() {
    let currentAnswerElement = document.getElementById(currentQuestion.answer.toString());

    if (currentAnswerElement.checked) {
        correctAnswers++;
    }

    ++currentQuestionIndex;
    document.getElementById('score').innerHTML = (10 * correctAnswers / countOfQuestions).toString();
    if (currentQuestionIndex === countOfQuestions) {
        document.getElementById('questSection').style.display = 'none';
        return document;
    }

    currentQuestion = generateQuestion();
    document.getElementById('formula').innerHTML = currentQuestion.formula;
}

function generateQuestion() {
    createController();
    let formula = generateFormula();
    let answer = controller.buildTest(formula) === formula;

    return new Question(formula, answer);
}
