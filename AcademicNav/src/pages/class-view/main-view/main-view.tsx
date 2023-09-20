import "react-tabs/style/react-tabs.css";
import './main-view.scss';
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import GraphView from "./graph-view/graph-view";
import BlockView from "./block-view/block-view";
import questionMark from '/public/images/question-mark.png';
import { useState } from "react";
import { useUser } from "../../../Providers/UserProv";
import CriticalPath from "./critical-path/critical-path";

interface ModalProps {
  onClose: () => void;
}

const Modal = ({ onClose }: ModalProps) => (
  <div className="modal">
    <div className="modal-content">
      <h3>Help</h3>
      <p>Simply drag and drop classes to the semester you wish to take them. If this is not allowed due to a prerequisite or credit hour restriction, you will be notified.</p>
      <ul>
        <li>
          <strong>Graph View:</strong> This tab provides a graphical representation of your schedule, allowing you to visualize prerequisite and post-requisite relationships.
        </li>
        <li>
          <strong>Block View:</strong> This tab displays your schedule in a block-like format, similar to a typical schedule layout.
        </li>
        <li>
          <strong>Critical Path:</strong> This tab displays a graphical view of classes which have pre-requisites to help guide you in placing classes on you schedule.
        </li>
        <li>
          <strong>Save Workspace:</strong> Click "Save Workspace" to save your current work so that you can work on it or refer to it later.
        </li>
        <li>
          <strong>Color Guide:</strong> Green: Completed class, Yellow: In progress, Blue: Future class
        </li>
      </ul>
      <button onClick={onClose}>Close</button>
    </div>
  </div>
);

const MainView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { classArray, setCreditHours, creditHours } = useUser();

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleCreditHoursChange = (event: any) => {
    const newCreditHours = Math.min(20, Math.max(1, event.target.value));
    if (newCreditHours > 0 && newCreditHours <= 20) {
      setCreditHours(newCreditHours);
    }
  };

  function saveWorkSpace() {
    const blob = new Blob([JSON.stringify(classArray, null, 2)], { type: 'application/json' });
    saveFile(blob);
  }

  const saveFile = async (blob: any) => {
    const a = document.createElement('a');
    a.download = 'my-schedule.json';
    a.href = URL.createObjectURL(blob);
    a.addEventListener('click', () => {
      setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
    });
    a.click();
  };

  return (
    <div>
      <div className="main-view">
        <div className="top-bar">
          <label htmlFor="creditHours">Credit Hours Per Semester:</label>
          <input
            type="number"
            id="creditHours"
            name="creditHours"
            min="1"
            max="20"
            className="input-field"
            value={creditHours}
            onChange={handleCreditHoursChange}
          />
          <button className="save" onClick={saveWorkSpace}>Save Work Space</button>
          <button className="help-button" onClick={openModal}>
            <img
              src={questionMark}
              alt="Help"
              className="question-mark-img"
            />
          </button>
        </div>
        <div className="right-tabs">
          <Tabs>
            <TabList>
              <Tab>Graph View</Tab>
              <Tab>Block View</Tab>
              <Tab>Critical Path</Tab>
            </TabList>
            <TabPanel>
              <GraphView />
            </TabPanel>
            <TabPanel>
              <BlockView />
            </TabPanel>
            <TabPanel>
              <CriticalPath />
            </TabPanel>
          </Tabs>
        </div>
      </div>
      {isModalOpen && <Modal onClose={closeModal} />}
    </div>
  );
}

export default MainView;