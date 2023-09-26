import NewView from './new-view-input/new-view-input';
import './welcome.scss';
import { useUser } from '../../Providers/UserProv';
import { useEffect } from 'react';

const Welcome = () => {
  const { major, handleDropdownChange, setClassArray, classArray, setIsMainViewVisible } = useUser();

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
          setIsMainViewVisible(true);
        } catch (error) {
          console.error("Error parsing the file content as JSON:", error);
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  return (
    <>
      {major === "" ? <div className="welcome-container">
        <div className="main-container">
          <div className="left-panel">
            <p>Select a Major to Get Started</p>
            <select value={major} onChange={(e) => { handleDropdownChange(e) }} className='major-dropdown'>
              <option value="">Select your degree option</option>
              <option value="computer-science-ba">Computer Science BA</option>
              <option value="computer-science-bs">Computer Science BS</option>
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
      </div> : <NewView />
      }
    </>
  );
}

export default Welcome;