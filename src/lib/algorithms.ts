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
      '    queue = [startNode]',
      '    visited = new Set()',
      '    while queue is not empty:',
      '        current = queue.dequeue()',
      '        if current in visited:',
      '            continue',
      '        visited.add(current)',
      '        for neighbor in graph.neighbors(current):',
      '            if neighbor not in visited:',
      '                queue.enqueue(neighbor)',
      '    return visited'
    ],
    'dfs': [
      'function DFS(graph, startNode):',
      '    stack = [startNode]',
      '    visited = new Set()',
      '    while stack is not empty:',
      '        current = stack.pop()',
      '        if current in visited:',
      '            continue',
      '        visited.add(current)',
      '        for neighbor in graph.neighbors(current):',
      '            if neighbor not in visited:',
      '                stack.push(neighbor)',
      '    return visited'
    ],
    'dijkstra': [
      'function Dijkstra(graph, startNode):',
      '    distances = {startNode: 0}',
      '    pq = PriorityQueue([(0, startNode)])',
      '    visited = new Set()',
      '    while pq is not empty:',
      '        currentDist, current = pq.pop()',
      '        if current in visited:',
      '            continue',
      '        visited.add(current)',
      '        for neighbor, weight in graph.edges(current):',
      '            newDist = currentDist + weight',
      '            if newDist < distances.get(neighbor, ∞):',
      '                distances[neighbor] = newDist',
      '                pq.push((newDist, neighbor))',
      '    return distances'
    ]
  };
  
  return algorithms[algorithm] || ['Algorithm not implemented'];
};

export class AlgorithmRunner {
  private graphData: GraphData;
  private steps: AlgorithmStep[] = [];
  private currentStep = 0;

  constructor(graphData: GraphData) {
    this.graphData = { ...graphData };
  }

  async runBFS(startNodeId: string): Promise<AlgorithmExecution> {
    this.steps = [];
    const visited = new Set<string>();
    const queue: string[] = [startNodeId];
    let stepId = 0;

    // Step 0: Initialize
    this.addStep(stepId++, 'Initialize BFS with start node', 1, {
      nodeUpdates: [{ id: startNodeId, state: 'current' }],
      description: `Starting BFS from node ${this.getNodeLabel(startNodeId)}`
    });

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      
      if (visited.has(currentId)) {
        this.addStep(stepId++, 'Node already visited, skip', 5, {
          description: `Node ${this.getNodeLabel(currentId)} already visited`
        });
        continue;
      }

      // Mark as visited
      visited.add(currentId);
      this.addStep(stepId++, 'Mark current node as visited', 7, {
        nodeUpdates: [{ id: currentId, state: 'visited' }],
        description: `Visited node ${this.getNodeLabel(currentId)}`
      });

      // Find neighbors
      const neighbors = this.getNeighbors(currentId);
      
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId) && !queue.includes(neighborId)) {
          queue.push(neighborId);
          this.addStep(stepId++, 'Add neighbor to queue', 10, {
            nodeUpdates: [{ id: neighborId, state: 'current' }],
            edgeUpdates: [{ source: currentId, target: neighborId, isActive: true }],
            description: `Added ${this.getNodeLabel(neighborId)} to queue`
          });
        }
      }
    }

    this.addStep(stepId++, 'BFS Complete', 11, {
      description: 'Algorithm finished - all reachable nodes visited'
    });

    return {
      steps: this.steps,
      currentStep: 0,
      isComplete: false
    };
  }

  async runDijkstra(startNodeId: string): Promise<AlgorithmExecution> {
    this.steps = [];
    const distances: Record<string, number> = {};
    const visited = new Set<string>();
    const pq: Array<{ distance: number; nodeId: string }> = [];
    let stepId = 0;

    // Initialize distances
    this.graphData.nodes.forEach(node => {
      distances[node.id] = node.id === startNodeId ? 0 : Infinity;
    });

    pq.push({ distance: 0, nodeId: startNodeId });

    this.addStep(stepId++, 'Initialize Dijkstra', 1, {
      nodeUpdates: [{ id: startNodeId, state: 'current', distance: 0 }],
      description: `Starting Dijkstra from ${this.getNodeLabel(startNodeId)}`
    });

    while (pq.length > 0) {
      // Sort priority queue by distance
      pq.sort((a, b) => a.distance - b.distance);
      const current = pq.shift()!;

      if (visited.has(current.nodeId)) {
        this.addStep(stepId++, 'Node already processed', 6, {
          description: `Node ${this.getNodeLabel(current.nodeId)} already processed`
        });
        continue;
      }

      visited.add(current.nodeId);
      this.addStep(stepId++, 'Process current node', 8, {
        nodeUpdates: [{ id: current.nodeId, state: 'visited' }],
        description: `Processing ${this.getNodeLabel(current.nodeId)} (distance: ${current.distance})`
      });

      // Check neighbors
      const edges = this.graphData.edges.filter(e => 
        e.source === current.nodeId || e.target === current.nodeId
      );

      for (const edge of edges) {
        const neighborId = edge.source === current.nodeId ? edge.target : edge.source;
        const weight = edge.weight || 1;
        const newDistance = distances[current.nodeId] + weight;

        if (newDistance < distances[neighborId]) {
          distances[neighborId] = newDistance;
          pq.push({ distance: newDistance, nodeId: neighborId });

          this.addStep(stepId++, 'Update distance', 12, {
            nodeUpdates: [{ id: neighborId, distance: newDistance, state: 'current' }],
            edgeUpdates: [{ id: edge.id, isActive: true }],
            description: `Updated distance to ${this.getNodeLabel(neighborId)}: ${newDistance}`
          });
        }
      }
    }

    this.addStep(stepId++, 'Dijkstra Complete', 14, {
      description: 'Shortest path algorithm finished'
    });

    return {
      steps: this.steps,
      currentStep: 0,
      isComplete: false
    };
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

  private getNodeLabel(nodeId: string): string {
    return this.graphData.nodes.find(n => n.id === nodeId)?.label || nodeId;
  }

  private getNeighbors(nodeId: string): string[] {
    return this.graphData.edges
      .filter(edge => edge.source === nodeId || edge.target === nodeId)
      .map(edge => edge.source === nodeId ? edge.target : edge.source);
  }
}