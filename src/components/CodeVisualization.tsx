import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Play } from "lucide-react";

interface CodeVisualizationProps {
  algorithm: string;
  codeLines: string[];
  currentLine: number;
  currentStep: string;
}

export const CodeVisualization = ({ 
  algorithm, 
  codeLines, 
  currentLine, 
  currentStep 
}: CodeVisualizationProps) => {
  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Algorithm Code
          <Badge variant="outline" className="ml-auto">
            {algorithm.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded text-sm">
            <Play className="h-4 w-4 text-primary" />
            <span>{currentStep}</span>
          </div>
          
          <div className="bg-black/20 rounded-lg p-4 font-mono text-sm overflow-x-auto">
            {codeLines.map((line, index) => (
              <div
                key={index}
                className={`py-1 px-2 rounded ${
                  index === currentLine - 1
                    ? 'bg-primary/20 border-l-2 border-primary text-primary-glow'
                    : 'text-muted-foreground'
                }`}
              >
                <span className="text-muted-foreground/50 mr-3 select-none">
                  {(index + 1).toString().padStart(2, '0')}
                </span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};