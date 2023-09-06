import "react-tabs/style/react-tabs.css";
import './main-view.scss';
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import GraphView from "./graph-view/graph-view";
import BlockView from "./block-view/block-view";

interface ClassList {
  id: string,
  title: string,
  credits: number,
  prerequisites: Array<string>,
  prerequisitesTaken: Array<string>,
  isReadyToTake: boolean,
  taken: boolean
}

interface SideBarProps {
  classArray: ClassList[];
}

const MainView = ({ classArray }: SideBarProps) => {
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
              <GraphView classArray={classArray}/>
            </TabPanel>
            <TabPanel>
              <BlockView classArray={classArray}/>
            </TabPanel>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default MainView;




