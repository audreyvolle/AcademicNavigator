/*
    tab of both views
*/
import React from "react";
import Sidebar from "react-sidebar";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import CriticalPath from "./critical-path/critical-path";
import ClassList from "./class-list/class-list";
interface AppState {
    sidebarOpen: boolean;
}

class SideBar extends React.Component<{}, AppState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            sidebarOpen: true
        };
        this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
    }

    onSetSidebarOpen(open: boolean) {
        this.setState({ sidebarOpen: open });
    }

    render() {
        return (
            <Sidebar
                sidebar={<b>Sidebar content</b>}
                open={this.state.sidebarOpen}
                onSetOpen={this.onSetSidebarOpen}
                styles={{ sidebar: { background: "white" } }}
            >
                <button onClick={() => this.onSetSidebarOpen(true)}>
                    Open sidebar
                </button>
                <Tabs>
                    <TabList>
                        <Tab>Critical Path</Tab>
                        <Tab>Class List</Tab>
                    </TabList>
                    <TabPanel>
            <CriticalPath />
          </TabPanel>
          <TabPanel>
            <ClassList />
          </TabPanel>
        </Tabs>
            </Sidebar>
        );
    }
}

export default SideBar;