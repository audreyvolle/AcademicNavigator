import React, { useState } from 'react';
import 'reactflow/dist/style.css';
import './critical-path.scss';
import { useUser } from '../../../../Providers/UserProv';
import computerScienceBA from '/public/images/critical-path-images/computer-science-ba.svg';
import computerScienceBS from '/public/images/critical-path-images/computer-science-bs.svg';
import publicHealth from '/public/images/critical-path-images/public-health.svg';
import test from '/public/images/critical-path-images/test.svg';

interface ModalProps {
  onClose: () => void;
}

const Modal = ({ onClose }: ModalProps) => (
  <div className="modal">
    <div className="modal-content">
      <h3>Legend</h3>
      <ul>
        <li>
          <strong>Dotted lines: </strong>Represent OR relationships. This class OR that class should be taken to fullfill the requirement.
        </li>
        <li>
          <strong>Full lines: </strong>Represent AND relationships. This class AND that class should be taken to fullfill the requirement.
        </li>
      </ul>
      <button onClick={onClose}>Close</button>
    </div>
  </div>
);

// Add more SVG files as needed
const svgFiles = {
  'computer-science-ba': computerScienceBA,
  'computer-science-bs': computerScienceBS,
  'public-health': publicHealth,
  'test': test
};

const fullMajorNames = {
  'computer-science-ba': "Computer Science BA",
  'computer-science-bs': "Computer Science BS",
  'public-health': "Public Health",
  'test': "Test"
};

const CriticalPath = () => {
  const { major, setMajor } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  console.log(major);
  const majorName = fullMajorNames[major as keyof typeof fullMajorNames];

  const isInvalidMajor = !svgFiles.hasOwnProperty(major);

  function handleMajorDropdownChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const selectedValue = event.target.value;
    setMajor(selectedValue);
  }

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className='critical-path-container'>
      {isInvalidMajor ? (
        <div>
          <h1 className='critical-path-heading'>Select Your Major</h1>
          <select value={major} onChange={(e) => { handleMajorDropdownChange(e) }} className='major-dropdown'>
            <option value="computer-science-ba">Computer Science BA</option>
            <option value="computer-science-bs">Computer Science BS</option>
            <option value="public-health">Public Health</option>
          </select>
        </div>
      ) : (
        <div>
          <div className="heading-wrapper">
            <h1 className='critical-path-heading'>
              {majorName} Critical Path
            </h1>
            <button className="legend" onClick={openModal}>Legend</button>
          </div>
          <img
            className='critical-path-img'
            src={svgFiles[major as keyof typeof svgFiles]}
            alt={`SVG for ${major}`}
          />
        </div>
      )}
      {isModalOpen && <Modal onClose={closeModal} />}
    </div>
  );
};

export default CriticalPath;

