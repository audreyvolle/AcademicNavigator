import React, { useState } from 'react';
import NewView from './new-view-input/new-view-input';
import './welcome.scss';
import majorAbbreviationKey from '../../assets/majorsAbrev';
import majorFullKey from '../../assets/majorsFull';
import Course from '../../assets/course';
import { useUser } from '../../Providers/UserProv';
//import { printToJson } from '../../services/handleJSON';

const Welcome = () => {
  const { selectedValue, setSelectedValue, handleDropdownChange } = useUser();
  let courseList: Course[];

  const handleLoadWorkspace = () => { };

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
            <div className='load-container'>
              <p className='load-text'>Returning user? </p>
              <button type="button" onClick={handleLoadWorkspace} className='load-workspace'>
                LOAD
              </button>
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