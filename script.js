const app = document.querySelector("#app");
const startScreen = document.querySelector("#screen-start");
const registerScreen = document.querySelector("#screen-register");
const triviaScreen = document.querySelector("#screen-trivia");
const thanksScreen = document.querySelector("#screen-thanks");
const registerForm = document.querySelector("#register-form");
const keyboard = document.querySelector("#touch-keyboard");
const keyboardKeys = document.querySelector("#keyboard-keys");
const textFields = document.querySelectorAll(".field input");
const questionCount = document.querySelector("#question-count");
const questionText = document.querySelector("#question-text");
const answerOptions = document.querySelectorAll(".answer-option");
const triviaContinue = document.querySelector("#trivia-continue");
const finalScore = document.querySelector("#final-score");
const prizeMessage = document.querySelector("#prize-message");
const finishButton = document.querySelector("#finish-button");

const PERFECT_TIME_LIMIT = 15000;
const MAX_SCORE = 1000;

let activeInput = null;
let currentQuestionIndex = 0;
let score = 0;
let quizStartTime = 0;

const questions = [
  {
    text: "¿Cuál es el concepto central de Tech HR Day 2026?",
    options: {
      A: "Digital First",
      B: "Human + IA powered by Skills",
      C: "AI vs Humans",
      D: "Future Office",
    },
    correctAnswer: "B",
  },
  {
    text: "¿Qué hace Mocion en un evento?",
    options: {
      A: "Solo monta tarimas y sonido",
      B: "Convierte una experiencia física en una interacción memorable, tecnológica y medible",
      C: "Reparte volantes en la entrada",
      D: "Vende boletas para conciertos",
    },
    correctAnswer: "B",
  },
  {
    text: "En el concepto del evento, ¿Qué representan las habilidades?",
    options: {
      A: "El estadio",
      B: "Los árbitros",
      C: "La ventaja competitiva",
      D: "Los entrenadores",
    },
    correctAnswer: "C",
  },
  {
    text: "¿Cuál de estas experiencias podría hacer parte de un evento gamificado por Mocion?",
    options: {
      A: "Una fila sin interacción",
      B: "Un discurso de 3 horas sin pausas",
      C: "Un juego interactivo con ranking, puntajes y premios",
      D: "Una mesa vacía con folletos",
    },
    correctAnswer: "C",
  },
  {
    text: "¿Qué busca impulsar Tech HR Day 2026 dentro de las organizaciones?",
    options: {
      A: "Automatización total",
      B: "Menos interacción humana",
      C: "Equipos más ágiles, humanos y competitivos",
      D: "Procesos tradicionales",
    },
    correctAnswer: "C",
  },
  {
    text: "¿Qué tipo de datos puede capturar Mocion durante una experiencia en evento?",
    options: {
      A: "Participación, puntajes, registros e interacciones de los usuarios",
      B: "El color favorito del clima",
      C: "La cantidad de nubes en el cielo",
      D: "El horóscopo del público",
    },
    correctAnswer: "A",
  },
  {
    text: "¿Cuál es uno de los principales objetivos del evento?",
    options: {
      A: "Venta de tecnología",
      B: "Networking y conversaciones estratégicas",
      C: "Reclutamiento masivo",
      D: "Competencias deportivas",
    },
    correctAnswer: "B",
  },
  {
    text: "¿Cuál es una de las grandes ventajas de gamificar un evento?",
    options: {
      A: "Que las personas participen más, se diviertan y recuerden mejor la marca",
      B: "Que nadie se acerque al stand",
      C: "Que el evento sea más silencioso",
      D: "Que los premios se queden guardados",
    },
    correctAnswer: "A",
  },
  {
    text: "Según el concepto del evento, ¿Qué potencia el desempeño de los equipos?",
    options: {
      A: "La jerarquía",
      B: "Humanos + Inteligencia Artificial",
      C: "El organigrama",
      D: "La automatización aislada",
    },
    correctAnswer: "B",
  },
  {
    text: "En el mundo de Mocion, una experiencia exitosa no solo debe verse bien, también debe...",
    options: {
      A: "Ser medible, interactiva y generar valor para la marca",
      B: "Durar máximo 10 segundos",
      C: "Tener muchas sillas",
      D: "No usar tecnología",
    },
    correctAnswer: "A",
  },
];

const defaultKeyboardRows = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
  ["Borrar", "Espacio", "Listo"],
];

const emailKeyboardRows = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M", "@", ".", "_"],
  ["Borrar", "-", "Espacio", "Listo"],
];

function showRegisterScreen() {
  startScreen.classList.remove("active");
  registerScreen.classList.add("active");
}

function showKeyboard(input) {
  activeInput = input;
  renderKeyboard(input.type === "email" ? emailKeyboardRows : defaultKeyboardRows);
  keyboard.classList.add("visible");
  input.focus({ preventScroll: true });
}

function hideKeyboard() {
  keyboard.classList.remove("visible");
  activeInput = null;
}

function showTriviaScreen() {
  hideKeyboard();
  registerScreen.classList.remove("active");
  triviaScreen.classList.add("active");
  currentQuestionIndex = 0;
  score = 0;
  quizStartTime = performance.now();
  renderQuestion();
}

function calculatePoints(correctAnswers, elapsedTime) {
  const accuracyRatio = correctAnswers / questions.length;
  const basePoints = MAX_SCORE * accuracyRatio;
  const extraSeconds = Math.max(0, (elapsedTime - PERFECT_TIME_LIMIT) / 1000);
  const timeMultiplier = Math.max(0.35, 1 - extraSeconds * 0.015);

  return Math.round(basePoints * timeMultiplier);
}

function getFinalResult() {
  const elapsedTime = performance.now() - quizStartTime;
  const points = calculatePoints(score, elapsedTime);

  return { points };
}

function showThanksScreen() {
  const result = getFinalResult();
  triviaScreen.classList.remove("active");
  thanksScreen.classList.add("active");
  finalScore.textContent = `${result.points} pts`;
  prizeMessage.textContent = "";
}

function restartQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  registerForm.reset();
  thanksScreen.classList.remove("active");
  startScreen.classList.add("active");
  app.focus();
}

function renderQuestion() {
  const question = questions[currentQuestionIndex];
  questionCount.textContent = `Pregunta ${currentQuestionIndex + 1}`;
  questionText.textContent = question.text;

  answerOptions.forEach((option) => {
    const answerKey = option.dataset.answer;
    option.textContent = `${answerKey}) ${question.options[answerKey]}`;
    option.classList.remove("selected", "correct-answer");

    if (answerKey === question.correctAnswer) {
      option.classList.add("correct-answer");
    }
  });
}

function renderKeyboard(rows) {
  keyboardKeys.innerHTML = "";

  rows.flat().forEach((keyValue) => {
    const key = document.createElement("button");
    key.type = "button";
    key.className = "key";
    key.textContent = keyValue;
    key.dataset.key = keyValue;

    if (keyValue === "Borrar" || keyValue === "Listo") {
      key.classList.add("key-wide");
    }

    if (keyValue === "Espacio") {
      key.classList.add("key-space");
    }

    if (keyValue === "Listo") {
      key.classList.add("key-done");
    }

    keyboardKeys.appendChild(key);
  });
}

function insertAtCursor(input, value) {
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  input.value = `${input.value.slice(0, start)}${value}${input.value.slice(end)}`;
  const nextPosition = start + value.length;
  input.setSelectionRange(nextPosition, nextPosition);
}

function deleteAtCursor(input) {
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;

  if (start !== end) {
    input.value = `${input.value.slice(0, start)}${input.value.slice(end)}`;
    input.setSelectionRange(start, start);
    return;
  }

  if (start > 0) {
    input.value = `${input.value.slice(0, start - 1)}${input.value.slice(end)}`;
    input.setSelectionRange(start - 1, start - 1);
  }
}

startScreen.addEventListener("pointerdown", showRegisterScreen);

app.addEventListener("keydown", (event) => {
  const advanceKeys = ["Enter", " ", "Spacebar", "OK"];

  if (startScreen.classList.contains("active") && advanceKeys.includes(event.key)) {
    event.preventDefault();
    showRegisterScreen();
  }
});

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  showTriviaScreen();
});

textFields.forEach((input) => {
  input.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    showKeyboard(input);
  });
});

keyboardKeys.addEventListener("pointerdown", (event) => {
  const key = event.target.closest(".key");

  if (!key || !activeInput) {
    return;
  }

  event.preventDefault();

  if (key.dataset.key === "Borrar") {
    deleteAtCursor(activeInput);
  } else if (key.dataset.key === "Espacio") {
    insertAtCursor(activeInput, " ");
  } else if (key.dataset.key === "Listo") {
    hideKeyboard();
  } else {
    insertAtCursor(activeInput, key.dataset.key);
  }

  if (activeInput) {
    activeInput.focus({ preventScroll: true });
  }
});

answerOptions.forEach((option) => {
  option.addEventListener("pointerdown", () => {
    answerOptions.forEach((currentOption) => currentOption.classList.remove("selected"));
    option.classList.add("selected");
  });
});

triviaContinue.addEventListener("pointerdown", () => {
  if (!triviaScreen.classList.contains("active")) {
    return;
  }

  const selectedOption = document.querySelector(".answer-option.selected");

  if (!selectedOption) {
    return;
  }

  const question = questions[currentQuestionIndex];

  if (selectedOption.dataset.answer === question.correctAnswer) {
    score += 1;
  }

  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex += 1;
    renderQuestion();
  } else {
    showThanksScreen();
  }
});

finishButton.addEventListener("pointerdown", restartQuiz);

app.focus();
