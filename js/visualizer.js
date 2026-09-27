/* ==========================================
   BFS & DFS Graph Traversal Visualizer
   Pro-Level Canvas Animation & Visual Renderer
   ========================================== */

class GraphVisualizer {
  constructor(canvas, graph) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.graph = graph;

    // Canvas rendering configuration
    this.nodeRadius = 26;
    this.selectedNodeId = null;
    this.hoveredNodeId = null;
    this.isDragging = false;
    this.draggedNodeId = null;
    this.dragOffset = { x: 0, y: 0 };
    this.mode = 'select'; // 'select', 'addNode', 'addEdge', 'delete'

    // Edge creation state
    this.edgeStartNodeId = null;

    // Animation state
    this.currentStep = null;
    this.highlightPath = []; // node ID list for shortest path
    this.animationProgress = 0; // 0 to 1 progress for edge particles & ripples
    this.pulseAngle = 0;
    this.ripples = []; // active ripple animations: [{ x, y, r, alpha, color }]

    this.initCanvasSize();
    this.attachEventListeners();
    this.startAnimationLoop();
  }

  initCanvasSize() {
    const parent = this.canvas.parentElement;
    if (parent) {
      this.canvas.width = parent.clientWidth || 700;
      this.canvas.height = parent.clientHeight || 520;
    }
  }

  attachEventListeners() {
    window.addEventListener('resize', () => this.initCanvasSize());

    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
    this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());

    // Mobile Touch Support
    this.canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.canvas.dispatchEvent(mouseEvent);
    });

    this.canvas.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.canvas.dispatchEvent(mouseEvent);
    });

    this.canvas.addEventListener('touchend', () => this.handleMouseUp());
  }

  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  getNodeAtPos(x, y) {
    for (const [id, node] of this.graph.nodes) {
      const dx = node.x - x;
      const dy = node.y - y;
      if (Math.sqrt(dx * dx + dy * dy) <= this.nodeRadius) {
        return id;
      }
    }
    return null;
  }

  handleMouseDown(e) {
    const pos = this.getMousePos(e);
    const clickedNodeId = this.getNodeAtPos(pos.x, pos.y);

    if (this.mode === 'addNode') {
      if (!clickedNodeId) {
        const count = this.graph.nodes.size;
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let label = count < 26 ? alphabet[count] : `V${count + 1}`;
        this.graph.addNode(label, label, pos.x, pos.y);
        this.addRipple(pos.x, pos.y, '#06b6d4');
        if (window.app) window.app.onGraphModified();
      }
      return;
    }

    if (clickedNodeId) {
      if (this.mode === 'addEdge') {
        if (!this.edgeStartNodeId) {
          this.edgeStartNodeId = clickedNodeId;
        } else {
          if (this.edgeStartNodeId !== clickedNodeId) {
            this.graph.addEdge(this.edgeStartNodeId, clickedNodeId);
            if (window.app) window.app.onGraphModified();
          }
          this.edgeStartNodeId = null;
        }
      } else if (this.mode === 'delete') {
        this.graph.removeNode(clickedNodeId);
        if (window.app) window.app.onGraphModified();
      } else {
        // Drag / Select mode
        this.isDragging = true;
        this.draggedNodeId = clickedNodeId;
        const node = this.graph.nodes.get(clickedNodeId);
        this.dragOffset = { x: pos.x - node.x, y: pos.y - node.y };
        this.selectedNodeId = clickedNodeId;
        if (window.app) window.app.onNodeSelected(clickedNodeId);
      }
    } else {
      this.selectedNodeId = null;
      this.edgeStartNodeId = null;
    }
  }

  handleMouseMove(e) {
    const pos = this.getMousePos(e);
    this.hoveredNodeId = this.getNodeAtPos(pos.x, pos.y);

    if (this.isDragging && this.draggedNodeId) {
      const node = this.graph.nodes.get(this.draggedNodeId);
      if (node) {
        const margin = this.nodeRadius + 10;
        node.x = Math.max(margin, Math.min(this.canvas.width - margin, pos.x - this.dragOffset.x));
        node.y = Math.max(margin, Math.min(this.canvas.height - margin, pos.y - this.dragOffset.y));
      }
    }
  }

  handleMouseUp() {
    this.isDragging = false;
    this.draggedNodeId = null;
  }

  setStepState(stepState, highlightPath = []) {
    if (stepState && stepState.activeEdge && stepState.activeEdge.status === 'discovered') {
      const targetNode = this.graph.nodes.get(stepState.activeEdge.v);
      if (targetNode) {
        this.addRipple(targetNode.x, targetNode.y, '#06b6d4');
      }
    } else if (stepState && stepState.isDeadEnd) {
      const deadEndNode = this.graph.nodes.get(stepState.current);
      if (deadEndNode) {
        this.addRipple(deadEndNode.x, deadEndNode.y, '#f43f5e');
      }
    }

    this.currentStep = stepState;
    this.highlightPath = highlightPath || [];
    this.animationProgress = 0;
  }

  addRipple(x, y, color = '#06b6d4') {
    this.ripples.push({ x, y, r: this.nodeRadius, alpha: 1.0, color });
  }

  startAnimationLoop() {
    const animate = () => {
      this.pulseAngle += 0.05;
      this.animationProgress = (this.animationProgress + 0.025) % 1.0;
      this.updateRipples();
      this.draw();
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  updateRipples() {
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rip = this.ripples[i];
      rip.r += 1.5;
      rip.alpha -= 0.035;
      if (rip.alpha <= 0) {
        this.ripples.splice(i, 1);
      }
    }
  }

  getCssVar(varName, defaultVal) {
    const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return val || defaultVal;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Grid Background
    this.drawGrid();

    // 2. Traversal Path Edges (Base tree highlighting)
    this.drawTraversalPathEdges();

    // 3. Graph Edges
    this.drawEdges();

    // 4. Pending edge line in Add Edge mode
    if (this.mode === 'addEdge' && this.edgeStartNodeId && this.hoveredNodeId) {
      const startNode = this.graph.nodes.get(this.edgeStartNodeId);
      const endNode = this.graph.nodes.get(this.hoveredNodeId);
      if (startNode && endNode) {
        this.drawEdgeLine(startNode, endNode, '#06b6d4', 2, true);
      }
    }

    // 5. Ripples
    this.drawRipples();

    // 6. Nodes & Badges
    this.drawNodes();
  }

  drawGrid() {
    const gridColor = this.getCssVar('--canvas-grid', 'rgba(255, 255, 255, 0.03)');
    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 1;
    const gridSize = 40;

    for (let x = 0; x < this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  drawTraversalPathEdges() {
    if (!this.currentStep || !this.currentStep.traversalPathEdges) return;

    this.currentStep.traversalPathEdges.forEach(pathEdge => {
      const nodeU = this.graph.nodes.get(pathEdge.u);
      const nodeV = this.graph.nodes.get(pathEdge.v);
      if (nodeU && nodeV) {
        this.drawEdgeLine(nodeU, nodeV, 'rgba(6, 182, 212, 0.35)', 6, false, null, false);
      }
    });
  }

  drawEdges() {
    const defaultEdgeColor = this.getCssVar('--edge-default', '#334155');

    this.graph.edges.forEach(edge => {
      const nodeU = this.graph.nodes.get(edge.u);
      const nodeV = this.graph.nodes.get(edge.v);
      if (!nodeU || !nodeV) return;

      let color = defaultEdgeColor;
      let width = 2;
      let status = null;

      if (this.currentStep && this.currentStep.activeEdge) {
        const active = this.currentStep.activeEdge;
        if (
          (active.u === edge.u && active.v === edge.v) ||
          (!this.graph.isDirected && active.u === edge.v && active.v === edge.u)
        ) {
          status = active.status;
          if (status === 'examining') {
            color = '#f59e0b';
            width = 4;
          } else if (status === 'discovered') {
            color = '#06b6d4';
            width = 4;
          } else if (status === 'rejected') {
            color = '#f43f5e';
            width = 3;
          } else if (status === 'backtracking') {
            color = '#8b5cf6';
            width = 4;
          }
        }
      }

      if (this.highlightPath.length > 1) {
        for (let i = 0; i < this.highlightPath.length - 1; i++) {
          const u = this.highlightPath[i];
          const v = this.highlightPath[i + 1];
          if (
            (u === edge.u && v === edge.v) ||
            (!this.graph.isDirected && u === edge.v && v === edge.u)
          ) {
            color = '#f43f5e';
            width = 5;
            status = 'shortest-path';
            break;
          }
        }
      }

      this.drawEdgeLine(nodeU, nodeV, color, width, false, edge.weight, status);
    });
  }

  drawEdgeLine(uNode, vNode, color, width, isDashed = false, weight = null, status = null) {
    const angle = Math.atan2(vNode.y - uNode.y, vNode.x - uNode.x);

    const startX = uNode.x + Math.cos(angle) * this.nodeRadius;
    const startY = uNode.y + Math.sin(angle) * this.nodeRadius;
    const endX = vNode.x - Math.cos(angle) * this.nodeRadius;
    const endY = vNode.y - Math.sin(angle) * this.nodeRadius;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;

    if (isDashed) {
      this.ctx.setLineDash([6, 4]);
    }

    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();

    // Animated particle along active edge
    if (status) {
      let pProgress = this.animationProgress;
      if (status === 'backtracking') {
        pProgress = 1.0 - this.animationProgress;
      }

      const px = startX + (endX - startX) * pProgress;
      const py = startY + (endY - startY) * pProgress;

      this.ctx.beginPath();
      this.ctx.fillStyle = color;
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 12;
      this.ctx.arc(px, py, 7, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Directional Arrow Head
    if (this.graph.isDirected || status === 'shortest-path') {
      const arrowSize = 11;
      this.ctx.beginPath();
      this.ctx.fillStyle = color;
      this.ctx.moveTo(endX, endY);
      this.ctx.lineTo(
        endX - arrowSize * Math.cos(angle - Math.PI / 6),
        endY - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      this.ctx.lineTo(
        endX - arrowSize * Math.cos(angle + Math.PI / 6),
        endY - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      this.ctx.closePath();
      this.ctx.fill();
    }

    // Weight Label
    if (this.graph.isWeighted && weight !== null) {
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;

      this.ctx.fillStyle = this.getCssVar('--bg-card', '#1e293b');
      this.ctx.fillRect(midX - 12, midY - 10, 24, 18);
      this.ctx.strokeStyle = this.getCssVar('--border-color', '#334155');
      this.ctx.strokeRect(midX - 12, midY - 10, 24, 18);

      this.ctx.fillStyle = this.getCssVar('--text-main', '#f8fafc');
      this.ctx.font = 'bold 11px JetBrains Mono, monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(weight.toString(), midX, midY - 1);
    }

    this.ctx.restore();
  }

  drawRipples() {
    this.ripples.forEach(rip => {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.strokeStyle = rip.color;
      this.ctx.lineWidth = 2;
      this.ctx.globalAlpha = rip.alpha;
      this.ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    });
  }

  drawNodes() {
    this.graph.nodes.forEach((node, id) => {
      let state = 'unvisited';
      let badgeText = null;

      if (this.currentStep && this.currentStep.nodeStates && this.currentStep.nodeStates[id]) {
        state = this.currentStep.nodeStates[id];
      }

      if (this.currentStep && this.currentStep.nodeBadges && this.currentStep.nodeBadges[id]) {
        badgeText = this.currentStep.nodeBadges[id];
      }

      if (this.highlightPath.includes(id)) {
        state = 'path';
        badgeText = 'PATH';
      }

      const isSelected = this.selectedNodeId === id || this.edgeStartNodeId === id;
      const isHovered = this.hoveredNodeId === id;

      this.drawNodeCircle(node, state, badgeText, isSelected, isHovered);
    });
  }

  drawNodeCircle(node, state, badgeText, isSelected, isHovered) {
    this.ctx.save();

    let bgColor = this.getCssVar('--node-unvisited-bg', '#1e293b');
    let borderColor = this.getCssVar('--node-unvisited-border', '#64748b');
    let textColor = this.getCssVar('--text-main', '#ffffff');
    let glowColor = null;
    let pulseRing = false;

    switch (state) {
      case 'current':
        bgColor = '#f59e0b';
        borderColor = '#fbbf24';
        textColor = '#000000';
        glowColor = '#f59e0b';
        pulseRing = true;
        break;
      case 'discovered':
      case 'queued':
        bgColor = '#06b6d4';
        borderColor = '#67e8f9';
        textColor = '#000000';
        glowColor = '#06b6d4';
        break;
      case 'stacked':
        bgColor = '#8b5cf6';
        borderColor = '#c084fc';
        textColor = '#ffffff';
        glowColor = '#8b5cf6';
        break;
      case 'visited':
        bgColor = '#10b981';
        borderColor = '#6ee7b7';
        textColor = '#ffffff';
        glowColor = '#10b981';
        break;
      case 'path':
        bgColor = '#f43f5e';
        borderColor = '#fda4af';
        textColor = '#ffffff';
        glowColor = '#f43f5e';
        pulseRing = true;
        break;
      default:
        bgColor = this.getCssVar('--node-unvisited-bg', '#1e293b');
        borderColor = this.getCssVar('--node-unvisited-border', '#64748b');
        textColor = this.getCssVar('--text-main', '#ffffff');
    }

    if (isSelected) {
      borderColor = '#0284c7';
      glowColor = '#0284c7';
    } else if (isHovered) {
      borderColor = '#cbd5e1';
    }

    // Outer Pulsing Glow Ring
    if (pulseRing) {
      const ringRadius = this.nodeRadius + 6 + Math.sin(this.pulseAngle * 3) * 4;
      this.ctx.beginPath();
      this.ctx.strokeStyle = glowColor;
      this.ctx.lineWidth = 3;
      this.ctx.shadowColor = glowColor;
      this.ctx.shadowBlur = 15;
      this.ctx.arc(node.x, node.y, ringRadius, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // Outer Glow Effect
    if (glowColor) {
      this.ctx.shadowColor = glowColor;
      this.ctx.shadowBlur = 15;
    }

    // Node Circle Fill
    this.ctx.beginPath();
    this.ctx.fillStyle = bgColor;
    this.ctx.arc(node.x, node.y, this.nodeRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // Node Border
    this.ctx.lineWidth = isSelected ? 4 : 3;
    this.ctx.strokeStyle = borderColor;
    this.ctx.stroke();

    this.ctx.shadowBlur = 0;

    // Node Label
    this.ctx.fillStyle = textColor;
    this.ctx.font = 'bold 16px Inter, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(node.label, node.x, node.y);

    // State Badge Indicator above node
    if (badgeText) {
      this.drawNodeBadge(node.x, node.y - this.nodeRadius - 14, badgeText, state);
    }

    this.ctx.restore();
  }

  drawNodeBadge(x, y, text, state) {
    this.ctx.save();
    this.ctx.font = 'bold 10px Inter, sans-serif';
    const paddingX = 6;
    const textWidth = this.ctx.measureText(text).width;
    const badgeWidth = textWidth + paddingX * 2;
    const badgeHeight = 16;

    let bg = '#334155';
    let textColor = '#ffffff';

    if (state === 'current') { bg = '#f59e0b'; textColor = '#000000'; }
    else if (state === 'discovered' || state === 'queued') { bg = '#06b6d4'; textColor = '#000000'; }
    else if (state === 'stacked') { bg = '#8b5cf6'; textColor = '#ffffff'; }
    else if (state === 'visited') { bg = '#10b981'; textColor = '#ffffff'; }
    else if (text === 'DEAD END') { bg = '#f43f5e'; textColor = '#ffffff'; }

    this.ctx.fillStyle = bg;
    this.ctx.beginPath();
    this.ctx.roundRect(x - badgeWidth / 2, y - badgeHeight / 2, badgeWidth, badgeHeight, 8);
    this.ctx.fill();

    this.ctx.fillStyle = textColor;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, x, y);

    this.ctx.restore();
  }
}
