/* ==========================================
   DMS Assignment — Graph Traversal Portal
   assignment.js — Interactive Logic
   ========================================== */

/* ------------------------------------------
   HOME CHECKLIST
   ------------------------------------------ */
function updateHomeChecklist() {
  const checkboxes = document.querySelectorAll('.home-checkbox');
  const total = checkboxes.length;
  const checked = Array.from(checkboxes).filter(c => c.checked).length;

  const fill = document.getElementById('home-checklist-fill');
  const count = document.getElementById('home-checklist-count');
  if (fill) fill.style.width = total > 0 ? `${Math.round((checked / total) * 100)}%` : '0%';
  if (count) count.textContent = `${checked} / ${total} completed`;

  // Persist state
  try {
    const state = Array.from(checkboxes).map(c => c.checked);
    localStorage.setItem('dms_home_checklist', JSON.stringify(state));
  } catch(e) {}
}

function restoreHomeChecklist() {
  try {
    const saved = JSON.parse(localStorage.getItem('dms_home_checklist') || '[]');
    const checkboxes = document.querySelectorAll('.home-checkbox');
    checkboxes.forEach((cb, i) => { if (saved[i] !== undefined) cb.checked = saved[i]; });
    updateHomeChecklist();
  } catch(e) {}
}

/* ------------------------------------------
   TOGGLE SOLUTION REVEAL
   ------------------------------------------ */
function toggleSolution(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const isVisible = el.style.display !== 'none';
  el.style.display = isVisible ? 'none' : 'block';

  // Find the button that triggered this and update text
  const btn = document.querySelector(`[onclick="toggleSolution('${id}')"]`);
  if (btn) {
    btn.textContent = isVisible ? '💡 Show Solution' : '🙈 Hide Solution';
  }
}

/* ------------------------------------------
   EXERCISE LEVEL TABS
   ------------------------------------------ */
function showLevel(level, btn) {
  // Hide all level sections
  document.querySelectorAll('.ex-level-section').forEach(el => {
    el.style.display = 'none';
  });

  // Remove active from all buttons
  document.querySelectorAll('.ex-level-btn').forEach(b => b.classList.remove('active'));

  // Show selected level
  const target = document.getElementById(`ex-level-${level}`);
  if (target) target.style.display = 'flex';

  // Activate button
  if (btn) btn.classList.add('active');
}

/* ------------------------------------------
   TRY IT YOURSELF — CHALLENGE DATA
   ------------------------------------------ */
const tryitChallenges = [
  {
    id: 'tc1',
    title: 'BFS Challenge 1 — Simple Graph',
    desc: 'Perform BFS on this connected graph starting from vertex A.',
    algorithm: 'BFS',
    startVertex: 'A',
    adjacency: { A: ['B','C'], B: ['A','D','E'], C: ['A','F'], D: ['B'], E: ['B'], F: ['C'] },
    svgContent: () => generateSVGFromAdj({ A:[300,80], B:[160,160], C:[440,160], D:[80,240], E:[240,240], F:[440,240] },
      [['A','B'],['A','C'],['B','D'],['B','E'],['C','F']], 'BFS'),
    question: 'Starting from vertex A, predict the complete BFS traversal order:',
    hint: 'BFS explores level by level. Level 0: A. Level 1: all direct neighbours of A. Level 2: neighbours of Level 1 vertices that haven\'t been visited yet.',
    answer: ['A','B','C','D','E','F'],
    explanation: 'BFS from A: Level 0=A, Level 1=B,C (neighbours of A), Level 2=D,E (from B) then F (from C). Queue: [A]→dequeue A, enqueue B,C → [B,C]→dequeue B, enqueue D,E → [C,D,E]→dequeue C, enqueue F → [D,E,F]→dequeue D→[E,F]→dequeue E→[F]→dequeue F→done.'
  },
  {
    id: 'tc2',
    title: 'DFS Challenge 1 — Same Graph',
    desc: 'Perform DFS (recursive, alphabetical neighbours) starting from vertex A.',
    algorithm: 'DFS',
    startVertex: 'A',
    adjacency: { A: ['B','C'], B: ['A','D','E'], C: ['A','F'], D: ['B'], E: ['B'], F: ['C'] },
    svgContent: () => generateSVGFromAdj({ A:[300,80], B:[160,160], C:[440,160], D:[80,240], E:[240,240], F:[440,240] },
      [['A','B'],['A','C'],['B','D'],['B','E'],['C','F']], 'DFS'),
    question: 'Starting from vertex A, predict the complete DFS traversal order:',
    hint: 'DFS goes deep first. From A, go to first unvisited neighbour B. From B, go to first unvisited neighbour D. D is a dead end, backtrack to B, then try E. Backtrack to A, then go to C, then F.',
    answer: ['A','B','D','E','C','F'],
    explanation: 'DFS(A)→visit A, call DFS(B). DFS(B)→visit B, call DFS(D). DFS(D)→visit D, dead end, return. DFS(E)→visit E, dead end, return to B, return to A. DFS(C)→visit C, call DFS(F). DFS(F)→visit F, done.'
  },
  {
    id: 'tc3',
    title: 'BFS Challenge 2 — Tree Graph',
    desc: 'A binary tree-shaped graph. Predict BFS from root A.',
    algorithm: 'BFS',
    startVertex: 'A',
    adjacency: { A: ['B','C'], B: ['A','D','E'], C: ['A','F','G'], D: ['B'], E: ['B'], F: ['C'], G: ['C'] },
    svgContent: () => generateSVGFromAdj(
      { A:[280,50], B:[140,130], C:[420,130], D:[60,220], E:[200,220], F:[350,220], G:[490,220] },
      [['A','B'],['A','C'],['B','D'],['B','E'],['C','F'],['C','G']], 'BFS'),
    question: 'BFS from vertex A — what is the traversal order?',
    hint: 'This is a perfect binary tree. Level 0=A, Level 1=B,C, Level 2=D,E,F,G. BFS processes all Level 1 before Level 2.',
    answer: ['A','B','C','D','E','F','G'],
    explanation: 'BFS Level-order: A→B,C→D,E,F,G. This is the classic level-order traversal of a binary tree. Queue: enqueue A→dequeue A enqueue B,C→dequeue B enqueue D,E→dequeue C enqueue F,G→dequeue D,E,F,G in order.'
  },
  {
    id: 'tc4',
    title: 'DFS Challenge 2 — Tree Graph',
    desc: 'Same tree as Challenge 3. Now predict DFS (pre-order) from root A.',
    algorithm: 'DFS',
    startVertex: 'A',
    adjacency: { A: ['B','C'], B: ['A','D','E'], C: ['A','F','G'], D: ['B'], E: ['B'], F: ['C'], G: ['C'] },
    svgContent: () => generateSVGFromAdj(
      { A:[280,50], B:[140,130], C:[420,130], D:[60,220], E:[200,220], F:[350,220], G:[490,220] },
      [['A','B'],['A','C'],['B','D'],['B','E'],['C','F'],['C','G']], 'DFS'),
    question: 'DFS from vertex A — what is the traversal order (recursive, alphabetical)?',
    hint: 'DFS completely explores B\'s entire subtree (D and E) before returning to A and exploring C\'s subtree (F and G). This is pre-order traversal.',
    answer: ['A','B','D','E','C','F','G'],
    explanation: 'DFS(A)→A. DFS(B)→B. DFS(D)→D dead end. DFS(E)→E dead end. Back to A. DFS(C)→C. DFS(F)→F dead end. DFS(G)→G done. Pre-order: A B D E C F G'
  },
  {
    id: 'tc5',
    title: 'BFS Challenge 3 — Cycle Graph',
    desc: 'A graph with a cycle. BFS from vertex 1.',
    algorithm: 'BFS',
    startVertex: '1',
    adjacency: { '1':['2','3'], '2':['1','3','4'], '3':['1','2','5'], '4':['2','5'], '5':['3','4'] },
    svgContent: () => generateSVGFromAdj(
      { '1':[280,80], '2':[140,180], '3':[420,180], '4':[140,280], '5':[420,280] },
      [['1','2'],['1','3'],['2','3'],['2','4'],['3','5'],['4','5']], 'BFS'),
    question: 'BFS from vertex 1 — traversal order?',
    hint: 'Level 0: {1}. Level 1: neighbours of 1 = {2, 3}. Level 2: unvisited neighbours of 2 and 3. Note: edge 2-3 is a back edge (both already discovered).',
    answer: ['1','2','3','4','5'],
    explanation: 'Queue: [1]→dequeue 1, enqueue 2,3 → [2,3]→dequeue 2, neighbours 1(V),3(queued),4→enqueue 4 → [3,4]→dequeue 3, neighbours 1(V),2(V),5→enqueue 5 → [4,5]→dequeue 4→dequeue 5. Order: 1→2→3→4→5.'
  },
  {
    id: 'tc6',
    title: 'DFS Challenge 3 — Finding Path',
    desc: 'DFS from vertex A on a graph with multiple paths.',
    algorithm: 'DFS',
    startVertex: 'A',
    adjacency: { A:['B','C'], B:['A','D'], C:['A','D','E'], D:['B','C','F'], E:['C','F'], F:['D','E'] },
    svgContent: () => generateSVGFromAdj(
      { A:[280,60], B:[140,160], C:[420,160], D:[140,270], E:[420,270], F:[280,360] },
      [['A','B'],['A','C'],['B','D'],['C','D'],['C','E'],['D','F'],['E','F']], 'DFS'),
    question: 'DFS from vertex A (alphabetical neighbours) — traversal order?',
    hint: 'From A, first go to B (alphabetically first). From B, go to D. From D, neighbours are B(V), C, F — go to C first. From C, neighbours are A(V), D(V), E — go to E. From E, go to F.',
    answer: ['A','B','D','C','E','F'],
    explanation: 'DFS(A)→A. Neighbour B first. DFS(B)→B. DFS(D)→D. D\'s neighbours: B(V), C unvisited → DFS(C)→C. C\'s: A(V),D(V),E→DFS(E)→E. E\'s: C(V),F→DFS(F)→F. Done. Order: A,B,D,C,E,F.'
  }
];

let currentTryitIdx = 0;

/* ------------------------------------------
   HELPER: Generate SVG for Try It Yourself
   ------------------------------------------ */
function generateSVGFromAdj(positions, edges, algoType) {
  const color = algoType === 'BFS' ? '#06b6d4' : '#8b5cf6';
  let svg = '';
  // Draw edges
  edges.forEach(([u, v]) => {
    const p1 = positions[u], p2 = positions[v];
    if (p1 && p2) {
      svg += `<line x1="${p1[0]/1.9}" y1="${p1[1]/1.5}" x2="${p2[0]/1.9}" y2="${p2[1]/1.5}" stroke="${color}" stroke-width="2"/>`;
    }
  });
  // Draw nodes
  Object.entries(positions).forEach(([label, [px, py]]) => {
    const x = px / 1.9, y = py / 1.5;
    svg += `<circle cx="${x}" cy="${y}" r="20" fill="#1e293b" stroke="${color}" stroke-width="2.5"/>`;
    svg += `<text x="${x}" y="${y + 5}" text-anchor="middle" fill="white" font-size="13" font-weight="bold" font-family="Inter,sans-serif">${label}</text>`;
  });
  return svg;
}

/* ------------------------------------------
   INIT TRY IT YOURSELF PANEL
   ------------------------------------------ */
function initTryit() {
  const grid = document.getElementById('tryit-challenge-grid');
  if (!grid) return;

  grid.innerHTML = tryitChallenges.map((ch, i) => `
    <button class="tryit-challenge-btn" onclick="loadTryitChallenge(${i})" id="tryit-btn-${i}">
      <div class="tryit-q-title">${ch.algorithm} — Challenge ${i + 1}</div>
      <div class="tryit-q-sub">${ch.title}</div>
    </button>
  `).join('');

  // Randomize initial challenge without repeating
  let usedQuestions = [];
  try {
    usedQuestions = JSON.parse(sessionStorage.getItem('dms_tryit_used')) || [];
  } catch (e) {}

  if (usedQuestions.length >= tryitChallenges.length) {
    usedQuestions = [];
  }

  let availableIndices = [];
  for (let i = 0; i < tryitChallenges.length; i++) {
    if (!usedQuestions.includes(i)) {
      availableIndices.push(i);
    }
  }

  const randomIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  usedQuestions.push(randomIdx);

  try {
    sessionStorage.setItem('dms_tryit_used', JSON.stringify(usedQuestions));
  } catch (e) {}

  // Load the randomly selected challenge by default
  loadTryitChallenge(randomIdx);
}

function loadTryitChallenge(idx) {
  currentTryitIdx = idx;
  const ch = tryitChallenges[idx];
  if (!ch) return;

  // Update active button
  document.querySelectorAll('.tryit-challenge-btn').forEach((b, i) => {
    b.classList.toggle('active', i === idx);
  });

  // Show challenge card
  const activeCard = document.getElementById('tryit-active');
  if (activeCard) activeCard.style.display = 'block';

  // Set title, desc, badge
  const titleEl = document.getElementById('tryit-title');
  const descEl = document.getElementById('tryit-desc');
  const badgeEl = document.getElementById('tryit-badge');
  const questionEl = document.getElementById('tryit-question');
  const adjEl = document.getElementById('tryit-adj');
  const svgEl = document.getElementById('tryit-svg');

  if (titleEl) titleEl.textContent = ch.title;
  if (descEl) descEl.textContent = ch.desc;
  if (badgeEl) {
    badgeEl.textContent = ch.algorithm;
    badgeEl.className = `badge ${ch.algorithm === 'BFS' ? 'badge-cyan' : 'badge-purple'}`;
  }
  if (questionEl) questionEl.textContent = ch.question;

  // Build adjacency list display
  if (adjEl) {
    const adjText = Object.entries(ch.adjacency).map(([v, ns]) => `${v}: [${ns.join(', ')}]`).join(' | ');
    adjEl.innerHTML = `<strong>Adjacency List:</strong><br>${adjText}`;
  }

  // Generate SVG
  if (svgEl && ch.svgContent) {
    svgEl.innerHTML = ch.svgContent();
  }

  // Reset UI
  const input = document.getElementById('tryit-input');
  if (input) input.value = '';
  const result = document.getElementById('tryit-result');
  if (result) { result.style.display = 'none'; result.innerHTML = ''; }
  const hint = document.getElementById('tryit-hint');
  if (hint) { hint.style.display = 'none'; hint.textContent = ''; }
}

function getValidTraversals(ch) {
  const adj = {};
  for (let key in ch.adjacency) {
    adj[key.toUpperCase()] = ch.adjacency[key].map(v => v.toUpperCase());
  }
  const startVertex = ch.startVertex.toUpperCase();
  const algo = ch.algorithm.toUpperCase();
  const totalNodes = Object.keys(adj).length;

  let results = [];

  function getPermutations(arr) {
    if (arr.length <= 1) return [arr];
    let res = [];
    for (let i = 0; i < arr.length; i++) {
      let rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
      let restPerms = getPermutations(rest);
      for (let rp of restPerms) {
        res.push([arr[i], ...rp]);
      }
    }
    return res;
  }

  if (algo === 'BFS') {
    function generateBFS(queue, visited, currentPath) {
      if (queue.length === 0) {
        if (currentPath.length === totalNodes) results.push(currentPath.join(''));
        return;
      }
      let u = queue.shift();
      let unvisitedNeighbours = adj[u] ? adj[u].filter(v => !visited.has(v)) : [];
      let perms = getPermutations(unvisitedNeighbours);
      if (perms.length === 0) {
        generateBFS([...queue], new Set(visited), [...currentPath]);
      } else {
        for (let p of perms) {
          let newQueue = [...queue, ...p];
          let newVisited = new Set(visited);
          for (let v of p) newVisited.add(v);
          generateBFS(newQueue, newVisited, [...currentPath, ...p]);
        }
      }
    }
    generateBFS([startVertex], new Set([startVertex]), [startVertex]);
  } else if (algo === 'DFS') {
    function generateDFS(path, visited, stack) {
      if (path.length === totalNodes) {
        results.push(path.join(''));
        return;
      }
      if (stack.length === 0) return;
      
      let u = stack[stack.length - 1];
      let unvisited = adj[u] ? adj[u].filter(v => !visited.has(v)) : [];
      
      if (unvisited.length === 0) {
        let newStack = [...stack];
        newStack.pop();
        generateDFS(path, visited, newStack);
      } else {
        for (let v of unvisited) {
          let newVisited = new Set(visited);
          newVisited.add(v);
          generateDFS([...path, v], newVisited, [...stack, v]);
        }
      }
    }
    generateDFS([startVertex], new Set([startVertex]), [startVertex]);
  }

  if (results.length === 0) {
    results.push(ch.answer.map(s => s.toUpperCase()).join(''));
  }
  
  return Array.from(new Set(results));
}

function checkTryitAnswer() {
  const ch = tryitChallenges[currentTryitIdx];
  const input = document.getElementById('tryit-input');
  const resultEl = document.getElementById('tryit-result');
  if (!input || !resultEl || !ch) return;

  const userRaw = input.value.trim();
  if (!userRaw) {
    showToast('Please enter your predicted traversal order first!', 'warning');
    return;
  }

  const userAns = userRaw.split(/[\s,→\-]+/).map(s => s.trim().toUpperCase()).filter(Boolean);
  const userAnsJoined = userAns.join('');
  const validTraversals = getValidTraversals(ch);
  const totalNodes = Object.keys(ch.adjacency).length;

  const isCorrect = validTraversals.includes(userAnsJoined) && userAns.length === totalNodes;
  
  let isPartiallyCorrect = false;
  let maxMatched = 0;
  let bestMatchStr = validTraversals[0];

  if (!isCorrect) {
    for (let valid of validTraversals) {
      let matchCount = 0;
      for (let i = 0; i < Math.min(userAnsJoined.length, valid.length); i++) {
        if (userAnsJoined[i] === valid[i]) {
          matchCount++;
        } else {
          break;
        }
      }
      if (matchCount > maxMatched) {
        maxMatched = matchCount;
        bestMatchStr = valid;
      }
    }
    if (maxMatched > 0 && maxMatched < totalNodes) {
      isPartiallyCorrect = true;
    }
  }

  resultEl.style.display = 'block';

  if (isCorrect) {
    resultEl.innerHTML = `
      <div class="tryit-result-correct">
        ✅ Correct! Well done!<br>
        <span style="font-family:'JetBrains Mono',monospace;">Order: ${userAns.join(' → ')}</span><br>
        <div style="margin-top:0.6rem;font-size:0.85rem;font-weight:400;color:var(--accent-green);">${ch.explanation}</div>
      </div>`;
    showToast('Correct! 🎉 Great understanding!', 'success');
  } else if (isPartiallyCorrect) {
    const partialAns = userAnsJoined.substring(0, maxMatched).split('');
    const bestAns = bestMatchStr.split('');
    resultEl.innerHTML = `
      <div class="tryit-result-incorrect" style="border-left-color: var(--accent-cyan); background: rgba(6, 182, 212, 0.05);">
        <div class="tryit-wrong" style="color: var(--accent-cyan);">⚠️ Partially Correct!</div>
        <div style="margin-bottom:0.4rem;font-size:0.88rem;">Your sequence starts correctly: <span style="font-family:'JetBrains Mono',monospace; color: var(--accent-cyan);">${partialAns.join(' → ')}</span></div>
        <div style="margin-bottom:0.4rem;font-size:0.88rem;">But then diverges. Keep going!</div>
        <div class="tryit-correct-ans" style="opacity: 0.7;">Possible correct: ${bestAns.join(' → ')}</div>
        <div style="margin-top:0.75rem;font-size:0.85rem;color:var(--text-muted);">${ch.explanation}</div>
      </div>`;
    showToast('You are on the right track!', 'info');
  } else {
    const bestAns = bestMatchStr.split('');
    resultEl.innerHTML = `
      <div class="tryit-result-incorrect">
        <div class="tryit-wrong">❌ Not quite right. Keep trying!</div>
        <div style="margin-bottom:0.4rem;font-size:0.88rem;">Your answer: <span style="font-family:'JetBrains Mono',monospace;">${userAns.join(' → ') || '(empty or invalid)'}</span></div>
        <div class="tryit-correct-ans">✓ Correct: ${bestAns.join(' → ')}</div>
        <div style="margin-top:0.75rem;font-size:0.85rem;color:var(--text-muted);">${ch.explanation}</div>
      </div>`;
    showToast('Not quite — the explanation is shown below.', 'error');
  }
}

function resetTryit() {
  const input = document.getElementById('tryit-input');
  if (input) input.value = '';
  const result = document.getElementById('tryit-result');
  if (result) { result.style.display = 'none'; result.innerHTML = ''; }
  const hint = document.getElementById('tryit-hint');
  if (hint) { hint.style.display = 'none'; }
}

function showTryitHint() {
  const ch = tryitChallenges[currentTryitIdx];
  const hintEl = document.getElementById('tryit-hint');
  if (!hintEl || !ch) return;
  hintEl.style.display = 'block';
  hintEl.textContent = '💡 Hint: ' + ch.hint;
}

function verifyInTool() {
  if (typeof app !== 'undefined') {
    app.navigateToTab('tab-visualizer');
    showToast('Use the Interactive Tool to run and verify your traversal!', 'info');
  }
}

/* ------------------------------------------
   ACTIVITY HELPERS
   ------------------------------------------ */
function loadAndNavigateDisconnected() {
  if (typeof app !== 'undefined') {
    app.navigateToTab('tab-visualizer');
    setTimeout(() => {
      const sel = document.getElementById('preset-select');
      if (sel) {
        sel.value = 'disconnected';
        sel.dispatchEvent(new Event('change'));
        showToast('Disconnected graph loaded in Interactive Tool!', 'success');
      }
    }, 300);
  }
}

function loadTreeAndNavigate() {
  if (typeof app !== 'undefined') {
    app.navigateToTab('tab-visualizer');
    setTimeout(() => {
      const sel = document.getElementById('preset-select');
      if (sel) {
        sel.value = 'tree';
        sel.dispatchEvent(new Event('change'));
        showToast('Binary Tree graph loaded in Interactive Tool!', 'success');
      }
    }, 300);
  }
}

/* ------------------------------------------
   TOAST NOTIFICATIONS (standalone, in case
   the main app.js hasn't defined showToast)
   ------------------------------------------ */
function showToast(message, type = 'info') {
  // Try app's toast first
  if (typeof app !== 'undefined' && typeof app.showToast === 'function') {
    app.showToast(message, type);
    return;
  }
  // Fallback
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  const colors = { success: '#10b981', error: '#f43f5e', warning: '#f59e0b', info: '#06b6d4' };
  toast.style.cssText = `
    padding: 0.75rem 1.25rem;
    background: var(--bg-card);
    border-left: 4px solid ${colors[type] || colors.info};
    border-radius: 10px;
    color: var(--text-main);
    font-size: 0.88rem;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    margin-bottom: 0.5rem;
    animation: slideInRight 0.3s ease;
    max-width: 320px;
  `;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ------------------------------------------
   INSTRUCTIONS MODAL
   ------------------------------------------ */
function initInstructionsModal() {
  const btn = document.getElementById('btn-show-instructions');
  if (btn) {
    btn.addEventListener('click', () => {
      const modal = document.getElementById('instructions-modal');
      if (modal) modal.classList.add('active');
    });
  }
  // Close on backdrop click
  const modal = document.getElementById('instructions-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }
}

/* ------------------------------------------
   DOM READY INIT
   ------------------------------------------ */
document.addEventListener('DOMContentLoaded', () => {
  restoreHomeChecklist();
  initTryit();
  initInstructionsModal();
});
