/* ==========================================
   BFS & DFS Graph Traversal Visualizer
   Pro-Level Dynamic Offline Quiz Engine
   ========================================== */

class QuizManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    
    // Quiz State
    this.state = 'setup'; // 'setup', 'active', 'results'
    this.questions = [];
    this.userAnswers = {};
    this.score = 0;
    this.currentAttemptId = null;
    this.startTime = null;
    this.endTime = null;

    // Quiz Settings Defaults
    this.config = {
      numQuestions: 10,
      difficulty: 'Medium', // 'Easy', 'Medium', 'Hard', 'Mixed'
      categories: {
        conceptual: true,
        bfs: true,
        dfs: true,
        graphBased: true,
        complexity: true,
        shortestPath: true
      }
    };

    // Attempt History Key in LocalStorage
    this.STORAGE_KEY = 'dms_quiz_history';

    this.render();
  }

  // ==================================================
  // UTILITY HELPERS: RANDOMIZATION & SHUFFLING
  // ==================================================

  static getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  static shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Shuffles question options and safely updates the correct answer index
   */
  static randomizeQuestionOptions(qObj) {
    const originalCorrectText = qObj.options[qObj.answer];
    const shuffledOptions = QuizManager.shuffleArray(qObj.options);
    const newCorrectIndex = shuffledOptions.indexOf(originalCorrectText);

    return {
      ...qObj,
      options: shuffledOptions,
      answer: newCorrectIndex
    };
  }

  // ==================================================
  // DYNAMIC GRAPH & QUESTION GENERATION ENGINE
  // ==================================================

  /**
   * Generates a random connected Graph object for dynamic questions
   */
  static generateRandomGraph(numNodes = 5, isDirected = false) {
    const labels = ["A", "B", "C", "D", "E", "F", "G"].slice(0, numNodes);
    const graph = new Graph(isDirected, false);

    // Arrange nodes in a neat circle for clean SVG rendering
    const cx = 160;
    const cy = 110;
    const r = 75;

    labels.forEach((label, i) => {
      const angle = (2 * Math.PI * i) / numNodes - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      graph.addNode(label, label, x, y);
    });

    // Ensure connectivity (spanning tree first)
    for (let i = 0; i < labels.length - 1; i++) {
      graph.addEdge(labels[i], labels[i + 1]);
    }

    // Add 1-3 extra random edges to create interesting paths/cycles
    const extraEdges = QuizManager.getRandomInt(1, 2);
    for (let k = 0; k < extraEdges; k++) {
      const u = QuizManager.getRandomElement(labels);
      const v = QuizManager.getRandomElement(labels);
      if (u !== v) {
        graph.addEdge(u, v);
      }
    }

    return { graph, labels };
  }

  /**
   * Generates an SVG string representation of a Graph for rendering inside quiz cards
   */
  static renderGraphSVG(graph) {
    let svg = `<svg width="320" height="220" viewBox="0 0 320 220" style="background:#0d121f; border-radius:8px; border:1px solid #374151; margin:0.75rem 0;">`;

    // Render Edges
    graph.edges.forEach(e => {
      const u = graph.nodes.get(e.u);
      const v = graph.nodes.get(e.v);
      if (u && v) {
        svg += `<line x1="${u.x}" y1="${u.y}" x2="${v.x}" y2="${v.y}" stroke="#4b5563" stroke-width="2" />`;
      }
    });

    // Render Nodes
    graph.nodes.forEach((node) => {
      svg += `
        <circle cx="${node.x}" cy="${node.y}" r="18" fill="#1f2937" stroke="#06b6d4" stroke-width="2" />
        <text x="${node.x}" y="${node.y + 4}" fill="#ffffff" font-weight="bold" font-size="13" text-anchor="middle">${node.label}</text>
      `;
    });

    svg += `</svg>`;
    return svg;
  }

  /**
   * Large Bank of Dynamic Question Templates
   */
  generateQuestionBank() {
    const bank = [];

    // --- CATEGORY: CONCEPTUAL & DEFINITIONS ---
    bank.push({
      category: 'conceptual',
      difficulty: 'Easy',
      question: "Which data structure is primarily used to implement Breadth First Search (BFS)?",
      options: ["Queue (FIFO)", "Stack (LIFO)", "Priority Queue", "Hash Map"],
      answer: 0,
      explanation: "BFS explores vertices level-by-level in First-In-First-Out (FIFO) order using a Queue."
    });

    bank.push({
      category: 'conceptual',
      difficulty: 'Easy',
      question: "Which data structure or execution paradigm is used by Depth First Search (DFS)?",
      options: ["Stack (LIFO) / System Call Stack", "Queue (FIFO)", "Binary Heap", "Array List"],
      answer: 0,
      explanation: "DFS dives deep along branches before backtracking, operating in Last-In-First-Out (LIFO) order using a Stack or recursion."
    });

    bank.push({
      category: 'conceptual',
      difficulty: 'Easy',
      question: "In Discrete Mathematics, what is a Graph G = (V, E) composed of?",
      options: [
        "A set of Vertices V and a set of Edges E connecting pairs of vertices",
        "A sequence of numbers sorted in ascending order",
        "A matrix containing only binary bits",
        "A root node with strictly two child pointers"
      ],
      answer: 0,
      explanation: "A graph G = (V, E) consists of a set of vertices V (nodes) and edges E (connections)."
    });

    bank.push({
      category: 'conceptual',
      difficulty: 'Easy',
      question: "What defines a Directed Graph (Digraph)?",
      options: [
        "Edges have a specific direction associated with them (u → v)",
        "Edges can be traversed in both directions identically",
        "All vertices must have the exact same degree",
        "It contains no cycles or closed loops"
      ],
      answer: 0,
      explanation: "In a directed graph, edges have orientation, so edge (u → v) does not imply (v → u)."
    });

    bank.push({
      category: 'conceptual',
      difficulty: 'Easy',
      question: "What primary role does the 'Visited' set play during graph traversal algorithms?",
      options: [
        "It prevents infinite loops/cycles and avoids re-processing already discovered vertices",
        "It stores the weight of every edge in memory",
        "It automatically sorts vertices alphabetically",
        "It calculates the shortest Euclidean distance"
      ],
      answer: 0,
      explanation: "Tracking visited vertices prevents the algorithm from revisiting nodes endlessly in cyclic graphs."
    });

    bank.push({
      category: 'conceptual',
      difficulty: 'Medium',
      question: "What property defines a Connected Undirected Graph?",
      options: [
        "A valid path exists between every pair of vertices in the graph",
        "The graph contains zero edges",
        "Every node connects directly to every other node",
        "The graph contains at least two disconnected components"
      ],
      answer: 0,
      explanation: "A graph is connected if there is at least one path between any pair of vertices."
    });

    bank.push({
      category: 'conceptual',
      difficulty: 'Medium',
      question: "What is a Tree in Graph Theory?",
      options: [
        "A connected undirected graph with no cycles (having E = V - 1 edges)",
        "A graph where every node has degree 4",
        "A directed cyclic graph",
        "A graph with disconnected components"
      ],
      answer: 0,
      explanation: "A tree is an acyclic connected graph with exactly V - 1 edges for V vertices."
    });

    bank.push({
      category: 'conceptual',
      difficulty: 'Hard',
      question: "When DFS reaches a vertex with zero unvisited neighbors (a dead end), what action is executed?",
      options: [
        "DFS pops the vertex off the stack and backtracks to the most recent ancestor node with unvisited neighbors",
        "DFS terminates the entire program immediately",
        "DFS clears the Visited set and restarts from node A",
        "DFS converts the graph into an adjacency matrix"
      ],
      answer: 0,
      explanation: "DFS uses backtracking to return to ancestor call frames when a dead end is encountered."
    });

    // --- CATEGORY: COMPLEXITY ---
    bank.push({
      category: 'complexity',
      difficulty: 'Easy',
      question: "What is the Time Complexity of BFS/DFS on a graph represented using an Adjacency List?",
      options: ["O(V + E)", "O(V²)", "O(E²)", "O(V log V)"],
      answer: 0,
      explanation: "Each vertex is processed once and each edge is inspected during adjacency list traversal: O(V + E)."
    });

    bank.push({
      category: 'complexity',
      difficulty: 'Easy',
      question: "What is the Space Complexity of BFS/DFS in terms of the number of vertices V?",
      options: ["O(V)", "O(1)", "O(V²)", "O(E²)"],
      answer: 0,
      explanation: "Queue/stack auxiliary memory and visited boolean tracking require O(V) space."
    });

    bank.push({
      category: 'complexity',
      difficulty: 'Medium',
      question: "If a graph with V vertices is represented using an Adjacency Matrix of size V × V, what is the Time Complexity of BFS or DFS?",
      options: ["O(V²)", "O(V + E)", "O(E)", "O(1)"],
      answer: 0,
      explanation: "To find all neighbors of a vertex in an adjacency matrix, we must scan an entire row of V entries, giving O(V * V) = O(V²)."
    });

    bank.push({
      category: 'complexity',
      difficulty: 'Hard',
      question: "In a dense graph where the number of edges E approaches V², what does the time complexity O(V + E) simplify to?",
      options: ["O(V²)", "O(V log V)", "O(V)", "O(2^V)"],
      answer: 0,
      explanation: "In a dense graph, E ≈ V², so O(V + V²) = O(V²)."
    });

    // --- CATEGORY: APPLICATIONS ---
    bank.push({
      category: 'conceptual',
      difficulty: 'Easy',
      question: "Which real-world problem is best solved using Breadth-First Search (BFS)?",
      options: [
        "Finding the shortest path in unweighted networks or finding 1st/2nd degree social network friends",
        "Topological sorting of university prerequisites",
        "Solving a maze using recursive backtracking",
        "Calculating disk usage of nested subdirectories"
      ],
      answer: 0,
      explanation: "BFS explores level-by-level, making it ideal for shortest paths in unweighted graphs and degree-of-separation searches."
    });

    bank.push({
      category: 'conceptual',
      difficulty: 'Easy',
      question: "Which real-world engineering application relies heavily on Depth-First Search (DFS)?",
      options: [
        "Topological sorting, cycle detection in build systems, and maze solving",
        "Finding nearest GPS gas stations by radius",
        "Web crawling radially outward from a seed page",
        "Network packet broadcasting in minimum hops"
      ],
      answer: 0,
      explanation: "DFS is ideal for topological sorting, cycle detection, and maze/game decision tree solving."
    });

    // --- CATEGORY: DYNAMIC BFS & DFS GRAPH QUESTIONS ---
    for (let gCount = 0; gCount < 8; gCount++) {
      const { graph, labels } = QuizManager.generateRandomGraph(5, false);
      const startNode = QuizManager.getRandomElement(labels);

      // 1. Dynamic BFS Question
      const bfsSteps = GraphAlgorithms.generateBFS(graph, startNode);
      const actualBfsOrder = bfsSteps[bfsSteps.length - 1].traversalOrder.join(' → ');

      // Generate distractors
      const dfsSteps = GraphAlgorithms.generateDFS(graph, startNode);
      const dfsOrderDistractor = dfsSteps[dfsSteps.length - 1].traversalOrder.join(' → ');
      const reverseBfsDistractor = bfsSteps[bfsSteps.length - 1].traversalOrder.slice().reverse().join(' → ');
      const shiftedDistractor = labels.slice().reverse().join(' → ');

      const bfsOptions = Array.from(new Set([actualBfsOrder, dfsOrderDistractor, reverseBfsDistractor, shiftedDistractor]));
      while (bfsOptions.length < 4) {
        bfsOptions.push(labels.slice().sort(() => Math.random() - 0.5).join(' → '));
      }

      bank.push({
        category: 'bfs',
        difficulty: 'Medium',
        graphObj: graph,
        svgMarkup: QuizManager.renderGraphSVG(graph),
        question: `Based on the graph shown below, what is the exact BFS Traversal Order starting from vertex ${startNode}?`,
        options: bfsOptions.slice(0, 4),
        answer: bfsOptions.indexOf(actualBfsOrder),
        explanation: `Starting from ${startNode}, BFS visits neighbors level-by-level: ${actualBfsOrder}.`
      });

      // 2. Dynamic DFS Question
      const actualDfsOrder = dfsSteps[dfsSteps.length - 1].traversalOrder.join(' → ');
      const dfsOptions = Array.from(new Set([actualDfsOrder, actualBfsOrder, reverseBfsDistractor, shiftedDistractor]));
      while (dfsOptions.length < 4) {
        dfsOptions.push(labels.slice().sort(() => Math.random() - 0.5).join(' → '));
      }

      bank.push({
        category: 'dfs',
        difficulty: 'Medium',
        graphObj: graph,
        svgMarkup: QuizManager.renderGraphSVG(graph),
        question: `Based on the graph shown below, what is the exact DFS Traversal Order starting from vertex ${startNode}?`,
        options: dfsOptions.slice(0, 4),
        answer: dfsOptions.indexOf(actualDfsOrder),
        explanation: `Starting from ${startNode}, DFS dives deep along branches before backtracking: ${actualDfsOrder}.`
      });

      // 3. Dynamic Shortest Path Question
      const targetNode = labels.find(l => l !== startNode) || labels[labels.length - 1];
      const spResult = GraphAlgorithms.findShortestPathBFS(graph, startNode, targetNode);
      if (spResult.found) {
        const pathStr = spResult.path.join(' → ');
        const distance = spResult.path.length - 1;

        const spDistractors = [
          pathStr,
          `${distance + 1} edges`,
          `${Math.max(1, distance - 1)} edges`,
          `${distance + 2} edges`
        ];

        const pathOptions = [`${distance} edge(s) (${pathStr})`, `${distance + 1} edge(s)`, `${Math.max(1, distance - 1)} edge(s)`, `${distance + 2} edge(s)`];

        bank.push({
          category: 'shortestPath',
          difficulty: 'Hard',
          graphObj: graph,
          svgMarkup: QuizManager.renderGraphSVG(graph),
          question: `Using BFS on the graph below, what is the length of the Shortest Path from vertex ${startNode} to vertex ${targetNode}?`,
          options: pathOptions,
          answer: 0,
          explanation: `BFS discovers shortest path level-by-level: Path is ${pathStr} with distance of ${distance} edge(s).`
        });
      }
    }

    return bank;
  }

  /**
   * Randomly selects, shuffles, and validates questions based on user setup config
   */
  generateQuizQuestions() {
    const fullBank = this.generateQuestionBank();
    const config = this.config;

    // Filter by category
    let eligible = fullBank.filter(q => {
      if (q.category === 'conceptual' && !config.categories.conceptual) return false;
      if (q.category === 'bfs' && !config.categories.bfs) return false;
      if (q.category === 'dfs' && !config.categories.dfs) return false;
      if (q.category === 'graphBased' && !config.categories.graphBased) return false;
      if (q.category === 'complexity' && !config.categories.complexity) return false;
      if (q.category === 'shortestPath' && !config.categories.shortestPath) return false;
      return true;
    });

    // Filter by difficulty if not 'Mixed'
    if (config.difficulty !== 'Mixed') {
      eligible = eligible.filter(q => q.difficulty === config.difficulty || q.difficulty === 'Easy');
    }

    if (eligible.length === 0) {
      eligible = fullBank; // Fallback if filters are too strict
    }

    // Shuffle question order
    const shuffledBank = QuizManager.shuffleArray(eligible);
    const selectedCount = Math.min(config.numQuestions, shuffledBank.length);
    const selectedRaw = shuffledBank.slice(0, selectedCount);

    // Randomize option order for EVERY question and recalculate correct answer index
    return selectedRaw.map((q, idx) => {
      const randomized = QuizManager.randomizeQuestionOptions(q);
      return {
        id: idx + 1,
        ...randomized
      };
    });
  }

  // ==================================================
  // LOCALSTORAGE ATTEMPT HISTORY MANAGEMENT
  // ==================================================

  getHistory() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  saveAttempt(score, total) {
    try {
      const history = this.getHistory();
      const attempt = {
        id: Date.now(),
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        score: score,
        total: total,
        percentage: Math.round((score / total) * 100),
        difficulty: this.config.difficulty,
        numQuestions: total
      };
      history.unshift(attempt);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history.slice(0, 20))); // Keep last 20 attempts
    } catch (e) {
      console.warn("Unable to save attempt to localStorage", e);
    }
  }

  clearHistory() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      this.render();
    } catch (e) {
      console.warn("Unable to clear history", e);
    }
  }

  // ==================================================
  // RENDER UI & SCREEN STATES
  // ==================================================

  render() {
    if (!this.container) return;

    if (this.state === 'setup') {
      this.renderSetupScreen();
    } else if (this.state === 'active') {
      this.renderActiveQuizScreen();
    } else if (this.state === 'results') {
      this.renderResultsScreen();
    }
  }

  renderSetupScreen() {
    const history = this.getHistory();

    let html = `
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">
            <span class="card-icon">📝</span> Dynamic Offline DMS Quiz Generator
          </h2>
          <span class="badge badge-cyan">100% Offline & Randomized</span>
        </div>

        <p>Customize your quiz options below. Every quiz attempt generates a <strong>unique set of questions and randomized choices</strong> without requiring an internet connection!</p>

        <!-- Quiz Setup Form -->
        <div class="grid-2" style="margin: 1.5rem 0;">
          
          <div class="ds-box">
            <h4 style="color:var(--accent-cyan); margin-bottom: 0.8rem;">1. Quiz Parameters</h4>
            
            <div class="form-group">
              <label class="form-label">Number of Questions:</label>
              <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-sm btn-quiz-num ${this.config.numQuestions === 5 ? 'btn-primary' : 'btn-secondary'}" data-num="5">5</button>
                <button class="btn btn-sm btn-quiz-num ${this.config.numQuestions === 10 ? 'btn-primary' : 'btn-secondary'}" data-num="10">10</button>
                <button class="btn btn-sm btn-quiz-num ${this.config.numQuestions === 15 ? 'btn-primary' : 'btn-secondary'}" data-num="15">15</button>
                <button class="btn btn-sm btn-quiz-num ${this.config.numQuestions === 20 ? 'btn-primary' : 'btn-secondary'}" data-num="20">20</button>
              </div>
            </div>

            <div class="form-group" style="margin-top: 1rem;">
              <label class="form-label">Difficulty Level:</label>
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button class="btn btn-sm btn-quiz-diff ${this.config.difficulty === 'Easy' ? 'btn-green' : 'btn-secondary'}" data-diff="Easy">Easy</button>
                <button class="btn btn-sm btn-quiz-diff ${this.config.difficulty === 'Medium' ? 'btn-primary' : 'btn-secondary'}" data-diff="Medium">Medium</button>
                <button class="btn btn-sm btn-quiz-diff ${this.config.difficulty === 'Hard' ? 'btn-purple' : 'btn-secondary'}" data-diff="Hard">Hard</button>
                <button class="btn btn-sm btn-quiz-diff ${this.config.difficulty === 'Mixed' ? 'btn-primary' : 'btn-secondary'}" data-diff="Mixed">Mixed</button>
              </div>
            </div>
          </div>

          <div class="ds-box">
            <h4 style="color:var(--accent-cyan); margin-bottom: 0.8rem;">2. Question Categories</h4>
            <div style="display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.85rem;">
              <label style="cursor:pointer;"><input type="checkbox" id="chk-cat-conceptual" ${this.config.categories.conceptual ? 'checked' : ''}> Conceptual & Definitions</label>
              <label style="cursor:pointer;"><input type="checkbox" id="chk-cat-bfs" ${this.config.categories.bfs ? 'checked' : ''}> BFS Algorithm & Queue</label>
              <label style="cursor:pointer;"><input type="checkbox" id="chk-cat-dfs" ${this.config.categories.dfs ? 'checked' : ''}> DFS Algorithm & Stack/Recursion</label>
              <label style="cursor:pointer;"><input type="checkbox" id="chk-cat-graphBased" ${this.config.categories.graphBased ? 'checked' : ''}> Dynamic Graph Traversal Orders</label>
              <label style="cursor:pointer;"><input type="checkbox" id="chk-cat-complexity" ${this.config.categories.complexity ? 'checked' : ''}> Time & Space Complexity</label>
              <label style="cursor:pointer;"><input type="checkbox" id="chk-cat-shortestPath" ${this.config.categories.shortestPath ? 'checked' : ''}> BFS Shortest Path Calculations</label>
            </div>
          </div>

        </div>

        <button id="btn-start-quiz-now" class="btn btn-primary btn-lg" style="width: 100%;">
          🚀 START NEW RANDOMIZED QUIZ
        </button>

        <!-- Local Attempt History Section -->
        <div style="margin-top: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
            <h3 style="font-size: 1.1rem; color: var(--text-main);">📜 Local Quiz Attempt History</h3>
            ${history.length > 0 ? '<button id="btn-clear-quiz-history" class="btn btn-danger btn-sm">Clear History</button>' : ''}
          </div>

          ${history.length === 0 ? `
            <p style="font-size:0.85rem; color:var(--text-subtle);">No previous quiz attempts stored. Complete a quiz to view your score history here!</p>
          ` : `
            <div class="table-responsive">
              <table class="custom-table" style="font-size: 0.85rem;">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Difficulty</th>
                    <th>Questions</th>
                    <th>Score</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  ${history.map(att => `
                    <tr>
                      <td>${att.date}</td>
                      <td><span class="badge ${att.difficulty === 'Hard' ? 'badge-purple' : att.difficulty === 'Easy' ? 'badge-green' : 'badge-cyan'}">${att.difficulty}</span></td>
                      <td>${att.numQuestions}</td>
                      <td><strong>${att.score} / ${att.total}</strong></td>
                      <td><span style="color:${att.percentage >= 80 ? 'var(--accent-green)' : att.percentage >= 50 ? 'var(--accent-amber)' : 'var(--accent-rose)'}; font-weight:bold;">${att.percentage}%</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>

      </div>
    `;

    this.container.innerHTML = html;
    this.attachSetupEvents();
  }

  attachSetupEvents() {
    // Number of questions buttons
    const numBtns = this.container.querySelectorAll('.btn-quiz-num');
    numBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.config.numQuestions = parseInt(btn.getAttribute('data-num'));
        this.renderSetupScreen();
      });
    });

    // Difficulty buttons
    const diffBtns = this.container.querySelectorAll('.btn-quiz-diff');
    diffBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.config.difficulty = btn.getAttribute('data-diff');
        this.renderSetupScreen();
      });
    });

    // Category checkboxes
    const catCheckboxes = ['conceptual', 'bfs', 'dfs', 'graphBased', 'complexity', 'shortestPath'];
    catCheckboxes.forEach(cat => {
      const chk = document.getElementById(`chk-cat-${cat}`);
      if (chk) {
        chk.addEventListener('change', (e) => {
          this.config.categories[cat] = e.target.checked;
        });
      }
    });

    // Start Quiz Button
    const startBtn = document.getElementById('btn-start-quiz-now');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.questions = this.generateQuizQuestions();
        this.score = 0;
        this.userAnswers = {};
        this.startTime = Date.now();
        this.state = 'active';
        this.render();
      });
    }

    // Clear History Button
    const clearBtn = document.getElementById('btn-clear-quiz-history');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm("Clear all locally saved quiz attempt records?")) {
          this.clearHistory();
        }
      });
    }
  }

  renderActiveQuizScreen() {
    let html = `
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">
            <span class="card-icon">📝</span> DMS Concept & Traversal Quiz
          </h2>
          <div style="display: flex; gap: 1rem; align-items: center;">
            <span class="badge badge-cyan" id="quiz-score-badge" style="font-size: 0.9rem; padding: 0.4rem 0.8rem;">
              Score: ${this.score} / ${this.questions.length}
            </span>
            <button id="btn-quit-quiz" class="btn btn-secondary btn-sm">Quit Quiz</button>
          </div>
        </div>

        <div class="quiz-questions-list">
    `;

    this.questions.forEach((q, qIndex) => {
      html += `
        <div class="quiz-card" id="quiz-q-${q.id}">
          <h4 style="margin-bottom: 0.5rem; color: var(--text-main);">
            Q${qIndex + 1}. ${q.question}
          </h4>
          
          ${q.svgMarkup ? `<div>${q.svgMarkup}</div>` : ''}

          <div class="quiz-options-group">
      `;

      q.options.forEach((opt, optIndex) => {
        const isSelected = this.userAnswers[q.id] === optIndex;
        let optionClass = "quiz-option";
        if (isSelected) optionClass += " selected";

        html += `
          <div class="${optionClass}" data-qid="${q.id}" data-optindex="${optIndex}">
            <span style="font-weight: 700; width: 24px; color: var(--accent-cyan);">${String.fromCharCode(65 + optIndex)}.</span>
            <span>${opt}</span>
          </div>
        `;
      });

      html += `
          </div>
          <div class="quiz-feedback" id="feedback-q-${q.id}"></div>
        </div>
      `;
    });

    html += `
        </div>

        <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end;">
          <button id="btn-finish-quiz" class="btn btn-primary btn-lg">
            🏁 Finish Quiz & View Results
          </button>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.attachActiveEvents();
  }

  attachActiveEvents() {
    const optionEls = this.container.querySelectorAll('.quiz-option');
    optionEls.forEach(el => {
      el.addEventListener('click', () => {
        const qid = parseInt(el.getAttribute('data-qid'));
        const optIndex = parseInt(el.getAttribute('data-optindex'));
        this.selectAnswer(qid, optIndex);
      });
    });

    const quitBtn = document.getElementById('btn-quit-quiz');
    if (quitBtn) {
      quitBtn.addEventListener('click', () => {
        if (confirm("Quit active quiz and return to setup?")) {
          this.state = 'setup';
          this.render();
        }
      });
    }

    const finishBtn = document.getElementById('btn-finish-quiz');
    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        this.finishQuiz();
      });
    }
  }

  selectAnswer(qid, optIndex) {
    if (this.userAnswers[qid] !== undefined) return; // Prevent changing answer after selected

    this.userAnswers[qid] = optIndex;
    const question = this.questions.find(q => q.id === qid);
    const isCorrect = optIndex === question.answer;

    if (isCorrect) {
      this.score += 1;
    }

    // Update score badge
    const scoreBadge = document.getElementById('quiz-score-badge');
    if (scoreBadge) scoreBadge.innerText = `Score: ${this.score} / ${this.questions.length}`;

    // Highlight options
    const questionCard = document.getElementById(`quiz-q-${qid}`);
    const options = questionCard.querySelectorAll('.quiz-option');

    options.forEach((optEl, i) => {
      if (i === question.answer) {
        optEl.classList.add('correct');
      } else if (i === optIndex && !isCorrect) {
        optEl.classList.add('incorrect');
      }
    });

    // Show explanation feedback
    const feedbackEl = document.getElementById(`feedback-q-${qid}`);
    if (feedbackEl) {
      feedbackEl.classList.add('show');
      if (isCorrect) {
        feedbackEl.classList.add('correct');
        feedbackEl.innerHTML = `<strong>✓ Correct!</strong> ${question.explanation}`;
      } else {
        feedbackEl.classList.add('incorrect');
        feedbackEl.innerHTML = `<strong>✗ Incorrect.</strong> ${question.explanation}`;
      }
    }
  }

  finishQuiz() {
    this.endTime = Date.now();
    this.saveAttempt(this.score, this.questions.length);
    this.state = 'results';
    this.render();
  }

  renderResultsScreen() {
    const total = this.questions.length;
    const pct = Math.round((this.score / total) * 100);

    let gradeMsg = "Great Effort!";
    let badgeClass = "badge-cyan";
    if (pct >= 90) { gradeMsg = "🏆 Excellent Mastery!"; badgeClass = "badge-green"; }
    else if (pct >= 70) { gradeMsg = "👍 Good Performance!"; badgeClass = "badge-cyan"; }
    else if (pct >= 50) { gradeMsg = "📖 Keep Practicing!"; badgeClass = "badge-amber"; }
    else { gradeMsg = "⚠️ Review Concepts & Traversal Rules"; badgeClass = "badge-rose"; }

    let html = `
      <div class="card" style="text-align: center; padding: 2rem;">
        <span class="badge ${badgeClass}" style="font-size: 1rem; padding: 0.5rem 1rem;">${gradeMsg}</span>
        
        <h2 style="font-size: 2.5rem; margin-top: 1rem; color: var(--accent-cyan);">
          ${this.score} / ${total}
        </h2>
        <p style="font-size: 1.2rem; font-weight: bold; color: #fff;">
          Score Percentage: ${pct}%
        </p>

        <div style="max-width: 400px; margin: 1.5rem auto; text-align: left; background: var(--bg-primary); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); font-size: 0.9rem;">
          <p style="margin-bottom:0.4rem;"><strong>Difficulty:</strong> ${this.config.difficulty}</p>
          <p style="margin-bottom:0.4rem;"><strong>Questions Answered:</strong> ${Object.keys(this.userAnswers).length} / ${total}</p>
          <p style="margin-bottom:0;"><strong>Mode:</strong> 100% Offline Dynamic Generation</p>
        </div>

        <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
          <button id="btn-retake-quiz" class="btn btn-primary btn-lg">
            ↻ Retake Quiz (New Randomized Questions)
          </button>
          <button id="btn-return-setup" class="btn btn-secondary btn-lg">
            ⚙️ Change Quiz Settings
          </button>
        </div>
      </div>
    `;

    this.container.innerHTML = html;

    const retakeBtn = document.getElementById('btn-retake-quiz');
    if (retakeBtn) {
      retakeBtn.addEventListener('click', () => {
        this.questions = this.generateQuizQuestions();
        this.score = 0;
        this.userAnswers = {};
        this.startTime = Date.now();
        this.state = 'active';
        this.render();
      });
    }

    const setupBtn = document.getElementById('btn-return-setup');
    if (setupBtn) {
      setupBtn.addEventListener('click', () => {
        this.state = 'setup';
        this.render();
      });
    }
  }
}
