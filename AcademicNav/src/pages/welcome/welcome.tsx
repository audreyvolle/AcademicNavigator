import NewView from './new-view-input/new-view-input';
import './welcome.scss';
import { useUser } from '../../Providers/UserProv';
import { useEffect, useState } from 'react';

interface ModalProps {
  onClose: () => void;
}

const Modal = ({ onClose }: ModalProps) => (
  <div className="modal">
    <div className="modal-content">
      <h3>Work Spaces</h3>
      
      <button onClick={onClose}>Close</button>
    </div>
  </div>
);

const Welcome = () => {
  const { selectedValue, setSelectedValue, handleDropdownChange, setClassArray, classArray } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLoadWorkspace = () => {
    const fileInput = document.getElementById('fileInput');
    fileInput?.click();
  };

  useEffect(() => {
    console.log(classArray);
  }, [classArray]);

  const handleFileUpload = (e: any) => {
    console.log(classArray);
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const fileContent = event.target?.result as string;

        try {
          const parsedContent = JSON.parse(fileContent);
          setClassArray(parsedContent);
        } catch (error) {
          console.error("Error parsing the file content as JSON:", error);
        }
      };

      reader.readAsText(selectedFile);
    }
  };
  

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {selectedValue === "" ? <div className="welcome-container">
        <div className="main-container">
          <div className="left-panel">
            <p>Select a Major to Get Started</p>
            <select value={selectedValue} onChange={(e) => { handleDropdownChange(e) }} className='major-dropdown'>
              <option value="">Select your degree option</option>
              <option value="computer-science-ba">Computer Science BA</option>
              <option value="computer-science-bs">Computer Science BS</option>
              <option value="public-health">Public Health</option>
            </select>
            <hr></hr>
             <div className="load-container">
                <p className="load-text">Returning user? </p>
                <button
                  type="button"
                  onClick={handleLoadWorkspace}
                  className="load-workspace"
                >
                  LOAD
                </button>
                <input
                  type="file"
                  id="fileInput"
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </div>
          </div>
          <div className="vertical-line"></div>
          <div className="right-panel">
            <div className="welcome">
              <h1>Academic Navigator</h1>
              <p>Welcome! Select your major from the drop down to generate a schedule, or click LOAD to modify an existing schedule.</p>
            </div>
          </div>
        </div>
        {isModalOpen && <Modal onClose={closeModal} />}
      </div> : <NewView />
      }
    </>
  );
}

export default Welcome;