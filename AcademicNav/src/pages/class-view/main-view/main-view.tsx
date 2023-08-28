import SideBar from "../side-bar/side-bar";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import './main-view.scss';
import GraphView from "./graph-view/graph-view";
import BlockView from "./block-view/block-view";

function MainView() {
  return (
    <div>
      <div>
        <hr />
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
{    /*  BUGGY  <SideBar />   */}
      </div>
    </div>
  );
}

export default MainView;




