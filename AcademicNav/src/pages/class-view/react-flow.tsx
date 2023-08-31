import { useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Connection,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

import ClassList from './side-bar/class-list/class-list';
import CriticalPath from './side-bar/critical-path/critical-path';
import GraphView from './main-view/graph-view/graph-view';
import BlockView from './main-view/block-view/block-view';

const initialNodes = [
  {
    id: 'provider-1',
    type: 'input',
    data: {
      label: 'Node 1',
      taken: false, // Add the properties needed by ReactFlowNode
      isReadyToTake: true,
      prerequisitesTaken: [],
    },
    position: { x: 250, y: 5 },
  },
  // ... other nodes
];

const initialEdges = [
  {
    id: 'provider-e1-2',
    source: 'provider-1',
    target: 'provider-2',
    animated: true,
  },
  { id: 'provider-e1-3', source: 'provider-1', target: 'provider-3' },
];

const ProviderFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback((params: Edge | Connection) => setEdges((els) => addEdge(params, els)), []);

  return (
    <div className="providerflow">
      <ReactFlowProvider>
        <div className="reactflow-wrapper">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <Controls />
          </ReactFlow>
        </div>
        <div className="main-view">
          <div className="right-tabs">
            <Tabs>
              <TabList>
                <Tab>Graph View</Tab>
                <Tab>Block View</Tab>
              </TabList>
              <TabPanel>
                <GraphView nodes={nodes} />
              </TabPanel>
              <TabPanel>
                <BlockView nodes={nodes} />
              </TabPanel>
            </Tabs>
          </div>
          <div className="left-tabs">
            <Tabs>
              <TabList>
                <Tab>Class List</Tab>
                <Tab>Critical Path</Tab>
              </TabList>
              <TabPanel>
                <ClassList nodes={nodes} />
              </TabPanel>
              <TabPanel>
                <CriticalPath nodes={nodes} />
              </TabPanel>
            </Tabs>
          </div>
      </div>
      </ReactFlowProvider>
    </div>
  );
};

export default ProviderFlow;



