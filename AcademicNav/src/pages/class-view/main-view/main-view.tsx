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
      <p>Simply <strong>drag and drop</strong> classes to the semester you wish to take them. If this is not allowed due to a prerequisite or credit hour restriction, you will be notified. <strong>Double click</strong> to remove a class.</p>
      <ul>
        <li>
          <strong>Graph View:</strong> This tab provides a graphical representation of your schedule, allowing you to visualize prerequisite and post-requisite relationships. Double click a class to remove it.
        </li>
        <li>
          <strong>Block View:</strong> This tab displays your schedule in a block-like format, similar to a typical schedule layout. You are also able to print this page with the "Download Print View" button.
        </li>
        <li>
          <strong>Critical Path:</strong> This tab displays a graphical view of classes which have pre-requisites to help guide you in placing classes on you schedule.
        </li>
        <li>
          <strong>Save Workspace:</strong> Click "Save Workspace" to save your current work so that you can work on it or refer to it later.
        </li>
      </ul>
      <button onClick={onClose}>Close</button>
    </div>
  </div>
);

interface ModalPropsDR {
  onDRClose: () => void;
  selectedMajor: string;
}

const ModalDR = ({ onDRClose, selectedMajor }: ModalPropsDR) => {
  let content;

  // Determine content based on selected major
  if (selectedMajor === "computer-science-ba") {
    content = (
      <div>
        <h3>Computer Science BA Degree Requirements</h3>
        <ul>
          <li>
            <strong>CS: </strong>111, 140, 150, 234, 286, 314, 325, 330, 340, 360, 425, 447, 499
          </li>
          <li>
            <strong>MATH: </strong>150, 223 or 224
          </li>
          <li>
            <strong>STAT: </strong>224
          </li>
          <li>
            <strong>Two Computing Electives:</strong> CS 321, CS 382, CS 423, CS 434, CS 438, CS 454, CS 456, CS 482, CS 490, CS 495, MATH 465
          </li>
          <li>
            One two-semester foreign language sequence (101-102)
          </li>
          <li>
            One Minor (or Second Major)
          </li>
        </ul>
      </div>
    );
  } else if (selectedMajor === "computer-science-bs") {
    content = (
      <div>
        <h3>Computer Science BS Degree Requirements</h3>
        <ul>
          <li>
            <strong>CS: </strong>111, 140, 150, 234, 286, 314, 325, 330, 340, 360, 425, 447, 499
          </li>
          <li>
            <strong>MATH: </strong>150, 152, 223 or 224
          </li>
          <li>
            <strong>STAT: </strong>224 or 380
          </li>
          <li>
            <strong>One Laboratory Science Sequence: </strong>PHYS 141/151L & 142/152L or CHEM 121A/125A & 121B/125B or CHEM 131/135 & 121B/125B
          </li>
          <li>
            <strong>One Additional Science Lab Elective: </strong>BIOL 150, CHEM 121A/125A, CHEM 131/135, PHYS 141/151L, or PHYS 201/201L
          </li>
          <li>
            <strong>Two Math Electives: </strong>MATH 250, 321, or 423
          </li>
          <li>
            <strong>Five Computing Electives: </strong>CS 321, CS 382, CS 423, CS 434, CS 438, CS 454, CS 456, CS 482, CS 490, CS 495, ECE 381, ECE 482, ECE 483, or MATH 465
          </li>
        </ul>
      </div>
    );
  } else if (selectedMajor === "public-health") {
    content = (
      <div>
        <h3>Public Health Degree Requirements</h3>
        <ul>
          <li>
            <strong>PBHE: </strong>111, 305, 353, 363, 370, 375, 405, 410, 420, 455, 490, 491, 495, 498, 499
          </li>
          <li>
            <strong>Approved Major Electives </strong>15 or more hours from the following or from appropriate disciplines approved by the advisor:
          </li>
          <li>
            ACS 304, 311, 370
          </li>
          <li>
            ANTH 352, 366
          </li>
          <li>
            CJ 311, 420, 464
          </li>
          <li>
            GEOG 205, 404, 418, 454
          </li>
          <li>
            KIN 211
          </li>
          <li>
            MC 325, 452, 472
          </li>
          <li>
            NURS 234
          </li>
          <li>
            NUTR 250, 375
          </li>
          <li>
            PBHE 210, 213, 220, 230, 240, 462, 489
          </li>
          <li>
            PHIL 321
          </li>
          <li>
            POLS 320, 370
          </li>
          <li>
            PSYC 303
          </li>
          <li>
            SOC 309, 310, 383
          </li>
          <li>
            SOCW 386, 420, 454, 491
          </li>
        </ul>
      </div>
    );
  } else {
    content = <p>Select a major in the Critical Path tab to view degree requirements.</p>;
  }

  return (
    <div className="modal">
      <div className="modal-content">
        {content}
        <button onClick={onDRClose}>Close</button>
      </div>
    </div>
  );
};

const MainView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDRModalOpen, setIsDRModalOpen] = useState(false);
  const { classArray, setCreditHours, creditHours, major } = useUser();

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openDRModal = () => {
    setIsDRModalOpen(true);
  };

  const closeDRModal = () => {
    setIsDRModalOpen(false);
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
          <button className="save" onClick={openDRModal}>Degree Requirements</button>
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
      {isDRModalOpen && <ModalDR onDRClose={closeDRModal} selectedMajor={major} />}
    </div>
  );
}

export default MainView;