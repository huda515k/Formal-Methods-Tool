interface Node {
  id: number;
  label: string;
}

interface Edge {
  from: number;
  to: number;
  label?: string;
}

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

interface SimpleGraphProps {
  data: GraphData;
}

const SimpleGraph = ({ data }: SimpleGraphProps) => {
  if (!data || !data.nodes || !data.edges) {
    return <div className="text-slate-500">No graph data available</div>;
  }
  
  return (
    <div className="p-2">
      <div className="mb-4">
        <h4 className="text-sm font-medium text-slate-700 mb-2">Nodes:</h4>
        <ul className="ml-4 space-y-1">
          {data.nodes.map((node) => (
            <li key={node.id} className="flex items-center">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-medium mr-2">
                {node.id}
              </span>
              <span className="text-slate-700 font-mono text-xs">{node.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-2">Edges:</h4>
        <ul className="ml-4 space-y-1">
          {data.edges.map((edge, idx) => (
            <li key={idx} className="flex items-center">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-medium mr-2">
                {edge.from}
              </span>
              <span className="text-slate-500 mx-1">→</span>
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-medium mr-2">
                {edge.to}
              </span>
              {edge.label && (
                <span className="ml-2 px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-xs">
                  {edge.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SimpleGraph;