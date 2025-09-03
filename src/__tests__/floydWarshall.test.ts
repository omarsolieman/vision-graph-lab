import { describe, it, expect } from 'vitest';
import { AlgorithmRunner } from '../lib/algorithms';
import { GraphData } from '../lib/graph-types';

describe('Floyd-Warshall Algorithm', () => {
  it('computes all-pairs shortest paths for a simple graph', async () => {
    const graph: GraphData = {
      nodes: [
        { id: 'A', label: 'A' },
        { id: 'B', label: 'B' },
        { id: 'C', label: 'C' }
      ],
      edges: [
  { id: 'e1', source: 'A', target: 'B', weight: 2, isActive: false },
  { id: 'e2', source: 'B', target: 'C', weight: 3, isActive: false },
  { id: 'e3', source: 'A', target: 'C', weight: 10, isActive: false }
      ]
    };
    const runner = new AlgorithmRunner(graph);
    const result = await runner.runFloydWarshall();
    const matrix = result.steps[result.steps.length - 1].matrix;
    expect(matrix['A']['A']).toBe(0);
    expect(matrix['A']['B']).toBe(2);
    expect(matrix['A']['C']).toBe(5); // A->B->C is shorter than A->C
    expect(matrix['B']['A']).toBe(Infinity);
    expect(matrix['B']['B']).toBe(0);
    expect(matrix['B']['C']).toBe(3);
    expect(matrix['C']['A']).toBe(Infinity);
    expect(matrix['C']['B']).toBe(Infinity);
    expect(matrix['C']['C']).toBe(0);
  });
});
