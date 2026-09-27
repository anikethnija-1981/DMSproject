/* ==========================================
   BFS & DFS Graph Traversal Visualizer
   Pro-Level Algorithm Step Generator & Solver Module
   ========================================== */

class GraphAlgorithms {

  /**
   * BFS Pseudocode definitions for line highlighting
   */
  static BFS_PSEUDOCODE = [
    { line: 1, text: "BFS(G, start):" },
    { line: 2, text: "  mark start visited" },
    { line: 3, text: "  enqueue(start)" },
    { line: 4, text: "  while queue is not empty:" },
    { line: 5, text: "    v = dequeue()" },
    { line: 6, text: "    for each neighbour u of v:" },
    { line: 7, text: "      if u is unvisited:" },
    { line: 8, text: "        mark u visited" },
    { line: 9, text: "        enqueue(u)" },
    { line: 10, text: "  return traversal order" }
  ];

  /**
   * DFS Pseudocode definitions for line highlighting
   */
  static DFS_PSEUDOCODE = [
    { line: 1, text: "DFS(G, start):" },
    { line: 2, text: "  push(start) onto stack" },
    { line: 3, text: "  while stack is not empty:" },
    { line: 4, text: "    v = pop()" },
    { line: 5, text: "    if v is unvisited:" },
    { line: 6, text: "      mark v visited & process v" },
    { line: 7, text: "      for each neighbour u of v:" },
    { line: 8, text: "        if u is unvisited:" },
    { line: 9, text: "          push(u) onto stack" },
    { line: 10, text: "    else if no unvisited neighbours:" },
    { line: 11, text: "      backtrack to previous vertex" }
  ];

  /**
   * Generates detailed step-by-step traces for BFS Traversal
   * @param {Graph} graph 
   * @param {string} startNodeId 
   * @returns {Array} Array of step state objects
   */
  static generateBFS(graph, startNodeId) {
    const steps = [];
    if (!graph.nodes.has(startNodeId)) return steps;

    const visited = new Set();
    const discovered = new Set();
    const queue = [];
    const traversalOrder = [];
    const nodeStates = {};
    const nodeBadges = {};
    const levels = {}; // nodeId -> level distance
    const traversalPathEdges = []; // edges forming the traversal tree

    graph.nodes.forEach((_, id) => {
      nodeStates[id] = 'unvisited';
      nodeBadges[id] = null;
    });

    let stepNum = 1;

    // Step 1: Select start node & Pseudocode Line 1
    steps.push({
      step: stepNum++,
      lineIndex: 1,
      current: null,
      examiningNode: null,
      queue: [],
      visited: [],
      discovered: [],
      traversalOrder: [],
      activeEdge: null,
      traversalPathEdges: [],
      nodeStates: { ...nodeStates },
      nodeBadges: { ...nodeBadges },
      levels: { ...levels },
      explanation: `Algorithm Initialized: Selected starting root vertex ${startNodeId}.`,
      timelineEvent: `Start BFS at ${startNodeId}`
    });

    // Step 2: Mark start visited & Pseudocode Line 2
    discovered.add(startNodeId);
    nodeStates[startNodeId] = 'discovered';
    nodeBadges[startNodeId] = 'DISCOVERED';
    levels[startNodeId] = 0;

    steps.push({
      step: stepNum++,
      lineIndex: 2,
      current: null,
      examiningNode: null,
      queue: [],
      visited: [],
      discovered: Array.from(discovered),
      traversalOrder: [],
      activeEdge: null,
      traversalPathEdges: [],
      nodeStates: { ...nodeStates },
      nodeBadges: { ...nodeBadges },
      levels: { ...levels },
      explanation: `Mark starting vertex ${startNodeId} as discovered (Level 0).`,
      timelineEvent: `${startNodeId} discovered`
    });

    // Step 3: Enqueue start node & Pseudocode Line 3
    queue.push(startNodeId);
    nodeStates[startNodeId] = 'queued';
    nodeBadges[startNodeId] = 'WAITING';

    steps.push({
      step: stepNum++,
      lineIndex: 3,
      current: null,
      examiningNode: null,
      queue: [...queue],
      visited: [],
      discovered: Array.from(discovered),
      traversalOrder: [],
      activeEdge: null,
      traversalPathEdges: [],
      nodeStates: { ...nodeStates },
      nodeBadges: { ...nodeBadges },
      levels: { ...levels },
      explanation: `Enqueue ${startNodeId} into the FIFO Queue.`,
      timelineEvent: `${startNodeId} enqueued`
    });

    // Main BFS loop
    while (queue.length > 0) {
      // Step: Check while queue not empty (Line 4)
      steps.push({
        step: stepNum++,
        lineIndex: 4,
        current: null,
        examiningNode: null,
        queue: [...queue],
        visited: Array.from(visited),
        discovered: Array.from(discovered),
        traversalOrder: [...traversalOrder],
        activeEdge: null,
        traversalPathEdges: [...traversalPathEdges],
        nodeStates: { ...nodeStates },
        nodeBadges: { ...nodeBadges },
        levels: { ...levels },
        explanation: `Queue has ${queue.length} item(s): [${queue.join(', ')}]. Checking loop condition...`,
        timelineEvent: `Queue check (${queue.length} items)`
      });

      // Dequeue current (Line 5)
      const current = queue.shift();
      visited.add(current);
      traversalOrder.push(current);

      nodeStates[current] = 'current';
      nodeBadges[current] = 'CURRENT';

      steps.push({
        step: stepNum++,
        lineIndex: 5,
        current: current,
        examiningNode: null,
        queue: [...queue],
        visited: Array.from(visited),
        discovered: Array.from(discovered),
        traversalOrder: [...traversalOrder],
        activeEdge: null,
        traversalPathEdges: [...traversalPathEdges],
        nodeStates: { ...nodeStates },
        nodeBadges: { ...nodeBadges },
        levels: { ...levels },
        explanation: `Dequeued vertex ${current} from FRONT of queue. Marked as CURRENT vertex being processed.`,
        timelineEvent: `Dequeue ${current} → CURRENT`
      });

      const neighbors = graph.getNeighbors(current);

      // Line 6: Loop through neighbors
      steps.push({
        step: stepNum++,
        lineIndex: 6,
        current: current,
        examiningNode: null,
        queue: [...queue],
        visited: Array.from(visited),
        discovered: Array.from(discovered),
        traversalOrder: [...traversalOrder],
        activeEdge: null,
        traversalPathEdges: [...traversalPathEdges],
        nodeStates: { ...nodeStates },
        nodeBadges: { ...nodeBadges },
        levels: { ...levels },
        explanation: `Inspecting adjacency list for vertex ${current}: neighbors [${neighbors.length > 0 ? neighbors.join(', ') : 'none'}].`,
        timelineEvent: `Scan neighbors of ${current}`
      });

      for (const neighbor of neighbors) {
        // Line 6/7: Examining edge (current -> neighbor)
        const isNeighborVisited = discovered.has(neighbor);

        steps.push({
          step: stepNum++,
          lineIndex: 6,
          current: current,
          examiningNode: neighbor,
          queue: [...queue],
          visited: Array.from(visited),
          discovered: Array.from(discovered),
          traversalOrder: [...traversalOrder],
          activeEdge: { u: current, v: neighbor, status: isNeighborVisited ? 'rejected' : 'examining' },
          traversalPathEdges: [...traversalPathEdges],
          nodeStates: { ...nodeStates },
          nodeBadges: { ...nodeBadges },
          levels: { ...levels },
          explanation: `Examining edge ${current} → ${neighbor}. Checking if ${neighbor} is unvisited...`,
          timelineEvent: `Check edge ${current} → ${neighbor}`
        });

        if (!discovered.has(neighbor)) {
          // Line 7: u is unvisited
          discovered.add(neighbor);
          levels[neighbor] = levels[current] + 1;
          nodeStates[neighbor] = 'discovered';
          nodeBadges[neighbor] = 'DISCOVERED';

          // Add to traversal path edges
          traversalPathEdges.push({ u: current, v: neighbor });

          steps.push({
            step: stepNum++,
            lineIndex: 7,
            current: current,
            examiningNode: neighbor,
            queue: [...queue],
            visited: Array.from(visited),
            discovered: Array.from(discovered),
            traversalOrder: [...traversalOrder],
            activeEdge: { u: current, v: neighbor, status: 'discovered' },
            traversalPathEdges: [...traversalPathEdges],
            nodeStates: { ...nodeStates },
            nodeBadges: { ...nodeBadges },
            levels: { ...levels },
            explanation: `✓ Vertex ${neighbor} is unvisited! Discovered ${neighbor} at Level ${levels[neighbor]} (distance = ${levels[neighbor]}).`,
            timelineEvent: `${neighbor} discovered (Level ${levels[neighbor]})`
          });

          // Line 8 & 9: Mark visited & Enqueue
          queue.push(neighbor);
          nodeStates[neighbor] = 'queued';
          nodeBadges[neighbor] = 'WAITING';

          steps.push({
            step: stepNum++,
            lineIndex: 9,
            current: current,
            examiningNode: neighbor,
            queue: [...queue],
            visited: Array.from(visited),
            discovered: Array.from(discovered),
            traversalOrder: [...traversalOrder],
            activeEdge: { u: current, v: neighbor, status: 'discovered' },
            traversalPathEdges: [...traversalPathEdges],
            nodeStates: { ...nodeStates },
            nodeBadges: { ...nodeBadges },
            levels: { ...levels },
            explanation: `Enqueued vertex ${neighbor} to REAR of queue.`,
            timelineEvent: `${neighbor} added to queue`
          });
        } else {
          // Neighbor already visited/discovered
          steps.push({
            step: stepNum++,
            lineIndex: 7,
            current: current,
            examiningNode: neighbor,
            queue: [...queue],
            visited: Array.from(visited),
            discovered: Array.from(discovered),
            traversalOrder: [...traversalOrder],
            activeEdge: { u: current, v: neighbor, status: 'rejected' },
            traversalPathEdges: [...traversalPathEdges],
            nodeStates: { ...nodeStates },
            nodeBadges: { ...nodeBadges },
            levels: { ...levels },
            explanation: `Vertex ${neighbor} was already discovered/visited. Edge ${current} → ${neighbor} skipped.`,
            timelineEvent: `Skip already visited ${neighbor}`
          });
        }
      }

      // Mark current node complete (VISITED)
      nodeStates[current] = 'visited';
      nodeBadges[current] = 'VISITED';

      steps.push({
        step: stepNum++,
        lineIndex: 5,
        current: null,
        examiningNode: null,
        queue: [...queue],
        visited: Array.from(visited),
        discovered: Array.from(discovered),
        traversalOrder: [...traversalOrder],
        activeEdge: null,
        traversalPathEdges: [...traversalPathEdges],
        nodeStates: { ...nodeStates },
        nodeBadges: { ...nodeBadges },
        levels: { ...levels },
        explanation: `Completed processing all neighbors of vertex ${current}. ${current} marked VISITED.`,
        timelineEvent: `${current} processing complete`
      });
    }

    // Step: BFS Complete (Line 10)
    steps.push({
      step: stepNum,
      lineIndex: 10,
      current: null,
      examiningNode: null,
      queue: [],
      visited: Array.from(visited),
      discovered: Array.from(discovered),
      traversalOrder: [...traversalOrder],
      activeEdge: null,
      traversalPathEdges: [...traversalPathEdges],
      nodeStates: { ...nodeStates },
      nodeBadges: { ...nodeBadges },
      levels: { ...levels },
      isComplete: true,
      explanation: `✓ BFS Traversal Complete! All reachable vertices visited. Final Order: ${traversalOrder.join(' → ')}.`,
      timelineEvent: `✓ BFS COMPLETE`
    });

    return steps;
  }

  /**
   * Generates detailed step-by-step traces for DFS Traversal with Recursion Tree & Backtracking
   * @param {Graph} graph 
   * @param {string} startNodeId 
   * @returns {Array} Array of step state objects
   */
  static generateDFS(graph, startNodeId) {
    const steps = [];
    if (!graph.nodes.has(startNodeId)) return steps;

    const visited = new Set();
    const discovered = new Set();
    const stack = []; // for data structure monitor
    const traversalOrder = [];
    const nodeStates = {};
    const nodeBadges = {};
    const recursionCallStack = []; // ['DFS(A)', 'DFS(B)']
    const traversalPathEdges = [];

    graph.nodes.forEach((_, id) => {
      nodeStates[id] = 'unvisited';
      nodeBadges[id] = null;
    });

    let stepNum = 1;

    // Step 1: Initialize DFS
    steps.push({
      step: stepNum++,
      lineIndex: 1,
      current: null,
      examiningNode: null,
      stack: [],
      visited: [],
      discovered: [],
      traversalOrder: [],
      activeEdge: null,
      traversalPathEdges: [],
      recursionCallStack: [],
      isBacktracking: false,
      isDeadEnd: false,
      nodeStates: { ...nodeStates },
      nodeBadges: { ...nodeBadges },
      explanation: `DFS Initialized: Selected starting vertex ${startNodeId}.`,
      timelineEvent: `Start DFS at ${startNodeId}`
    });

    // Recursive helper function for exact DFS behavior with backtracking trace
    function dfsRecursive(u, parent = null) {
      visited.add(u);
      discovered.add(u);
      traversalOrder.push(u);
      stack.push(u);
      recursionCallStack.push(`DFS(${u})`);

      nodeStates[u] = 'current';
      nodeBadges[u] = 'CURRENT';

      if (parent) {
        traversalPathEdges.push({ u: parent, v: u });
      }

      // Step: Call DFS(u)
      steps.push({
        step: stepNum++,
        lineIndex: 6,
        current: u,
        examiningNode: null,
        stack: [...stack],
        visited: Array.from(visited),
        discovered: Array.from(discovered),
        traversalOrder: [...traversalOrder],
        activeEdge: parent ? { u: parent, v: u, status: 'discovered' } : null,
        traversalPathEdges: [...traversalPathEdges],
        recursionCallStack: [...recursionCallStack],
        isBacktracking: false,
        isDeadEnd: false,
        nodeStates: { ...nodeStates },
        nodeBadges: { ...nodeBadges },
        explanation: `Invoked DFS(${u}). Marked ${u} as CURRENT active vertex and added to Traversal Order.`,
        timelineEvent: `Visit ${u} (Push onto Stack)`
      });

      const neighbors = graph.getNeighbors(u);

      // Step: Check neighbors line 7
      steps.push({
        step: stepNum++,
        lineIndex: 7,
        current: u,
        examiningNode: null,
        stack: [...stack],
        visited: Array.from(visited),
        discovered: Array.from(discovered),
        traversalOrder: [...traversalOrder],
        activeEdge: null,
        traversalPathEdges: [...traversalPathEdges],
        recursionCallStack: [...recursionCallStack],
        isBacktracking: false,
        isDeadEnd: false,
        nodeStates: { ...nodeStates },
        nodeBadges: { ...nodeBadges },
        explanation: `Examining adjacent neighbors of ${u}: [${neighbors.length > 0 ? neighbors.join(', ') : 'none'}].`,
        timelineEvent: `Check neighbors of ${u}`
      });

      let hasUnvisitedNeighbor = false;

      for (const v of neighbors) {
        const isVVisited = visited.has(v);

        // Step: Examine edge u -> v
        steps.push({
          step: stepNum++,
          lineIndex: 8,
          current: u,
          examiningNode: v,
          stack: [...stack],
          visited: Array.from(visited),
          discovered: Array.from(discovered),
          traversalOrder: [...traversalOrder],
          activeEdge: { u: u, v: v, status: isVVisited ? 'rejected' : 'examining' },
          traversalPathEdges: [...traversalPathEdges],
          recursionCallStack: [...recursionCallStack],
          isBacktracking: false,
          isDeadEnd: false,
          nodeStates: { ...nodeStates },
          nodeBadges: { ...nodeBadges },
          explanation: `Examining edge ${u} → ${v}. Checking if ${v} is unvisited...`,
          timelineEvent: `Check edge ${u} → ${v}`
        });

        if (!visited.has(v)) {
          hasUnvisitedNeighbor = true;
          // Step: Found unvisited neighbor, dive deeper!
          steps.push({
            step: stepNum++,
            lineIndex: 9,
            current: u,
            examiningNode: v,
            stack: [...stack],
            visited: Array.from(visited),
            discovered: Array.from(discovered),
            traversalOrder: [...traversalOrder],
            activeEdge: { u: u, v: v, status: 'discovered' },
            traversalPathEdges: [...traversalPathEdges],
            recursionCallStack: [...recursionCallStack],
            isBacktracking: false,
            isDeadEnd: false,
            nodeStates: { ...nodeStates },
            nodeBadges: { ...nodeBadges },
            explanation: `✓ Vertex ${v} is unvisited! Diving deeper along edge ${u} → ${v}...`,
            timelineEvent: `Dive deeper into ${v}`
          });

          // Change current u to visited in background state before diving
          nodeStates[u] = 'stacked';
          nodeBadges[u] = 'WAITING';

          dfsRecursive(v, u);

          // Returned from recursive call! Re-highlight u as CURRENT
          nodeStates[u] = 'current';
          nodeBadges[u] = 'CURRENT';

          steps.push({
            step: stepNum++,
            lineIndex: 11,
            current: u,
            examiningNode: v,
            stack: [...stack],
            visited: Array.from(visited),
            discovered: Array.from(discovered),
            traversalOrder: [...traversalOrder],
            activeEdge: { u: v, v: u, status: 'backtracking' },
            traversalPathEdges: [...traversalPathEdges],
            recursionCallStack: [...recursionCallStack],
            isBacktracking: true,
            isDeadEnd: false,
            nodeStates: { ...nodeStates },
            nodeBadges: { ...nodeBadges },
            explanation: `Returned from DFS(${v}) back to ${u}. Resuming exploration of remaining neighbors of ${u}.`,
            timelineEvent: `Returned to DFS(${u})`
          });
        } else {
          // Skip visited neighbor
          steps.push({
            step: stepNum++,
            lineIndex: 8,
            current: u,
            examiningNode: v,
            stack: [...stack],
            visited: Array.from(visited),
            discovered: Array.from(discovered),
            traversalOrder: [...traversalOrder],
            activeEdge: { u: u, v: v, status: 'rejected' },
            traversalPathEdges: [...traversalPathEdges],
            recursionCallStack: [...recursionCallStack],
            isBacktracking: false,
            isDeadEnd: false,
            nodeStates: { ...nodeStates },
            nodeBadges: { ...nodeBadges },
            explanation: `Vertex ${v} is already visited. Edge ${u} → ${v} skipped.`,
            timelineEvent: `Skip visited ${v}`
          });
        }
      }

      // If no unvisited neighbors exist, dead end reached! Backtrack!
      if (!hasUnvisitedNeighbor && parent !== null) {
        nodeStates[u] = 'visited';
        nodeBadges[u] = 'DEAD END';

        steps.push({
          step: stepNum++,
          lineIndex: 10,
          current: u,
          examiningNode: null,
          stack: [...stack],
          visited: Array.from(visited),
          discovered: Array.from(discovered),
          traversalOrder: [...traversalOrder],
          activeEdge: null,
          traversalPathEdges: [...traversalPathEdges],
          recursionCallStack: [...recursionCallStack],
          isBacktracking: true,
          isDeadEnd: true,
          nodeStates: { ...nodeStates },
          nodeBadges: { ...nodeBadges },
          explanation: `🛑 DEAD END: Vertex ${u} has NO unvisited neighbors. Backtracking to ${parent}...`,
          timelineEvent: `DEAD END at ${u} → Backtracking`
        });
      }

      // Finish DFS frame for u
      stack.pop();
      recursionCallStack.pop();
      nodeStates[u] = 'visited';
      nodeBadges[u] = 'VISITED';
    }

    dfsRecursive(startNodeId, null);

    // Step: DFS Complete
    steps.push({
      step: stepNum,
      lineIndex: 1,
      current: null,
      examiningNode: null,
      stack: [],
      visited: Array.from(visited),
      discovered: Array.from(discovered),
      traversalOrder: [...traversalOrder],
      activeEdge: null,
      traversalPathEdges: [...traversalPathEdges],
      recursionCallStack: [],
      isBacktracking: false,
      isDeadEnd: false,
      isComplete: true,
      nodeStates: { ...nodeStates },
      nodeBadges: { ...nodeBadges },
      explanation: `✓ DFS Traversal Complete! Stack is empty. Final Traversal Order: ${traversalOrder.join(' → ')}.`,
      timelineEvent: `✓ DFS COMPLETE`
    });

    return steps;
  }

  /**
   * Finds Shortest Path between Source and Destination using BFS and generates animated path trace steps
   * @param {Graph} graph 
   * @param {string} startId 
   * @param {string} targetId 
   * @returns {Object} { path: Array, steps: Array, found: boolean }
   */
  static findShortestPathBFS(graph, startId, targetId) {
    if (!graph.nodes.has(startId) || !graph.nodes.has(targetId)) {
      return { path: [], steps: [], found: false };
    }

    const queue = [startId];
    const visited = new Set([startId]);
    const parent = {};
    parent[startId] = null;

    let found = false;

    while (queue.length > 0) {
      const current = queue.shift();

      if (current === targetId) {
        found = true;
        break;
      }

      const neighbors = graph.getNeighbors(current);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          parent[neighbor] = current;
          queue.push(neighbor);
        }
      }
    }

    if (!found) {
      return { path: [], steps: [], found: false };
    }

    // Reconstruct path
    const path = [];
    let curr = targetId;
    while (curr !== null) {
      path.unshift(curr);
      curr = parent[curr];
    }

    return { path, found: true };
  }
}
