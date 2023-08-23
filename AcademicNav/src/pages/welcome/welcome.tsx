import React, { useState } from 'react';
import NewView from './new-view-input/new-view-input';
import './welcome.scss';
import majorAbbreviationKey from '../../assets/majorsAbrev';
import majorFullKey from '../../assets/majorsFull';
import Course from '../../assets/course';
//import { printToJson } from '../../services/handleJSON';

interface WelcomeProps {
  setSelectedValue:React.Dispatch<React.SetStateAction<string>>;
  selectedValue: string;
}



const Welcome = ({setSelectedValue,selectedValue}:WelcomeProps) => {
  let courseList: Course[];

  const handleLoadWorkspace = () => {
    
  };

  const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setSelectedValue(selectedValue);

    // Get the corresponding major abbreviation from the key
    const selectedMajorAbbreviation = majorAbbreviationKey[selectedValue];
    const majorFullName = majorFullKey[selectedValue];
    if (selectedMajorAbbreviation) {
      buildUrlForMajor(selectedMajorAbbreviation, majorFullName);
    }
  };
  
  function buildUrlForMajor(majorAbbreviation: string, majorFull: string) {
    const baseUrl = 'https://www.siue.edu/academics/undergraduate/courses/index.shtml';
    const reqBaseURL = 'https://www.siue.edu/academics/undergraduate/degrees-and-programs/';
    const reqTail = '/degree-requirements.shtml';
    const queryString = `?subject=${majorAbbreviation}`;
    const reqQueryString = `?${majorFull}`;
    const classListURL = baseUrl + queryString;
    const requirementsURL = reqBaseURL + reqQueryString + reqTail;

    //scrapeCourseList(classListURL);
    //scrapeDegreeRequirements(requirementsURL);
    //printToJson(courseList);
  }

  function scrapeCourseList(courseURL: string){
    /*scrape and populate the courseList array
    {

    }
    */
  }

  function scrapeDegreeRequirements(requirementURL: string){
    /*
      fill in the other fields of the courseList array
    */

  }

  return (
  <div className="welcome-container">
    <h1>Welcome to Academic Navigator</h1>
    <button type="button" onClick={handleLoadWorkspace}>
      Load Previous Work Space
    </button>
    <p>Select a Major to Get Started</p>
    <select value={selectedValue} onChange={handleDropdownChange}>
      <option value="">Select an option</option>
      <option value="computer-science-ba">Computer Science BA</option>
      <option value="computer-science-bs">Computer Science BS</option>
      <option value="public-health">Public Health</option>
    </select>
    </div>
  );
}

export default Welcome;