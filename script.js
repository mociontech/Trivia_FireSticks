const app = document.querySelector("#app");
const startScreen = document.querySelector("#screen-start");
const registerScreen = document.querySelector("#screen-register");
const triviaScreen = document.querySelector("#screen-trivia");
const thanksScreen = document.querySelector("#screen-thanks");
const registerForm = document.querySelector("#register-form");
const keyboard = document.querySelector("#touch-keyboard");
const keyboardKeys = document.querySelector("#keyboard-keys");
const textFields = document.querySelectorAll(".field input");
const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const registerContinue = document.querySelector(".continue-button");
const questionCount = document.querySelector("#question-count");
const questionText = document.querySelector("#question-text");
const answerOptions = document.querySelectorAll(".answer-option");
const triviaContinue = document.querySelector("#trivia-continue");
const finalScore = document.querySelector("#final-score");
const prizeMessage = document.querySelector("#prize-message");
const finishButton = document.querySelector("#finish-button");
const debugLog = document.querySelector("#debug-log");
const debugLogBody = document.querySelector("#debug-log-body");
const debugLogClear = document.querySelector("#debug-log-clear");

const PERFECT_TIME_LIMIT = 15000;
const MAX_SCORE = 1000;
const DATAHUB_PENDING_KEY = "triviaFireSticksPendingDatahub";
const DATAHUB_CONFIG = {
  enabled: false,
  baseUrl: "",
  eventId: "",
  experienceId: "",
  token: "",
  source: "trivia-firesticks",
  debug: true,
  ...(window.TRIVIA_DATAHUB_CONFIG || {}),
};

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
    text: "Según el concepto del evento, ¿Qué potencia el desempeño de los equipos?",
    options: {
      A: "La jerarquía",
      B: "Humanos + Inteligencia Artificial",
      C: "El organigrama",
      D: "La automatización aislada",
    },
    correctAnswer: "B",
  },
];

const defaultKeyboardRows = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
  ["Borrar", "Espacio", "Listo"],
];

const emailKeyboardRows = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
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
  renderKeyboard(input.id === "email" ? emailKeyboardRows : defaultKeyboardRows);
  keyboard.classList.add("visible");
  input.focus({ preventScroll: true });
}

function hideKeyboard() {
  keyboard.classList.remove("visible");
  activeInput = null;
}

function isRegisterComplete() {
  return Boolean(nameInput.value.trim() && emailInput.value.trim());
}

function updateRegisterState() {
  registerContinue.disabled = !isRegisterComplete();
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

function isDatahubReady() {
  return Boolean(
    DATAHUB_CONFIG.enabled &&
      DATAHUB_CONFIG.baseUrl &&
      DATAHUB_CONFIG.eventId &&
      DATAHUB_CONFIG.experienceId &&
      DATAHUB_CONFIG.token,
  );
}

function addDebugLog(message, type = "info") {
  if (!DATAHUB_CONFIG.debug || !debugLogBody) {
    return;
  }

  const entry = document.createElement("div");
  const time = new Date().toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  entry.className = `debug-log-entry ${type}`;
  entry.textContent = `[${time}] ${message}`;
  debugLogBody.prepend(entry);
}

function getMaskedToken() {
  if (!DATAHUB_CONFIG.token) {
    return "";
  }

  return `${DATAHUB_CONFIG.token.slice(0, 12)}...${DATAHUB_CONFIG.token.slice(-8)}`;
}

function toggleDebugLog() {
  debugLog.classList.toggle("visible");
}

function normalizeBaseUrl(url) {
  return url.replace(/\/+$/, "");
}

function buildDatahubUrl(endpoint) {
  return `${normalizeBaseUrl(DATAHUB_CONFIG.baseUrl)}${endpoint}`;
}

function getPlayerData() {
  return {
    fullName: document.querySelector("#name").value.trim(),
    email: document.querySelector("#email").value.trim().toLowerCase(),
  };
}

function getPendingSubmissions() {
  try {
    const pending = JSON.parse(localStorage.getItem(DATAHUB_PENDING_KEY));
    return Array.isArray(pending) ? pending : [];
  } catch {
    return [];
  }
}

function savePendingSubmissions(submissions) {
  localStorage.setItem(DATAHUB_PENDING_KEY, JSON.stringify(submissions));
}

function queueDatahubSubmission(submission) {
  savePendingSubmissions([...getPendingSubmissions(), submission]);
  addDebugLog(`Envio en cola local: ${submission.email || "sin correo"}`, "info");
}

async function postDatahubBatch(endpoint, records, sentAt) {
  addDebugLog(`POST ${endpoint} · ${records.length} record(s)`, "info");
  const payload = {
    eventId: DATAHUB_CONFIG.eventId,
    experienceId: DATAHUB_CONFIG.experienceId,
    source: DATAHUB_CONFIG.source,
    sentAt,
    records,
  };

  addDebugLog(`URL: ${buildDatahubUrl(endpoint)}`, "info");
  addDebugLog(`AUTH: Bearer ${getMaskedToken()}`, "info");
  addDebugLog(`JSON: ${JSON.stringify(payload)}`, "info");

  const response = await fetch(buildDatahubUrl(endpoint), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${DATAHUB_CONFIG.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Datahub ${endpoint} respondio ${response.status}`);
  }

  const data = await response.json();
  addDebugLog(`${endpoint} OK · processed=${data.processed ?? "?"} failed=${data.failed ?? "?"}`, "success");
  return data;
}

async function flushPendingDatahubSubmissions() {
  if (!isDatahubReady()) {
    addDebugLog("Datahub sin configurar. No se reintenta cola local.", "info");
    return;
  }

  const pending = getPendingSubmissions();

  if (!pending.length) {
    addDebugLog("Sin envios pendientes.", "info");
    return;
  }

  addDebugLog(`Reintentando ${pending.length} envio(s) pendiente(s).`, "info");
  const failed = [];

  for (const submission of pending) {
    try {
      await sendDatahubSubmission(submission, false);
    } catch {
      failed.push(submission);
    }
  }

  savePendingSubmissions(failed);
  addDebugLog(`Reintento terminado. Pendientes restantes: ${failed.length}.`, failed.length ? "error" : "success");
}

async function sendDatahubSubmission(submission, queueOnFailure = true) {
  if (!isDatahubReady()) {
    addDebugLog("Datahub incompleto: falta enabled/baseUrl/eventId/experienceId/token.", "error");

    if (queueOnFailure) {
      queueDatahubSubmission(submission);
    }

    return;
  }

  try {
    await postDatahubBatch(
      "/experiences",
      [
        {
          email: submission.email,
          play_timestamp: submission.completedAt,
          score: submission.points,
          data: {
            fullName: submission.fullName,
            correctAnswers: submission.correctAnswers,
            totalQuestions: submission.totalQuestions,
            elapsedMs: submission.elapsedMs,
            maxScore: MAX_SCORE,
            perfectTimeLimitMs: PERFECT_TIME_LIMIT,
          },
        },
      ],
      submission.completedAt,
    );

    addDebugLog(`Envio completo: ${submission.email}`, "success");
  } catch (error) {
    console.warn("No se pudo enviar a Datahub. Se guardara para reintento.", error);
    addDebugLog(`Error Datahub: ${error.message}`, "error");

    if (queueOnFailure) {
      queueDatahubSubmission(submission);
    }
  }
}

function submitResultToDatahub(result) {
  const player = getPlayerData();

  if (!player.fullName || !player.email) {
    addDebugLog("No se envia: registro incompleto.", "error");
    return;
  }

  addDebugLog(`Preparando envio: ${player.email} · ${result.points} pts`, "info");
  sendDatahubSubmission({
    ...player,
    points: result.points,
    correctAnswers: score,
    totalQuestions: questions.length,
    elapsedMs: result.elapsedTime,
    completedAt: new Date().toISOString(),
  });
}

function getFinalResult() {
  const elapsedTime = performance.now() - quizStartTime;
  const points = calculatePoints(score, elapsedTime);

  return { points, elapsedTime };
}

function showThanksScreen() {
  const result = getFinalResult();
  triviaScreen.classList.remove("active");
  thanksScreen.classList.add("active");
  finalScore.textContent = `${result.points} pts`;
  prizeMessage.textContent = "";
  submitResultToDatahub(result);
}

function restartQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  registerForm.reset();
  updateRegisterState();
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

  if (typeof input.setSelectionRange === "function") {
    input.setSelectionRange(nextPosition, nextPosition);
  }

  updateRegisterState();
}

function deleteAtCursor(input) {
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;

  if (start !== end) {
    input.value = `${input.value.slice(0, start)}${input.value.slice(end)}`;

    if (typeof input.setSelectionRange === "function") {
      input.setSelectionRange(start, start);
    }

    updateRegisterState();
    return;
  }

  if (start > 0) {
    input.value = `${input.value.slice(0, start - 1)}${input.value.slice(end)}`;

    if (typeof input.setSelectionRange === "function") {
      input.setSelectionRange(start - 1, start - 1);
    }

    updateRegisterState();
  }
}

startScreen.addEventListener("pointerdown", showRegisterScreen);

app.addEventListener("keydown", (event) => {
  const advanceKeys = ["Enter", " ", "Spacebar", "OK"];

  if (event.key.toLowerCase() === "l") {
    toggleDebugLog();
  }

  if (startScreen.classList.contains("active") && advanceKeys.includes(event.key)) {
    event.preventDefault();
    showRegisterScreen();
  }
});

debugLogClear.addEventListener("pointerdown", () => {
  debugLogBody.innerHTML = "";
  addDebugLog("Log limpiado.", "info");
});

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!isRegisterComplete()) {
    return;
  }

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

addDebugLog("Log listo. Presiona L para mostrar u ocultar.", "info");
flushPendingDatahubSubmissions();
updateRegisterState();
app.focus();
