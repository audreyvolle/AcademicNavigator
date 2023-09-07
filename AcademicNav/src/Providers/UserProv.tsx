import { createContext, ReactNode, useContext, useState } from "react";
import majorAbbreviationKey from '../assets/majorsAbrev';
import majorFullKey from '../assets/majorsFull';
import classData from '../data/scraped/test.json';
import ClassList from "../pages/class-view/side-bar/class-list/class-list";

//Think about it's a global state value. 
//Add everything in exportValue
//Set up the initial state
interface ClassList {
  id: string,
  title: string,
  credits: number,
  prerequisites: Array<string>,
  prerequisitesTaken: Array<string>,
  isReadyToTake: boolean,
  taken: boolean
}
const classArray: ClassList[] = classData as ClassList[];

export interface exportedValue {
    selectedValue: string;
    setSelectedValue: React.Dispatch<React.SetStateAction<string>>;
    handleDropdownChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    isMainViewVisible:boolean;
    setIsMainViewVisible: React.Dispatch<React.SetStateAction<boolean>>;
    selectedClasses: string[];
    setSelectedClasses: React.Dispatch<React.SetStateAction<string[]>>;
    handleCheckboxChange: (className: string) => void;
    handleSkipClick: () => void;
    handleContinueClick: () => void;
    classArray: ClassList[];
    setClassArray: React.Dispatch<React.SetStateAction<ClassList[]>>;
}

const initialState:exportedValue = {
    selectedValue: '',
    isMainViewVisible: false,
    selectedClasses: [],
    classArray: [],
    setSelectedClasses: () => {},
    setIsMainViewVisible: () => {},
    setSelectedValue: () => {},
    handleDropdownChange: () => {},
    handleCheckboxChange: () => {},
    handleSkipClick: () => {},
    handleContinueClick: () => {},
    setClassArray: () => {}
};

export const UserInfoContext = createContext<exportedValue>(initialState);

export const UserProvider = ({children}: { children: ReactNode}) => {
    const [selectedValue, setSelectedValue] = useState<string>("");
    const [isMainViewVisible, setIsMainViewVisible] = useState<boolean>(false);
    const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
    const [classArray, setClassArray] = useState<ClassList[]>([]);

    const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;
        setSelectedValue(selectedValue);
    
        // Get the corresponding major abbreviation from the key
        const selectedMajorAbbreviation = majorAbbreviationKey[selectedValue];
        const majorFullName = majorFullKey[selectedValue];
        if (selectedMajorAbbreviation) {
          buildUrlForMajor(selectedMajorAbbreviation, majorFullName);
        }
        setClassArray(classData as ClassList[]);
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

    const handleCheckboxChange = (className: string) => { //need to handle if the box goes from checked to unchecked (set back to taken=false, semester="", and remove the class from preRequisitestaken)
      if (selectedClasses.includes(className)) {
        setSelectedClasses(selectedClasses.filter((c) => c !== className));
      } else {
        setSelectedClasses([...selectedClasses, className]);
        const updatedClasses = classArray.map((course) => {
          // Check if the course is the selected one
          if (course.id === className) {
            // Update the course's taken status
            const updatedCourse = {
              ...course,
              semester: "done",
              taken: true
            };
    
            return updatedCourse;
          }
          return course;
        });
    
        // Now that updatedClasses is defined, update prerequisitesTaken based on the prerequisites
        classArray.forEach((updatedCourse) => {
          updatedCourse.prerequisites.forEach((prerequisite) => {
            const prerequisiteIndex = classArray.findIndex((c) => c.title === prerequisite);
            if (prerequisiteIndex !== -1) {
              updatedClasses[prerequisiteIndex].prerequisitesTaken.push(updatedCourse.title);
            }
          });
        });
        console.log(updatedClasses);
        setClassArray(updatedClasses);
      }
    };
    
    
      const handleSkipClick = () => {
        setIsMainViewVisible(true);
      };
    
      const handleContinueClick = () => {
        setIsMainViewVisible(true);
      };
    
    const value = {
        //here is the value we should export
        selectedValue,
        setSelectedValue,
        handleDropdownChange,
        isMainViewVisible,
        setIsMainViewVisible,
        selectedClasses,
        setSelectedClasses,
        handleCheckboxChange,
        handleSkipClick,
        handleContinueClick,
        setClassArray,
        classArray
    };


    return (
        <>
            <UserInfoContext.Provider value={value}>{children}</UserInfoContext.Provider>
        </>
    );

};

export function useUser() {
    return useContext(UserInfoContext);
}