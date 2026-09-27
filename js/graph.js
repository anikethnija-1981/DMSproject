/* ==========================================
   BFS & DFS Graph Traversal Visualizer
   Core Graph Data Structure Module
   ========================================== */

class Graph {
  constructor(isDirected = false, isWeighted = false) {
    this.nodes = new Map(); // id -> { id, label, x, y }
    this.edges = [];        // [{ id, u, v, weight }]
    this.isDirected = isDirected;
    this.isWeighted = isWeighted;
  }

  addNode(id, label, x, y) {
    if (this.nodes.has(id)) return false;
    this.nodes.set(id, { id, label: label || id, x, y });
    return true;
  }

  removeNode(id) {
    if (!this.nodes.has(id)) return false;
    this.nodes.delete(id);
    // Remove all connected edges
    this.edges = this.edges.filter(edge => edge.u !== id && edge.v !== id);
    return true;
  }

  addEdge(u, v, weight = 1) {
    if (!this.nodes.has(u) || !this.nodes.has(v)) return false;
    // Check if edge already exists
    const exists = this.edges.some(e => 
      (e.u === u && e.v === v) || (!this.isDirected && e.u === v && e.v === u)
    );
    if (exists) return false;

    const edgeId = `${u}-${v}`;
    this.edges.push({ id: edgeId, u, v, weight: Number(weight) || 1 });
    return true;
  }

  removeEdge(u, v) {
    const initialLength = this.edges.length;
    this.edges = this.edges.filter(e => {
      if (this.isDirected) {
        return !(e.u === u && e.v === v);
      } else {
        return !( (e.u === u && e.v === v) || (e.u === v && e.v === u) );
      }
    });
    return this.edges.length < initialLength;
  }

  getNeighbors(u) {
    const neighbors = [];
    this.edges.forEach(e => {
      if (e.u === u) {
        neighbors.push(e.v);
      } else if (!this.isDirected && e.v === u) {
        neighbors.push(e.u);
      }
    });
    // Sort alphabetically for deterministic traversal step-by-step
    return Array.from(new Set(neighbors)).sort();
  }

  getAdjacencyList() {
    const adj = {};
    const sortedNodeKeys = Array.from(this.nodes.keys()).sort();
    
    sortedNodeKeys.forEach(key => {
      adj[key] = this.getNeighbors(key);
    });
    
    return adj;
  }

  clear() {
    this.nodes.clear();
    this.edges = [];
  }

  // Serialization for Save & Load Graph
  toJSON() {
    return {
      isDirected: this.isDirected,
      isWeighted: this.isWeighted,
      nodes: Array.from(this.nodes.values()),
      edges: this.edges
    };
  }

  fromJSON(data) {
    if (!data || !Array.isArray(data.nodes)) return false;
    this.clear();
    this.isDirected = !!data.isDirected;
    this.isWeighted = !!data.isWeighted;

    data.nodes.forEach(n => {
      this.addNode(n.id, n.label, n.x, n.y);
    });

    if (Array.isArray(data.edges)) {
      data.edges.forEach(e => {
        this.addEdge(e.u, e.v, e.weight || 1);
      });
    }
    return true;
  }

  // Predefined Preset Graphs
  loadPreset(presetName, width = 700, height = 400) {
    this.clear();
    const cx = width / 2;
    const cy = height / 2;

    switch (presetName) {
      case 'simple': {
        this.addNode('A', 'A', cx - 180, cy - 80);
        this.addNode('B', 'B', cx, cy - 130);
        this.addNode('C', 'C', cx + 180, cy - 80);
        this.addNode('D', 'D', cx - 100, cy + 90);
        this.addNode('E', 'E', cx + 100, cy + 90);

        this.addEdge('A', 'B');
        this.addEdge('A', 'C');
        this.addEdge('B', 'D');
        this.addEdge('C', 'E');
        this.addEdge('D', 'E');
        break;
      }

      case 'tree': {
        this.addNode('A', 'A', cx, cy - 130);
        this.addNode('B', 'B', cx - 160, cy - 30);
        this.addNode('C', 'C', cx + 160, cy - 30);
        this.addNode('D', 'D', cx - 220, cy + 80);
        this.addNode('E', 'E', cx - 100, cy + 80);
        this.addNode('F', 'F', cx + 100, cy + 80);
        this.addNode('G', 'G', cx + 220, cy + 80);

        this.addEdge('A', 'B');
        this.addEdge('A', 'C');
        this.addEdge('B', 'D');
        this.addEdge('B', 'E');
        this.addEdge('C', 'F');
        this.addEdge('C', 'G');
        break;
      }

      case 'cycle': {
        this.addNode('A', 'A', cx - 140, cy - 80);
        this.addNode('B', 'B', cx + 140, cy - 80);
        this.addNode('C', 'C', cx + 180, cy + 80);
        this.addNode('D', 'D', cx, cy + 130);
        this.addNode('E', 'E', cx - 180, cy + 80);

        this.addEdge('A', 'B');
        this.addEdge('B', 'C');
        this.addEdge('C', 'D');
        this.addEdge('D', 'E');
        this.addEdge('E', 'A');
        this.addEdge('B', 'D');
        break;
      }

      case 'disconnected': {
        this.addNode('A', 'A', cx - 220, cy - 60);
        this.addNode('B', 'B', cx - 120, cy - 120);
        this.addNode('C', 'C', cx - 120, cy + 40);

        this.addEdge('A', 'B');
        this.addEdge('A', 'C');
        this.addEdge('B', 'C');

        this.addNode('D', 'D', cx + 120, cy - 80);
        this.addNode('E', 'E', cx + 220, cy - 20);
        this.addNode('F', 'F', cx + 140, cy + 80);

        this.addEdge('D', 'E');
        this.addEdge('E', 'F');
        break;
      }

      case 'contrast': {
        this.addNode('A', 'A', cx - 220, cy);
        this.addNode('B', 'B', cx - 80, cy - 100);
        this.addNode('C', 'C', cx - 80, cy + 100);
        this.addNode('D', 'D', cx + 60, cy - 100);
        this.addNode('E', 'E', cx + 60, cy + 100);
        this.addNode('F', 'F', cx + 200, cy);

        this.addEdge('A', 'B');
        this.addEdge('A', 'C');
        this.addEdge('B', 'D');
        this.addEdge('D', 'F');
        this.addEdge('C', 'E');
        this.addEdge('E', 'F');
        break;
      }

      default:
        this.loadPreset('simple', width, height);
    }
  }
}
