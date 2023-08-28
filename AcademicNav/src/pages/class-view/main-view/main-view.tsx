import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import './main-view.scss';
import GraphView from "./graph-view/graph-view";
import BlockView from "./block-view/block-view";
import ClassList from "../side-bar/class-list/class-list";
import CriticalPath from "../side-bar/critical-path/critical-path";

function MainView() {
  return (
    <div>
      <div className="main-view">
        <div className="right-tabs">
          <Tabs>
            <TabList>
              <Tab>Graph View</Tab>
              <Tab>Block View</Tab>
            </TabList>

            <TabPanel>
              <GraphView />
            </TabPanel>
            <TabPanel>
              <BlockView />
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
              <ClassList />
            </TabPanel>
            <TabPanel>
              <CriticalPath />
            </TabPanel>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default MainView;




