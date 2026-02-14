const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("game-status");
const resetButton = document.getElementById("reset-button");
const computerModeToggle = document.getElementById("computer-mode");
const undoButton = document.getElementById("undo-button");

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;
let vsComputer = false;
let moveHistory = [];
let undoUsed = false;
let computerMoveTimeout = null;
// 💬 To avoid repeating same taunt twice
let tauntMemory = { last: null };


const taunts = [
  "Nice move!",
  "You're on fire! 🔥",
  "Well played!",
  "This is getting interesting 😏",
  "Ooooh, sneaky one!",
  "Watch out! 😮",
  "Let’s goooo! 🚀",
  "Boom! 👊",
  "Tension rising… 💥"
];

const winConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

function initializeGame() {
  cells.forEach(cell => cell.addEventListener("click", handleCellClick));
  resetButton.addEventListener("click", resetGame);

  computerModeToggle.addEventListener("change", () => {
  vsComputer = computerModeToggle.checked;

  // Show Undo button only for vs Computer mode
  if (vsComputer) {
    undoButton.style.display = "inline-block";
  } else {
    undoButton.style.display = "none";
  }

  resetGame();
});

  statusText.textContent = `Player ${currentPlayer}'s turn`;

  undoButton.addEventListener("click", () => {
    if (vsComputer && !undoUsed && moveHistory.length > 0 && gameActive) {
      if (computerMoveTimeout) {
        clearTimeout(computerMoveTimeout); // cancel computer move
        computerMoveTimeout = null;
      }

      const lastSavedState = moveHistory.pop();
      board = [...lastSavedState];
      updateBoardUI();

      currentPlayer = "X";
      statusText.textContent = "Undo used! Player X's turn";
      undoUsed = true;
    } else if (vsComputer && undoUsed && gameActive) {
      alert("⚠️ Undo can only be used once per game!");
    }
  });
}

function updateBoardUI() {
  board.forEach((value, index) => {
    document.getElementById(index).textContent = value;
  });
  cells.forEach(cell => cell.classList.remove("winning-cell"));
}

function handleCellClick(e) {
  const cell = e.target;
  const index = parseInt(cell.id);

  if (board[index] !== "" || !gameActive) return;

  if (vsComputer && currentPlayer === "X" && !undoUsed) {
    moveHistory.push([...board]);
  }

  makeMove(index, currentPlayer);

  if (gameActive) displayTaunt();

  if (vsComputer && currentPlayer === "O" && gameActive) {
    computerMoveTimeout = setTimeout(() => {
      computerMove();
      computerMoveTimeout = null;
    }, 2000);
  }
}

function makeMove(index, player) {
  board[index] = player;
  document.getElementById(index).textContent = player;

  const cellElement = document.getElementById(index);
  cellElement.textContent = player;

  if (player === "X") {
    cellElement.style.color = "#00ffe7"; 
  } else {
    cellElement.style.color = "#ff4081"; 
  }


  checkWinner();
  if (gameActive) switchPlayer();
  cellElement.classList.add("clicked");

  setTimeout(() => {
  cellElement.classList.remove("clicked");
  }, 200);

}

function switchPlayer() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

function computerMove() {
  let emptyCells = board.map((val, i) => val === "" ? i : null).filter(i => i !== null);
  if (emptyCells.length === 0 || !gameActive) return;

  const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  makeMove(randomIndex, "O");
  if (gameActive) displayTaunt();
}

function checkWinner() {
  let roundWon = false;

  for (let condition of winConditions) {
    const [a, b, c] = condition;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      roundWon = true;
      document.getElementById(a).classList.add("winning-cell");
      document.getElementById(b).classList.add("winning-cell");
      document.getElementById(c).classList.add("winning-cell");
      break;
    }
  }

  if (roundWon) {
    statusText.textContent = `🎉 Player ${currentPlayer} wins! 🎊 Great Job!`;
    gameActive = false;

    if (typeof confetti === 'function') {
      confetti({
        particleCount: 400,
        spread: 200,
        startVelocity: 30,
        origin: { x: 0.5, y: 0.6 }
      });
    }

    return;
  }

  if (!board.includes("")) {
    statusText.textContent = "😐 It's a draw!";
    gameActive = false;
  }
}

function resetGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameActive = true;
  moveHistory = [];
  undoUsed = false;

  cells.forEach(cell => {
    cell.textContent = "";
    cell.style.color = ""; 
    cell.classList.remove("winning-cell");
  });

  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

function displayTaunt() {
  let taunt;
  do {
    taunt = taunts[Math.floor(Math.random() * taunts.length)];
  } while (taunt === tauntMemory.last); // prevent repetition

  tauntMemory.last = taunt;
  statusText.textContent += ` — ${taunt}`;
}


initializeGame();