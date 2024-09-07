let questions = [];
let currentQuestion = 0;
let score = 0;
let bonusScore = 0;
let totalTimeSpent = 0;
let timeRemaining = 15; // 15 seconds per question
let timerInterval;
let timeTakenForCurrentQuestion = 0;
let username = "";
let backgroundMusic = new Audio("../assets/music/background-music.mp3");
let isMusicPlaying = false;

// Function to toggle music
document.getElementById("musicControl").onclick = function () {
  if (isMusicPlaying) {
    backgroundMusic.pause();
  } else {
    backgroundMusic.play();
    backgroundMusic.loop = true;
  }
  isMusicPlaying = !isMusicPlaying;
};

// Function to generate a random question
function generateQuestion() {
  const operators = ["+", "-", "*", "/"];
  let num1 = Math.floor(Math.random() * 9) + 1; // Random hundreds
  let num2 = Math.floor(Math.random() * 90) + 10; // Random tens
  let operator = operators[Math.floor(Math.random() * operators.length)];
  let correctAnswer;
  let options = [];

  if (operator === "/") {
    num1 = num2 * Math.floor(Math.random() * 9) + 1; // Ensure integer division
  }

  switch (operator) {
    case "+":
      correctAnswer = num1 + num2;
      break;
    case "-":
      correctAnswer = num1 - num2;
      break;
    case "*":
      correctAnswer = num1 * num2;
      break;
    case "/":
      correctAnswer = num1 / num2;
      break;
  }

  options.push(correctAnswer);

  // Generate 3 random wrong answers
  while (options.length < 4) {
    let wrongAnswer = Math.floor(Math.random() * 100) - 50; // Range from -1000 to 4000
    if (options.indexOf(wrongAnswer) === -1) {
      options.push(wrongAnswer);
    }
  }

  // Shuffle the options
  options = options.sort(() => Math.random() - 0.5);

  return {
    question: `${num1} ${operator} ${num2} = ?`,
    correctAnswer: correctAnswer,
    options: options,
  };
}

// Function to generate 10 random questions
function generateQuestions() {
  for (let i = 0; i < 10; i++) {
    questions.push(generateQuestion());
  }
}

// Start the game
function startGame() {
  score = 0;
  bonusScore = 0;
  totalTimeSpent = 0;
  currentQuestion = 0;
  questions = [];
  generateQuestions();
  showQuestion();
  document.querySelector(".welcome-container").style.display = "none";
  document.querySelector(".game-container").style.display = "block";
  document.querySelector("#playerName").innerText = `Player: ${username}`;
}

// Show current question
function showQuestion() {
  if (currentQuestion < 10) {
    const questionObj = questions[currentQuestion];
    document.getElementById("question").innerText = questionObj.question;
    document.getElementById("question").classList.remove("active");
    setTimeout(
      () => document.getElementById("question").classList.add("active"),
      100
    );

    const optionsDiv = document.getElementById("options");
    optionsDiv.innerHTML = "";
    questionObj.options.forEach((option) => {
      const button = document.createElement("button");
      button.className = "btn btn-option btn-light";
      button.innerText = option;
      button.onclick = () =>
        selectAnswer(option, questionObj.correctAnswer, button);
      optionsDiv.appendChild(button);
    });

    // Reset timer and start for the current question
    timeRemaining = 15;
    timeTakenForCurrentQuestion = 0;
    startTimer();
  } else {
    endGame();
  }
}

// Function for answer selection
function selectAnswer(selectedAnswer, correctAnswer, button) {
  clearInterval(timerInterval);
  const buttons = document.querySelectorAll(".btn-option");
  buttons.forEach((btn) => (btn.disabled = true));

  if (selectedAnswer === correctAnswer) {
    button.classList.add("correct");
    score += 10;
    bonusScore += 15 - timeTakenForCurrentQuestion; // Bonus only for correct answers
  } else {
    button.classList.add("wrong");
    const correctButton = Array.from(buttons).find(
      (btn) => parseInt(btn.innerText) === correctAnswer
    );
    correctButton.classList.add("correct");
  }

  setTimeout(() => {
    currentQuestion++;
    showQuestion();
  }, 1000);
}

// Timer for each question
function startTimer() {
  const timeBar = document.getElementById("time-bar");
  timerInterval = setInterval(() => {
    timeRemaining--;
    timeTakenForCurrentQuestion++;
    document.getElementById(
      "time-remaining"
    ).innerHTML = `${timeRemaining}<span>s Remaining</span>`;
    timeBar.style.width = `${(timeRemaining / 15) * 100}%`;

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      currentQuestion++;
      showQuestion();
    }
  }, 1000);
}

// End game and show results
function endGame() {
  clearInterval(timerInterval);
  totalTimeSpent =
    questions.length * 15 - (10 * 15 - timeRemaining * questions.length);
  Swal.fire({
    title: `Well done, ${username}!`,
    html: `
            <p>Your Score: ${score}</p>
            <p>Bonus Points: ${bonusScore}</p>
            <p>Total Time Spent: ${totalTimeSpent}s</p>
            <p>Correct: ${score / 10}</p>
            <p>Wrong: ${10 - score / 10}</p>
        `,
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "Retry",
    cancelButtonText: "Finish",
    customClass: {
      confirmButton: "btn btn-primary",
      cancelButton: "btn btn-danger",
    },
    buttonStyling: false,
  }).then((result) => {
    if (result.isConfirmed) {
      startGame();
    } else {
      Swal.fire({
        title: `Thank You ${username}!`,
        icon: "success",
        confirmButtonText: "Back to home",
        customClass: {
          confirmButton: "btn btn-primary btn-lg mx-2",
        },
      }).then(() => {
        window.location.reload(); // Return to welcome screen
      });
    }
  });
}

// Show game rules before starting the game
function showRules() {
  Swal.fire({
    title: "Game Rules",
    html: `
            <ul style="text-align: left;">
                <li>Answer 10 randomly generated math questions.</li>
                <li>You have 15 seconds to answer each question.</li>
                <li>Correct answers give you 10 points.</li>
                <li>Bonus points are awarded for answering quickly.</li>
                <li>If time runs out, you'll automatically move to the next question without bonus points.</li>
                <li>Final score and detailed answers will be shown at the end.</li>
            </ul>`,
    icon: "info",
    confirmButtonText: "Start Game",
    customClass: {
      confirmButton: "btn btn-primary",
    },
  }).then(() => {
    startGame();
  });
}

// Show rules when page loads
window.onload = function () {
  const welcomeForm = document.getElementById("welcomeForm");
  welcomeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    username = document.getElementById("username").value;
    showRules();
  });
};
