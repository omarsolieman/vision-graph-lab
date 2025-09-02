import { GraphData, GraphNode, GraphEdge, AlgorithmStep } from './graph-types';

export interface AlgorithmExecution {
  steps: AlgorithmStep[];
  currentStep: number;
  isComplete: boolean;
}

export const getAlgorithmCode = (algorithm: string): string[] => {
	const algorithms: Record<string, string[]> = {
    'bfs': [
      'function BFS(graph, startNode):',
      '    queue = [startNode]',
      '    visited = new Set()',
      '    while queue is not empty:',
      '        current = queue.dequeue()',
      '        if current in visited:',
      '            continue',
      '        visited.add(current)',
      '        for neighbor in graph.neighbors(current):',
      '            if neighbor not in visited:',
      '                queue.enqueue(neighbor)',
      '    return visited'
    ],
    'dfs': [
      'function DFS(graph, startNode):',
      '    stack = [startNode]',
      '    visited = new Set()',
      '    while stack is not empty:',
      '        current = stack.pop()',
      '        if current in visited:',
      '            continue',
      '        visited.add(current)',
      '        for neighbor in graph.neighbors(current):',
      '            if neighbor not in visited:',
      '                stack.push(neighbor)',
      '    return visited'
    ],
    'dijkstra': [
      'function Dijkstra(graph, startNode):',
      '    distances = {startNode: 0}',
      '    pq = PriorityQueue([(0, startNode)])',
      '    visited = new Set()',
      '    while pq is not empty:',
      '        currentDist, current = pq.pop()',
      '        if current in visited:',
      '            continue',
      '        visited.add(current)',
      '        for neighbor, weight in graph.edges(current):',
      '            newDist = currentDist + weight',
      '            if newDist < distances.get(neighbor, ∞):',
      '                distances[neighbor] = newDist',
      '                pq.push((newDist, neighbor))',
      '    return distances'
    ],
    'a_star': [
      'function A_Star(graph, start, goal, h):',
      '    openSet = PriorityQueue([start])',
      '    gScore = {node: ∞}; gScore[start] = 0',
      '    fScore = {node: ∞}; fScore[start] = h(start)',
      '    while openSet is not empty:',
      '        current = node in openSet with lowest fScore',
      '        if current == goal:',
      '            return reconstruct_path(cameFrom, current)',
      '        openSet.remove(current)',
      '        for neighbor, weight in graph.edges(current):',
      '            tentative_gScore = gScore[current] + weight',
      '            if tentative_gScore < gScore[neighbor]:',
      '                cameFrom[neighbor] = current',
      '                gScore[neighbor] = tentative_gScore',
      '                fScore[neighbor] = gScore[neighbor] + h(neighbor)',
      '                if neighbor not in openSet:',
      '                    openSet.add(neighbor)',
      '    return failure'
    ],
    'bellman_ford': [
      'function BellmanFord(graph, start):',
      '    distances = {node: ∞}; distances[start] = 0',
      '    for i from 1 to |V| - 1:',
      '        for each edge (u, v) with weight w:',
      '            if distances[u] + w < distances[v]:',
      '                distances[v] = distances[u] + w',
      '    for each edge (u, v) with weight w:',
      '        if distances[u] + w < distances[v]:',
      '            return "Negative weight cycle detected"',
      '    return distances'
    ],
    'prims': [
      'function Prims(graph, startNode):',
      '    MST = []',
      '    visited = new Set()',
      '    pq = new PriorityQueue()',
      '    visited.add(startNode)',
      '    add_edges_to_pq(startNode, pq)',
      '    while pq is not empty:',
      '        edge = pq.extract_min()',
      '        node = edge.unvisited_node()',
      '        if node is visited:',
      '            continue',
      '        visited.add(node)',
      '        MST.add(edge)',
      '        add_edges_to_pq(node, pq)',
      '    return MST'
    ],
    'kruskals': [
      'function Kruskals(graph):',
      '    MST = []',
      '    edges = sort_edges_by_weight(graph.edges)',
      '    dsu = new DisjointSetUnion(graph.nodes)',
      '    for edge in edges:',
      '        u, v = edge.nodes',
      '        if dsu.find(u) != dsu.find(v):',
      '            MST.add(edge)',
      '            dsu.union(u, v)',
      '    return MST'
    ]
  };
  
	// Add aliases for UI keys
	if (algorithm === 'bellman-ford') return algorithms['bellman_ford'] || ['Algorithm not implemented'];
	if (algorithm === 'prim') return algorithms['prims'] || ['Algorithm not implemented'];
	if (algorithm === 'kruskal') return algorithms['kruskals'] || ['Algorithm not implemented'];
	return algorithms[algorithm] || ['Algorithm not implemented'];
};

export class AlgorithmRunner {
  private graphData: GraphData;
  private steps: AlgorithmStep[] = [];
  private currentStep = 0;

  constructor(graphData: GraphData) {
    this.graphData = { ...graphData };
  }

  private addStep(id: number, description: string, codeLine: number, updates: Partial<AlgorithmStep>) {
    this.steps.push({
      id,
      description,
      codeLine,
      nodeUpdates: updates.nodeUpdates || [],
      edgeUpdates: updates.edgeUpdates || [],
      ...updates
    });
  }

  private getNode(nodeId: string): GraphNode | undefined {
    return this.graphData.nodes.find(n => n.id === nodeId);
  }

  private getNodeLabel(nodeId: string): string {
    return this.getNode(nodeId)?.label || nodeId;
  }

  private getNeighbors(nodeId: string): string[] {
    return this.graphData.edges
      .filter(edge => edge.source === nodeId || edge.target === nodeId)
      .map(edge => edge.source === nodeId ? edge.target : edge.source);
  }

  private createDefaultExecution(): AlgorithmExecution {
    return {
      steps: this.steps,
      currentStep: 0,
      isComplete: false
    };
  }

  // --- Traversal Algorithms ---

  async runBFS(startNodeId: string): Promise<AlgorithmExecution> {
    this.steps = [];
    const visited = new Set<string>();
    const queue: string[] = [startNodeId];
    let stepId = 0;

    this.addStep(stepId++, 'Initialize BFS', 1, {
      nodeUpdates: [{ id: startNodeId, state: 'current' }],
      description: `Starting BFS from node ${this.getNodeLabel(startNodeId)}`
    });

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      
      if (visited.has(currentId)) {
        this.addStep(stepId++, 'Node already visited', 6, {
          description: `Node ${this.getNodeLabel(currentId)} already visited, skipping.`
        });
        continue;
      }

      visited.add(currentId);
      this.addStep(stepId++, 'Visit node', 7, {
        nodeUpdates: [{ id: currentId, state: 'visited' }],
        description: `Visited node ${this.getNodeLabel(currentId)}`
      });
      
      for (const neighborId of this.getNeighbors(currentId)) {
        if (!visited.has(neighborId) && !queue.includes(neighborId)) {
          queue.push(neighborId);
          this.addStep(stepId++, 'Enqueue neighbor', 10, {
            nodeUpdates: [{ id: neighborId, state: 'current' }],
            edgeUpdates: [{ source: currentId, target: neighborId, isActive: true }],
            description: `Added ${this.getNodeLabel(neighborId)} to queue`
          });
        }
      }
    }

    this.addStep(stepId++, 'BFS Complete', 11, {
      description: 'Algorithm finished: all reachable nodes visited.'
    });

    return this.createDefaultExecution();
  }

  async runDFS(startNodeId: string): Promise<AlgorithmExecution> {
    this.steps = [];
    const visited = new Set<string>();
    const stack: string[] = [startNodeId];
    let stepId = 0;

    this.addStep(stepId++, 'Initialize DFS', 1, {
      nodeUpdates: [{ id: startNodeId, state: 'current' }],
      description: `Starting DFS from node ${this.getNodeLabel(startNodeId)}`
    });

    while (stack.length > 0) {
      const currentId = stack.pop()!;
      
      if (visited.has(currentId)) {
        this.addStep(stepId++, 'Node already visited', 6, {
          description: `Node ${this.getNodeLabel(currentId)} already visited, skipping.`
        });
        continue;
      }

      visited.add(currentId);
      this.addStep(stepId++, 'Visit node', 7, {
        nodeUpdates: [{ id: currentId, state: 'visited' }],
        description: `Visited node ${this.getNodeLabel(currentId)}`
      });
      
      for (const neighborId of this.getNeighbors(currentId)) {
        if (!visited.has(neighborId)) {
          stack.push(neighborId);
          this.addStep(stepId++, 'Push neighbor to stack', 10, {
            nodeUpdates: [{ id: neighborId, state: 'current' }],
            edgeUpdates: [{ source: currentId, target: neighborId, isActive: true }],
            description: `Added ${this.getNodeLabel(neighborId)} to stack`
          });
        }
      }
    }

    this.addStep(stepId++, 'DFS Complete', 11, {
      description: 'Algorithm finished: all reachable nodes visited.'
    });

    return this.createDefaultExecution();
  }


  // --- Shortest Path Algorithms ---

  async runDijkstra(startNodeId: string): Promise<AlgorithmExecution> {
    this.steps = [];
    const distances: Record<string, number> = {};
    const visited = new Set<string>();
    const pq: Array<{ distance: number; nodeId: string }> = [];
    let stepId = 0;

    this.graphData.nodes.forEach(node => {
      distances[node.id] = node.id === startNodeId ? 0 : Infinity;
    });

    pq.push({ distance: 0, nodeId: startNodeId });

    this.addStep(stepId++, 'Initialize Dijkstra', 1, {
      nodeUpdates: this.graphData.nodes.map(n => ({
        id: n.id,
        distance: distances[n.id],
        state: n.id === startNodeId ? 'current' : 'default'
      })),
      description: `Starting Dijkstra from ${this.getNodeLabel(startNodeId)}`
    });

    while (pq.length > 0) {
      pq.sort((a, b) => a.distance - b.distance);
      const current = pq.shift()!;

      if (visited.has(current.nodeId)) continue;
      if (current.distance === Infinity) break;

      visited.add(current.nodeId);
      this.addStep(stepId++, 'Process current node', 8, {
        nodeUpdates: [{ id: current.nodeId, state: 'visited' }],
        description: `Processing ${this.getNodeLabel(current.nodeId)} (dist: ${current.distance})`
      });
      
      const edges = this.graphData.edges.filter(e => e.source === current.nodeId);
      for (const edge of edges) {
        const neighborId = edge.target;
        if (visited.has(neighborId)) continue;

        const weight = edge.weight || 1;
        const newDistance = distances[current.nodeId] + weight;

        if (newDistance < distances[neighborId]) {
          distances[neighborId] = newDistance;
          pq.push({ distance: newDistance, nodeId: neighborId });

          this.addStep(stepId++, 'Update distance', 12, {
            nodeUpdates: [{ id: neighborId, distance: newDistance, state: 'current' }],
            edgeUpdates: [{ id: edge.id, isActive: true }],
            description: `Update distance to ${this.getNodeLabel(neighborId)}: ${newDistance}`
          });
        }
      }
    }

    this.addStep(stepId++, 'Dijkstra Complete', 14, {
      description: 'Shortest path algorithm finished.'
    });

    return this.createDefaultExecution();
  }

  async runAStar(startNodeId: string, endNodeId: string): Promise<AlgorithmExecution> {
    this.steps = [];
    let stepId = 0;

    const h = (nodeId: string) => {
      const node = this.getNode(nodeId);
      const endNode = this.getNode(endNodeId);
      if (!node || !endNode || node.x === undefined || node.y === undefined || endNode.x === undefined || endNode.y === undefined) return 0;
      return Math.sqrt(Math.pow(node.x - endNode.x, 2) + Math.pow(node.y - endNode.y, 2));
    };

    const openSet: string[] = [startNodeId];
    const cameFrom: Record<string, string> = {};
    const gScore: Record<string, number> = {};
    const fScore: Record<string, number> = {};

    this.graphData.nodes.forEach(node => {
      gScore[node.id] = Infinity;
      fScore[node.id] = Infinity;
    });
    gScore[startNodeId] = 0;
    fScore[startNodeId] = h(startNodeId);

    this.addStep(stepId++, 'Initialize A*', 3, {
      nodeUpdates: this.graphData.nodes.map(n => ({
        id: n.id,
        distance: gScore[n.id],
        state: n.id === startNodeId ? 'current' : 'default'
      })),
      description: `Starting A* from ${this.getNodeLabel(startNodeId)} to ${this.getNodeLabel(endNodeId)}`
    });

    while (openSet.length > 0) {
      openSet.sort((a, b) => fScore[a] - fScore[b]);
      const currentId = openSet.shift()!;

      this.addStep(stepId++, 'Select node from open set', 6, {
        nodeUpdates: [{ id: currentId, state: 'current' }],
        description: `Selecting ${this.getNodeLabel(currentId)} (fScore: ${fScore[currentId].toFixed(2)})`
      });

      if (currentId === endNodeId) {
        let path = [currentId];
        let current = currentId;
        while (cameFrom[current]) {
          current = cameFrom[current];
          path.unshift(current);
        }
        this.addStep(stepId++, 'Path found', 8, {
          nodeUpdates: path.map(id => ({ id, state: 'visited' })),
          edgeUpdates: path.slice(0, -1).map((id, i) => ({ source: id, target: path[i+1], isActive: true })),
          description: `Path found with total cost ${gScore[endNodeId].toFixed(2)}`
        });
        return this.createDefaultExecution();
      }

      for (const edge of this.graphData.edges.filter(e => e.source === currentId)) {
        const neighborId = edge.target;
        const tentative_gScore = gScore[currentId] + (edge.weight || 1);
        this.addStep(stepId++, 'Check neighbor', 11, {
            edgeUpdates: [{ id: edge.id, isActive: true }],
            description: `Checking neighbor ${this.getNodeLabel(neighborId)}`
        });

        if (tentative_gScore < gScore[neighborId]) {
          cameFrom[neighborId] = currentId;
          gScore[neighborId] = tentative_gScore;
          fScore[neighborId] = gScore[neighborId] + h(neighborId);
          if (!openSet.includes(neighborId)) {
            openSet.push(neighborId);
          }
          this.addStep(stepId++, 'Update neighbor scores', 15, {
            nodeUpdates: [{ id: neighborId, distance: gScore[neighborId], state: 'current' }],
            description: `Updating ${this.getNodeLabel(neighborId)}: gScore=${gScore[neighborId].toFixed(2)}, fScore=${fScore[neighborId].toFixed(2)}`
          });
        }
      }
    }

    this.addStep(stepId++, 'A* Complete - No Path', 18, {
      description: 'Algorithm finished: no path found to the destination.'
    });
    return this.createDefaultExecution();
  }

  async runBellmanFord(startNodeId: string): Promise<AlgorithmExecution> {
    this.steps = [];
    let stepId = 0;
    const distances: Record<string, number> = {};

    this.graphData.nodes.forEach(node => {
      distances[node.id] = Infinity;
    });
    distances[startNodeId] = 0;

    this.addStep(stepId++, 'Initialize Bellman-Ford', 2, {
      nodeUpdates: this.graphData.nodes.map(n => ({
        id: n.id,
        distance: distances[n.id]
      })),
      description: `Initializing distances. Start node ${this.getNodeLabel(startNodeId)} is 0.`
    });

    for (let i = 0; i < this.graphData.nodes.length - 1; i++) {
      let updated = false;
      for (const edge of this.graphData.edges) {
        const u = edge.source;
        const v = edge.target;
        const w = edge.weight || 1;
        this.addStep(stepId++, `Relaxing edge`, 4, {
          edgeUpdates: [{ id: edge.id, isActive: true }],
          description: `Iteration ${i+1}: Checking edge ${this.getNodeLabel(u)} -> ${this.getNodeLabel(v)}`
        });
        if (distances[u] !== Infinity && distances[u] + w < distances[v]) {
          distances[v] = distances[u] + w;
          updated = true;
          this.addStep(stepId++, 'Distance updated', 6, {
            nodeUpdates: [{ id: v, distance: distances[v] }],
            description: `Updated distance to ${this.getNodeLabel(v)}: ${distances[v]}`
          });
        }
      }
      if (!updated) break;
    }

    for (const edge of this.graphData.edges) {
      const u = edge.source;
      const v = edge.target;
      const w = edge.weight || 1;
      if (distances[u] !== Infinity && distances[u] + w < distances[v]) {
        this.addStep(stepId++, 'Negative cycle detected', 9, {
          nodeUpdates: [{ id: v, state: 'error' }, {id: u, state: 'error'}],
          edgeUpdates: [{id: edge.id, isError: true}],
          description: 'Negative weight cycle detected! Algorithm cannot find shortest paths.'
        });
        return this.createDefaultExecution();
      }
    }

    this.addStep(stepId++, 'Bellman-Ford Complete', 10, {
      description: 'Algorithm finished. Final distances calculated.'
    });
    return this.createDefaultExecution();
  }

  // --- Minimum Spanning Tree (MST) Algorithms ---

  async runPrims(startNodeId: string): Promise<AlgorithmExecution> {
    this.steps = [];
    let stepId = 0;
    const mstEdges: GraphEdge[] = [];
    const visited = new Set<string>();
    const pq: GraphEdge[] = [];

    visited.add(startNodeId);
    this.addStep(stepId++, 'Initialize Prim\'s', 5, {
      nodeUpdates: [{ id: startNodeId, state: 'visited' }],
      description: `Starting Prim's algorithm from node ${this.getNodeLabel(startNodeId)}`
    });

    const addEdges = (nodeId: string) => {
      this.graphData.edges
        .filter(e => e.source === nodeId || e.target === nodeId)
        .forEach(edge => pq.push(edge));
    };
    
    addEdges(startNodeId);
    this.addStep(stepId++, 'Add initial edges to PQ', 6, {
      description: `Adding edges from ${this.getNodeLabel(startNodeId)} to the priority queue.`
    });

    while (pq.length > 0 && mstEdges.length < this.graphData.nodes.length - 1) {
      pq.sort((a, b) => (a.weight || 1) - (b.weight || 1));
      const edge = pq.shift()!;

      this.addStep(stepId++, 'Select minimum edge', 8, {
        edgeUpdates: [{ id: edge.id, isActive: true }],
        description: `Selecting edge (${this.getNodeLabel(edge.source)}-${this.getNodeLabel(edge.target)}) with weight ${edge.weight || 1}`
      });

      const isSourceVisited = visited.has(edge.source);
      const isTargetVisited = visited.has(edge.target);

      if (isSourceVisited && isTargetVisited) {
        this.addStep(stepId++, 'Skip edge (creates cycle)', 11, {
          edgeUpdates: [{ id: edge.id, isActive: false, isError: true }],
          description: 'Both nodes already in MST, skipping edge.'
        });
        continue;
      }

      const newNodeId = isSourceVisited ? edge.target : edge.source;
      visited.add(newNodeId);
      mstEdges.push(edge);
      this.addStep(stepId++, 'Add edge to MST', 13, {
        nodeUpdates: [{ id: newNodeId, state: 'visited' }],
        edgeUpdates: [{ id: edge.id, inTree: true }],
        description: `Adding edge to MST and visiting node ${this.getNodeLabel(newNodeId)}`
      });

      addEdges(newNodeId);
    }

    this.addStep(stepId++, 'Prim\'s Complete', 15, {
      description: 'Minimum Spanning Tree construction complete.'
    });
    return this.createDefaultExecution();
  }
  
  async runKruskals(): Promise<AlgorithmExecution> {
    this.steps = [];
    let stepId = 0;
    const mstEdges: GraphEdge[] = [];
    const sortedEdges = [...this.graphData.edges].sort((a, b) => (a.weight || 1) - (b.weight || 1));
    
    const parent: Record<string, string> = {};
    this.graphData.nodes.forEach(node => parent[node.id] = node.id);

    const find = (i: string): string => {
      if (parent[i] === i) return i;
      return find(parent[i]);
    };
    const union = (i: string, j: string) => {
      const rootI = find(i);
      const rootJ = find(j);
      if(rootI !== rootJ) parent[rootJ] = rootI;
    };
    
    this.addStep(stepId++, 'Initialize Kruskal\'s', 3, {
      description: 'Sorting all edges by weight.'
    });
    
    for(const edge of sortedEdges) {
      this.addStep(stepId++, 'Consider next edge', 5, {
        edgeUpdates: [{ id: edge.id, isActive: true }],
        description: `Considering edge (${this.getNodeLabel(edge.source)}-${this.getNodeLabel(edge.target)}) with weight ${edge.weight || 1}`
      });

      const rootU = find(edge.source);
      const rootV = find(edge.target);
      
      if (rootU !== rootV) {
        mstEdges.push(edge);
        union(edge.source, edge.target);
        this.addStep(stepId++, 'Add edge to MST', 8, {
          nodeUpdates: [{id: edge.source, state: 'visited'}, {id: edge.target, state: 'visited'}],
          edgeUpdates: [{ id: edge.id, inTree: true }],
          description: `Nodes are in different sets. Adding edge to MST.`
        });
      } else {
        this.addStep(stepId++, 'Skip edge (creates cycle)', 7, {
          edgeUpdates: [{ id: edge.id, isError: true, isActive: false }],
          description: `Nodes are in the same set. Skipping to avoid a cycle.`
        });
      }

      if(mstEdges.length === this.graphData.nodes.length - 1) break;
    }
    
    this.addStep(stepId++, 'Kruskal\'s Complete', 10, {
      description: 'Minimum Spanning Tree construction complete.'
    });
    return this.createDefaultExecution();
  }
}