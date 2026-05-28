const socket = io();

const state = {
  room: null,
  playerId: null,
  pendingBillAction: null,
  pendingBillReady: false,
  confirmTimer: null,
  confirmExpireTimer: null
};

const screens = {
  landing: document.getElementById("landing"),
  game: document.getElementById("game"),
  lobby: document.getElementById("lobbyView"),
  voting: document.getElementById("votingView"),
  result: document.getElementById("resultView"),
  ended: document.getElementById("endedView")
};

const message = document.getElementById("message");
const playerName = document.getElementById("playerName");
const roomCodeInput = document.getElementById("roomCodeInput");
const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const roomCode = document.getElementById("roomCode");
const roundLabel = document.getElementById("roundLabel");
const billBar = document.getElementById("billBar");
const billToggleBtn = document.getElementById("billToggleBtn");
const billPanel = document.getElementById("billPanel");
const billOptions = document.getElementById("billOptions");
const billMessage = document.getElementById("billMessage");
const playersList = document.getElementById("playersList");
const stats = document.getElementById("stats");
const lobbyHint = document.getElementById("lobbyHint");
const startGameBtn = document.getElementById("startGameBtn");
const scenarioTitle = document.getElementById("scenarioTitle");
const scenarioDescription = document.getElementById("scenarioDescription");
const choices = document.getElementById("choices");
const voteNotice = document.getElementById("voteNotice");
const votedPlayers = document.getElementById("votedPlayers");
const winningChoice = document.getElementById("winningChoice");
const consequence = document.getElementById("consequence");
const effects = document.getElementById("effects");
const pressureEffects = document.getElementById("pressureEffects");
const surpriseWrap = document.getElementById("surpriseWrap");
const surpriseTitle = document.getElementById("surpriseTitle");
const surpriseText = document.getElementById("surpriseText");
const surpriseEffects = document.getElementById("surpriseEffects");
const billWonNotice = document.getElementById("billWonNotice");
const resultTrend = document.getElementById("resultTrend");
const tieNotice = document.getElementById("tieNotice");
const nextRoundBtn = document.getElementById("nextRoundBtn");
const endedTitle = document.getElementById("endedTitle");
const endedReason = document.getElementById("endedReason");
const restartBtn = document.getElementById("restartBtn");
const backToLobbyBtn = document.getElementById("backToLobbyBtn");
const gameLog = document.getElementById("gameLog");

const billActionLabels = {
  calmar_policia: "Calmar a la policía",
  pedir_pizza: "Pedir pizza para distraer a todos",
  comprar_ingredientes: "Comprar más ingredientes"
};

const billActionEffects = {
  calmar_policia: { caos: -40 },
  pedir_pizza: { caos: -30, paciencia: 8 },
  comprar_ingredientes: { ingredientes: 25 }
};

createRoomBtn.addEventListener("click", () => {
  sendWithReply("createRoom", { name: playerName.value }, (response) => {
    if (!response.ok) return showMessage(response.message);
    state.playerId = response.playerId;
    clearMessage();
  });
});

joinRoomBtn.addEventListener("click", () => {
  sendWithReply("joinRoom", { name: playerName.value, code: roomCodeInput.value }, (response) => {
    if (!response.ok) return showMessage(response.message);
    state.playerId = response.playerId;
    clearMessage();
  });
});

startGameBtn.addEventListener("click", () => {
  sendWithReply("startGame", null);
});

nextRoundBtn.addEventListener("click", () => {
  sendWithReply("nextRound", null);
});

restartBtn.addEventListener("click", () => {
  sendWithReply("restartGame", null);
});

backToLobbyBtn.addEventListener("click", () => {
  sendWithReply("backToLobby", null);
});

billToggleBtn.addEventListener("click", () => {
  billPanel.classList.toggle("hidden");
});

roomCodeInput.addEventListener("input", () => {
  roomCodeInput.value = roomCodeInput.value.replace(/\D/g, "").slice(0, 4);
});

socket.on("roomState", (room) => {
  state.room = room;
  render();
});

socket.on("disconnect", () => {
  showMessage("Se perdió la conexión. Recarga la página para volver a entrar.");
});

function sendWithReply(eventName, payload, onSuccess) {
  socket.emit(eventName, payload, (response = {}) => {
    if (!response.ok) {
      showMessage(response.message || "Algo salió mal.");
      return;
    }

    clearMessage();
    if (onSuccess) onSuccess(response);
  });
}

function render() {
  if (!state.room) return;

  screens.landing.classList.add("hidden");
  screens.game.classList.remove("hidden");

  const { game } = state.room;
  roomCode.textContent = state.room.code;
  roundLabel.textContent = game.status === "lobby" ? "-" : game.round;

  renderBill();
  renderPlayers();
  renderStats(game.stats);
  renderLog();
  renderView(game.status);
}

function renderBill() {
  const { game } = state.room;
  billBar.classList.toggle("hidden", !game.hasBill || game.billUsed || game.status === "ended");

  if (game.hasBill && !game.billUsed) {
    renderBillOptions();
  } else {
    billPanel.classList.add("hidden");
    resetBillConfirmation();
  }

  if (game.billUseResult) {
    billMessage.textContent = game.billUseResult.message;
    billMessage.classList.remove("hidden");
  } else {
    billMessage.textContent = "";
    billMessage.classList.add("hidden");
  }
}

function renderBillOptions() {
  billOptions.innerHTML = "";

  Object.entries(billActionLabels).forEach(([actionId, label]) => {
    const button = document.createElement("button");
    const isPending = state.pendingBillAction === actionId;
    button.className = "bill-option";
    button.textContent = getBillButtonText(actionId, label, isPending);
    button.addEventListener("click", () => handleBillAction(actionId));
    billOptions.appendChild(button);
  });
}

function handleBillAction(actionId) {
  if (state.pendingBillAction !== actionId) {
    state.pendingBillAction = actionId;
    state.pendingBillReady = false;
    renderBillOptions();
    window.clearTimeout(state.confirmTimer);
    window.clearTimeout(state.confirmExpireTimer);
    state.confirmTimer = window.setTimeout(() => {
      state.pendingBillReady = true;
      renderBillOptions();
    }, 1000);
    state.confirmExpireTimer = window.setTimeout(() => {
      state.pendingBillAction = null;
      state.pendingBillReady = false;
      renderBillOptions();
    }, 3500);
    return;
  }

  if (!state.pendingBillReady) {
    return;
  }

  window.clearTimeout(state.confirmTimer);
  sendWithReply("useBill", { actionId }, () => {
    resetBillConfirmation();
    billPanel.classList.add("hidden");
  });
}

function resetBillConfirmation() {
  state.pendingBillAction = null;
  state.pendingBillReady = false;
  window.clearTimeout(state.confirmTimer);
  window.clearTimeout(state.confirmExpireTimer);
}

function getBillButtonText(actionId, label, isPending) {
  if (!isPending) {
    return `${label} (${formatEffectsInline(billActionEffects[actionId])})`;
  }

  return state.pendingBillReady ? "¿Estás seguro? Toca otra vez" : "Espera 1 segundo...";
}

function renderPlayers() {
  playersList.innerHTML = "";

  state.room.players.forEach((player) => {
    const item = document.createElement("li");
    item.textContent = player.name;

    if (player.id === state.room.hostId) {
      const badge = document.createElement("span");
      badge.className = "host-badge";
      badge.textContent = " anfitrión";
      item.appendChild(badge);
    }

    playersList.appendChild(item);
  });
}

function renderStats(values) {
  const statLabels = [
    ["ingredientes", "Ingredientes 🥩"],
    ["paciencia", "Paciencia 😤"],
    ["caos", "Caos 🔥"],
    ["hallacas", "Hallacas 🫔"]
  ];

  stats.innerHTML = "";
  statLabels.forEach(([key, label]) => {
    const card = document.createElement("article");
    const mood = getStatMood(key, values[key]);
    card.className = `stat-card ${mood.className}`;
    card.innerHTML = `
      <span>${label}</span>
      <strong>${values[key]}</strong>
      <div class="stat-bar" aria-hidden="true"><div style="width: ${values[key]}%"></div></div>
      <small>${mood.emoji} ${mood.label}</small>
    `;
    stats.appendChild(card);
  });
}

function renderLog() {
  gameLog.innerHTML = "";
  const log = state.room.game.log || [];

  if (!log.length) {
    const item = document.createElement("li");
    item.textContent = "Todavía no hay chismes.";
    gameLog.appendChild(item);
    return;
  }

  log.forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = entry;
    gameLog.appendChild(item);
  });
}

function renderView(status) {
  [screens.lobby, screens.voting, screens.result, screens.ended].forEach((screen) => {
    screen.classList.add("hidden");
  });

  if (status === "lobby") renderLobby();
  if (status === "voting") renderVoting();
  if (status === "result") renderResult();
  if (status === "ended") renderEnded();
}

function renderLobby() {
  screens.lobby.classList.remove("hidden");
  startGameBtn.classList.toggle("hidden", !isHost());
  lobbyHint.textContent = isHost()
    ? "Reúne a la familia y arranca cuando la cocina esté lista."
    : "Esperando que el anfitrión empiece las hallacas...";
}

function renderVoting() {
  const { game } = state.room;
  const hasVoted = game.votedPlayerIds.includes(state.playerId);

  screens.voting.classList.remove("hidden");
  scenarioTitle.textContent = game.currentScenario.title;
  scenarioDescription.textContent = game.currentScenario.description;
  voteNotice.textContent = hasVoted ? "Voto enviado." : "Elige qué hará la familia.";

  choices.innerHTML = "";
  game.currentScenario.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.textContent = choice.text;
    button.disabled = hasVoted;
    button.addEventListener("click", () => {
      sendWithReply("vote", { choiceId: choice.id });
    });
    choices.appendChild(button);
  });

  renderVotedPlayers();
}

function renderVotedPlayers() {
  votedPlayers.innerHTML = "";

  state.room.players.forEach((player) => {
    if (!state.room.game.votedPlayerIds.includes(player.id)) return;
    const item = document.createElement("li");
    item.textContent = player.name;
    votedPlayers.appendChild(item);
  });

  if (!votedPlayers.children.length) {
    const item = document.createElement("li");
    item.textContent = "Nadie ha votado todavía";
    votedPlayers.appendChild(item);
  }
}

function renderResult() {
  const result = state.room.game.result;
  screens.result.classList.remove("hidden");
  winningChoice.textContent = result.winningText;
  consequence.textContent = result.consequence;
  renderEffects(result.effects, effects);
  renderEffects(result.pressure, pressureEffects);
  renderSurprise(result.surprise);

  if (result.billWon) {
    billWonNotice.textContent = "💵 ¡La familia consiguió el billete de $100!";
    billWonNotice.classList.remove("hidden");
  } else {
    billWonNotice.textContent = "";
    billWonNotice.classList.add("hidden");
  }

  resultTrend.textContent = getResultTrend(result.effects, state.room.game.stats);
  resultTrend.className = `trend ${isDisasterTrend(result.effects, state.room.game.stats) ? "danger-trend" : ""}`;
  tieNotice.textContent = result.tieBroken ? "Hubo empate y el destino decidió." : "";
  nextRoundBtn.classList.toggle("hidden", !isHost());
}

function renderEffects(effectValues, target) {
  target.innerHTML = "";

  Object.entries(effectValues).forEach(([stat, change]) => {
    const item = document.createElement("div");
    item.className = `effect ${change < 0 ? "negative" : ""}`;
    item.innerHTML = `<span>${statLabel(stat)}</span><strong>${formatChange(change)}</strong>`;
    target.appendChild(item);
  });
}

function renderSurprise(surprise) {
  if (!surprise) {
    surpriseWrap.classList.add("hidden");
    surpriseTitle.textContent = "";
    surpriseText.textContent = "";
    surpriseEffects.innerHTML = "";
    return;
  }

  surpriseWrap.classList.remove("hidden");
  surpriseTitle.textContent = surprise.title;
  surpriseText.textContent = surprise.text;
  renderEffects(surprise.effects, surpriseEffects);
}

function renderEnded() {
  const { endedReason: reason } = state.room.game;
  const success = reason === "success";

  screens.ended.classList.remove("hidden");
  endedTitle.textContent = success ? "¡Navidad salvada!" : "La hallacada no sobrevivió.";
  endedReason.textContent = getEndedMessage(reason);
  restartBtn.classList.toggle("hidden", !isHost());
  backToLobbyBtn.classList.toggle("hidden", !isHost());
}

function getEndedMessage(reason) {
  const messages = {
    success: "¡Lo lograron! Entre gritos, risas, masa pegada y hojas por todos lados, la familia terminó las hallacas. La Navidad está salvada.",
    ingredientes: "Se acabaron los ingredientes. Sin guiso, sin hojas y sin forma de resolver, la familia acepta la derrota navideña.",
    paciencia: "La paciencia llegó a cero. La discusión se salió de control y la producción de hallacas quedó oficialmente suspendida.",
    caos: "El caos tomó la casa. Nadie sabe dónde está la masa, el guiso, las hojas ni quién dejó la hornilla prendida."
  };

  return messages[reason] || "La hallacada no pudo continuar.";
}

function getResultTrend(effectValues, currentStats) {
  if (currentStats.hallacas >= 100) {
    return "Las hallacas están listas. La Navidad respira tranquila.";
  }

  if (currentStats.caos >= 75) {
    return "El caos está subiendo. Esto ya parece diciembre en modo supervivencia.";
  }

  if (currentStats.ingredientes <= 25 || currentStats.paciencia <= 25) {
    return "La cosa se está poniendo seria. O amarran rápido o se acaba la paciencia.";
  }

  if ((effectValues.hallacas || 0) >= 10) {
    return "Van bien, pero no se confíen: una tía estresada puede acabar con todo.";
  }

  if ((effectValues.caos || 0) > 10) {
    return "La producción avanza, pero la casa está agarrando candela.";
  }

  return "Todavía hay chance, pero la cocina está al borde del colapso.";
}

function isDisasterTrend(effectValues, currentStats) {
  return (
    currentStats.ingredientes <= 25 ||
    currentStats.paciencia <= 25 ||
    currentStats.caos >= 75 ||
    ((effectValues.caos || 0) > 12 && (effectValues.hallacas || 0) < 8)
  );
}

function isHost() {
  return state.room && state.room.hostId === state.playerId;
}

function statLabel(value) {
  const labels = {
    ingredientes: "Ingredientes 🥩",
    paciencia: "Paciencia 😤",
    caos: "Caos 🔥",
    hallacas: "Hallacas 🫔"
  };

  return labels[value] || value;
}

function getStatMood(stat, value) {
  if (stat === "hallacas") {
    if (value >= 100) return { label: "¡Listas!", emoji: "🫔", className: "good" };
    if (value >= 80) return { label: "Casi listas", emoji: "🫔", className: "good" };
    if (value >= 40) return { label: "Avanzando", emoji: "🫔", className: "warning" };
    return { label: "Empezando", emoji: "🫔", className: "neutral" };
  }

  if (stat === "caos") {
    if (value <= 34) return { label: "Controlado", emoji: "😄", className: "good" };
    if (value <= 69) return { label: "Subiendo", emoji: "😐", className: "warning" };
    return { label: "Desastre", emoji: "😰", className: "critical" };
  }

  if (value >= 70) return { label: "Bien", emoji: "😄", className: "good" };
  if (value >= 35) return { label: "Cuidado", emoji: "😐", className: "warning" };
  return { label: "Crítico", emoji: "😰", className: "critical" };
}

function formatChange(value) {
  return value > 0 ? `+${value}` : String(value);
}

function formatEffectsInline(effectValues) {
  return Object.entries(effectValues)
    .map(([stat, change]) => `${statLabel(stat)} ${formatChange(change)}`)
    .join(", ");
}

function showMessage(text) {
  message.textContent = text;
  message.classList.remove("hidden");
}

function clearMessage() {
  message.textContent = "";
  message.classList.add("hidden");
}
