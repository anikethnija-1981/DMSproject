/* ==========================================
   BFS & DFS Graph Traversal Visualizer
   Interactive Educational Experiments & Activities
   ========================================== */

class ExperimentManager {
  constructor(graph, visualizer) {
    this.graph = graph;
    this.visualizer = visualizer;
  }

  loadExperiment(expNumber) {
    const outputEl = document.getElementById('experiment-output');
    if (!outputEl) return;

    switch (expNumber) {
      case 1: {
        // Same Graph, Different Traversal
        this.graph.loadPreset('contrast', 700, 450);
        const bfsSteps = GraphAlgorithms.generateBFS(this.graph, 'A');
        const dfsSteps = GraphAlgorithms.generateDFS(this.graph, 'A');

        const bfsOrder = bfsSteps.length ? bfsSteps[bfsSteps.length - 1].traversalOrder.join(' → ') : '';
        const dfsOrder = dfsSteps.length ? dfsSteps[dfsSteps.length - 1].traversalOrder.join(' → ') : '';

        outputEl.innerHTML = `
          <div class="card" style="background-color: var(--bg-card); border-color: var(--accent-cyan);">
            <h4 style="color: var(--accent-cyan); margin-bottom: 0.5rem;">Experiment 1: Same Graph, Different Traversal</h4>
            <p>Comparing BFS vs DFS traversal order starting from vertex <strong>A</strong> on the loaded graph:</p>
            <div style="display: flex; flex-direction: column; gap: 0.5rem; margin: 1rem 0;">
              <div style="padding: 0.6rem; background: rgba(6, 182, 212, 0.1); border-radius: 6px; border: 1px solid var(--accent-cyan);">
                <strong style="color: var(--accent-cyan);">BFS Traversal (Level-by-Level):</strong><br>
                <code style="font-size: 1.1rem; color: #fff;">${bfsOrder}</code>
              </div>
              <div style="padding: 0.6rem; background: rgba(139, 92, 246, 0.1); border-radius: 6px; border: 1px solid var(--accent-purple);">
                <strong style="color: var(--accent-purple);">DFS Traversal (Deep Branching):</strong><br>
                <code style="font-size: 1.1rem; color: #fff;">${dfsOrder}</code>
              </div>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-muted);">
              <em>Observation:</em> Notice how BFS explores immediate neighbors (B and C) first before moving deeper, whereas DFS dives down to F via B → D → F before backtracking!
            </p>
          </div>
        `;
        break;
      }

      case 2: {
        // Change Starting Vertex
        this.graph.loadPreset('simple', 700, 450);
        outputEl.innerHTML = `
          <div class="card" style="background-color: var(--bg-card); border-color: var(--accent-cyan);">
            <h4 style="color: var(--accent-cyan); margin-bottom: 0.5rem;">Experiment 2: Change Starting Vertex</h4>
            <p>Select a different starting vertex below to observe how starting root alters traversal order:</p>
            <div style="display: flex; gap: 1rem; align-items: center; margin: 1rem 0;">
              <label class="form-label" style="margin:0;">Select Root Node:</label>
              <select id="exp2-start-select" class="form-select" style="width: 120px;">
                ${Array.from(this.graph.nodes.keys()).map(n => `<option value="${n}">${n}</option>`).join('')}
              </select>
              <button id="btn-run-exp2" class="btn btn-primary btn-sm">Run Comparison</button>
            </div>
            <div id="exp2-results"></div>
          </div>
        `;

        const runBtn = document.getElementById('btn-run-exp2');
        if (runBtn) {
          runBtn.addEventListener('click', () => {
            const startNode = document.getElementById('exp2-start-select').value;
            const bfsSteps = GraphAlgorithms.generateBFS(this.graph, startNode);
            const dfsSteps = GraphAlgorithms.generateDFS(this.graph, startNode);
            const bfsOrder = bfsSteps[bfsSteps.length - 1].traversalOrder.join(' → ');
            const dfsOrder = dfsSteps[dfsSteps.length - 1].traversalOrder.join(' → ');

            document.getElementById('exp2-results').innerHTML = `
              <div style="margin-top: 1rem; padding: 0.75rem; background: var(--bg-primary); border-radius: 6px;">
                <p><strong>Root Node:</strong> ${startNode}</p>
                <p><strong>BFS Order:</strong> <code>${bfsOrder}</code></p>
                <p><strong>DFS Order:</strong> <code>${dfsOrder}</code></p>
              </div>
            `;
          });
        }
        break;
      }

      case 3: {
        // Add an Edge
        this.graph.loadPreset('tree', 700, 450);
        outputEl.innerHTML = `
          <div class="card" style="background-color: var(--bg-card); border-color: var(--accent-cyan);">
            <h4 style="color: var(--accent-cyan); margin-bottom: 0.5rem;">Experiment 3: Add an Edge</h4>
            <p>Currently loaded: Binary Tree Graph (Root A). Click below to add a cross edge between leaf nodes <strong>D</strong> and <strong>G</strong>:</p>
            <button id="btn-exp3-add" class="btn btn-green btn-sm" style="margin: 0.5rem 0;">Add Edge D ↔ G</button>
            <div id="exp3-results"></div>
          </div>
        `;

        const addBtn = document.getElementById('btn-exp3-add');
        if (addBtn) {
          addBtn.addEventListener('click', () => {
            this.graph.addEdge('D', 'G');
            if (window.app) window.app.onGraphModified();

            const bfsSteps = GraphAlgorithms.generateBFS(this.graph, 'A');
            const bfsOrder = bfsSteps[bfsSteps.length - 1].traversalOrder.join(' → ');

            document.getElementById('exp3-results').innerHTML = `
              <div style="padding: 0.75rem; background: var(--bg-primary); border-radius: 6px; margin-top: 0.5rem;">
                <p>✓ Edge <strong>D ↔ G</strong> added successfully!</p>
                <p><strong>New BFS Traversal Order:</strong> <code>${bfsOrder}</code></p>
                <p style="font-size: 0.85rem; color: var(--text-muted);">
                  Adding cross edges creates shortcut paths between previously distant subtrees!
                </p>
              </div>
            `;
          });
        }
        break;
      }

      case 4: {
        // Remove an Edge
        this.graph.loadPreset('simple', 700, 450);
        outputEl.innerHTML = `
          <div class="card" style="background-color: var(--bg-card); border-color: var(--accent-cyan);">
            <h4 style="color: var(--accent-cyan); margin-bottom: 0.5rem;">Experiment 4: Remove an Edge</h4>
            <p>Remove the edge between <strong>A</strong> and <strong>B</strong> to observe how graph reachability changes:</p>
            <button id="btn-exp4-remove" class="btn btn-danger btn-sm" style="margin: 0.5rem 0;">Remove Edge A ↔ B</button>
            <div id="exp4-results"></div>
          </div>
        `;

        const removeBtn = document.getElementById('btn-exp4-remove');
        if (removeBtn) {
          removeBtn.addEventListener('click', () => {
            this.graph.removeEdge('A', 'B');
            if (window.app) window.app.onGraphModified();

            const bfsSteps = GraphAlgorithms.generateBFS(this.graph, 'A');
            const bfsOrder = bfsSteps[bfsSteps.length - 1].traversalOrder.join(' → ');

            document.getElementById('exp4-results').innerHTML = `
              <div style="padding: 0.75rem; background: var(--bg-primary); border-radius: 6px; margin-top: 0.5rem;">
                <p>✓ Edge <strong>A ↔ B</strong> removed!</p>
                <p><strong>New BFS Traversal Order from A:</strong> <code>${bfsOrder}</code></p>
                <p style="font-size: 0.85rem; color: var(--text-muted);">
                  Notice that node B is now reached via path A → C → E → D → B instead of directly!
                </p>
              </div>
            `;
          });
        }
        break;
      }

      case 5: {
        // Disconnected Graph
        this.graph.loadPreset('disconnected', 700, 450);
        const bfsSteps = GraphAlgorithms.generateBFS(this.graph, 'A');
        const visitedNodes = bfsSteps[bfsSteps.length - 1].visited;

        outputEl.innerHTML = `
          <div class="card" style="background-color: var(--bg-card); border-color: var(--accent-cyan);">
            <h4 style="color: var(--accent-cyan); margin-bottom: 0.5rem;">Experiment 5: Disconnected Graph Traversal</h4>
            <p>Graph contains 2 disconnected components: Component 1 (A, B, C) and Component 2 (D, E, F).</p>
            <div style="padding: 0.75rem; background: var(--bg-primary); border-radius: 6px; margin: 0.75rem 0;">
              <p><strong>Start Node:</strong> A</p>
              <p><strong>Visited Vertices:</strong> <code>${visitedNodes.join(', ')}</code></p>
              <p><strong>Unvisited Vertices:</strong> <code>D, E, F</code></p>
            </div>
            <p style="font-size: 0.85rem; color: var(--accent-amber);">
              ⚠️ <strong>Key DMS Takeaway:</strong> A single run of BFS/DFS starting from a specific node can only traverse nodes in the same connected component. To visit all vertices in a disconnected graph, an outer loop over all unvisited vertices is required.
            </p>
          </div>
        `;
        break;
      }

      case 6: {
        // Cycle Detection Concept
        this.graph.loadPreset('cycle', 700, 450);
        outputEl.innerHTML = `
          <div class="card" style="background-color: var(--bg-card); border-color: var(--accent-cyan);">
            <h4 style="color: var(--accent-cyan); margin-bottom: 0.5rem;">Experiment 6: Cycle Detection & Visited Set</h4>
            <p>This graph contains a cycle: <code>A → B → C → D → E → A</code>.</p>
            <p>Observe how the <code>visited</code> set prevents infinite loops when visiting neighboring nodes:</p>
            <div style="padding: 0.75rem; background: var(--bg-primary); border-radius: 6px; margin: 0.75rem 0;">
              <p>When at vertex <strong>E</strong>, its adjacent neighbor is <strong>A</strong>.</p>
              <p>Since <code>visited['A'] === true</code>, the algorithm skips re-enqueuing A, successfully terminating the traversal!</p>
            </div>
          </div>
        `;
        break;
      }

      case 7: {
        // Shortest Path Using BFS
        this.graph.loadPreset('simple', 700, 450);
        outputEl.innerHTML = `
          <div class="card" style="background-color: var(--bg-card); border-color: var(--accent-cyan);">
            <h4 style="color: var(--accent-cyan); margin-bottom: 0.5rem;">Experiment 7: Shortest Path Finder (BFS)</h4>
            <p>Select Source and Target vertices to calculate shortest path in an unweighted graph using BFS:</p>
            <div style="display: flex; gap: 1rem; align-items: center; margin: 1rem 0; flex-wrap: wrap;">
              <div>
                <label class="form-label">Source Node:</label>
                <select id="sp-source" class="form-select" style="width: 100px;">
                  ${Array.from(this.graph.nodes.keys()).map(n => `<option value="${n}">${n}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="form-label">Target Node:</label>
                <select id="sp-target" class="form-select" style="width: 100px;">
                  ${Array.from(this.graph.nodes.keys()).map((n, i) => `<option value="${n}" ${i === 4 ? 'selected' : ''}>${n}</option>`).join('')}
                </select>
              </div>
              <div style="margin-top: 1.4rem;">
                <button id="btn-find-sp" class="btn btn-primary btn-sm">Find Shortest Path</button>
              </div>
            </div>
            <div id="sp-output"></div>
          </div>
        `;

        const findSpBtn = document.getElementById('btn-find-sp');
        if (findSpBtn) {
          findSpBtn.addEventListener('click', () => {
            const src = document.getElementById('sp-source').value;
            const target = document.getElementById('sp-target').value;
            const result = GraphAlgorithms.findShortestPathBFS(this.graph, src, target);

            const output = document.getElementById('sp-output');
            if (result.found) {
              const pathStr = result.path.join(' → ');
              const distance = result.path.length - 1;
              output.innerHTML = `
                <div style="padding: 0.8rem; background: rgba(236, 72, 153, 0.1); border: 1px solid var(--accent-rose); border-radius: 6px; margin-top: 0.5rem;">
                  <strong style="color: var(--accent-rose);">Shortest Path Found:</strong><br>
                  <code style="font-size: 1.2rem; color: #fff;">${pathStr}</code>
                  <p style="margin-top: 0.4rem; color: var(--text-main);">Edge Distance (Hops): <strong>${distance}</strong></p>
                </div>
              `;
              // Highlight path visually in canvas
              this.visualizer.setStepState(null, result.path);
            } else {
              output.innerHTML = `
                <div style="padding: 0.8rem; background: rgba(244, 63, 94, 0.1); border: 1px solid var(--accent-rose); border-radius: 6px; margin-top: 0.5rem; color: var(--accent-rose);">
                  No reachable path exists between <strong>${src}</strong> and <strong>${target}</strong>!
                </div>
              `;
              this.visualizer.setStepState(null, []);
            }
          });
        }
        break;
      }
    }

    if (window.app) window.app.onGraphModified();
  }
}
