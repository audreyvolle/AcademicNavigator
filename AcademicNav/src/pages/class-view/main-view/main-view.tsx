import "react-tabs/style/react-tabs.css";
import './main-view.scss';
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import GraphView from "./graph-view/graph-view";
import BlockView from "./block-view/block-view";

const MainView = () => {
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
      </div>
    </div>
  );
}

export default MainView;




