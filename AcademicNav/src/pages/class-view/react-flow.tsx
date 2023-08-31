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
import { useUser } from '../../Providers/UserProv';

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

let groupcount = 0;
const groupspacing = 150
const ProviderFlow = () => {
  const { classArray } = useUser();

  const spacing = 75;
  let count = 0;
  const nodes: ReactFlowNode[] | { id: string; position: { x: number; y: number; }; data: { label: string[]; }; } | undefined = [];

  classArray.forEach(function (value) {
    nodes.push({ id: value.id, position: { x: 0, y: count * spacing }, data: { label: value.title, taken: value.taken, isReadyToTake: value.isReadyToTake, prerequisitesTaken: value.prerequisitesTaken } });
    count++;
  });

  const [nodesState, setNodesState, onNodesStateChange] = useNodesState(nodes);
  //const [edgesState, setEdgesState, onEdgesStateChange] = useEdgesState(initialEdges);
  //const onConnect = useCallback((params: Edge | Connection) => setEdgesState((els) => addEdge(params, els)), []);


  return (
    <div className="providerflow">
      <ReactFlowProvider>
        <div className="reactflow-wrapper">
          <ReactFlow
            nodes={nodes}
            
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



/*
edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
*/