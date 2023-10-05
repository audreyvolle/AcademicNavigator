import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useData } from "./DataProv";
import computerScienceBA from '../data/Requirements/csbareq.json';
import computerScienceBS from '../data/Requirements/csbsreq.json';
import publicHealth from '../data/Requirements/pubhealthreq.json';
//Think about it's a global state value. 
//Add everything in exportValue
//Set up the initial state

export type PrerequisiteType = {
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
  major: string;
  setMajor: React.Dispatch<React.SetStateAction<string>>;
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
  classesNotTaken: ClassList[];
  setClassesNotTaken: React.Dispatch<React.SetStateAction<ClassList[]>>;
  creditHours: number;
  setCreditHours: React.Dispatch<React.SetStateAction<number>>;
  currentSemester: string;
  setCurrentSemester: React.Dispatch<React.SetStateAction<string>>;
  graduationSemester: string;
  setGraduationSemester: React.Dispatch<React.SetStateAction<string>>;
}

const initialState: exportedValue = {
  major: '',
  isMainViewVisible: false,
  selectedClasses: [],
  classArray: [],
  creditHours: 15,
  currentSemester: '',
  graduationSemester: '',
  classesNotTaken: [],
  setSelectedClasses: () => { },
  setIsMainViewVisible: () => { },
  setMajor: () => { },
  handleDropdownChange: () => { },
  handleCheckboxChange: () => { },
  handleSkipClick: () => { },
  handleContinueClick: () => { },
  setClassArray: () => { },
  setCreditHours: () => { },
  setCurrentSemester: () => { },
  setGraduationSemester: () => { },
  setClassesNotTaken: () => { },
};

export const UserInfoContext = createContext<exportedValue>(initialState);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [major, setMajor] = useState<string>("");
  const [isMainViewVisible, setIsMainViewVisible] = useState<boolean>(false);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [classArray, setClassArray] = useState<ClassList[]>([]);
  const [creditHours, setCreditHours] = useState<number>(15);
  const [currentSemester, setCurrentSemester] = useState<string>("");
  const [graduationSemester, setGraduationSemester] = useState<string>("");
  const [classesNotTaken, setClassesNotTaken] = useState<ClassList[]>([]);

  const { courses } = useData();

  useEffect(() => {
    setClassesNotTaken(classArray.filter((classItem: ClassList) => !classItem.taken));
  }, [classArray]);

  const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setMajor(selectedValue);
    console.log(selectedValue);
    setClassArray(courses as ClassList[]);
    setClassesNotTaken(courses as ClassList[]);
  };

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
          const updatedORPrerequisitesTaken = course.prerequisitesOR.map(
            (prerequisitesOR) => {
              if (prerequisitesOR.id === className) {
                return course.title;
              }
              return prerequisitesOR;
            }
          );
          const isReadyToTakeOR =
            updatedORPrerequisitesTaken.length === course.prerequisitesOR.length;
          const updatedANDPrerequisitesTaken = course.prerequisitesOR.map(
            (prerequisitesOR) => {
              if (prerequisitesOR.id === className) {
                return course.title;
              }
              return prerequisitesOR;
            }
          );
          const isReadyToTakeAND =
            updatedANDPrerequisitesTaken.length === course.prerequisitesAND.length;
          const isReadyToTake = isReadyToTakeOR && isReadyToTakeAND;
          return {
            ...course,
            prerequisitesORTaken: updatedORPrerequisitesTaken,
            prerequisitesANDTaken: updatedANDPrerequisitesTaken,
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
    createCriticalPath();
    setIsMainViewVisible(true);
  };

  const requirements = {
    'computer-science-ba': computerScienceBA,
    'computer-science-bs': computerScienceBS,
    'public-health': publicHealth
  };

  const updatedPrerequisitesTaken = (courseTaken: ClassList, classArrayCopy: ClassList[]) => {
    const updatedClassArray = classArrayCopy.map((course) => {
      if (course.id !== courseTaken.id) {
        const updatedORPrerequisitesTaken = course.prerequisitesOR.map(
          (prerequisitesOR) => {
            if (prerequisitesOR.id === courseTaken.id) {
              return course.title;
            }
            return prerequisitesOR;
          }
        );
        const isReadyToTakeOR =
          updatedORPrerequisitesTaken.length === course.prerequisitesOR.length;
        const updatedANDPrerequisitesTaken = course.prerequisitesOR.map(
          (prerequisitesOR) => {
            if (prerequisitesOR.id === courseTaken.id) {
              return course.title;
            }
            return prerequisitesOR;
          }
        );
        const isReadyToTakeAND =
          updatedANDPrerequisitesTaken.length === course.prerequisitesAND.length;
        const isReadyToTake = isReadyToTakeOR && isReadyToTakeAND;
        return {
          ...course,
          prerequisitesORTaken: updatedORPrerequisitesTaken,
          prerequisitesANDTaken: updatedANDPrerequisitesTaken,
          isReadyToTake,
        };
      }
      return course;
    });
    console.log(updatedClassArray);
    return updatedClassArray;
  };

  const createCriticalPath = () => {
    const semestersSeasons = ['Spring', 'Fall'];
    const minGraduationYear = 2023;
    let graduationOptions: any = [];
    
    for (let year = minGraduationYear; year <= 2050; year++) {
      for (const semester of semestersSeasons) {
        graduationOptions.push(`${semester} ${year}`);
      }
    }
  
    let preReqStack: any = [];
    let semesterPlacement = currentSemester;
    const maxCreditHours = creditHours ? creditHours : 15;
  
    let classArrayCopy = [...classArray];
    let currentSemesterCredits = 0;
  
    const majorRequirements = requirements[major as keyof typeof requirements];
    const requiredClasses = classArray.filter((c) => {
      return majorRequirements.some((b) => b === c.id);
    });
  
    requiredClasses.forEach((c) => {
      //if preReqStack is not empty, then place the preReqStack classes first and check to make sure that classes prerequisites are met
      if (preReqStack.length > 0) {
        preReqStack.forEach((p: any) => {
          if(p.prerequisitesTaken.length === p.prerequisitesAND.length) {
          if (currentSemesterCredits + p.credits <= maxCreditHours) {
            p.semester = semesterPlacement;
            p.taken = true;
            currentSemesterCredits += p.credits;
            classArrayCopy = updatedPrerequisitesTaken(c, classArrayCopy);
          } else {
            currentSemesterCredits = 0;
            semesterPlacement = graduationOptions[graduationOptions.indexOf(semesterPlacement) + 1];
            p.semester = semesterPlacement;
            p.taken = true;
            currentSemesterCredits += p.credits;
            classArrayCopy = updatedPrerequisitesTaken(c, classArrayCopy);
          }
        }
        else {
          p.prerequisitesAND.forEach((p: any) => {
            //find the class in the classArrayCopy and then push it into the preReqStack
            const preReqClass = classArrayCopy.find((r) => r.id === p.id);
            preReqStack.push(preReqClass);
          });
        }
        });
      }
      else if (c.prerequisitesTaken.length === c.prerequisitesAND.length) {
        if (currentSemesterCredits + c.credits <= maxCreditHours) {
          c.semester = semesterPlacement;
          c.taken = true;
          currentSemesterCredits += c.credits;
          classArrayCopy = updatedPrerequisitesTaken(c, classArrayCopy);
        } else {
          currentSemesterCredits = 0;
          semesterPlacement = graduationOptions[graduationOptions.indexOf(semesterPlacement) + 1];
          c.semester = semesterPlacement;
          c.taken = true;
          currentSemesterCredits += c.credits;
          classArrayCopy = updatedPrerequisitesTaken(c, classArrayCopy);
        }
      } else { // else put into stack to place instead of the requiredClasses
        c.prerequisitesAND.forEach((p) => {
          //find the class in the classArrayCopy and then push it into the preReqStack
          const preReqClass = classArrayCopy.find((r) => r.id === p.id);
          preReqStack.push(preReqClass);
        });
        preReqStack.push(c);
      }
    });
    setClassArray(classArrayCopy);
    console.log(classArrayCopy);
  };
  
  const value = {
    //here is the value we should export
    major,
    setMajor,
    handleDropdownChange,
    isMainViewVisible,
    setIsMainViewVisible,
    selectedClasses,
    setSelectedClasses,
    handleCheckboxChange,
    handleSkipClick,
    handleContinueClick,
    setClassArray,
    classArray,
    creditHours,
    currentSemester,
    graduationSemester,
    setCreditHours,
    setCurrentSemester,
    setGraduationSemester,
    classesNotTaken,
    setClassesNotTaken,
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

