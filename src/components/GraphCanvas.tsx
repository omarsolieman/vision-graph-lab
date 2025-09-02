import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MousePointer2, Plus, Minus } from "lucide-react";
import { GraphNode, GraphEdge, GraphData } from "@/lib/graph-types";
import { useToast } from "@/hooks/use-toast";

type Tool = 'select' | 'add-node' | 'add-edge';

interface GraphCanvasProps {
  graphData: GraphData;
  setGraphData: React.Dispatch<React.SetStateAction<GraphData>>;
}

export const GraphCanvas = ({ graphData, setGraphData }: GraphCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('select');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isDrawingEdge, setIsDrawingEdge] = useState(false);
  const [edgeStart, setEdgeStart] = useState<string | null>(null);
  const [editingEdge, setEditingEdge] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState('');
  const { toast } = useToast();

  const canvasWidth = 1200;
  const canvasHeight = 800;
  const nodeRadius = 25;

  useEffect(() => {
    drawGraph();
  }, [graphData, selectedNode, hoveredNode]);

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'hsl(222 84% 4%)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw grid
    ctx.strokeStyle = 'hsl(217 32% 12%)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    
    for (let x = 0; x <= canvasWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
    
    for (let y = 0; y <= canvasHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }

    // Draw edges
    graphData.edges.forEach(edge => {
      const sourceNode = graphData.nodes.find(n => n.id === edge.source);
      const targetNode = graphData.nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        ctx.strokeStyle = edge.isActive ? 'hsl(48 96% 60%)' : 'hsl(210 40% 50%)';
        ctx.lineWidth = edge.isActive ? 3 : 2;
        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.stroke();

        // Draw weight if exists
        if (edge.weight !== undefined) {
          const midX = (sourceNode.x + targetNode.x) / 2;
          const midY = (sourceNode.y + targetNode.y) / 2;
          
          // Highlight if being edited
          const isEditing = editingEdge === edge.id;
          
          ctx.fillStyle = isEditing ? 'hsl(48 96% 60%)' : 'hsl(210 40% 98%)';
          ctx.fillRect(midX - 15, midY - 10, 30, 20);
          ctx.strokeStyle = isEditing ? 'hsl(48 96% 60%)' : 'hsl(217 32% 17%)';
          ctx.strokeRect(midX - 15, midY - 10, 30, 20);
          
          ctx.fillStyle = 'hsl(222 84% 5%)';
          ctx.font = isEditing ? 'bold 12px monospace' : '12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(edge.weight.toString(), midX, midY + 4);
        }
      }
    });

    // Draw nodes
    graphData.nodes.forEach(node => {
      let fillColor = 'hsl(198 93% 60%)'; // default
      
      if (node.state === 'visited') fillColor = 'hsl(142 76% 60%)';
      else if (node.state === 'current') fillColor = 'hsl(48 96% 60%)';
      else if (node.state === 'path') fillColor = 'hsl(262 83% 70%)';
      
      if (node.id === selectedNode) {
        // Draw selection ring
        ctx.strokeStyle = 'hsl(251 91% 70%)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius + 5, 0, 2 * Math.PI);
        ctx.stroke();
      }
      
      if (node.id === hoveredNode && tool === 'select') {
        // Draw hover effect
        ctx.strokeStyle = 'hsl(251 91% 60%)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius + 3, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Draw node
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = 'hsl(222 84% 5%)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw label
      ctx.fillStyle = 'hsl(222 84% 5%)';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + 5);
    });
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const findNodeAt = (x: number, y: number): GraphNode | null => {
    return graphData.nodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= nodeRadius;
    }) || null;
  };

  const findEdgeWeightAt = (x: number, y: number): GraphEdge | null => {
    for (const edge of graphData.edges) {
      if (edge.weight === undefined) continue;
      
      const sourceNode = graphData.nodes.find(n => n.id === edge.source);
      const targetNode = graphData.nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const midX = (sourceNode.x + targetNode.x) / 2;
        const midY = (sourceNode.y + targetNode.y) / 2;
        
        if (x >= midX - 15 && x <= midX + 15 && y >= midY - 10 && y <= midY + 10) {
          return edge;
        }
      }
    }
    return null;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    const clickedNode = findNodeAt(pos.x, pos.y);
    const clickedEdge = findEdgeWeightAt(pos.x, pos.y);

    // Handle edge weight editing
    if (tool === 'select' && clickedEdge && !clickedNode) {
      setEditingEdge(clickedEdge.id);
      setEditWeight(clickedEdge.weight?.toString() || '');
      return;
    }

    if (tool === 'add-node' && !clickedNode && !clickedEdge) {
      const newNode: GraphNode = {
        id: `node-${Date.now()}`,
        label: String.fromCharCode(65 + graphData.nodes.length),
        x: pos.x,
        y: pos.y,
        state: 'default'
      };
      
      setGraphData(prev => ({
        ...prev,
        nodes: [...prev.nodes, newNode]
      }));
      
      toast({
        title: "Node Added",
        description: `Added node ${newNode.label}`,
      });
    } else if (tool === 'add-edge' && clickedNode) {
      if (!isDrawingEdge) {
        setEdgeStart(clickedNode.id);
        setIsDrawingEdge(true);
        setSelectedNode(clickedNode.id);
      } else if (edgeStart && clickedNode.id !== edgeStart) {
        // Check if edge already exists
        const edgeExists = graphData.edges.some(edge => 
          (edge.source === edgeStart && edge.target === clickedNode.id) ||
          (edge.source === clickedNode.id && edge.target === edgeStart)
        );
        
        if (!edgeExists) {
          const newEdge: GraphEdge = {
            id: `edge-${Date.now()}`,
            source: edgeStart,
            target: clickedNode.id,
            weight: Math.floor(Math.random() * 10) + 1,
            isActive: false
          };
          
          setGraphData(prev => ({
            ...prev,
            edges: [...prev.edges, newEdge]
          }));
          
          toast({
            title: "Edge Added",
            description: `Connected nodes with weight ${newEdge.weight}`,
          });
        }
        
        setIsDrawingEdge(false);
        setEdgeStart(null);
        setSelectedNode(null);
      }
    } else if (tool === 'select') {
      setSelectedNode(clickedNode?.id || null);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'select') {
      const pos = getMousePos(e);
      const hoveredNode = findNodeAt(pos.x, pos.y);
      setHoveredNode(hoveredNode?.id || null);
    }
    
    // Clear editing state when clicking elsewhere
    if (editingEdge) {
      setEditingEdge(null);
    }
  };

  const handleWeightSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && editingEdge) {
      const weight = parseInt(editWeight);
      if (!isNaN(weight) && weight > 0) {
        setGraphData(prev => ({
          ...prev,
          edges: prev.edges.map(edge => 
            edge.id === editingEdge 
              ? { ...edge, weight }
              : edge
          )
        }));
        
        toast({
          title: "Weight Updated",
          description: `Edge weight set to ${weight}`,
        });
      }
      
      setEditingEdge(null);
      setEditWeight('');
    }
    
    if (e.key === 'Escape') {
      setEditingEdge(null);
      setEditWeight('');
    }
  };

  const clearGraph = () => {
    setGraphData({ nodes: [], edges: [] });
    setSelectedNode(null);
    setIsDrawingEdge(false);
    setEdgeStart(null);
    setEditingEdge(null);
    toast({
      title: "Graph Cleared",
      description: "All nodes and edges have been removed",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border bg-card/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={tool === 'select' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('select')}
            >
              <MousePointer2 className="h-4 w-4 mr-2" />
              Select
            </Button>
            <Button
              variant={tool === 'add-node' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('add-node')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Node
            </Button>
            <Button
              variant={tool === 'add-edge' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('add-edge')}
            >
              <Minus className="h-4 w-4 mr-2" />
              Add Edge
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              Nodes: {graphData.nodes.length}
            </Badge>
            <Badge variant="outline">
              Edges: {graphData.edges.length}
            </Badge>
            <Button variant="outline" size="sm" onClick={clearGraph}>
              Clear
            </Button>
          </div>
        </div>
        
        {isDrawingEdge && (
          <div className="mt-2 text-sm text-muted-foreground">
            Click on another node to create an edge
          </div>
        )}
        
        {editingEdge && (
          <div className="mt-2 text-sm text-muted-foreground">
            Editing edge weight - Press Enter to save, Escape to cancel
          </div>
        )}
      </div>
      
      <div className="flex-1 flex items-center justify-center bg-canvas-background relative">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="border border-border rounded-lg cursor-crosshair"
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
        />
        
        {editingEdge && (
          <div className="absolute top-4 left-4 z-10">
            <Input
              value={editWeight}
              onChange={(e) => setEditWeight(e.target.value)}
              onKeyDown={handleWeightSubmit}
              placeholder="Enter weight"
              className="w-32"
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );
};