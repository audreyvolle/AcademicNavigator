import { createContext, ReactNode, useContext, useState } from "react";
import majorAbbreviationKey from '../assets/majorsAbrev';
import majorFullKey from '../assets/majorsFull';
import classData from '../data/scraped/test.json';
import { useData } from "./DataProv";
//Think about it's a global state value. 
//Add everything in exportValue
//Set up the initial state

type PrerequisiteType = {
  id: string;
  Grade: string;
  concurrency: boolean;
};

interface ClassList {
  id: string,
  title: string,
  credits: number,
  prerequisitesOR: PrerequisiteType[],
  prerequisitesAND: PrerequisiteType[],
  prerequisitesTaken: Array<string>,
  isReadyToTake: boolean,
  taken: boolean,
  semester: string,
}

export interface exportedValue {
  selectedValue: string;
  setSelectedValue: React.Dispatch<React.SetStateAction<string>>;
  handleDropdownChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  isMainViewVisible: boolean;
  setIsMainViewVisible: React.Dispatch<React.SetStateAction<boolean>>;
  selectedClasses: string[];
  setSelectedClasses: React.Dispatch<React.SetStateAction<string[]>>;
  handleCheckboxChange: (className: string) => void;
  handleSkipClick: () => void;
  handleContinueClick: () => void;
  classArray: ClassList[];
  setClassArray: React.Dispatch<React.SetStateAction<ClassList[]>>;
}

const initialState: exportedValue = {
  selectedValue: '',
  isMainViewVisible: false,
  selectedClasses: [],
  classArray: [],
  setSelectedClasses: () => { },
  setIsMainViewVisible: () => { },
  setSelectedValue: () => { },
  handleDropdownChange: () => { },
  handleCheckboxChange: () => { },
  handleSkipClick: () => { },
  handleContinueClick: () => { },
  setClassArray: () => { }
};

export const UserInfoContext = createContext<exportedValue>(initialState);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [isMainViewVisible, setIsMainViewVisible] = useState<boolean>(false);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [classArray, setClassArray] = useState<ClassList[]>([]);
  const {courses} = useData();

  const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setSelectedValue(selectedValue);

    // Get the corresponding major abbreviation from the key
    const selectedMajorAbbreviation = majorAbbreviationKey[selectedValue];
    const majorFullName = majorFullKey[selectedValue];
    if (selectedMajorAbbreviation) {
      buildUrlForMajor(selectedMajorAbbreviation, majorFullName);
    }
    setClassArray(courses as ClassList[]);
  };

  console.log(courses)
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

  const handleCheckboxChange = (className: string) => {
    let classTitle = "";

    // Check if the class is already in selectedClasses
    if (selectedClasses.includes(className)) {
      // Remove it from selectedClasses
      setSelectedClasses(selectedClasses.filter((c) => c !== className));

      // Update classArray to mark the class as not taken
      const updatedClasses = classArray.map((course) => {
        if (course.id === className) {
          classTitle = course.title;
          return {
            ...course,
            semester: "",
            taken: false,
          };
        }
        return course;
      });
      console.log(updatedClasses);
      setClassArray(updatedClasses);

      // Remove the class from prerequisitesTaken of other courses
      const updatedClassArray = updatedClasses.map((course) => {
        if (course.id !== className) {
          const updatedPrerequisitesTaken = course.prerequisitesTaken.filter(
            (prerequisite) => prerequisite !== classTitle
          );
          return {
            ...course,
            prerequisitesTaken: updatedPrerequisitesTaken,
            isReadyToTake: false,
          };
        }
        return course;
      });
      console.log(updatedClassArray);
      setClassArray(updatedClassArray);
    }
    else {
      // Add it to selectedClasses
      setSelectedClasses([...selectedClasses, className]);

      // Update classArray to mark the class as taken
      const updatedClasses = classArray.map((course) => {
        if (course.id === className) {
          return {
            ...course,
            semester: "done",
            taken: true,
          };
        }
        return course;
      });

      // Update prerequisites for other courses
      const updatedClassArray = updatedClasses.map((course) => {
        if (course.id !== className) {
          const updatedPrerequisitesTaken = course.prerequisitesOR.map(
            (prerequisitesOR) => {
              if (prerequisitesOR.id === className) {
                return course.title;
              }
              return prerequisitesOR;
            }
          );
          const isReadyToTake =
            updatedPrerequisitesTaken.length === course.prerequisitesOR.length;
          return {
            ...course,
            prerequisitesTaken: updatedPrerequisitesTaken,
            isReadyToTake,
          };
        }
        return course;
      });
      console.log(updatedClassArray);
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
