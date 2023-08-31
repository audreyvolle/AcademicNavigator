import "react-tabs/style/react-tabs.css";
import './main-view.scss';
import { ReactFlowProvider } from "reactflow";
import { useState } from "react";
import ProviderFlow from "../react-flow";
/*import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import GraphView from "./graph-view/graph-view";
import BlockView from "./block-view/block-view";
import ClassList from "../side-bar/class-list/class-list";
import CriticalPath from "../side-bar/critical-path/critical-path";
*/

function MainView() {
  const [nodes, setNodes] = useState([]); // Initialize with your desired initial nodes

  return (
    <div>
      <div className="main-view">
      <ReactFlowProvider>
          <ProviderFlow />
        </ReactFlowProvider>
      </div>
    </div>
  );
}

export default MainView;


/*<div className="right-tabs">
            <Tabs>
              <TabList>
                <Tab>Graph View</Tab>
                <Tab>Block View</Tab>
              </TabList>
              <TabPanel>
                <GraphView nodes={nodes} setNodes={setNodes} />
              </TabPanel>
              <TabPanel>
                <BlockView nodes={nodes} setNodes={setNodes} />
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
                <ClassList nodes={nodes} setNodes={setNodes} />
              </TabPanel>
              <TabPanel>
                <CriticalPath nodes={nodes} setNodes={setNodes} />
              </TabPanel>
            </Tabs>
          </div>*/




