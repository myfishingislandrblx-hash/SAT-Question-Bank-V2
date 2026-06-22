// =========================
// Question Data (PLACEHOLDER)
// =========================
//
// Replace this with your real questions. Do NOT paste copyrighted text here
// unless you have the rights. For College Board material, keep this private.
//
// Each question object:
// {
//   id: 1,
//   topic: "Grammar",
//   question: "Placeholder question text...",
//   choices: ["A", "B", "C", "D"],
//   correctIndex: 1,
//   explanation: "Why this answer is correct..."
// }

const QUESTIONS = [
  {
    id: 1,
    topic: "Grammar",
    question: "In the context of the sentence, which choice best maintains the sentence’s clarity and correctness?",
    choices: [
      "Choice A placeholder",
      "Choice B placeholder",
      "Choice C placeholder",
      "Choice D placeholder"
    ],
    correctIndex: 2,
    explanation: "Explanation placeholder: describe why choice C is best and why others are weaker."
  },
  {
    id: 2,
    topic: "Rhetoric",
    question: "Which choice best introduces the main idea of the paragraph?",
    choices: [
      "Choice A placeholder",
      "Choice B placeholder",
      "Choice C placeholder",
      "Choice D placeholder"
    ],
    correctIndex: 0,
    explanation: "Explanation placeholder: tie to main idea and logical flow."
  },
  {
    id: 3,
    topic: "Reading",
    question: "Based on the passage, the author’s attitude toward the subject is best described as:",
    choices: [
      "Choice A placeholder",
      "Choice B placeholder",
      "Choice C placeholder",
      "Choice D placeholder"
    ],
    correctIndex: 1,
    explanation: "Explanation placeholder: reference key lines that show tone."
  }
  // Add more questions here...
];

// =========================
// State
// =========================

let currentSessionQuestions = [];
let currentIndex = 0;
let selectedChoiceIndex = null;
let currentTopicFilter = "all";

// Persistent stats in localStorage
const STORAGE_KEY = "oneprep_style_stats";

function loadStats() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      totalAnswered: 0,
      totalCorrect: 0,
      topicStats: {} // topic -> { answered, correct }
    };
  }
  try {
    return JSON.parse(raw);
  } catch {
    return {
      totalAnswered: 0,
      totalCorrect: 0,
      topicStats: {}
    };
  }
}

function saveStats(stats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

// =========================
// DOM Elements
// =========================

const lobbyScreen = document.getElementById("lobby-screen");
const practiceScreen = document.getElementById("practice-screen");

const topicSelect = document.getElementById("topic-select");
const questionCountInput = document.getElementById("question-count");
const startBtn = document.getElementById("start-btn");

const statTotal = document.getElementById("stat-total");
const statCorrect = document.getElementById("stat-correct");
const statAccuracy = document.getElementById("stat-accuracy");
const topicBarCanvas = document.getElementById("topic-bar-chart");

const backToLobbyBtn = document.getElementById("back-to-lobby");
const practiceTopicLabel = document.getElementById("practice-topic-label");
const practiceProgress = document.getElementById("practice-progress");

const questionTextEl = document.getElementById("question-text");
const answerChoicesEl = document.getElementById("answer-choices");
const feedbackContainer = document.getElementById("feedback-container");
const feedbackResult = document.getElementById("feedback-result");
const feedbackExplanation = document.getElementById("feedback-explanation");

const submitAnswerBtn = document.getElementById("submit-answer");
const nextQuestionBtn = document.getElementById("next-question");

// =========================
// Screen Management
// =========================

function showScreen(screenName) {
  if (screenName === "lobby") {
    lobbyScreen.classList.add("active");
    practiceScreen.classList.remove("active");
  } else {
    lobbyScreen.classList.remove("active");
    practiceScreen.classList.add("active");
  }
}

// =========================
// Question Selection
// =========================

function getFilteredQuestions(topic) {
  if (topic === "all") return QUESTIONS.slice();
  return QUESTIONS.filter(q => q.topic === topic);
}

function startPractice() {
  const topic = topicSelect.value;
  currentTopicFilter = topic;

  const count = Math.max(
    1,
    Math.min(parseInt(questionCountInput.value || "1", 10), 100)
  );

  const pool = getFilteredQuestions(topic);
  if (pool.length === 0) {
    alert("No questions available for this topic yet.");
    return;
  }

  // Shuffle and slice
  const shuffled = pool.sort(() => Math.random() - 0.5);
  currentSessionQuestions = shuffled.slice(0, count);

  currentIndex = 0;
  selectedChoiceIndex = null;

  practiceTopicLabel.textContent =
    topic === "all" ? "Topic: All" : `Topic: ${topic}`;
  showScreen("practice");
  renderQuestion();
}

// =========================
// Rendering Questions
// =========================

function renderQuestion() {
  const q = currentSessionQuestions[currentIndex];
  if (!q) return;

  practiceProgress.textContent = `Question ${currentIndex + 1} of ${currentSessionQuestions.length}`;

  questionTextEl.textContent = q.question;
  answerChoicesEl.innerHTML = "";
  feedbackContainer.classList.add("hidden");
  submitAnswerBtn.disabled = false;
  nextQuestionBtn.disabled = true;
  selectedChoiceIndex = null;

  q.choices.forEach((choiceText, index) => {
    const li = document.createElement("li");
    const label = document.createElement("label");
    label.className = "answer-option";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "answer";
    input.value = index;

    input.addEventListener("change", () => {
      selectedChoiceIndex = index;
      // Highlight selected
      document
        .querySelectorAll(".answer-option")
        .forEach(el => el.classList.remove("selected"));
      label.classList.add("selected");
    });

    const span = document.createElement("span");
    span.textContent = choiceText;

    label.appendChild(input);
    label.appendChild(span);
    li.appendChild(label);
    answerChoicesEl.appendChild(li);
  });
}

// =========================
// Answer Handling
// =========================

function submitAnswer() {
  if (selectedChoiceIndex === null) {
    alert("Select an answer first.");
    return;
  }

  const q = currentSessionQuestions[currentIndex];
  const isCorrect = selectedChoiceIndex === q.correctIndex;

  // Update feedback
  feedbackContainer.classList.remove("hidden");
  feedbackResult.textContent = isCorrect ? "Correct!" : "Incorrect.";
  feedbackResult.className = "";
  feedbackResult.classList.add(isCorrect ? "correct" : "incorrect");
  feedbackExplanation.textContent = q.explanation;

  // Update stats
  const stats = loadStats();
  stats.totalAnswered += 1;
  if (isCorrect) stats.totalCorrect += 1;

  if (!stats.topicStats[q.topic]) {
    stats.topicStats[q.topic] = { answered: 0, correct: 0 };
  }
  stats.topicStats[q.topic].answered += 1;
  if (isCorrect) stats.topicStats[q.topic].correct += 1;

  saveStats(stats);
  renderStats(stats);

  submitAnswerBtn.disabled = true;
  nextQuestionBtn.disabled = false;
}

function nextQuestion() {
  currentIndex += 1;
  if (currentIndex >= currentSessionQuestions.length) {
    // Session finished
    alert("Session complete!");
    showScreen("lobby");
    return;
  }
  renderQuestion();
}

// =========================
// Stats + Bar Graph
// =========================

function renderStats(stats) {
  statTotal.textContent = stats.totalAnswered;
  statCorrect.textContent = stats.totalCorrect;
  const accuracy =
    stats.totalAnswered === 0
      ? 0
      : Math.round((stats.totalCorrect / stats.totalAnswered) * 100);
  statAccuracy.textContent = `${accuracy}%`;

  renderTopicBarChart(stats.topicStats);
}

function renderTopicBarChart(topicStats) {
  const ctx = topicBarCanvas.getContext("2d");
  ctx.clearRect(0, 0, topicBarCanvas.width, topicBarCanvas.height);

  const topics = Object.keys(topicStats);
  if (topics.length === 0) {
    ctx.fillStyle = "#6b7280";
    ctx.font = "14px system-ui";
    ctx.fillText("No topic data yet. Complete some questions first.", 10, 30);
    return;
  }

  const accuracies = topics.map(t => {
    const { answered, correct } = topicStats[t];
    return answered === 0 ? 0 : correct / answered;
  });

  const padding = 30;
  const chartWidth = topicBarCanvas.width - padding * 2;
  const chartHeight = topicBarCanvas.height - padding * 2;
  const barWidth = chartWidth / topics.length - 20;

  ctx.font = "12px system-ui";

  topics.forEach((topic, i) => {
    const accuracy = accuracies[i];
    const barHeight = accuracy * chartHeight;

    const x = padding + i * (barWidth + 20);
    const y = padding + (chartHeight - barHeight);

    // Bar
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(x, y, barWidth, barHeight);

    // Topic label
    ctx.fillStyle = "#e5e7eb";
    ctx.textAlign = "center";
    ctx.fillText(topic, x + barWidth / 2, topicBarCanvas.height - 8);

    // Accuracy label
    ctx.fillStyle = "#9ca3af";
    ctx.textAlign = "center";
    ctx.fillText(
      `${Math.round(accuracy * 100)}%`,
      x + barWidth / 2,
      y - 4
    );
  });

  // Y-axis line
  ctx.strokeStyle = "#4b5563";
  ctx.beginPath();
  ctx.moveTo(padding - 5, padding);
  ctx.lineTo(padding - 5, padding + chartHeight);
  ctx.stroke();
}

// =========================
// Event Listeners
// =========================

startBtn.addEventListener("click", startPractice);
backToLobbyBtn.addEventListener("click", () => {
  showScreen("lobby");
});

submitAnswerBtn.addEventListener("click", submitAnswer);
nextQuestionBtn.addEventListener("click", nextQuestion);

// =========================
// Init
// =========================

(function init() {
  const stats = loadStats();
  renderStats(stats);
  showScreen("lobby");
})();
