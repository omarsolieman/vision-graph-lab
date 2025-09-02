export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  state: 'default' | 'visited' | 'current' | 'path' | 'error';
  distance?: number;
  parent?: string;
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
  codeLine: number;
  nodeUpdates?: Partial<GraphNode>[];
  edgeUpdates?: Partial<GraphEdge>[];
  highlightNodes?: string[];
  highlightEdges?: string[];
}

export interface AlgorithmResult {
  steps: AlgorithmStep[];
  finalState: GraphData;
  pathFound?: boolean;
  totalDistance?: number;
  mstWeight?: number;
}