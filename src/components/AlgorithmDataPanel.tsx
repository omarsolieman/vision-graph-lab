import React from "react";

interface AlgorithmDataPanelProps {
  data?: Record<string, any>;
}

export const AlgorithmDataPanel: React.FC<AlgorithmDataPanelProps> = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-card/60 border border-border rounded-lg p-4 text-muted-foreground text-sm mt-4">
        No algorithm data to display.
      </div>
    );
  }

  return (
    <div className="bg-card/60 border border-border rounded-lg p-4 mt-4">
      <h3 className="font-bold mb-2 text-lg">Algorithm Data Structures</h3>
      <div className="space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key}>
            <span className="font-semibold capitalize">{key}:</span>{" "}
            <span className="font-mono bg-muted/40 px-2 py-1 rounded">
              {Array.isArray(value) ? value.join(", ") : JSON.stringify(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
