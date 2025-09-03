// src/lib/graph-templates.ts
// Predefined template graphs for easy selection in the UI
import { GraphData } from './graph-types';

export interface GraphTemplate {
  name: string;
  description?: string;
  data: GraphData;
}

export const graphTemplates: GraphTemplate[] = [
  {
    name: 'Simple 3-node',
    description: 'A simple graph with three connected nodes.',
    data: {
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'c', label: 'C' },
      ],
      edges: [
        { id: 'e1', source: 'a', target: 'b', isActive: false },
        { id: 'e2', source: 'b', target: 'c', isActive: false },
      ],
    },
  },
  {
    name: 'Cycle',
    description: 'A 4-node cycle.',
    data: {
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'c', label: 'C' },
        { id: 'd', label: 'D' },
      ],
      edges: [
        { id: 'e1', source: 'a', target: 'b', isActive: false },
        { id: 'e2', source: 'b', target: 'c', isActive: false },
        { id: 'e3', source: 'c', target: 'd', isActive: false },
        { id: 'e4', source: 'd', target: 'a', isActive: false },
      ],
    },
  },
  {
    name: 'Tree',
    description: 'A simple tree structure.',
    data: {
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'c', label: 'C' },
        { id: 'd', label: 'D' },
        { id: 'e', label: 'E' },
      ],
      edges: [
        { id: 'e1', source: 'a', target: 'b', isActive: false },
        { id: 'e2', source: 'a', target: 'c', isActive: false },
        { id: 'e3', source: 'b', target: 'd', isActive: false },
        { id: 'e4', source: 'b', target: 'e', isActive: false },
      ],
    },
  },
  {
    name: 'Weighted Graph',
    description: 'A small weighted graph.',
    data: {
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'c', label: 'C' },
      ],
      edges: [
        { id: 'e1', source: 'a', target: 'b', weight: 2, isActive: false },
        { id: 'e2', source: 'b', target: 'c', weight: 3, isActive: false },
        { id: 'e3', source: 'a', target: 'c', weight: 1, isActive: false },
      ],
    },
  },
];
