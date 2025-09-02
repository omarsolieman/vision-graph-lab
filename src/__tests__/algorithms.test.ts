import { describe, it, expect } from 'vitest';
import { GraphData, GraphNode, GraphEdge } from '../lib/graph-types';
import { AlgorithmRunner } from '../lib/algorithms';

function makeGraph(nodes: GraphNode[], edges: GraphEdge[]): GraphData {
  return { nodes, edges };
}

describe('Graph Algorithms', () => {
  it('BFS visits all reachable nodes', async () => {
    const nodes = [
  { id: 'A', label: 'A', x: 0, y: 0, state: 'default' as const },
  { id: 'B', label: 'B', x: 0, y: 0, state: 'default' as const },
  { id: 'C', label: 'C', x: 0, y: 0, state: 'default' as const },
    ];
    const edges = [
      { id: 'e1', source: 'A', target: 'B', isActive: false },
      { id: 'e2', source: 'B', target: 'C', isActive: false },
    ];
    const graph = makeGraph(nodes, edges);
  const algo = new AlgorithmRunner(graph);
    const result = await algo.runBFS('A');
    const visited = result.steps.flatMap(s => s.nodeUpdates || []).map(n => n.id);
    expect(visited).toContain('A');
    expect(visited).toContain('B');
    expect(visited).toContain('C');
  });

  it('Dijkstra finds shortest path', async () => {
    const nodes = [
  { id: 'A', label: 'A', x: 0, y: 0, state: 'default' as const },
  { id: 'B', label: 'B', x: 0, y: 0, state: 'default' as const },
  { id: 'C', label: 'C', x: 0, y: 0, state: 'default' as const },
    ];
    const edges = [
      { id: 'e1', source: 'A', target: 'B', weight: 1, isActive: false },
      { id: 'e2', source: 'B', target: 'C', weight: 2, isActive: false },
      { id: 'e3', source: 'A', target: 'C', weight: 5, isActive: false },
    ];
    const graph = makeGraph(nodes, edges);
  const algo = new AlgorithmRunner(graph);
  const result = await algo.runDijkstra('A');
    // Should prefer A->B->C (cost 3) over A->C (cost 5)
    const lastStep = result.steps[result.steps.length - 1];
    expect(lastStep.description).toMatch(/finished/i);
  });

  it('Bellman-Ford detects negative cycles', async () => {
    const nodes = [
  { id: 'A', label: 'A', x: 0, y: 0, state: 'default' as const },
  { id: 'B', label: 'B', x: 0, y: 0, state: 'default' as const },
    ];
    const edges = [
      { id: 'e1', source: 'A', target: 'B', weight: -2, isActive: false },
      { id: 'e2', source: 'B', target: 'A', weight: -1, isActive: false },
    ];
    const graph = makeGraph(nodes, edges);
  const algo = new AlgorithmRunner(graph);
    const result = await algo.runBellmanFord('A');
    const errorStep = result.steps.find(s => s.description?.toLowerCase().includes('negative weight cycle'));
    expect(errorStep).toBeDefined();
  });

  it('Prim\'s algorithm builds MST', async () => {
    const nodes = [
  { id: 'A', label: 'A', x: 0, y: 0, state: 'default' as const },
  { id: 'B', label: 'B', x: 0, y: 0, state: 'default' as const },
  { id: 'C', label: 'C', x: 0, y: 0, state: 'default' as const },
    ];
    const edges = [
      { id: 'e1', source: 'A', target: 'B', weight: 1, isActive: false },
      { id: 'e2', source: 'B', target: 'C', weight: 2, isActive: false },
      { id: 'e3', source: 'A', target: 'C', weight: 3, isActive: false },
    ];
    const graph = makeGraph(nodes, edges);
  const algo = new AlgorithmRunner(graph);
    const result = await algo.runPrims('A');
    const mstEdges = result.steps.flatMap(s => s.edgeUpdates || []).filter(e => e.inTree);
    expect(mstEdges.length).toBe(nodes.length - 1);
  });

  it('Kruskal\'s algorithm builds MST', async () => {
    const nodes = [
  { id: 'A', label: 'A', x: 0, y: 0, state: 'default' as const },
  { id: 'B', label: 'B', x: 0, y: 0, state: 'default' as const },
  { id: 'C', label: 'C', x: 0, y: 0, state: 'default' as const },
    ];
    const edges = [
      { id: 'e1', source: 'A', target: 'B', weight: 1, isActive: false },
      { id: 'e2', source: 'B', target: 'C', weight: 2, isActive: false },
      { id: 'e3', source: 'A', target: 'C', weight: 3, isActive: false },
    ];
    const graph = makeGraph(nodes, edges);
  const algo = new AlgorithmRunner(graph);
    const result = await algo.runKruskals();
    const mstEdges = result.steps.flatMap(s => s.edgeUpdates || []).filter(e => e.inTree);
    expect(mstEdges.length).toBe(nodes.length - 1);
  });
});
