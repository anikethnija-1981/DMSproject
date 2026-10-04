/* ==========================================
   BFS & DFS Graph Traversal Platform
   Pro-Level Application Controller & State Glue
   ========================================== */

class App {
  constructor() {
    this.graph = new Graph(false, false);
    this.visualizer = null;
    this.quiz = null;
    this.experiments = null;

    // Animation Playback State
    this.algorithmSteps = [];
    this.currentStepIndex = 0;
    this.isPlaying = false;
    this.playTimer = null;
    this.speed = 1000;
    this.speedMultiplier = 1.0;
    this.isStepMode = false;
    this.activeAlgorithm = 'BFS';
    this.startNodeId = 'A';

    // Panel Visibility Toggles
    this.showPseudocode = false;
    this.showLevelView = false;

    // Student Progress State (Stored in LocalStorage)
    this.progress = {
      topicsVisited: new Set(['tab-intro']),
      traversalsRun: 0,
      quizzesCompleted: 0,
      quizScores: [],
      experimentsDone: new Set()
    };

    window.app = this;
  }

  init() {
    // 1. Initialize Opening Animation Intro Canvas
    this.initOpeningIntro();

    // 2. Initialize Theme Switcher (Dark/Light)
    this.initThemeSwitcher();

    // 3. Initialize Mobile Drawer Menu
    this.initMobileMenu();

    // 4. Initialize Student Progress Tracker
    this.loadProgress();

    // 5. Initialize Canvas Visualizer Engine
    const canvas = document.getElementById('graphCanvas');
    if (canvas) {
      this.visualizer = new GraphVisualizer(canvas, this.graph);
      this.graph.loadPreset('simple', canvas.width, canvas.height);
      this.visualizer.draw();
    }

    // 6. Initialize Quiz & Experiments Modules (Keeping Quiz untouched!)
    this.quiz = new QuizManager('quiz-container');
    this.experiments = new ExperimentManager(this.graph, this.visualizer);

    // 7. Attach Event Listeners
    this.attachTabNavigation();
    this.attachGraphControls();
    this.attachPlaybackControls();
    this.attachPanelToggles();
    this.attachCodeTabListeners();
    this.attachObservationControls();

    // 8. Initial UI Sync
    this.updateAdjacencyListUI();
    this.updateStartNodeDropdowns();
    this.renderProgressDashboard();
  }

  // ==================================================
  // TOAST NOTIFICATION SYSTEM
  // ==================================================
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    else if (type === 'warning') icon = '⚠️';
    else if (type === 'error') icon = '❌';

    toast.innerHTML = `<span style="font-weight:bold;">${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  }

  // ==================================================
  // 1. IMPRESSIVE WEBSITE OPENING ANIMATION SEQUENCE
  // ==================================================
  initOpeningIntro() {
    const overlay = document.getElementById('intro-overlay');
    const introCanvas = document.getElementById('introCanvas');
    if (!overlay || !introCanvas) return;

    if (sessionStorage.getItem('dms_intro_completed') === 'true') {
      overlay.classList.add('hidden');
      return;
    }

    const ctx = introCanvas.getContext('2d');
    introCanvas.width = window.innerWidth;
    introCanvas.height = window.innerHeight;

    const nodes = [
      { id: 'A', x: introCanvas.width * 0.3, y: introCanvas.height * 0.35, alpha: 0, scale: 0 },
      { id: 'B', x: introCanvas.width * 0.5, y: introCanvas.height * 0.25, alpha: 0, scale: 0 },
      { id: 'C', x: introCanvas.width * 0.7, y: introCanvas.height * 0.35, alpha: 0, scale: 0 },
      { id: 'D', x: introCanvas.width * 0.35, y: introCanvas.height * 0.65, alpha: 0, scale: 0 },
      { id: 'E', x: introCanvas.width * 0.65, y: introCanvas.height * 0.65, alpha: 0, scale: 0 }
    ];

    const edges = [
      { u: 0, v: 1, progress: 0 },
      { u: 0, v: 2, progress: 0 },
      { u: 1, v: 3, progress: 0 },
      { u: 2, v: 4, progress: 0 },
      { u: 3, v: 4, progress: 0 }
    ];

    let frame = 0;
    let pulseProgress = 0;

    const animateIntro = () => {
      frame++;
      ctx.clearRect(0, 0, introCanvas.width, introCanvas.height);

      nodes.forEach((n, idx) => {
        const delay = idx * 10;
        if (frame > delay) {
          n.alpha = Math.min(1, n.alpha + 0.05);
          n.scale = Math.min(1, n.scale + 0.08);
        }
      });

      edges.forEach((e, idx) => {
        const delay = 40 + idx * 12;
        if (frame > delay) {
          e.progress = Math.min(1, e.progress + 0.04);
        }
      });

      if (frame > 100) {
        pulseProgress = (pulseProgress + 0.02) % 1.0;
      }

      edges.forEach(e => {
        if (e.progress > 0) {
          const u = nodes[e.u];
          const v = nodes[e.v];
          const ex = u.x + (v.x - u.x) * e.progress;
          const ey = u.y + (v.y - u.y) * e.progress;

          ctx.beginPath();
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
          ctx.lineWidth = 2;
          ctx.moveTo(u.x, u.y);
          ctx.lineTo(ex, ey);
          ctx.stroke();

          if (frame > 100) {
            const px = u.x + (v.x - u.x) * pulseProgress;
            const py = u.y + (v.y - u.y) * pulseProgress;
            ctx.beginPath();
            ctx.fillStyle = frame > 180 ? '#8b5cf6' : '#06b6d4';
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 10;
            ctx.arc(px, py, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      });

      nodes.forEach(n => {
        if (n.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = n.alpha;

          ctx.beginPath();
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 12;
          ctx.arc(n.x, n.y, 22 * n.scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 15px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(n.id, n.x, n.y);
          ctx.restore();
        }
      });

      if (!overlay.classList.contains('hidden')) {
        requestAnimationFrame(animateIntro);
      }
    };

    requestAnimationFrame(animateIntro);

    const dismissIntro = () => {
      overlay.classList.add('hidden');
      sessionStorage.setItem('dms_intro_completed', 'true');
    };

    const startBtn = document.getElementById('btn-start-learning');
    const skipBtn = document.getElementById('btn-skip-intro');

    if (startBtn) startBtn.addEventListener('click', dismissIntro);
    if (skipBtn) skipBtn.addEventListener('click', dismissIntro);
  }

  // ==================================================
  // 2. THEME SWITCHER (DARK / LIGHT MODE)
  // ==================================================
  initThemeSwitcher() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    const iconSun = document.getElementById('theme-icon-sun');
    const iconMoon = document.getElementById('theme-icon-moon');
    if (!themeBtn) return;

    const savedTheme = localStorage.getItem('dms_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const updateIcons = (theme) => {
      if (theme === 'light') {
        if (iconSun) iconSun.style.display = 'inline';
        if (iconMoon) iconMoon.style.display = 'none';
      } else {
        if (iconSun) iconSun.style.display = 'none';
        if (iconMoon) iconMoon.style.display = 'inline';
      }
    };

    updateIcons(savedTheme);

    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('dms_theme', next);
      updateIcons(next);
      this.showToast(`Switched to ${next.toUpperCase()} mode`, 'info');

      if (this.visualizer) {
        this.visualizer.draw();
      }
    });
  }

  // ==================================================
  // 3. MOBILE MENU DRAWER
  // ==================================================
  initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const drawer = document.getElementById('mobile-drawer');
    if (!menuBtn || !drawer) return;

    menuBtn.addEventListener('click', () => {
      drawer.classList.toggle('open');
    });

    drawer.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        drawer.classList.remove('open');
        const target = tab.getAttribute('data-target');
        this.navigateToTab(target);
      });
    });
  }

  // ==================================================
  // 4. NAVIGATION CONTROLLER & PROGRESS LOGGING
  // ==================================================
  attachTabNavigation() {
    const tabs = document.querySelectorAll('.app-navbar .nav-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.getAttribute('data-target');
        this.navigateToTab(targetId);
      });
    });

    const brandLogo = document.getElementById('brand-logo');
    if (brandLogo) {
      brandLogo.addEventListener('click', () => this.navigateToTab('tab-intro'));
    }
  }

  navigateToTab(tabId) {
    document.querySelectorAll('.nav-tab').forEach(t => {
      if (t.getAttribute('data-target') === tabId) t.classList.add('active');
      else t.classList.remove('active');
    });

    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const targetEl = document.getElementById(tabId);
    if (targetEl) targetEl.classList.add('active');

    this.progress.topicsVisited.add(tabId);
    this.saveProgress();

    if (tabId === 'tab-visualizer' && this.visualizer) {
      setTimeout(() => this.visualizer.initCanvasSize(), 50);
    }
  }

  // ==================================================
  // 5. STUDENT PROGRESS TRACKER & BADGES
  // ==================================================
  loadProgress() {
    try {
      const raw = localStorage.getItem('dms_student_progress');
      if (raw) {
        const parsed = JSON.parse(raw);
        this.progress.topicsVisited = new Set(parsed.topicsVisited || ['tab-intro']);
        this.progress.traversalsRun = parsed.traversalsRun || 0;
        this.progress.quizzesCompleted = parsed.quizzesCompleted || 0;
        this.progress.quizScores = parsed.quizScores || [];
        this.progress.experimentsDone = new Set(parsed.experimentsDone || []);
      }
    } catch (e) {
      console.warn("Unable to load student progress", e);
    }
  }

  saveProgress() {
    try {
      const payload = {
        topicsVisited: Array.from(this.progress.topicsVisited),
        traversalsRun: this.progress.traversalsRun,
        quizzesCompleted: this.progress.quizzesCompleted,
        quizScores: this.progress.quizScores,
        experimentsDone: Array.from(this.progress.experimentsDone)
      };
      localStorage.setItem('dms_student_progress', JSON.stringify(payload));
      this.renderProgressDashboard();
    } catch (e) {
      console.warn("Unable to save student progress", e);
    }
  }

  recordTraversalRun() {
    this.progress.traversalsRun++;
    this.saveProgress();
  }

  renderProgressDashboard() {
    const topicsEl = document.getElementById('prog-val-topics');
    const runsEl = document.getElementById('prog-val-runs');
    const quizzesEl = document.getElementById('prog-val-quizzes');
    const accuracyEl = document.getElementById('prog-val-accuracy');
    const barFill = document.getElementById('overall-progress-fill');
    const badgesEl = document.getElementById('badges-container');

    if (topicsEl) topicsEl.innerText = `${this.progress.topicsVisited.size} / 8`;
    if (runsEl) runsEl.innerText = this.progress.traversalsRun.toString();
    if (quizzesEl) quizzesEl.innerText = this.progress.quizzesCompleted.toString();

    let avgAcc = 0;
    if (this.progress.quizScores.length > 0) {
      const sum = this.progress.quizScores.reduce((a, b) => a + b, 0);
      avgAcc = Math.round(sum / this.progress.quizScores.length);
    }
    if (accuracyEl) accuracyEl.innerText = `${avgAcc}%`;

    const overallPct = Math.min(100, Math.round(
      (this.progress.topicsVisited.size / 8 * 40) +
      (Math.min(10, this.progress.traversalsRun) * 3) +
      (Math.min(5, this.progress.quizzesCompleted) * 6)
    ));

    if (barFill) barFill.style.width = `${overallPct}%`;

    if (badgesEl) {
      const badges = ['<span class="badge badge-cyan">🌱 DMS Novice</span>'];
      if (this.progress.traversalsRun >= 3) badges.push('<span class="badge badge-cyan">🌊 BFS Explorer</span>');
      if (this.progress.traversalsRun >= 5) badges.push('<span class="badge badge-purple">🌲 DFS Backtracker</span>');
      if (this.progress.experimentsDone.size >= 3) badges.push('<span class="badge badge-green">🧪 Lab Specialist</span>');
      if (this.progress.quizzesCompleted >= 1 && avgAcc >= 70) badges.push('<span class="badge badge-amber">🎯 Quiz Master</span>');
      if (overallPct >= 80) badges.push('<span class="badge badge-purple">🏆 Graph Theory Master</span>');

      badgesEl.innerHTML = badges.join('');
    }
  }

  // ==================================================
  // 6. GRAPH BUILDER & STORAGE CONTROLS
  // ==================================================
  attachCodeTabListeners() {
    const codeTabs = document.querySelectorAll('.code-tab');
    codeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const group = tab.getAttribute('data-group');
        const lang = tab.getAttribute('data-lang');

        document.querySelectorAll(`.code-tab[data-group="${group}"]`).forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        document.querySelectorAll(`.code-block[data-group="${group}"]`).forEach(b => b.style.display = 'none');
        const targetBlock = document.querySelector(`.code-block[data-group="${group}"][data-lang="${lang}"]`);
        if (targetBlock) targetBlock.style.display = 'block';
      });
    });
  }

  attachGraphControls() {
    // Mode Buttons
    const modeBtns = document.querySelectorAll('.btn-mode');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.getAttribute('data-mode');
        if (this.visualizer) this.visualizer.mode = mode;
      });
    });

    // Preset Selector
    const presetSelect = document.getElementById('preset-select');
    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        const preset = e.target.value;
        if (this.visualizer) {
          this.graph.loadPreset(preset, this.visualizer.canvas.width, this.visualizer.canvas.height);
          this.resetAnimation();
          this.onGraphModified();
          this.showToast(`Loaded preset graph: ${preset}`, 'info');
        }
      });
    }

    // Directed / Undirected Toggle
    const directedToggle = document.getElementById('toggle-directed');
    if (directedToggle) {
      directedToggle.addEventListener('change', (e) => {
        this.graph.isDirected = e.target.checked;
        this.onGraphModified();
        this.showToast(e.target.checked ? "Switched to Directed Graph" : "Switched to Undirected Graph", 'info');
      });
    }

    // Weighted / Unweighted Toggle
    const weightedToggle = document.getElementById('toggle-weighted');
    if (weightedToggle) {
      weightedToggle.addEventListener('change', (e) => {
        this.graph.isWeighted = e.target.checked;
        this.onGraphModified();
        this.showToast(e.target.checked ? "Weighted Edges Enabled" : "Unweighted Edges Enabled", 'info');
      });
    }

    // Step Mode Toggle
    const stepModeToggle = document.getElementById('toggle-stepmode');
    if (stepModeToggle) {
      stepModeToggle.addEventListener('change', (e) => {
        this.isStepMode = e.target.checked;
        if (this.isStepMode && this.isPlaying) {
          this.pause();
        }
        this.showToast(this.isStepMode ? "Step-by-Step Manual Mode Enabled" : "Auto-Play Animation Mode Enabled", 'info');
      });
    }

    // Add Vertex Form Button
    const btnAddVertex = document.getElementById('btn-add-vertex');
    if (btnAddVertex) {
      btnAddVertex.addEventListener('click', () => {
        const input = document.getElementById('input-vertex-label');
        const label = input ? input.value.trim().toUpperCase() : '';
        if (label) {
          const cx = (this.visualizer ? this.visualizer.canvas.width : 700) / 2 + (Math.random() * 120 - 60);
          const cy = (this.visualizer ? this.visualizer.canvas.height : 500) / 2 + (Math.random() * 120 - 60);
          if (this.graph.addNode(label, label, cx, cy)) {
            if (input) input.value = '';
            this.onGraphModified();
            this.showToast(`Vertex ${label} added successfully`, 'success');
          } else {
            this.showToast(`Vertex ${label} already exists!`, 'warning');
          }
        } else {
          this.showToast("Please enter a valid node label", 'warning');
        }
      });
    }

    // Add Edge Form Button
    const btnAddEdge = document.getElementById('btn-add-edge');
    if (btnAddEdge) {
      btnAddEdge.addEventListener('click', () => {
        const uSelect = document.getElementById('select-edge-u');
        const vSelect = document.getElementById('select-edge-v');
        if (!uSelect || !vSelect) return;
        const u = uSelect.value;
        const v = vSelect.value;

        if (u && v && u !== v) {
          if (this.graph.addEdge(u, v, 1)) {
            this.onGraphModified();
            this.showToast(`Connected Edge ${u} → ${v}`, 'success');
          } else {
            this.showToast(`Edge ${u} → ${v} already exists`, 'warning');
          }
        } else if (u === v) {
          this.showToast("Self loops are disabled for basic traversal demos", 'warning');
        }
      });
    }

    // Delete Edge Form Button
    const btnDeleteEdge = document.getElementById('btn-delete-edge');
    if (btnDeleteEdge) {
      btnDeleteEdge.addEventListener('click', () => {
        const uSelect = document.getElementById('select-delete-edge-u');
        const vSelect = document.getElementById('select-delete-edge-v');
        if (!uSelect || !vSelect) return;
        const u = uSelect.value;
        const v = vSelect.value;

        if (u && v && u !== v) {
          if (this.graph.removeEdge(u, v)) {
            this.onGraphModified();
            this.showToast(`Disconnected Edge ${u} ✕ ${v}`, 'info');
          } else {
            this.showToast(`No edge exists between ${u} and ${v}`, 'warning');
          }
        }
      });
    }

    // Delete Vertex Form Button
    const btnDeleteVertex = document.getElementById('btn-delete-vertex');
    if (btnDeleteVertex) {
      btnDeleteVertex.addEventListener('click', () => {
        const id = document.getElementById('select-delete-vertex').value;
        if (id) {
          this.graph.removeNode(id);
          this.onGraphModified();
          this.showToast(`Deleted Node ${id}`, 'info');
        }
      });
    }

    // Random Graph Button
    const btnRandom = document.getElementById('btn-random-graph');
    if (btnRandom) {
      btnRandom.addEventListener('click', () => {
        const width = this.visualizer ? this.visualizer.canvas.width : 700;
        const height = this.visualizer ? this.visualizer.canvas.height : 450;
        this.graph.generateRandomGraph(6, width, height);
        this.resetAnimation();
        this.onGraphModified();
        this.showToast("Generated random graph", 'success');
      });
    }

    // Instructions Modal Button
    const btnInstructions = document.getElementById('btn-show-instructions');
    if (btnInstructions) {
      btnInstructions.addEventListener('click', () => {
        const modal = document.getElementById('instructions-modal');
        if (modal) modal.classList.add('active');
      });
    }

    // Clear Graph Button
    const btnClear = document.getElementById('btn-clear-graph');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear all nodes and edges from the canvas?")) {
          this.graph.clear();
          this.resetAnimation();
          this.onGraphModified();
          this.showToast("Canvas cleared", 'info');
        }
      });
    }

    // Save Graph Button
    const btnSaveGraph = document.getElementById('btn-save-graph');
    if (btnSaveGraph) {
      btnSaveGraph.addEventListener('click', () => {
        if (this.graph.nodes.size === 0) {
          this.showToast("Cannot save an empty graph", 'warning');
          return;
        }
        const json = this.graph.toJSON();
        localStorage.setItem('dms_saved_graph', JSON.stringify(json));
        this.showToast("Graph saved to LocalStorage", 'success');
      });
    }

    // Load Graph Button
    const btnLoadGraph = document.getElementById('btn-load-graph');
    if (btnLoadGraph) {
      btnLoadGraph.addEventListener('click', () => {
        const raw = localStorage.getItem('dms_saved_graph');
        if (!raw) {
          this.showToast("No saved graph found in storage", 'warning');
          return;
        }
        try {
          const parsed = JSON.parse(raw);
          if (this.graph.fromJSON(parsed)) {
            this.resetAnimation();
            this.onGraphModified();
            this.showToast("Saved graph restored successfully", 'success');
          } else {
            this.showToast("Saved graph data was corrupted", 'error');
          }
        } catch (e) {
          this.showToast("Failed to parse saved graph", 'error');
        }
      });
    }

    // Start Node Select Listener
    const startSelect = document.getElementById('start-node-select');
    if (startSelect) {
      startSelect.addEventListener('change', (e) => {
        this.startNodeId = e.target.value;
        this.resetAnimation();
        this.showToast(`Start root node set to ${this.startNodeId}`, 'info');
      });
    }
  }

  // ==================================================
  // 7. PLAYBACK CONTROLS (PLAY, PAUSE, NEXT, PREV, SPEED)
  // ==================================================
  attachPlaybackControls() {
    const btnRunBfs = document.getElementById('btn-run-bfs');
    if (btnRunBfs) {
      btnRunBfs.addEventListener('click', () => {
        this.startAlgorithm('BFS');
      });
    }

    const btnRunDfs = document.getElementById('btn-run-dfs');
    if (btnRunDfs) {
      btnRunDfs.addEventListener('click', () => {
        this.startAlgorithm('DFS');
      });
    }

    const btnPlayPause = document.getElementById('btn-play-pause');
    if (btnPlayPause) {
      btnPlayPause.addEventListener('click', () => {
        if (this.isPlaying) {
          this.pause();
        } else {
          this.play();
        }
      });
    }

    const btnNextStep = document.getElementById('btn-next-step');
    if (btnNextStep) {
      btnNextStep.addEventListener('click', () => {
        this.pause();
        this.stepForward();
      });
    }

    const btnPrevStep = document.getElementById('btn-prev-step');
    if (btnPrevStep) {
      btnPrevStep.addEventListener('click', () => {
        this.pause();
        this.stepBackward();
      });
    }

    const btnReset = document.getElementById('btn-reset-animation');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.resetAnimation();
        this.showToast("Animation reset", 'info');
      });
    }

    const speedPills = document.querySelectorAll('.speed-pill');
    speedPills.forEach(pill => {
      pill.addEventListener('click', () => {
        speedPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const sp = parseFloat(pill.getAttribute('data-speed'));
        this.speedMultiplier = sp;
        this.speed = 1000 / sp;

        if (this.isPlaying) {
          this.pause();
          this.play();
        }
        this.showToast(`Animation speed set to ${sp}×`, 'info');
      });
    });

    const progressScrubber = document.getElementById('progress-scrubber');
    if (progressScrubber) {
      progressScrubber.addEventListener('input', (e) => {
        this.pause();
        const targetIdx = parseInt(e.target.value);
        if (targetIdx >= 0 && targetIdx < this.algorithmSteps.length) {
          this.currentStepIndex = targetIdx;
          this.renderCurrentStep();
        }
      });
    }
  }

  attachPanelToggles() {
    const btnToggleCode = document.getElementById('btn-toggle-pseudocode');
    if (btnToggleCode) {
      btnToggleCode.addEventListener('click', () => {
        this.showPseudocode = !this.showPseudocode;
        const panel = document.getElementById('pseudocode-panel');
        if (panel) {
          panel.style.display = this.showPseudocode ? 'block' : 'none';
          if (this.showPseudocode) this.renderPseudocode();
        }
      });
    }

    const btnToggleLevel = document.getElementById('btn-toggle-levelview');
    if (btnToggleLevel) {
      btnToggleLevel.addEventListener('click', () => {
        this.showLevelView = !this.showLevelView;
        const panel = document.getElementById('level-tree-panel');
        if (panel) {
          panel.style.display = this.showLevelView ? 'block' : 'none';
          if (this.showLevelView) this.renderLevelTree();
        }
      });
    }
  }

  startAlgTab(algType) {
    this.navigateToTab('tab-visualizer');
    setTimeout(() => this.startAlgorithm(algType), 100);
  }

  startAlgorithm(algType) {
    if (this.graph.nodes.size === 0) {
      this.showToast("Please add vertices or load a preset graph first!", 'warning');
      return;
    }

    this.activeAlgorithm = algType;
    const startNode = document.getElementById('start-node-select').value || Array.from(this.graph.nodes.keys())[0];
    this.startNodeId = startNode;

    if (algType === 'BFS') {
      this.algorithmSteps = GraphAlgorithms.generateBFS(this.graph, startNode);
    } else {
      this.algorithmSteps = GraphAlgorithms.generateDFS(this.graph, startNode);
    }

    this.recordTraversalRun();

    const progressScrubber = document.getElementById('progress-scrubber');
    if (progressScrubber) {
      progressScrubber.max = this.algorithmSteps.length - 1;
      progressScrubber.value = 0;
    }

    this.renderTimelineAll();
    this.renderPseudocode();

    this.currentStepIndex = 0;
    this.renderCurrentStep();

    this.showToast(`Started ${algType} traversal from node ${startNode}`, 'success');

    if (!this.isStepMode) {
      this.play();
    }
  }

  play() {
    if (this.algorithmSteps.length === 0) return;
    this.isPlaying = true;

    const playPauseBtn = document.getElementById('btn-play-pause');
    if (playPauseBtn) playPauseBtn.innerText = '⏸ Pause';

    clearInterval(this.playTimer);
    this.playTimer = setInterval(() => {
      if (this.currentStepIndex < this.algorithmSteps.length - 1) {
        this.stepForward();
      } else {
        this.pause();
      }
    }, this.speed);
  }

  pause() {
    this.isPlaying = false;
    clearInterval(this.playTimer);
    const playPauseBtn = document.getElementById('btn-play-pause');
    if (playPauseBtn) playPauseBtn.innerText = '▶ Play';
  }

  stepForward() {
    if (this.currentStepIndex < this.algorithmSteps.length - 1) {
      this.currentStepIndex++;
      this.renderCurrentStep();
    }
  }

  stepBackward() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.renderCurrentStep();
    }
  }

  resetAnimation() {
    this.pause();
    this.currentStepIndex = 0;
    this.algorithmSteps = [];
    if (this.visualizer) {
      this.visualizer.setStepState(null, []);
    }

    const scrubber = document.getElementById('progress-scrubber');
    if (scrubber) { scrubber.max = 0; scrubber.value = 0; }

    document.getElementById('step-counter').innerText = 'Step 0 / 0';
    document.getElementById('explanation-text').innerText = 'Select an algorithm (BFS or DFS) above and click Run to visualize step-by-step execution.';
    document.getElementById('ds-queue-stack-title').innerText = 'Data Structure State';
    document.getElementById('ds-queue-stack-strip').innerHTML = '<span style="color:var(--text-subtle);">Empty</span>';
    document.getElementById('ds-visited-strip').innerHTML = '<span style="color:var(--text-subtle);">Empty</span>';
    document.getElementById('ds-traversal-order').innerHTML = '<span style="color:var(--text-subtle);">None</span>';
    document.getElementById('timeline-container').innerHTML = '<div class="timeline-empty-msg">No algorithm active. Click "Run BFS" or "Run DFS" to populate event timeline.</div>';

    const pCodeContainer = document.getElementById('pseudocode-lines-container');
    if (pCodeContainer) pCodeContainer.innerHTML = '';
    const levelContainer = document.getElementById('level-tree-content');
    if (levelContainer) levelContainer.innerHTML = '';
  }

  renderCurrentStep() {
    if (!this.algorithmSteps || this.algorithmSteps.length === 0) return;

    const stepState = this.algorithmSteps[this.currentStepIndex];

    if (this.visualizer) {
      this.visualizer.setStepState(stepState, []);
    }

    const totalSteps = this.algorithmSteps.length - 1;
    document.getElementById('step-counter').innerText = `Step ${this.currentStepIndex} / ${totalSteps}`;
    const scrubber = document.getElementById('progress-scrubber');
    if (scrubber) scrubber.value = this.currentStepIndex;

    document.getElementById('explanation-text').innerText = stepState.explanation;

    const dsTitle = document.getElementById('ds-queue-stack-title');
    const dsStrip = document.getElementById('ds-queue-stack-strip');

    if (this.activeAlgorithm === 'BFS') {
      dsTitle.innerHTML = 'Queue State (FIFO): <span style="font-size:0.75rem; color:var(--accent-cyan);">FRONT (Dequeue) ➔ REAR (Enqueue)</span>';
      const items = stepState.queue || [];
      dsStrip.innerHTML = items.length === 0 
        ? '<span style="color:var(--text-subtle);">Empty</span>'
        : items.map((id, i) => `
            <div class="ds-element ds-element-queue" title="${i === 0 ? 'FRONT of Queue' : 'Queued Item'}">
              ${id}
              ${i === 0 ? '<span style="font-size:0.65rem; position:absolute; bottom:-14px; color:var(--accent-cyan);">FRONT</span>' : ''}
            </div>
          `).join('');
    } else {
      dsTitle.innerHTML = 'Stack State (LIFO): <span style="font-size:0.75rem; color:var(--accent-purple);">TOP (Push/Pop) ⬇ BOTTOM</span>';
      const items = stepState.stack || [];
      dsStrip.innerHTML = items.length === 0
        ? '<span style="color:var(--text-subtle);">Empty</span>'
        : items.map((id, i) => `
            <div class="ds-element ds-element-stack" title="${i === items.length - 1 ? 'TOP of Stack' : 'Stacked Item'}">
              ${id}
              ${i === items.length - 1 ? '<span style="font-size:0.65rem; position:absolute; top:-14px; color:var(--accent-purple);">TOP</span>' : ''}
            </div>
          `).join('');
    }

    const visitedStrip = document.getElementById('ds-visited-strip');
    const discovered = stepState.discovered || stepState.visited || [];
    visitedStrip.innerHTML = discovered.length === 0
      ? '<span style="color:var(--text-subtle);">Empty</span>'
      : discovered.map(id => `<div class="ds-element ds-element-visited">${id}</div>`).join('');

    const travOrderEl = document.getElementById('ds-traversal-order');
    const travOrder = stepState.traversalOrder || [];
    if (stepState.isComplete) {
      travOrderEl.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:0.2rem; width:100%;">
          <span class="badge badge-green" style="width:fit-content;">✓ ${this.activeAlgorithm} COMPLETE</span>
          <span style="font-weight:700; color:var(--accent-cyan); font-size:1.1rem;">${travOrder.join(' → ')}</span>
        </div>
      `;
    } else {
      travOrderEl.innerHTML = travOrder.length === 0
        ? '<span style="color:var(--text-subtle);">None</span>'
        : `<span style="font-weight:700; color:var(--accent-cyan); font-size:1.1rem;">${travOrder.join(' → ')}</span>`;
    }

    this.updateTimelineActiveStep();
    this.updatePseudocodeActiveLine(stepState.lineIndex);

    if (this.showLevelView) {
      this.renderLevelTree();
    }
  }

  renderTimelineAll() {
    const container = document.getElementById('timeline-container');
    if (!container || !this.algorithmSteps.length) return;

    let html = '';
    this.algorithmSteps.forEach((st, idx) => {
      let cssClass = 'timeline-item';
      if (st.isBacktracking) cssClass += ' backtrack';
      if (st.isDeadEnd) cssClass += ' deadend';

      html += `
        <div class="${cssClass}" id="timeline-step-${idx}" onclick="app.jumpToStep(${idx})" style="cursor:pointer;">
          <span class="timeline-step-badge">STEP ${String(idx).padStart(2, '0')}</span>
          <span>${st.timelineEvent}</span>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  updateTimelineActiveStep() {
    document.querySelectorAll('.timeline-item').forEach(el => el.classList.remove('active'));
    const activeEl = document.getElementById(`timeline-step-${this.currentStepIndex}`);
    if (activeEl) {
      activeEl.classList.add('active');
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  jumpToStep(idx) {
    this.pause();
    if (idx >= 0 && idx < this.algorithmSteps.length) {
      this.currentStepIndex = idx;
      this.renderCurrentStep();
    }
  }

  renderPseudocode() {
    const algTitle = document.getElementById('pseudocode-alg-title');
    const container = document.getElementById('pseudocode-lines-container');
    if (!container) return;

    const pseudoLines = this.activeAlgorithm === 'BFS' ? GraphAlgorithms.BFS_PSEUDOCODE : GraphAlgorithms.DFS_PSEUDOCODE;
    if (algTitle) {
      algTitle.innerText = `${this.activeAlgorithm} Pseudocode`;
      algTitle.className = this.activeAlgorithm === 'BFS' ? 'badge badge-cyan' : 'badge badge-purple';
    }

    let html = '';
    pseudoLines.forEach(item => {
      html += `
        <div class="pseudocode-line" id="pseudo-line-${item.line}">
          <span class="line-num">${String(item.line).padStart(2, '0')}</span>
          <span>${item.text.replace(/ /g, '&nbsp;')}</span>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  updatePseudocodeActiveLine(lineNum) {
    document.querySelectorAll('.pseudocode-line').forEach(el => el.classList.remove('active'));
    if (lineNum) {
      const activeLine = document.getElementById(`pseudo-line-${lineNum}`);
      if (activeLine) activeLine.classList.add('active');
    }
  }

  renderLevelTree() {
    const titleEl = document.getElementById('level-tree-title');
    const contentEl = document.getElementById('level-tree-content');
    if (!contentEl) return;

    const currentStepState = this.algorithmSteps[this.currentStepIndex];

    if (this.activeAlgorithm === 'BFS') {
      if (titleEl) titleEl.innerText = '📊 BFS Level Hierarchy (Distance from Start)';
      const levels = currentStepState ? currentStepState.levels : {};
      const levelGroups = {};

      Object.keys(levels).forEach(nodeId => {
        const lvl = levels[nodeId];
        if (!levelGroups[lvl]) levelGroups[lvl] = [];
        levelGroups[lvl].push(nodeId);
      });

      const lvlKeys = Object.keys(levelGroups).sort((a, b) => Number(a) - Number(b));

      if (lvlKeys.length === 0) {
        contentEl.innerHTML = '<span style="color:var(--text-subtle);">No vertices discovered yet.</span>';
        return;
      }

      let html = '<div class="level-hierarchy-container">';
      lvlKeys.forEach(lvl => {
        const nodes = levelGroups[lvl].sort();
        html += `
          <div class="level-row">
            <span class="level-badge">Level ${lvl} (Dist ${lvl}):</span>
            <div class="level-nodes-group">
              ${nodes.map(n => `<span class="level-node-pill">${n}</span>`).join('')}
            </div>
          </div>
        `;
      });
      html += '</div>';

      contentEl.innerHTML = html;
    } else {
      if (titleEl) titleEl.innerText = '🌲 DFS Recursion Stack Tree (Active Call Frames)';
      const recursionStack = currentStepState ? currentStepState.recursionCallStack : [];

      if (!recursionStack || recursionStack.length === 0) {
        contentEl.innerHTML = '<span style="color:var(--text-subtle);">Call stack is currently empty.</span>';
        return;
      }

      let html = '<div class="recursion-stack-tree">';
      recursionStack.forEach((frameStr, idx) => {
        const indent = '&nbsp;&nbsp;'.repeat(idx);
        const prefix = idx > 0 ? '└── ' : '';
        const isTop = idx === recursionStack.length - 1;
        html += `
          <div class="recursion-frame ${isTop ? 'active' : ''}">
            <span>${indent}${prefix}<strong>${frameStr}</strong></span>
            ${isTop ? '<span class="badge badge-purple" style="margin-left:auto; font-size:0.65rem;">ACTIVE CALL</span>' : ''}
          </div>
        `;
      });
      html += '</div>';

      contentEl.innerHTML = html;
    }
  }

  onGraphModified() {
    this.resetAnimation();
    this.updateAdjacencyListUI();
    this.updateStartNodeDropdowns();
  }

  onNodeSelected(nodeId) {
    const deleteSelect = document.getElementById('select-delete-vertex');
    if (deleteSelect) deleteSelect.value = nodeId;
  }

  updateAdjacencyListUI() {
    const adjContainer = document.getElementById('adjacency-list-display');
    if (!adjContainer) return;

    const adj = this.graph.getAdjacencyList();
    const nodeKeys = Object.keys(adj);

    if (nodeKeys.length === 0) {
      adjContainer.innerHTML = '<span style="color:var(--text-subtle);">Graph is empty.</span>';
      return;
    }

    let html = '<div style="font-family: monospace; font-size: 0.85rem;">';
    nodeKeys.forEach(u => {
      const neighbors = adj[u];
      const arrow = this.graph.isDirected ? '→' : '—';
      const neighborsStr = neighbors.length > 0 ? neighbors.join(', ') : '∅';
      html += `
        <div style="padding: 0.2rem 0; border-bottom: 1px dashed var(--border-color);">
          <strong style="color:var(--accent-cyan);">${u}</strong> ${arrow} [ ${neighborsStr} ]
        </div>
      `;
    });
    html += '</div>';

    adjContainer.innerHTML = html;
  }

  updateStartNodeDropdowns() {
    const nodeKeys = Array.from(this.graph.nodes.keys()).sort();

    const startSelect = document.getElementById('start-node-select');
    if (startSelect) {
      const prevVal = startSelect.value;
      startSelect.innerHTML = nodeKeys.map(k => `<option value="${k}">${k}</option>`).join('');
      if (nodeKeys.includes(prevVal)) startSelect.value = prevVal;
    }

    const uSelect = document.getElementById('select-edge-u');
    const vSelect = document.getElementById('select-edge-v');
    const delEdgeU = document.getElementById('select-delete-edge-u');
    const delEdgeV = document.getElementById('select-delete-edge-v');
    const delSelect = document.getElementById('select-delete-vertex');

    if (uSelect) uSelect.innerHTML = nodeKeys.map(k => `<option value="${k}">${k}</option>`).join('');
    if (vSelect) vSelect.innerHTML = nodeKeys.map((k, i) => `<option value="${k}" ${i === 1 ? 'selected' : ''}>${k}</option>`).join('');
    if (delEdgeU) delEdgeU.innerHTML = nodeKeys.map(k => `<option value="${k}">${k}</option>`).join('');
    if (delEdgeV) delEdgeV.innerHTML = nodeKeys.map((k, i) => `<option value="${k}" ${i === 1 ? 'selected' : ''}>${k}</option>`).join('');
    if (delSelect) delSelect.innerHTML = nodeKeys.map(k => `<option value="${k}">${k}</option>`).join('');
  }

  attachObservationControls() {
    const btnPrint = document.getElementById('btn-print-observation');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        const startNode = this.startNodeId || 'A';
        const bfsSteps = GraphAlgorithms.generateBFS(this.graph, startNode);
        const dfsSteps = GraphAlgorithms.generateDFS(this.graph, startNode);

        const bfsOrder = bfsSteps.length ? bfsSteps[bfsSteps.length - 1].traversalOrder.join(' → ') : 'A → B → C';
        const dfsOrder = dfsSteps.length ? dfsSteps[dfsSteps.length - 1].traversalOrder.join(' → ') : 'A → B → D';

        const row1Bfs = document.getElementById('obs-row1-bfs');
        const row1Dfs = document.getElementById('obs-row1-dfs');
        if (row1Bfs) row1Bfs.innerText = bfsOrder;
        if (row1Dfs) row1Dfs.innerText = dfsOrder;

        window.print();
      });
    }
  }
}

// Instantiate on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
