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
  prerequisitesANDTaken: (string | PrerequisiteType)[];
  prerequisitesORTaken: (string | PrerequisiteType)[];
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
  criticalPath: boolean;
  setCriticalPath: React.Dispatch<React.SetStateAction<boolean>>;
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
  criticalPath: false,
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
  setCriticalPath: () => { }
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
  const [criticalPath, setCriticalPath] = useState<boolean>(false);

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
          const updatedPrerequisitesTaken = course.prerequisitesANDTaken.filter(
            (prerequisite) => prerequisite !== classTitle
          );
          return {
            ...course,
            prerequisitesANDTaken: updatedPrerequisitesTaken,
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
              return;
            }
          );
         // const isReadyToTakeOR = updatedORPrerequisitesTaken.length === course.prerequisitesOR.length;
          const updatedANDPrerequisitesTaken = course.prerequisitesAND.map(
            (prerequisitesAND) => {
              if (prerequisitesAND.id === className) {
                return course.title;
              }
              return prerequisitesAND;
            }
          );
          const isReadyToTakeAND =
            updatedANDPrerequisitesTaken.length === course.prerequisitesAND.length;
          const isReadyToTake = isReadyToTakeAND;
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
    if(criticalPath) {
      createCriticalPath();
    }
    setIsMainViewVisible(true);
  };

  const requirements = {
    'computer-science-ba': computerScienceBA,
    'computer-science-bs': computerScienceBS,
    'public-health': publicHealth
  };

  const updatedPrerequisitesTaken = (courseTaken: ClassList) => {
      classArray.map((course) => {
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
        const updatedANDPrerequisitesTaken = course.prerequisitesAND.map(
          (prerequisitesAND) => {
            if (prerequisitesAND.id === courseTaken.id) {
              return course.title;
            }
            return prerequisitesAND;
          }
        );
        const isReadyToTakeAND =
          updatedANDPrerequisitesTaken.length === course.prerequisitesAND.length;
        const isReadyToTake = isReadyToTakeOR && isReadyToTakeAND;
        return {
          ...course,
          prerequisitesORTaken: [...updatedORPrerequisitesTaken],
          prerequisitesANDTaken: [...updatedANDPrerequisitesTaken],
          isReadyToTake,
        };
      }
      return course;
    });
  };

  const createCriticalPath = () => {
    const semestersSeasons = ['Spring', 'Fall'];
    const minGraduationYear = 2023;
    const graduationOptions: string[] = [];
    
    for (let year = minGraduationYear; year <= 2050; year++) {
      for (const semester of semestersSeasons) {
        graduationOptions.push(`${semester} ${year}`);
      }
    }
  
    let semesterPlacement = currentSemester;
    let currentSemesterCredits = 0;
  
    const majorRequirements = requirements[major as keyof typeof requirements];
    const requiredClasses = classArray.filter((c) => majorRequirements.includes(c.id));

    const scheduleClass = (classToSchedule: ClassList) => {
      // Check if any prerequisites are scheduled for the same or earlier semester
      const earliestPrereqSemester = classToSchedule.prerequisitesANDTaken.reduce(
        (earliestSemester, prereq) => {
          const prereqClass = classArray.find((c) => c.id === prereq);
          if (prereqClass && prereqClass.semester !== '' && graduationOptions.indexOf(prereqClass.semester) < graduationOptions.indexOf(earliestSemester.toString())) {
            return prereqClass.semester;
          }
          return earliestSemester;
        },
        semesterPlacement
      );
    
      // Check if class can be scheduled in the current semester
      if (graduationOptions.indexOf(earliestPrereqSemester.toString()) > graduationOptions.indexOf(semesterPlacement)) {
        semesterPlacement = earliestPrereqSemester.toString();
      }
    
      // Schedule prerequisites before the class that requires them
      classToSchedule.prerequisitesAND.forEach((prereq) => {
        const prereqClass = classArray.find((c) => c.id === prereq.id);
        if (prereqClass && !prereqClass.taken) {
          scheduleClass(prereqClass);
        }
      });
    
      // Schedule the class itself
      while (true) {
        if (currentSemesterCredits + classToSchedule.credits <= creditHours) {
          console.log("scheduling" + classToSchedule.id);
          classToSchedule.semester = semesterPlacement;
          classToSchedule.taken = true;
          currentSemesterCredits += classToSchedule.credits;
          break;
        } else {
          currentSemesterCredits = 0;
          semesterPlacement = graduationOptions[graduationOptions.indexOf(semesterPlacement) + 1];
        }
      }
    };
  
    requiredClasses.forEach((requiredClass) => {
     // if (requiredClass.prerequisitesANDTaken.length === requiredClass.prerequisitesAND.length) {
       // scheduleClass(requiredClass);
      //} else {
        requiredClass.prerequisitesAND.forEach((prerequisite) => {
          const prerequisiteClass = classArray.find((c) => c.id === prerequisite.id);
          if (prerequisiteClass ) {
            scheduleClass(prerequisiteClass);
          }
        });
        scheduleClass(requiredClass); // Schedule the required class after its prerequisites
      //}
    });
    console.log(classArray);
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
    criticalPath,
    setCriticalPath
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

