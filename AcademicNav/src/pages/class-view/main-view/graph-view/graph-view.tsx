import './graph-view.scss'
import { ReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import React from 'react';

interface ReactFlowNode {
  id: string;
  data: {
    label: string;
    taken: boolean;
    isReadyToTake: boolean;
    prerequisitesTaken: string[];
  };
  position: { x: number; y: number };
}

interface ClassListProps {
  nodes: ReactFlowNode[];
  //setNodes: React.Dispatch<React.SetStateAction<ReactFlowNode[]>>;
}


const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];
const GraphView: React.FC<ClassListProps> = ({ nodes }) => {
  return (
    <div>
        <p>graph view</p>
        <div style={{ width: '66vw', height: '75vh' }}>
          <ReactFlow nodes={nodes} edges={initialEdges} />
        </div>
    </div>
  );
};
  
export default GraphView;