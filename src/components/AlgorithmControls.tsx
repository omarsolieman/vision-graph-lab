import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, RotateCcw, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GraphData, AlgorithmStep } from "@/lib/graph-types";
import { AlgorithmRunner, getAlgorithmCode } from "@/lib/algorithms";
import { graphTemplates } from "@/lib/graph-templates";
import { CodeVisualization } from "./CodeVisualization";


export type Algorithm = 'bfs' | 'dfs' | 'dijkstra' | 'bellman-ford' | 'prim' | 'kruskal' | 'floyd-warshall';
export type ExecutionState = 'idle' | 'running' | 'paused' | 'completed';

interface AlgorithmControlsProps {
  graphData: GraphData;
  setGraphData: React.Dispatch<React.SetStateAction<GraphData>>;
  selectedAlgorithm: Algorithm;
  setSelectedAlgorithm: (algo: Algorithm) => void;
  algorithmSteps: AlgorithmStep[];
  setAlgorithmSteps: (steps: AlgorithmStep[]) => void;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  setAlgorithmExecution?: (exec: any) => void;
  isDirected: boolean;
  setIsDirected: React.Dispatch<React.SetStateAction<boolean>>;
}

const algorithms = {
  'bfs': 'Breadth-First Search',
  'dfs': 'Depth-First Search', 
  'dijkstra': 'Dijkstra\'s Algorithm',
  'bellman-ford': 'Bellman-Ford Algorithm',
  'prim': 'Prim\'s Algorithm (MST)',
  'kruskal': 'Kruskal\'s Algorithm (MST)',
  'floyd-warshall': 'Floyd-Warshall Algorithm (All-Pairs Shortest Path)'
};

export const AlgorithmControls = ({
  graphData,
  setGraphData,
  selectedAlgorithm,
  setSelectedAlgorithm,
  algorithmSteps,
  setAlgorithmSteps,
  currentStep,
  setCurrentStep,
  setAlgorithmExecution,
  isDirected,
  setIsDirected
}: AlgorithmControlsProps) => {
  const [executionState, setExecutionState] = useState<ExecutionState>('idle');
  const [speed, setSpeed] = useState([50]);
  const [stepMode, setStepMode] = useState(false); // step-through toggle
  const [startNode, setStartNode] = useState<string>('');
  const [endNode, setEndNode] = useState<string>('');
  const [totalSteps, setTotalSteps] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const resetGraphState = () => {
    setGraphData({
      ...graphData,
      nodes: graphData.nodes.map(node => ({ ...node, state: 'default', distance: undefined })),
      edges: graphData.edges.map(edge => ({ ...edge, isActive: false }))
    });
  };

  const applyStep = (step: AlgorithmStep) => {
    setGraphData(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => {
        const update = step.nodeUpdates?.find(u => u.id === node.id);
        return update ? { ...node, ...update } : node;
      }),
      edges: prev.edges.map(edge => {
        const update = step.edgeUpdates?.find(u => u.id === edge.id);
        return update ? { ...edge, ...update } : edge;
      })
    }));
  };

  const handlePlay = async () => {
    if (stepMode) return; // Don't auto-play in step mode
    if (!selectedAlgorithm) {
      toast({
        title: "No Algorithm Selected",
        description: "Please select an algorithm to visualize",
        variant: "destructive"
      });
      return;
    }

    if (graphData.nodes.length === 0) {
      toast({
        title: "Empty Graph",
        description: "Please add some nodes to visualize",
        variant: "destructive"
      });
      return;
    }

    if (executionState === 'idle' || executionState === 'completed') {
      resetGraphState();
      
      const runner = new AlgorithmRunner(graphData);
      let execution;
      
      try {
        if (selectedAlgorithm === 'bfs') {
          const start = startNode || graphData.nodes[0].id;
          execution = await runner.runBFS(start);
        } else if (selectedAlgorithm === 'dijkstra') {
          const start = startNode || graphData.nodes[0].id;
          execution = await runner.runDijkstra(start);
        } else if (selectedAlgorithm === 'prim') {
          const start = startNode || graphData.nodes[0].id;
          execution = await runner.runPrims(start);
        } else if (selectedAlgorithm === 'kruskal') {
          execution = await runner.runKruskals();
        } else if (selectedAlgorithm === 'bellman-ford') {
          const start = startNode || graphData.nodes[0].id;
          execution = await runner.runBellmanFord(start);

        } else if (selectedAlgorithm === 'floyd-warshall') {
          execution = await runner.runFloydWarshall();
        } else {
          toast({
            title: "Algorithm Not Implemented",
            description: `${algorithms[selectedAlgorithm]} is coming soon!`,
            variant: "destructive"
          });
          return;
        }

  setAlgorithmSteps(execution.steps);
  setTotalSteps(execution.steps.length);
  setCurrentStep(0);
  setExecutionState('running');
  if (typeof setAlgorithmExecution === 'function') setAlgorithmExecution(execution);
        
        toast({
          title: "Algorithm Started",
          description: `Running ${algorithms[selectedAlgorithm]}`,
        });

        // Start step-by-step execution
        const stepInterval = setInterval(() => {
          setCurrentStep(prev => {
            const nextStep = prev + 1;
            
            if (nextStep < execution.steps.length) {
              applyStep(execution.steps[nextStep]);
              return nextStep;
            } else {
              setExecutionState('completed');
              clearInterval(stepInterval);
              setIntervalId(null);
              return prev;
            }
          });
        }, Math.max(100, 2000 - (speed[0] * 19)));
        
        setIntervalId(stepInterval);
        
      } catch (error) {
        toast({
          title: "Algorithm Error",
          description: "Failed to run algorithm",
          variant: "destructive"
        });
      }
    } else if (executionState === 'paused') {
      setExecutionState('running');
      
      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          const nextStep = prev + 1;
          
          if (nextStep < algorithmSteps.length) {
            applyStep(algorithmSteps[nextStep]);
            return nextStep;
          } else {
            setExecutionState('completed');
            clearInterval(stepInterval);
            setIntervalId(null);
            return prev;
          }
        });
      }, Math.max(100, 2000 - (speed[0] * 19)));
      
      setIntervalId(stepInterval);
    }
  };

  const handlePause = () => {
    if (stepMode) return;
    if (executionState === 'running' && intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
      setExecutionState('paused');
    }
  };

  const handleStop = () => {
    if (stepMode) return;
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setExecutionState('idle');
    setCurrentStep(0);
    setTotalSteps(0);
    setAlgorithmSteps([]);
    resetGraphState();
  };

  const handleReset = () => {
    if (stepMode) return;
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setExecutionState('idle');
    setCurrentStep(0);
    setTotalSteps(0);
    setAlgorithmSteps([]);
    setStartNode('');
    setEndNode('');
    resetGraphState();
  };

  // Update interval speed when speed changes
  useEffect(() => {
    if (intervalId && executionState === 'running') {
      clearInterval(intervalId);
      
      const newInterval = setInterval(() => {
        setCurrentStep(prev => {
          const nextStep = prev + 1;
          
          if (nextStep < algorithmSteps.length) {
            applyStep(algorithmSteps[nextStep]);
            return nextStep;
          } else {
            setExecutionState('completed');
            clearInterval(newInterval);
            setIntervalId(null);
            return prev;
          }
        });
      }, Math.max(100, 2000 - (speed[0] * 19)));
      
      setIntervalId(newInterval);
    }
  }, [speed]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const getAlgorithmDescription = (algorithm: Algorithm) => {
    const descriptions = {
      'bfs': 'Explores nodes level by level, guaranteeing shortest path in unweighted graphs.',
      'dfs': 'Explores as far as possible along each branch before backtracking.',
      'dijkstra': 'Finds shortest paths from source to all vertices in weighted graphs with non-negative weights.',
      'bellman-ford': 'Finds shortest paths and detects negative cycles in weighted graphs.',
      'prim': 'Builds minimum spanning tree by adding minimum weight edges.',
      'kruskal': 'Builds minimum spanning tree by sorting edges and avoiding cycles.'
    };
    return descriptions[algorithm];
  };

  const needsStartNode = ['bfs', 'dfs', 'dijkstra', 'bellman-ford', 'prim'].includes(selectedAlgorithm);
  const needsEndNode = ['dijkstra', 'bellman-ford'].includes(selectedAlgorithm);

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Graph & Algorithm Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template Graph Selector */}
          <div>
            <label className="text-sm font-medium mb-2 block">Choose Template Graph</label>
            <Select onValueChange={val => {
              const template = graphTemplates.find(t => t.name === val);
              if (template) {
                // Assign default positions if missing
                const N = template.data.nodes.length;
                const centerX = 600, centerY = 400, radius = 250;
                const nodesWithPos = template.data.nodes.map((node, i) =>
                  (node.x !== undefined && node.y !== undefined)
                    ? node
                    : {
                        ...node,
                        x: centerX + radius * Math.cos((2 * Math.PI * i) / N),
                        y: centerY + radius * Math.sin((2 * Math.PI * i) / N)
                      }
                );
                setGraphData({
                  nodes: nodesWithPos,
                  edges: template.data.edges.map(e => ({ ...e }))
                });
                if (typeof setIsDirected === 'function' && typeof template.isDirected === 'boolean') {
                  setIsDirected(template.isDirected);
                }
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template graph (optional)" />
              </SelectTrigger>
              <SelectContent>
                {graphTemplates.map(t => (
                  <SelectItem key={t.name} value={t.name}>
                    {t.name} {t.description ? `- ${t.description}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Choose Algorithm</label>
            <Select value={selectedAlgorithm} onValueChange={(value) => setSelectedAlgorithm(value as Algorithm)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(algorithms).map(([key, name]) => (
                  <SelectItem key={key} value={key}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
            {getAlgorithmDescription(selectedAlgorithm)}
          </div>

          {needsStartNode && graphData.nodes.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Start Node</label>
              <Select value={startNode} onValueChange={setStartNode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select start node" />
                </SelectTrigger>
                <SelectContent>
                  {graphData.nodes.map(node => (
                    <SelectItem key={node.id} value={node.id}>
                      Node {node.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {needsEndNode && graphData.nodes.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">End Node</label>
              <Select value={endNode} onValueChange={setEndNode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select end node" />
                </SelectTrigger>
                <SelectContent>
                  {graphData.nodes.map(node => (
                    <SelectItem key={node.id} value={node.id}>
                      Node {node.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Visualization Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-1">
              <span className="font-medium text-xs">Step-through</span>
              <button
                type="button"
                className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none ${stepMode ? 'bg-primary' : 'bg-muted'}`}
                onClick={() => setStepMode(v => !v)}
                aria-pressed={stepMode}
                tabIndex={0}
              >
                <span
                  className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-background shadow transition-transform duration-200 ${stepMode ? 'translate-x-4' : ''}`}
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
                />
              </button>
            </div>
            <div className="flex gap-2 items-center">
              {stepMode ? (
                <>
                  {algorithmSteps.length === 0 ? (
                    <Button
                      variant="algorithm"
                      size="sm"
                      onClick={async () => {
                        // Generate steps as in handlePlay, but don't auto-play
                        if (!selectedAlgorithm || graphData.nodes.length === 0) return;
                        resetGraphState();
                        const runner = new AlgorithmRunner(graphData);
                        let execution;
                        try {
                          if (selectedAlgorithm === 'bfs') {
                            const start = startNode || graphData.nodes[0].id;
                            execution = await runner.runBFS(start);
                          } else if (selectedAlgorithm === 'dijkstra') {
                            const start = startNode || graphData.nodes[0].id;
                            execution = await runner.runDijkstra(start);
                          } else if (selectedAlgorithm === 'prim') {
                            const start = startNode || graphData.nodes[0].id;
                            execution = await runner.runPrims(start);
                          } else if (selectedAlgorithm === 'kruskal') {
                            execution = await runner.runKruskals();
                          } else if (selectedAlgorithm === 'bellman-ford') {
                            const start = startNode || graphData.nodes[0].id;
                            execution = await runner.runBellmanFord(start);
                          } else {
                            toast({ title: "Algorithm Not Implemented", description: `${algorithms[selectedAlgorithm]} is coming soon!`, variant: "destructive" });
                            return;
                          }
                          setAlgorithmSteps(execution.steps);
                          setTotalSteps(execution.steps.length);
                          setCurrentStep(0);
                          if (execution.steps.length > 0) applyStep(execution.steps[0]);
                          if (typeof setAlgorithmExecution === 'function') setAlgorithmExecution(execution);
                        } catch (error) {
                          toast({ title: "Algorithm Error", description: "Failed to run algorithm", variant: "destructive" });
                        }
                      }}
                      disabled={graphData.nodes.length === 0 || !selectedAlgorithm}
                      title="Start Step-Through"
                    >
                      <Play className="h-4 w-4" /> Start
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="algorithm"
                        size="sm"
                        onClick={() => {
                          setCurrentStep(0);
                          if (algorithmSteps.length > 0) applyStep(algorithmSteps[0]);
                        }}
                        disabled={currentStep === 0}
                        title="Go to First Step"
                      >
                        <Square className="h-4 w-4 rotate-45" />
                      </Button>
                      <Button
                        variant="algorithm"
                        size="sm"
                        onClick={() => {
                          if (currentStep > 0) {
                            setCurrentStep(currentStep - 1);
                            applyStep(algorithmSteps[currentStep - 1]);
                          }
                        }}
                        disabled={currentStep === 0}
                        title="Previous Step"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="algorithm"
                        size="sm"
                        onClick={() => {
                          if (currentStep < algorithmSteps.length - 1) {
                            setCurrentStep(currentStep + 1);
                            applyStep(algorithmSteps[currentStep + 1]);
                          }
                        }}
                        disabled={currentStep >= algorithmSteps.length - 1}
                        title="Next Step"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="algorithm"
                        size="sm"
                        onClick={() => {
                          setCurrentStep(algorithmSteps.length - 1);
                          if (algorithmSteps.length > 0) applyStep(algorithmSteps[algorithmSteps.length - 1]);
                        }}
                        disabled={currentStep === algorithmSteps.length - 1}
                        title="Go to Last Step"
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Button 
                    variant="algorithm" 
                    size="sm" 
                    onClick={handlePlay}
                    disabled={executionState === 'running'}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="algorithm" 
                    size="sm" 
                    onClick={handlePause}
                    disabled={executionState !== 'running'}
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="algorithm" 
                    size="sm" 
                    onClick={handleStop}
                    disabled={executionState === 'idle'}
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="algorithm" 
                    size="sm" 
                    onClick={handleReset}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Speed: {speed[0]}%</label>
              <Slider
                value={speed}
                onValueChange={setSpeed}
                max={100}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            {executionState !== 'idle' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{currentStep}/{totalSteps}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Execution Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">State:</span>
            <Badge 
              variant={executionState === 'running' ? 'default' : 'outline'}
              className="capitalize"
            >
              {executionState}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Legend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-node-default" />
            <span className="text-sm">Unvisited Node</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-node-current" />
            <span className="text-sm">Current Node</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-node-visited" />
            <span className="text-sm">Visited Node</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-node-path" />
            <span className="text-sm">Path Node</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-0.5 bg-edge-active" />
            <span className="text-sm">Active Edge</span>
          </div>
        </CardContent>
      </Card>

  {/* CodeVisualization removed: now rendered in Index.tsx only */}
    </div>
  );
};