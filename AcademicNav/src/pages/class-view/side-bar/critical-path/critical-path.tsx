/*
    just like prototype. I don't know how we will handle reloading the main view or adjusting it if this is changed.
*/
import './critical-path.scss'
import React, { useCallback, useState } from 'react';
import { useStore } from 'reactflow';

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

const transformSelector = (state: { transform: any }) => state.transform;

const CriticalPath: React.FC<ClassListProps> = ({ nodes }) => {
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
    <div className="class-list">
      <h2>Classes Left to Take</h2>
      <p>(Drag classes over to desired position)</p>
      <ul>
        {nodes
          .filter(
            (node) =>
              !node.data.taken &&
              (node.data.isReadyToTake || node.data.prerequisitesTaken.length === 0)
          )
          .map((node) => (
            <li
              key={node.id}
              className={selectedNodes.includes(node.id) ? 'selected' : ''}
              onClick={() => toggleNodeSelection(node.id)}
            >
              {node.data.label}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default CriticalPath;