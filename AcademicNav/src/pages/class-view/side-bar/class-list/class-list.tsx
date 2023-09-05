import React, { useState } from 'react';
import ReactFlow, { useStore } from 'reactflow';

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
  //onDrop: (event: DragEvent<HTMLDivElement>) => void;
  //setNodes: React.Dispatch<React.SetStateAction<ReactFlowNode[]>>;
}

const transformSelector = (state: { transform: any }) => state.transform;

const ClassList: React.FC<ClassListProps> = ({ nodes }) => {
  const transform = useStore(transformSelector);

  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

  const toggleNodeSelection = (nodeId: string) => {
    setSelectedNodes((prevSelectedNodes) =>
      prevSelectedNodes.includes(nodeId)
        ? prevSelectedNodes.filter((id) => id !== nodeId)
        : [...prevSelectedNodes, nodeId]
    );
  };

  return (
    <div className="class-list" style={{ width: '20vw', height: '75vh' }}>
      <h2>Classes Left to Take</h2>
      <p>(Drag classes over to desired position)</p>
      <ReactFlow nodes={nodes}></ReactFlow>
    </div>
  );
};

export default ClassList;
