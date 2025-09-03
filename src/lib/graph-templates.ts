// src/lib/graph-templates.ts
// Predefined template graphs for easy selection in the UI
import { GraphData } from './graph-types';

export interface GraphTemplate {
  name: string;
  description?: string;
  data: GraphData;
  isDirected?: boolean;
}

export const graphTemplates: GraphTemplate[] = [
  {
    name: 'Simple 3-node',
    description: 'A simple graph with three connected nodes.',
    isDirected: false,
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
    isDirected: false,
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
    isDirected: true,
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
    isDirected: false,
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
  {
    name: 'DAG (6 nodes)',
    description: 'Directed acyclic graph, good for topological sort.',
    isDirected: true,
    data: {
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'c', label: 'C' },
        { id: 'd', label: 'D' },
        { id: 'e', label: 'E' },
        { id: 'f', label: 'F' },
      ],
      edges: [
        { id: 'e1', source: 'a', target: 'b', isActive: false },
        { id: 'e2', source: 'a', target: 'c', isActive: false },
        { id: 'e3', source: 'b', target: 'd', isActive: false },
        { id: 'e4', source: 'c', target: 'd', isActive: false },
        { id: 'e5', source: 'd', target: 'e', isActive: false },
        { id: 'e6', source: 'e', target: 'f', isActive: false },
      ],
    },
  },
  {
    name: 'Large Undirected (8 nodes)',
    description: '8 nodes, cycles, and branches.',
    isDirected: false,
    data: {
      nodes: [
        { id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }, { id: 'd', label: 'D' },
        { id: 'e', label: 'E' }, { id: 'f', label: 'F' }, { id: 'g', label: 'G' }, { id: 'h', label: 'H' },
      ],
      edges: [
        { id: 'e1', source: 'a', target: 'b', isActive: false },
        { id: 'e2', source: 'a', target: 'c', isActive: false },
        { id: 'e3', source: 'b', target: 'd', isActive: false },
        { id: 'e4', source: 'c', target: 'd', isActive: false },
        { id: 'e5', source: 'd', target: 'e', isActive: false },
        { id: 'e6', source: 'e', target: 'f', isActive: false },
        { id: 'e7', source: 'f', target: 'g', isActive: false },
        { id: 'e8', source: 'g', target: 'h', isActive: false },
        { id: 'e9', source: 'h', target: 'a', isActive: false },
        { id: 'e10', source: 'c', target: 'f', isActive: false },
      ],
    },
  },
    // End of templates
    {
      name: 'Weighted Mixed (7 nodes)',
      description: 'Weighted graph with a variety of weights.',
      isDirected: false,
      data: {
        nodes: [
          { id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }, { id: 'd', label: 'D' },
          { id: 'e', label: 'E' }, { id: 'f', label: 'F' }, { id: 'g', label: 'G' },
        ],
        edges: [
          { id: 'e1', source: 'a', target: 'b', weight: 1, isActive: false },
          { id: 'e2', source: 'a', target: 'c', weight: 5, isActive: false },
          { id: 'e3', source: 'b', target: 'd', weight: 2, isActive: false },
          { id: 'e4', source: 'c', target: 'd', weight: 3, isActive: false },
          { id: 'e5', source: 'd', target: 'e', weight: 4, isActive: false },
          { id: 'e6', source: 'e', target: 'f', weight: 2, isActive: false },
          { id: 'e7', source: 'f', target: 'g', weight: 6, isActive: false },
          { id: 'e8', source: 'g', target: 'a', weight: 7, isActive: false },
        ],
      },
    },
    {
      name: 'Dense Graph (10 nodes)',
      description: '10 nodes, highly connected for stress-testing.',
      isDirected: false,
      data: {
        nodes: [
          { id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }, { id: 'd', label: 'D' },
          { id: 'e', label: 'E' }, { id: 'f', label: 'F' }, { id: 'g', label: 'G' }, { id: 'h', label: 'H' },
          { id: 'i', label: 'I' }, { id: 'j', label: 'J' },
        ],
        edges: [
          { id: 'e1', source: 'a', target: 'b', isActive: false },
          { id: 'e2', source: 'a', target: 'c', isActive: false },
          { id: 'e3', source: 'a', target: 'd', isActive: false },
          { id: 'e4', source: 'b', target: 'c', isActive: false },
          { id: 'e5', source: 'b', target: 'e', isActive: false },
          { id: 'e6', source: 'c', target: 'f', isActive: false },
          { id: 'e7', source: 'd', target: 'g', isActive: false },
          { id: 'e8', source: 'e', target: 'h', isActive: false },
          { id: 'e9', source: 'f', target: 'i', isActive: false },
          { id: 'e10', source: 'g', target: 'j', isActive: false },
          { id: 'e11', source: 'h', target: 'i', isActive: false },
          { id: 'e12', source: 'i', target: 'j', isActive: false },
          { id: 'e13', source: 'j', target: 'a', isActive: false },
        ],
      },
    },
    {
      name: 'Bipartite Graph',
      description: 'Two sets, edges only between sets.',
      isDirected: false,
      data: {
        nodes: [
          { id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }, { id: 'd', label: 'D' },
          { id: '1', label: '1' }, { id: '2', label: '2' }, { id: '3', label: '3' }, { id: '4', label: '4' },
        ],
        edges: [
          { id: 'e1', source: 'a', target: '1', isActive: false },
          { id: 'e2', source: 'a', target: '2', isActive: false },
          { id: 'e3', source: 'b', target: '2', isActive: false },
          { id: 'e4', source: 'b', target: '3', isActive: false },
          { id: 'e5', source: 'c', target: '3', isActive: false },
          { id: 'e6', source: 'c', target: '4', isActive: false },
          { id: 'e7', source: 'd', target: '1', isActive: false },
          { id: 'e8', source: 'd', target: '4', isActive: false },
        ],
      },
    },
]
