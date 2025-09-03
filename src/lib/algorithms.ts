import { GraphData, GraphNode, GraphEdge, AlgorithmStep } from './graph-types';

export interface AlgorithmExecution {
  steps: AlgorithmStep[];
  currentStep: number;
  isComplete: boolean;
  operationLog?: OperationLogEntry[];
}

export interface OperationLogEntry {
  iteration: number;
  operation: string;
  nodesVisited: string[];
  queue?: string[];
  stack?: string[];
  result?: string[];
  matrix?: Record<string, any>;
  list?: string[];
  array?: string[];
}

export const getAlgorithmCode = (algorithm: string): string[] => {
	const algorithms: Record<string, string[]> = {
		'ford-fulkerson': [
			'function FordFulkerson(graph, source, sink):',
			'    maxFlow = 0',
			'    while there is a path from source to sink in residual graph:',
			'        find minimum residual capacity (bottleneck) along the path',
			'        for each edge in the path:',
			'            subtract bottleneck from forward edge',
			'            add bottleneck to reverse edge',
			'        maxFlow += bottleneck',
			'    return maxFlow'
		],
		'floyd-warshall': [
			'function FloydWarshall(graph):',
			'    dist = matrix of size |V| x |V|, initialized to ∞',
			'    for each node v:',
			'        dist[v][v] = 0',
			'    for each edge (u, v) with weight w:',
			'        dist[u][v] = w',
			'    for k in V:',
			'        for i in V:',
			'            for j in V:',
			'                if dist[i][k] + dist[k][j] < dist[i][j]:',
			'                    dist[i][j] = dist[i][k] + dist[k][j]',
			'    return dist'
		],
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

	/**
	 * Ford-Fulkerson (Edmonds-Karp) algorithm for maximum flow.
	 * Returns the max flow value from source to sink.
	 */
	async runFordFulkerson(sourceId: string, sinkId: string): Promise<AlgorithmExecution> {
		this.steps = [];
		this.operationLog = [];
		let stepId = 0;
		// Build residual graph
		const nodeIds = this.graphData.nodes.map(n => n.id);
		// Initialize residual capacities
		const capacity: Record<string, Record<string, number>> = {};
		for (const u of nodeIds) {
			capacity[u] = {};
			for (const v of nodeIds) {
				capacity[u][v] = 0;
			}
		}
		for (const edge of this.graphData.edges) {
			capacity[edge.source][edge.target] = edge.weight || 1;
		}
		let maxFlow = 0;
		const parent: Record<string, string | null> = {};

		const bfs = (): boolean => {
			// Find path from source to sink in residual graph
			const visited = new Set<string>();
			const queue: string[] = [sourceId];
			parent[sourceId] = null;
			while (queue.length > 0) {
				const u = queue.shift()!;
				for (const v of nodeIds) {
					if (!visited.has(v) && capacity[u][v] > 0) {
						queue.push(v);
						parent[v] = u;
						visited.add(v);
						if (v === sinkId) return true;
					}
				}
			}
			return false;
		};

		this.addStep(stepId++, 'Initialize Ford-Fulkerson', 1, {
			description: `Finding max flow from ${this.getNodeLabel(sourceId)} to ${this.getNodeLabel(sinkId)}`,
			matrix: JSON.parse(JSON.stringify(capacity))
		});

		while (bfs()) {
			// Find bottleneck (min capacity) along the path
			let pathFlow = Infinity;
			let v = sinkId;
			while (v !== sourceId) {
				const u = parent[v]!;
				pathFlow = Math.min(pathFlow, capacity[u][v]);
				v = u;
			}
			// Update residual capacities
			v = sinkId;
			const path: string[] = [];
			while (v !== sourceId) {
				const u = parent[v]!;
				capacity[u][v] -= pathFlow;
				capacity[v][u] += pathFlow;
				path.unshift(v);
				v = u;
			}
			path.unshift(sourceId);
			maxFlow += pathFlow;
			this.addStep(stepId++, 'Augment path', 2, {
				description: `Augmented path: ${path.map(id => this.getNodeLabel(id)).join(' → ')} (flow +${pathFlow})`,
				matrix: JSON.parse(JSON.stringify(capacity)),
				list: path
			});
		}
		this.addStep(stepId++, 'Ford-Fulkerson Complete', 3, {
			description: `Algorithm finished. Max flow = ${maxFlow}`,
			matrix: JSON.parse(JSON.stringify(capacity)),
			result: [maxFlow.toString()]
		});
		return this.createDefaultExecution();
	}
  private operationLog: OperationLogEntry[] = [];
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
    // Build operation log entry for this step, always using node labels
    const nodesVisited = this.steps
      .flatMap(s => s.nodeUpdates?.filter(nu => nu.state === 'visited').map(nu => this.getNodeLabel(nu.id)) || [])
      .filter((v, i, arr) => arr.indexOf(v) === i);
    const mapLabels = (arr?: string[]) => arr ? arr.map(id => this.getNodeLabel(id)) : undefined;
    this.operationLog.push({
      iteration: id,
      operation: description,
      nodesVisited,
      queue: mapLabels(updates.queue),
      stack: mapLabels(updates.stack),
      result: mapLabels(updates.result),
      matrix: updates.matrix,
      list: mapLabels(updates.list),
      array: mapLabels(updates.array),
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
      isComplete: false,
      operationLog: this.operationLog
    };
  }

  // --- Traversal Algorithms ---
	async runDFS(startNodeId: string): Promise<AlgorithmExecution> {
		this.steps = [];
		this.operationLog = [];
		const visited = new Set<string>();
		const stack: string[] = [startNodeId];
		let stepId = 0;

		this.addStep(stepId++, 'Initialize DFS', 1, {
			nodeUpdates: [{ id: startNodeId, state: 'current' }],
			description: `Starting DFS from node ${this.getNodeLabel(startNodeId)}`,
			stack: stack.map(id => this.getNodeLabel(id))
		});

		while (stack.length > 0) {
			const currentId = stack.pop()!;
      
			if (visited.has(currentId)) {
				this.addStep(stepId++, 'Node already visited', 6, {
					description: `Node ${this.getNodeLabel(currentId)} already visited, skipping.`,
					stack: stack.map(id => this.getNodeLabel(id))
				});
				continue;
			}

			visited.add(currentId);
			this.addStep(stepId++, 'Visit node', 7, {
				nodeUpdates: [{ id: currentId, state: 'visited' }],
				description: `Visited node ${this.getNodeLabel(currentId)}`,
				stack: stack.map(id => this.getNodeLabel(id))
			});
      
			for (const neighborId of this.getNeighbors(currentId)) {
				if (!visited.has(neighborId)) {
					stack.push(neighborId);
					this.addStep(stepId++, 'Push neighbor to stack', 10, {
						nodeUpdates: [{ id: neighborId, state: 'current' }],
						edgeUpdates: [{ source: currentId, target: neighborId, isActive: true }],
						description: `Added ${this.getNodeLabel(neighborId)} to stack`,
						stack: stack.map(id => this.getNodeLabel(id))
					});
				}
			}
			// Always add a step to show the stack state after each iteration
			this.addStep(stepId++, 'Stack State', 2, {
				stack: stack.map(id => this.getNodeLabel(id))
			});
		}

		this.addStep(stepId++, 'DFS Complete', 11, {
			description: 'Algorithm finished: all reachable nodes visited.',
			stack: stack.map(id => this.getNodeLabel(id))
		});

		return this.createDefaultExecution();
	}

  async runBFS(startNodeId: string): Promise<AlgorithmExecution> {
    this.steps = [];
    this.operationLog = [];
    const visited = new Set<string>();
    const queue: string[] = [startNodeId];
    const visitOrder: string[] = [];
    let stepId = 0;

    this.addStep(stepId++, 'Initialize BFS', 1, {
      nodeUpdates: [{ id: startNodeId, state: 'current' }],
      description: `Starting BFS from node ${this.getNodeLabel(startNodeId)}`,
      queue: queue.map(id => this.getNodeLabel(id)),
      result: visitOrder.map(id => this.getNodeLabel(id))
    });

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      
      if (visited.has(currentId)) {
        this.addStep(stepId++, 'Node already visited', 6, {
          description: `Node ${this.getNodeLabel(currentId)} already visited, skipping.`,
          queue: queue.map(id => this.getNodeLabel(id)),
          result: visitOrder.map(id => this.getNodeLabel(id))
        });
        continue;
      }

      visited.add(currentId);
      visitOrder.push(currentId);
      this.addStep(stepId++, 'Visit node', 7, {
        nodeUpdates: [{ id: currentId, state: 'visited' }],
        description: `Visited node ${this.getNodeLabel(currentId)}`,
        queue: queue.map(id => this.getNodeLabel(id)),
        result: visitOrder.map(id => this.getNodeLabel(id))
      });
      
      for (const neighborId of this.getNeighbors(currentId)) {
        if (!visited.has(neighborId) && !queue.includes(neighborId)) {
          queue.push(neighborId);
          this.addStep(stepId++, 'Enqueue neighbor', 10, {
            nodeUpdates: [{ id: neighborId, state: 'current' }],
            edgeUpdates: [{ source: currentId, target: neighborId, isActive: true }],
            description: `Added ${this.getNodeLabel(neighborId)} to queue`,
            queue: queue.map(id => this.getNodeLabel(id)),
            result: visitOrder.map(id => this.getNodeLabel(id))
          });
        }
      }
      // Always add a step to show the queue state after each iteration
      this.addStep(stepId++, 'Queue State', 2, {
        queue: queue.map(id => this.getNodeLabel(id)),
        result: visitOrder.map(id => this.getNodeLabel(id))
      });
    }

    this.addStep(stepId++, 'BFS Complete', 11, {
      description: 'Algorithm finished: all reachable nodes visited.',
      result: visitOrder.map(id => this.getNodeLabel(id))
    });

    return this.createDefaultExecution();
  }



  // --- Shortest Path Algorithms ---
	/**
	 * Floyd-Warshall algorithm for all-pairs shortest paths.
	 * Returns a matrix of shortest distances between all pairs of nodes.
	 */
	async runFloydWarshall(): Promise<AlgorithmExecution> {
		this.steps = [];
		this.operationLog = [];
		let stepId = 0;
		const nodeIds = this.graphData.nodes.map(n => n.id);
		const dist: Record<string, Record<string, number>> = {};
		// Initialize distance matrix
		for (const u of nodeIds) {
			dist[u] = {};
			for (const v of nodeIds) {
				if (u === v) {
					dist[u][v] = 0;
				} else {
					const edge = this.graphData.edges.find(e => (e.source === u && e.target === v) || (e.target === u && e.source === v));
					dist[u][v] = edge ? (edge.weight || 1) : Infinity;
				}
			}
		}
		this.addStep(stepId++, 'Initialize distance matrix', 1, {
			matrix: JSON.parse(JSON.stringify(dist)),
			description: 'Initialized distance matrix for all node pairs.'
		});
		// Floyd-Warshall main loop
		for (const k of nodeIds) {
			for (const i of nodeIds) {
				for (const j of nodeIds) {
					if (dist[i][k] + dist[k][j] < dist[i][j]) {
						dist[i][j] = dist[i][k] + dist[k][j];
						this.addStep(stepId++, 'Update shortest path', 2, {
							matrix: JSON.parse(JSON.stringify(dist)),
							description: `Updated shortest path: ${this.getNodeLabel(i)} → ${this.getNodeLabel(j)} via ${this.getNodeLabel(k)}`
						});
					}
				}
			}
			this.addStep(stepId++, 'Matrix State', 3, {
				matrix: JSON.parse(JSON.stringify(dist)),
				description: `Matrix after considering ${this.getNodeLabel(k)} as intermediate.`
			});
		}
		this.addStep(stepId++, 'Floyd-Warshall Complete', 4, {
			matrix: JSON.parse(JSON.stringify(dist)),
			description: 'Algorithm finished. All-pairs shortest paths calculated.'
		});
		return this.createDefaultExecution();
	}

  async runDijkstra(startNodeId: string): Promise<AlgorithmExecution> {
    this.steps = [];
    this.operationLog = [];
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
      description: `Starting Dijkstra from ${this.getNodeLabel(startNodeId)}`,
      queue: pq.map(item => this.getNodeLabel(item.nodeId))
    });

    while (pq.length > 0) {
      pq.sort((a, b) => a.distance - b.distance);
      const current = pq.shift()!;

			if (visited.has(current.nodeId)) continue;
			if (current.distance === Infinity) break;

			visited.add(current.nodeId);
			// Show distances as a matrix (object) for visualization
			this.addStep(stepId++, 'Process current node', 8, {
				nodeUpdates: [{ id: current.nodeId, state: 'visited' }],
				description: `Processing ${this.getNodeLabel(current.nodeId)} (dist: ${current.distance})`,
				queue: pq.map(item => this.getNodeLabel(item.nodeId)),
				matrix: { ...distances }
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
						description: `Update distance to ${this.getNodeLabel(neighborId)}: ${newDistance}`,
						queue: pq.map(item => this.getNodeLabel(item.nodeId)),
						matrix: { ...distances }
					});
				}
			}
			// Always add a step to show the queue state and matrix after each iteration
			this.addStep(stepId++, 'Queue State', 2, {
				queue: pq.map(item => this.getNodeLabel(item.nodeId)),
				matrix: { ...distances }
			});
    }

		this.addStep(stepId++, 'Dijkstra Complete', 14, {
			description: 'Shortest path algorithm finished.',
			queue: pq.map(item => this.getNodeLabel(item.nodeId)),
			matrix: { ...distances }
		});

    return this.createDefaultExecution();
  }

  async runAStar(startNodeId: string, endNodeId: string): Promise<AlgorithmExecution> {
    this.steps = [];
    this.operationLog = [];
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
			description: `Starting A* from ${this.getNodeLabel(startNodeId)} to ${this.getNodeLabel(endNodeId)}`,
			queue: openSet.map(id => this.getNodeLabel(id)),
			matrix: { gScore: { ...gScore }, fScore: { ...fScore } }
		});

		while (openSet.length > 0) {
			openSet.sort((a, b) => fScore[a] - fScore[b]);
			const currentId = openSet.shift()!;

			this.addStep(stepId++, 'Select node from open set', 6, {
				nodeUpdates: [{ id: currentId, state: 'current' }],
				description: `Selecting ${this.getNodeLabel(currentId)} (fScore: ${fScore[currentId].toFixed(2)})`,
				queue: openSet.map(id => this.getNodeLabel(id)),
				matrix: { gScore: { ...gScore }, fScore: { ...fScore } }
			});
			// Always add a step to show the queue state and matrix after each iteration
			this.addStep(stepId++, 'Queue State', 2, {
				queue: openSet.map(id => this.getNodeLabel(id)),
				matrix: { gScore: { ...gScore }, fScore: { ...fScore } }
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
					description: `Path found with total cost ${gScore[endNodeId].toFixed(2)}`,
					result: path.map(id => this.getNodeLabel(id)),
					matrix: { gScore: { ...gScore }, fScore: { ...fScore } }
				});
				return this.createDefaultExecution();
			}

			for (const edge of this.graphData.edges.filter(e => e.source === currentId)) {
				const neighborId = edge.target;
				const tentative_gScore = gScore[currentId] + (edge.weight || 1);
				this.addStep(stepId++, 'Check neighbor', 11, {
						edgeUpdates: [{ id: edge.id, isActive: true }],
						description: `Checking neighbor ${this.getNodeLabel(neighborId)}`,
						matrix: { gScore: { ...gScore }, fScore: { ...fScore } }
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
						description: `Updating ${this.getNodeLabel(neighborId)}: gScore=${gScore[neighborId].toFixed(2)}, fScore=${fScore[neighborId].toFixed(2)}`,
						matrix: { gScore: { ...gScore }, fScore: { ...fScore } }
					});
				}
			}
    }

		this.addStep(stepId++, 'A* Complete - No Path', 18, {
			description: 'Algorithm finished: no path found to the destination.',
			queue: openSet.map(id => this.getNodeLabel(id)),
			matrix: { gScore: { ...gScore }, fScore: { ...fScore } }
		});
    return this.createDefaultExecution();
  }

  async runBellmanFord(startNodeId: string): Promise<AlgorithmExecution> {
    this.steps = [];
    this.operationLog = [];
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
			description: `Initializing distances. Start node ${this.getNodeLabel(startNodeId)} is 0.`,
			matrix: { ...distances }
		});

		for (let i = 0; i < this.graphData.nodes.length - 1; i++) {
			let updated = false;
			for (const edge of this.graphData.edges) {
				const u = edge.source;
				const v = edge.target;
				const w = edge.weight || 1;
				this.addStep(stepId++, `Relaxing edge`, 4, {
					edgeUpdates: [{ id: edge.id, isActive: true }],
					description: `Iteration ${i+1}: Checking edge ${this.getNodeLabel(u)} -> ${this.getNodeLabel(v)}`,
					matrix: { ...distances }
				});
				if (distances[u] !== Infinity && distances[u] + w < distances[v]) {
					distances[v] = distances[u] + w;
					updated = true;
					this.addStep(stepId++, 'Distance updated', 6, {
						nodeUpdates: [{ id: v, distance: distances[v] }],
						description: `Updated distance to ${this.getNodeLabel(v)}: ${distances[v]}`,
						matrix: { ...distances }
					});
				}
			}
			// Show matrix after each iteration
			this.addStep(stepId++, 'Matrix State', 7, {
				matrix: { ...distances }
			});
			if (!updated) break;
		}
    // Remove or fix this line, as stack is not defined in Bellman-Ford
    // this.addStep(stepId++, 'Stack State', 2, {
    //   stack: [...stack]
    // });

		for (const edge of this.graphData.edges) {
			const u = edge.source;
			const v = edge.target;
			const w = edge.weight || 1;
			if (distances[u] !== Infinity && distances[u] + w < distances[v]) {
				this.addStep(stepId++, 'Negative cycle detected', 9, {
					nodeUpdates: [{ id: v, state: 'error' }, {id: u, state: 'error'}],
					edgeUpdates: [{id: edge.id, isError: true}],
					description: 'Negative weight cycle detected! Algorithm cannot find shortest paths.',
					matrix: { ...distances }
				});
				return this.createDefaultExecution();
			}
		}

		this.addStep(stepId++, 'Bellman-Ford Complete', 10, {
			description: 'Algorithm finished. Final distances calculated.',
			matrix: { ...distances }
		});
    return this.createDefaultExecution();
  }

  // --- Minimum Spanning Tree (MST) Algorithms ---

  async runPrims(startNodeId: string): Promise<AlgorithmExecution> {
            // stack: [...stack] (remove, not relevant for Prim's)
    this.steps = [];
    this.operationLog = [];
    let stepId = 0;
    const mstEdges: GraphEdge[] = [];
    const visited = new Set<string>();
    const pq: GraphEdge[] = [];

    visited.add(startNodeId);
		this.addStep(stepId++, 'Initialize Prim\'s', 5, {
			nodeUpdates: [{ id: startNodeId, state: 'visited' }],
			description: `Starting Prim's algorithm from node ${this.getNodeLabel(startNodeId)}`,
			list: [this.getNodeLabel(startNodeId)]
		});

    const addEdges = (nodeId: string) => {
      this.graphData.edges
        .filter(e => e.source === nodeId || e.target === nodeId)
        .forEach(edge => pq.push(edge));
    };
    
    addEdges(startNodeId);
		this.addStep(stepId++, 'Add initial edges to PQ', 6, {
			description: `Adding edges from ${this.getNodeLabel(startNodeId)} to the priority queue.`,
			array: pq.map(e => `${this.getNodeLabel(e.source)}-${this.getNodeLabel(e.target)}(${e.weight || 1})`)
		});

		while (pq.length > 0 && mstEdges.length < this.graphData.nodes.length - 1) {
			pq.sort((a, b) => (a.weight || 1) - (b.weight || 1));
			const edge = pq.shift()!;

			this.addStep(stepId++, 'Select minimum edge', 8, {
				edgeUpdates: [{ id: edge.id, isActive: true }],
				description: `Selecting edge (${this.getNodeLabel(edge.source)}-${this.getNodeLabel(edge.target)}) with weight ${edge.weight || 1}`,
				array: pq.map(e => `${this.getNodeLabel(e.source)}-${this.getNodeLabel(e.target)}(${e.weight || 1})`),
				list: Array.from(visited).map(id => this.getNodeLabel(id))
			});

			const isSourceVisited = visited.has(edge.source);
			const isTargetVisited = visited.has(edge.target);

			if (isSourceVisited && isTargetVisited) {
				this.addStep(stepId++, 'Skip edge (creates cycle)', 11, {
					edgeUpdates: [{ id: edge.id, isActive: false, isError: true }],
					description: 'Both nodes already in MST, skipping edge.',
					array: pq.map(e => `${this.getNodeLabel(e.source)}-${this.getNodeLabel(e.target)}(${e.weight || 1})`),
					list: Array.from(visited).map(id => this.getNodeLabel(id))
				});
				continue;
			}

			const newNodeId = isSourceVisited ? edge.target : edge.source;
			visited.add(newNodeId);
			mstEdges.push(edge);
			this.addStep(stepId++, 'Add edge to MST', 13, {
				nodeUpdates: [{ id: newNodeId, state: 'visited' }],
				edgeUpdates: [{ id: edge.id, inTree: true }],
				description: `Adding edge to MST and visiting node ${this.getNodeLabel(newNodeId)}`,
				array: pq.map(e => `${this.getNodeLabel(e.source)}-${this.getNodeLabel(e.target)}(${e.weight || 1})`),
				list: Array.from(visited).map(id => this.getNodeLabel(id))
			});

			addEdges(newNodeId);
		}

		this.addStep(stepId++, 'Prim\'s Complete', 15, {
			description: 'Minimum Spanning Tree construction complete.',
			array: pq.map(e => `${this.getNodeLabel(e.source)}-${this.getNodeLabel(e.target)}(${e.weight || 1})`),
			list: Array.from(visited).map(id => this.getNodeLabel(id))
		});
    return this.createDefaultExecution();
  }
  
  async runKruskals(): Promise<AlgorithmExecution> {
    this.steps = [];
    this.operationLog = [];
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
			description: 'Sorting all edges by weight.',
			array: sortedEdges.map(e => `${this.getNodeLabel(e.source)}-${this.getNodeLabel(e.target)}(${e.weight || 1})`),
			list: this.graphData.nodes.map(n => this.getNodeLabel(n.id))
		});
    
		for(const edge of sortedEdges) {
			this.addStep(stepId++, 'Consider next edge', 5, {
				edgeUpdates: [{ id: edge.id, isActive: true }],
				description: `Considering edge (${this.getNodeLabel(edge.source)}-${this.getNodeLabel(edge.target)}) with weight ${edge.weight || 1}`,
				array: sortedEdges.map(e => `${this.getNodeLabel(e.source)}-${this.getNodeLabel(e.target)}(${e.weight || 1})`),
				list: this.graphData.nodes.map(n => this.getNodeLabel(n.id))
			});

			const rootU = find(edge.source);
			const rootV = find(edge.target);
      
			if (rootU !== rootV) {
				mstEdges.push(edge);
				union(edge.source, edge.target);
				this.addStep(stepId++, 'Add edge to MST', 8, {
					nodeUpdates: [{id: edge.source, state: 'visited'}, {id: edge.target, state: 'visited'}],
					edgeUpdates: [{ id: edge.id, inTree: true }],
					description: `Nodes are in different sets. Adding edge to MST.`,
					array: sortedEdges.map(e => `${this.getNodeLabel(e.source)}-${this.getNodeLabel(e.target)}(${e.weight || 1})`),
					list: this.graphData.nodes.map(n => this.getNodeLabel(n.id))
				});
			} else {
				this.addStep(stepId++, 'Skip edge (creates cycle)', 7, {
					edgeUpdates: [{ id: edge.id, isError: true, isActive: false }],
					description: `Nodes are in the same set. Skipping to avoid a cycle.`,
					array: sortedEdges.map(e => `${this.getNodeLabel(e.source)}-${this.getNodeLabel(e.target)}(${e.weight || 1})`),
					list: this.graphData.nodes.map(n => this.getNodeLabel(n.id))
				});
			}

			if(mstEdges.length === this.graphData.nodes.length - 1) break;
		}
    
		this.addStep(stepId++, 'Kruskal\'s Complete', 10, {
			description: 'Minimum Spanning Tree construction complete.',
			array: sortedEdges.map(e => `${this.getNodeLabel(e.source)}-${this.getNodeLabel(e.target)}(${e.weight || 1})`),
			list: this.graphData.nodes.map(n => this.getNodeLabel(n.id))
		});
    return this.createDefaultExecution();
  }
}