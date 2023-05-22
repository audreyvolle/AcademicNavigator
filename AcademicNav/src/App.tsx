import { useState } from 'react'
import Update from '@/components/update'
import logoVite from './assets/logo-vite.svg'
import logoElectron from './assets/logo-electron.svg'
import SlidingPanel from 'react-sliding-side-panel';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import './App.scss'

console.log('[App.tsx]', `Hello world from Electron ${process.versions.electron}!`)

function App() {
  const [count, setCount] = useState(0)
  const [openPanel, setOpenPanel] = useState(false);
  return (
    <div className='App'>
      <div>

        <Tabs>
          <TabList>
            <Tab>Graph View</Tab>
            <Tab>Block View</Tab>
          </TabList>

          <TabPanel>
            <h2>graph</h2>
          </TabPanel>
          <TabPanel>
            <h2>blocks</h2>
          </TabPanel>
        </Tabs>
        <button onClick={() => setOpenPanel(true)}>Open</button>
      </div>
      <SlidingPanel
        type={'left'}
        isOpen={openPanel}
        size={20}
      >
        <div>
          <div>My Panel Content</div>
          <Tabs>
            <TabList>
              <Tab>Core Path</Tab>
              <Tab>Class List</Tab>
            </TabList>

            <TabPanel>
              <h2>Edit Core Path</h2>
            </TabPanel>
            <TabPanel>
              <h2>List of all classes</h2>
            </TabPanel>
          </Tabs>
          <button onClick={() => setOpenPanel(false)}>close</button>
        </div>
      </SlidingPanel>
      {/*<Update />*/}
    </div>
  )
}

export default App
