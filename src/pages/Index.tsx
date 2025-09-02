import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraphCanvas } from "@/components/GraphCanvas";
import { AlgorithmControls, Algorithm } from "@/components/AlgorithmControls";
import { CodeVisualization } from "@/components/CodeVisualization";
import { getAlgorithmCode } from "@/lib/algorithms";
import { GraphData } from "@/lib/graph-types";
import { Play, Pause, RotateCcw, Zap } from "lucide-react";
import graphHero from "@/assets/graph-hero.jpg";

const Index = () => {
  const [isVisualizationMode, setIsVisualizationMode] = useState(false);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [showCodePanel, setShowCodePanel] = useState(true);
  const [codePanelWidth, setCodePanelWidth] = useState(400);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>('bfs');
  const [algorithmSteps, setAlgorithmSteps] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (isVisualizationMode) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">GraphViz</h1>
            </div>
            <Button 
              onClick={() => setIsVisualizationMode(false)}
              variant="outline"
            >
              Back to Home
            </Button>
          </div>
        </header>
        <div className="flex h-[calc(100vh-73px)]">
          <aside className="w-80 border-r border-border bg-card/50 p-4">
            <AlgorithmControls
              graphData={graphData}
              setGraphData={setGraphData}
              selectedAlgorithm={selectedAlgorithm}
              setSelectedAlgorithm={setSelectedAlgorithm}
              algorithmSteps={algorithmSteps}
              setAlgorithmSteps={setAlgorithmSteps}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
            />
          </aside>
          <main className="flex-1 flex">
            <div className="flex-1">
              <GraphCanvas graphData={graphData} setGraphData={setGraphData} />
            </div>
            {/* Code Panel */}
            {showCodePanel && (
              <div
                className="relative bg-background border-l border-border h-full flex flex-col transition-all duration-300"
                style={{ width: codePanelWidth, minWidth: 320, maxWidth: 600 }}
              >
                <button
                  className="absolute top-2 left-2 z-10 bg-card/80 rounded px-2 py-1 text-xs border border-border hover:bg-primary/10"
                  onClick={() => setShowCodePanel(false)}
                  title="Close code panel"
                >
                  Close
                </button>
                {/* You would pass real props here from AlgorithmControls */}
                <CodeVisualization
                  algorithm={selectedAlgorithm}
                  codeLines={getAlgorithmCode(selectedAlgorithm)}
                  currentLine={algorithmSteps[currentStep]?.codeLine || 0}
                  currentStep={algorithmSteps[currentStep]?.description || 'Ready to start'}
                />
              </div>
            )}
            {!showCodePanel && (
              <button
                className="absolute top-4 right-4 z-20 bg-card/80 rounded px-2 py-1 text-xs border border-border hover:bg-primary/10"
                onClick={() => setShowCodePanel(true)}
                title="Expand code panel"
              >
                Show Code
              </button>
            )}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Zap className="h-12 w-12 text-primary" />
              <h1 className="text-6xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                GraphViz
              </h1>
            </div>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Visualize and understand graph algorithms through interactive animations. 
              Draw graphs, run algorithms, and see how they work step by step.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                variant="hero" 
                size="xl"
                onClick={() => setIsVisualizationMode(true)}
              >
                <Play className="mr-2 h-5 w-5" />
                Start Visualizing
              </Button>
              <Button variant="outline" size="xl">
                Learn More
              </Button>
            </div>
          </div>
          
          {/* Background Decoration */}
          <div className="absolute inset-0">
            <img 
              src={graphHero} 
              alt="Graph visualization background" 
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Supported Algorithms
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-card border-border/50 hover:border-primary/20 transition-colors">
              <CardHeader>
                <CardTitle className="text-accent">Graph Traversal</CardTitle>
                <CardDescription>
                  Explore graph structures systematically
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Breadth-First Search (BFS)</li>
                  <li>• Depth-First Search (DFS)</li>
                  <li>• Topological Sort</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50 hover:border-primary/20 transition-colors">
              <CardHeader>
                <CardTitle className="text-accent">Shortest Path</CardTitle>
                <CardDescription>
                  Find optimal routes between nodes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Dijkstra's Algorithm</li>
                  <li>• Bellman-Ford Algorithm</li>
                  <li>• Floyd-Warshall</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50 hover:border-primary/20 transition-colors">
              <CardHeader>
                <CardTitle className="text-accent">Minimum Spanning Tree</CardTitle>
                <CardDescription>
                  Connect all nodes with minimum cost
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Prim's Algorithm</li>
                  <li>• Kruskal's Algorithm</li>
                  <li>• Borůvka's Algorithm</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;