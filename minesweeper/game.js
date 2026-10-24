const LEVELS = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 },
};

const boardEl = document.getElementById("board");
const minesEl = document.getElementById("mines-left");
const timerEl = document.getElementById("timer");
const faceEl = document.getElementById("face");
const difficultyEl = document.getElementById("difficulty");

let state = null;
let timerId = null;

function pad3(n) {
  const v = Math.max(-99, Math.min(999, n));
  if (v < 0) return `-${String(Math.abs(v)).padStart(2, "0")}`;
  return String(v).padStart(3, "0");
}

function neighbors(r, c, rows, cols) {
  const out = [];
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) out.push([nr, nc]);
    }
  }
  return out;
}

function createGrid(rows, cols) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      mine: false,
      open: false,
      flag: false,
      count: 0,
    })),
  );
}

function placeMines(grid, rows, cols, mines, safeR, safeC) {
  const forbidden = new Set([`${safeR},${safeC}`]);
  for (const [nr, nc] of neighbors(safeR, safeC, rows, cols)) {
    forbidden.add(`${nr},${nc}`);
  }

  const spots = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (!forbidden.has(`${r},${c}`)) spots.push([r, c]);
    }
  }

  for (let i = spots.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [spots[i], spots[j]] = [spots[j], spots[i]];
  }

  const count = Math.min(mines, spots.length);
  for (let i = 0; i < count; i += 1) {
    const [r, c] = spots[i];
    grid[r][c].mine = true;
  }

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (grid[r][c].mine) continue;
      grid[r][c].count = neighbors(r, c, rows, cols).filter(
        ([nr, nc]) => grid[nr][nc].mine,
      ).length;
    }
  }
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function startTimer() {
  stopTimer();
  timerId = setInterval(() => {
    if (!state || state.over) return;
    state.seconds = Math.min(999, state.seconds + 1);
    timerEl.textContent = pad3(state.seconds);
  }, 1000);
}

function newGame() {
  stopTimer();
  const level = LEVELS[difficultyEl.value] || LEVELS.beginner;
  state = {
    ...level,
    grid: createGrid(level.rows, level.cols),
    armed: false,
    over: false,
    won: false,
    flags: 0,
    seconds: 0,
  };
  setFace(false);
  minesEl.textContent = pad3(state.mines);
  timerEl.textContent = "000";
  renderBoard(true);
}

function remainingMines() {
  return state.mines - state.flags;
}

function floodOpen(r, c) {
  const stack = [[r, c]];
  while (stack.length) {
    const [cr, cc] = stack.pop();
    const cell = state.grid[cr][cc];
    if (cell.open || cell.flag) continue;
    cell.open = true;
    if (cell.count === 0 && !cell.mine) {
      for (const [nr, nc] of neighbors(cr, cc, state.rows, state.cols)) {
        const n = state.grid[nr][nc];
        if (!n.open && !n.flag) stack.push([nr, nc]);
      }
    }
  }
}

function checkWin() {
  const { rows, cols, grid, mines } = state;
  let opened = 0;
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (grid[r][c].open) opened += 1;
    }
  }
  if (opened === rows * cols - mines) {
    state.over = true;
    state.won = true;
    stopTimer();
    faceEl.textContent = "😎";
    for (const row of grid) {
      for (const cell of row) {
        if (cell.mine && !cell.flag) {
          cell.flag = true;
          state.flags += 1;
        }
      }
    }
    minesEl.textContent = pad3(remainingMines());
  }
}

function explode(hitR, hitC) {
  state.over = true;
  state.won = false;
  stopTimer();
  faceEl.textContent = "😵";
  state.hit = [hitR, hitC];
  for (const row of state.grid) {
    for (const cell of row) {
      if (cell.mine) cell.open = true;
    }
  }
}

function reveal(r, c) {
  if (state.over) return;
  const cell = state.grid[r][c];
  if (cell.open || cell.flag) return;

  if (!state.armed) {
    placeMines(state.grid, state.rows, state.cols, state.mines, r, c);
    state.armed = true;
    startTimer();
  }

  if (cell.mine) {
    explode(r, c);
    renderBoard();
    return;
  }

  floodOpen(r, c);
  checkWin();
  renderBoard();
}

function toggleFlag(r, c) {
  if (state.over) return;
  const cell = state.grid[r][c];
  if (cell.open) return;
  cell.flag = !cell.flag;
  state.flags += cell.flag ? 1 : -1;
  minesEl.textContent = pad3(remainingMines());
  renderBoard();
}

function chord(r, c) {
  if (state.over) return;
  const cell = state.grid[r][c];
  if (!cell.open || cell.count === 0) return;
  const around = neighbors(r, c, state.rows, state.cols);
  const flags = around.filter(([nr, nc]) => state.grid[nr][nc].flag).length;
  if (flags !== cell.count) return;
  for (const [nr, nc] of around) {
    const n = state.grid[nr][nc];
    if (!n.flag && !n.open) {
      if (n.mine) {
        explode(nr, nc);
        renderBoard();
        return;
      }
      floodOpen(nr, nc);
    }
  }
  checkWin();
  renderBoard();
}

function cellLabel(cell) {
  if (cell.flag && !cell.open) return "флаг";
  if (!cell.open) return "закрыто";
  if (cell.mine) return "мина";
  if (cell.count) return String(cell.count);
  return "пусто";
}

function renderBoard(rebuild = false) {
  const { rows, cols, grid } = state;
  if (rebuild || boardEl.children.length !== rows * cols) {
    boardEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    boardEl.replaceChildren();
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "cell";
        btn.dataset.r = String(r);
        btn.dataset.c = String(c);
        boardEl.append(btn);
      }
    }
  }

  const nodes = boardEl.children;
  let i = 0;
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const cell = grid[r][c];
      const btn = nodes[i];
      i += 1;
      btn.className = "cell";
      btn.textContent = "";
      btn.setAttribute("aria-label", `строка ${r + 1}, столбец ${c + 1}, ${cellLabel(cell)}`);

      if (cell.flag && !(state.over && !state.won && cell.mine && !cell.flag)) {
        if (!cell.open) btn.classList.add("flagged");
      }

      if (cell.open) {
        btn.classList.add("open");
        if (cell.mine) {
          btn.textContent = "💣";
          if (state.hit && state.hit[0] === r && state.hit[1] === c) {
            btn.classList.add("mine");
          }
        } else if (cell.count) {
          btn.textContent = String(cell.count);
          btn.classList.add(`n${cell.count}`);
        }
      } else if (state.over && !state.won && cell.flag && !cell.mine) {
        btn.classList.add("open", "wrong");
        btn.textContent = "✗";
        btn.classList.remove("flagged");
      }
    }
  }
}

let suppressClick = false;

boardEl.addEventListener("click", (event) => {
  if (suppressClick) {
    suppressClick = false;
    return;
  }
  const btn = event.target.closest(".cell");
  if (!btn) return;
  const r = Number(btn.dataset.r);
  const c = Number(btn.dataset.c);
  if (event.detail === 2) chord(r, c);
  else reveal(r, c);
});

boardEl.addEventListener("contextmenu", (event) => {
  const btn = event.target.closest(".cell");
  if (!btn) return;
  event.preventDefault();
  toggleFlag(Number(btn.dataset.r), Number(btn.dataset.c));
});

boardEl.addEventListener("auxclick", (event) => {
  if (event.button !== 1) return;
  const btn = event.target.closest(".cell");
  if (!btn) return;
  event.preventDefault();
  chord(Number(btn.dataset.r), Number(btn.dataset.c));
});

function setFace(pressing = false) {
  if (!state) return;
  if (state.over) faceEl.textContent = state.won ? "😎" : "😵";
  else faceEl.textContent = pressing ? "😮" : "🙂";
}

boardEl.addEventListener("pointerdown", () => setFace(true));
window.addEventListener("pointerup", () => setFace(false));
window.addEventListener("pointercancel", () => setFace(false));

let pressTimer = null;
boardEl.addEventListener("touchstart", (event) => {
  const btn = event.target.closest(".cell");
  if (!btn) return;
  pressTimer = setTimeout(() => {
    toggleFlag(Number(btn.dataset.r), Number(btn.dataset.c));
    suppressClick = true;
    pressTimer = null;
  }, 450);
});

boardEl.addEventListener("touchend", () => {
  if (pressTimer) {
    clearTimeout(pressTimer);
    pressTimer = null;
  }
});

faceEl.addEventListener("click", newGame);
difficultyEl.addEventListener("change", newGame);

newGame();
