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
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

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
const groupspacing = 150;
const ProviderFlow = () => {
  const { classArray } = useUser();

  const spacing = 75;
  let count = 0;
  const nodes: ReactFlowNode[] = [];
  const takenNodes: ReactFlowNode[] = [];
  const notTakenNodes: ReactFlowNode[] = [];

  classArray.forEach(function (value) {
    const node = {
      id: value.id,
      position: { x: 0, y: count * spacing },
      data: {
        label: value.title,
        taken: value.taken,
        isReadyToTake: value.isReadyToTake,
        prerequisitesTaken: value.prerequisitesTaken,
      },
    };

    nodes.push(node);

    if (value.taken) {
      takenNodes.push(node);
    } else {
      notTakenNodes.push(node);
    }

    count++;
  });

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };
    },
    []
  );

  const [nodesState, setNodesState, onNodesStateChange] = useNodesState(nodes);

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
                <GraphView nodes={takenNodes} onDrop={onDrop}/>
              </TabPanel>
              <TabPanel>
                <BlockView nodes={takenNodes} onDrop={onDrop}/>
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
                <ClassList nodes={notTakenNodes} onDrop={onDrop}/>
              </TabPanel>
              <TabPanel>
                <CriticalPath nodes={notTakenNodes} />
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