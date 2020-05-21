//CONSTANT
const question = document.getElementById("question-box");
const answerButtonsElement = Array.from(document.getElementsByClassName("choice-text"));
const prizeText = document.getElementById('prize');
const animateTimer = document.querySelector('.info-timer');
const gamepage = document.getElementById('gamepage');
const answercount = document.getElementById("answercount");
const topScores = JSON.parse(localStorage.getItem("topScores")) || [];
const buttons = document.querySelectorAll('.btnchoice');
const jackPot = 9;
const totalQuestion = 10;
const totalWrongAnswer = 3;
//------------------MOney Prize in Array-------------------
const Prize = [
    '€0',
    '€100,000',
    '€500,000',
    '€1,000,000',
    '€5,000,000',
    '€10,000,000',
    '€50,000,000',
    '€100,000,000',
    '€500,000,000',
    '€1,000,000,000',
    '€2,400,000,000',
];


let CurrentQuestionIndex = 0;
let CurrentMoneyIndex = 0;
let answer = 0;
let questions = [];
let availableQuestion = [];
let randomQuestion;
let playerName;
let timer;
let sound = true;
let timerMusic = new Audio('assets/sounds/suspense.wav');
let gameMusic = new Audio('assets/sounds/gamesound.mp3');
let endMusic = new Audio('assets/sounds/police.wav');
let correctMusic = new Audio('assets/sounds/correct.wav');
let incorrectMusic = new Audio('assets/sounds/incorrect.mp3');
let victoryMusic = new Audio('assets/sounds/victorymusic.wav');

$(document).ready(function () {
    gameMusic.play();
    $('#nameModal').modal('show');
    $('#gamepage').hide();

    //background music on/off
    $('#soundButton').click(() => {
        let soundOn = sound;
        soundOn ? stopGameMusic() : startGameMusic();
    });

    function stopGameMusic() {
        sound = false;
        $('#soundButton').addClass('soundOff');
        $('#soundButton').removeClass('soundOn');
        gameMusic.pause();
    }

    function startGameMusic() {
        sound = true;
        $('#soundButton').addClass('soundOn');
        $('#soundButton').removeClass('soundOff');
        gameMusic.play();
    }

});

fetch("https://opentdb.com/api.php?amount=13&difficulty=easy&type=multiple")
    .then((resp) => resp.json())
    .then((allQuestions) => {
        questions = allQuestions.results.map(function (results) {
            const newQuestion = {
                question: results.question,
            };
            const multipleAnswer = [...results.incorrect_answers];
            newQuestion.answer = Math.floor(Math.random() * 4) + 1;
            multipleAnswer.splice(newQuestion.answer - 1, 0, results.correct_answer);
            multipleAnswer.forEach((choice, index) => {
                newQuestion["choice" + (index + 1)] = choice;
            });
            return newQuestion;
        });
    })
    .catch(err => {
        console.error(err);
    });

startGame = () => {
    answeredCorrect = 0;
    answer = 0;
    currentQuestion = 0;
    CurrentMoneyIndex = 0;
    availablePrize = [...Prize];
    randomQuestion = questions.sort(() => Math.random() - 5);
    CurrentQuestionIndex = 0;
    availableQuestion = [...questions];
    nextQuestion();
};

//------------------Show next questions-------------------
/* Function on how to get/load the next Question from the API */
nextQuestion = () => {
    showQuestion(randomQuestion[CurrentQuestionIndex]);
};
//------------------Show the Questions-------------------
/* Function on how to load the next question from the API Array */
showQuestion = () => {
    if (answeredCorrect === totalQuestion) {
        console.log(answeredCorrect === totalQuestion);
        stopMusic();
        endGame();
        return;
    }
    CurrentQuestionIndex++;
    if (currentQuestion = availableQuestion[CurrentQuestionIndex]) {
        question.innerHTML = `<h2>Question : ${CurrentQuestionIndex}</h2><h2>${currentQuestion["question"]}</h2> `;

    }
    console.log(currentQuestion);

    answerButtonsElement.forEach(choice => {

        const number = choice.dataset["number"];
        choice.innerHTML = currentQuestion["choice" + number];

    });
    
    if (sound === false) {
    timerMusic.pause();
    } else {
        timerMusic.play();
    }
    acceptingAnswer = true;
    enableBtn();
    return;

}
//------------------ Multiple choice -------------------
/* Function on how to place the answer and show correct/incorrect choice from the API  */
answerButtonsElement.forEach(choice => {
    choice.addEventListener("click", e => {
        stopMusic();
        if (!acceptingAnswer) return;
        buttons.disabled = !buttons.disabled;
        buttons.disabled = true;
        acceptingAnswer = false;
        const selectedChoice = e.target;
        const selectedAnswer = selectedChoice.dataset["number"];


        setStatusClass(document.body, selectedAnswer)

        function setStatusClass(htmlElement, selectedAnswer) {

            if (selectedAnswer == currentQuestion.answer) {
                clearStatusClass(htmlElement);
                // use the classList API to add classes
                htmlElement.classList.add('correct');
                plusWin();
                correctMusic.play();

            } else {
                htmlElement.classList.add('incorrect');
                incorrectMusic.play();
                strikeOut();

            }
            return;

        }
        // use the classList API to remove classes
        function clearStatusClass(htmlElement) {
            htmlElement.classList.remove('correct');
            htmlElement.classList.remove('incorrect');
        }

        setTimeout(function () {
            document.body.classList.remove('correct');
            document.body.classList.remove('incorrect');
            nextQuestion();
            buttons.forEach(button => {
                button.disabled = true;
            });
            //animateTimer.classList.remove('animated', 'bounceOutLeft');
        }, 1000);
    });
});
//------------------Total Prize Won-------------------
/* Function on how to get the Prize from  correct answers */
plusWin = () => {
    CurrentMoneyIndex++;
    answeredCorrect++;
    currentPrize = availablePrize[CurrentMoneyIndex];
    if (answeredCorrect >= jackPot) {
        prizeText.innerHTML = `
    Money Heist! ${currentPrize}<n/>
    <br>
    <p class="info-prize-jackpot">THE LAST QUESTION!</p>`;
    } else {
        prizeText.innerHTML =
            `
         Money Heist! ${currentPrize}<n/>
        <br>
        <p> <span class="info-prize-correct">
        ${answeredCorrect}</span>
        correct answer!</p>`;
    }

};
//------------------Wrong Answer-------------------
/* Function on how to get 3 wrong answer and show game over modal */
strikeOut = () => {
    answer++;
    console.log(answer);
    if (answer >= totalWrongAnswer) {
        document.body.classList.remove('incorrect');
        endMusic.play();
        $('#gameOverModal').modal('show');
        $('#gamepage').hide();
        stopMusic();
        if (currentPrize != 0) {
            document.getElementById("playerScore").innerHTML = `Total Money Heist ${currentPrize}`;
        }
        saveTopScore();
    }

    answercount.innerHTML = `Strike <span class="info-strike">${answer}</span> out of <span class="info-strike">${totalWrongAnswer}</span>!`;
}
//------------------Start Timer-------------------
/* Function for Timed Questions */
startTimer = () => {

    var count = 10;
    timer = setInterval(function () {
            console.log(count);
            const hourGlass = document.getElementById("countdown-timer");
            hourGlass.innerHTML = `<span><i class="fas fa-hourglass-half"></i></span>Timer : ${count}`;
            count--;

            if (count < 0) {
                clearInterval(timer);
                endMusic.play();
                stopInterval();
                strikeOut();
                setTimeout(function () {
                    nextQuestion();
                    buttons.forEach(button => {
                        button.disabled = true;
                    });
                    //animateTimer.classList.remove('animated', 'bounceOutLeft');
                }, 8000);
                animateTimer.classList.add('animated', 'flip');
            }
        },
        1000);

    var stopInterval = function () {
        console.log('time is up!');
        document.getElementById("countdown-timer").innerHTML = "time is up!";
    }
}


//------------------Timed Buttons-------------------
/* Function to show disabled/hide Buttons */
enableBtn = () => {
    var delay = 5;
    var buttonsTimer = setInterval(() => {
        console.log(delay);
        delay--;
        document.getElementById("countdown-timer").innerHTML = "GOODLUCK!";
        clearInterval(timer);
        if (delay < 0) {
            buttons.forEach(button => {
                button.disabled = false;
            });
            clearInterval(buttonsTimer);
            //startTimer();
        } else {
            clearTimeout(delay, 1000);
        }
    }, 1000);
}

//------------------Players Name-------------------
/* Function to print the name of the Player*/


document.getElementById("nameModalexit").addEventListener("click", function () {
    playerName = document.getElementById("myText").value;
    if (playerName.length === 0) {
        document.getElementById("noName").innerHTML = `<div style="border: 0.1rem solid #C81912; background: white;">Por favor! Tu nombre / Please! enter your codename</div>`;
    } else {
        gameMusic.pause();
        $('#nameModal').modal('hide');
        $('#gamepage').show();
        setTimeout(() => {
            startGame();
        }, 2000);
    }

    document.getElementById("codename").innerHTML =
        `<img src="assets/images/codename1.png"></img>
         Hola! ${playerName}
         <img src="assets/images/codename1.png"></img>
         `;
});


//------------------The End Game-------------------
/* Function for the modal to show for the bravest and wisest of them all */
endGame = () => {
    victoryMusic.play();
    console.log(playerName);
    //answer++;
    if (CurrentQuestionIndex >= totalQuestion) {
        stopMusic();
        document.getElementById("playerWin").innerHTML = `Well done ${playerName}!`;
        $('#winModal').modal('show');
        $('#gamepage').hide();
        saveTopScore();
    }

}
stopMusic = () => {
    timerMusic.pause();
    
}

document.getElementById("soundTimer").addEventListener("click", function () {
    console.log("stop the music");
 
  
   timerSoundOn = sound;
    
  
        timerSoundOn ? stopSound() : startSound();
    

    function stopSound() {
        sound = false;
        $('#soundTimer').addClass('soundOff');
        $('#soundTimer').removeClass('soundOn');
        timerMusic.pause();
    }

    function startSound() {
        sound = true;
        $('#soundTimer').addClass('soundOn');
        $('#soundTimer').removeClass('soundOff');
        timerMusic.play();
    }
});
 

//------------------Player Name Modal-------------------

/*window.onload = function () {
    gameMusic.play();
    document.getElementById('nameModal').style.display = "block";
    document.getElementById('nameModal').style.background = "url(assets/images/blur3.png) no-repeat center center fixed";
    document.getElementById('nameModal').style.backgroundSize = "cover";
    document.getElementById('gamepage').style.display = "none";
};*/

//------------------Best Robber Score-------------------
/* Function to save top Score*/
saveTopScore = () => {
    const score = {
        name: playerName,
        money: currentPrize,
    }

    topScores.push(score);
    topScores.sort((a, b) => b.score - a.score);
    topScores.splice(10);

    localStorage.setItem("topScores", JSON.stringify(topScores));
}

const richList = document.getElementById('richList');
richList.innerHTML = topScores

    .map(score => {
        return `<li class="high-score">${score.name} - ${score.money}</li>`;
    })
    .join("");




 