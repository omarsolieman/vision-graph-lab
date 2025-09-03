export interface GraphNode {
  id: string;
  label: string;
  x?: number;
  y?: number;
  state?: 'default' | 'current' | 'visited' | 'error';
  distance?: number; // For shortest path algorithms
}
export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight?: number;
  isActive: boolean;
  isInMST?: boolean;
  inTree?: boolean;
  isError?: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface AlgorithmStep {
  id: number;
  description: string;
  codeLine?: number;
  nodeUpdates: Partial<GraphNode>[];
  edgeUpdates: Partial<GraphEdge>[];
  queue?: string[];
  stack?: string[];
  result?: string[];
  matrix?: Record<string, any>; // For distance tables, gScore/fScore, etc.
  list?: string[]; // For MST visited nodes, etc.
  array?: string[]; // For edge arrays, etc.
}

export interface AlgorithmResult {
  steps: AlgorithmStep[];
  finalState: GraphData;
  pathFound?: boolean;
  totalDistance?: number;
  mstWeight?: number;
}