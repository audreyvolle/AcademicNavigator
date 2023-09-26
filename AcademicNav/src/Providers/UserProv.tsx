import { createContext, ReactNode, useContext, useState } from "react";
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
  setGraduationSemester: () => { }
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
  const {courses} = useData();


  const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setMajor(selectedValue);
    console.log(selectedValue);
    setClassArray(courses as ClassList[]);
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
          const isReadyToTake = isReadyToTakeOR  &&  isReadyToTakeAND;
          return {
            ...course,
            prerequisitesORTaken: updatedORPrerequisitesTaken,
            prerequisitesANDTaken:updatedANDPrerequisitesTaken,
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

  const createCriticalPath = () => {
    const criticalPath: any[] = [];
    if (major == 'computer-science-ba' || major == 'computer-science-bs') {
       // Populate the prerequisites dictionaries
       classArray.forEach((course) => {
        //console.log(course);
       });
    }
    //console.log("critical Path: ");
    //console.log(criticalPath);
    //setClassArray(criticalPath);
  }

  const createCriticalPath2 = () => {
    const criticalPath: any[] = [];
    if (major == 'computer-science-ba' || major == 'computer-science-bs') {
      // Create dictionaries to store prerequisites and counts
      const prerequisitesAND: any = {}; // Store prerequisites that are ANDed
      const prerequisitesOR: any = {};  // Store prerequisites that are ORed
      const semesters: any = {};
  
      // Populate the prerequisites dictionaries
      classArray.forEach((course) => {
        const courseId = course.id;
        const coursePrerequisitesAND = course.prerequisitesAND || [];
        const coursePrerequisitesOR = course.prerequisitesOR || [];
  
        prerequisitesAND[courseId] = coursePrerequisitesAND;
        prerequisitesOR[courseId] = coursePrerequisitesOR;
        semesters[courseId] = course.semester;
      });
  
      // Function to check if a course can be taken based on OR prerequisites
      const canTakeCourse = (courseId: any) => {
        const orPrerequisites = prerequisitesOR[courseId];
        if (orPrerequisites) {
          for (const prerequisite of orPrerequisites) {
            if (criticalPath.some((completedCourse) => completedCourse.id === prerequisite.id)) {
              return true;
            }
          }
          return false;
        }
        return true;
      };
  
      // Topological sorting loop
      while (true) {
        let found = false;
  
        // Iterate through the courses
        for (const courseId in prerequisitesAND) {
          if (prerequisitesAND[courseId].every((prerequisite: any) =>
            criticalPath.some((completedCourse) => completedCourse.id === prerequisite.id)) && canTakeCourse(courseId)) {
            // Course has all prerequisites completed (AND) and can be taken (OR), add it to the critical path
            criticalPath.push({
              id: courseId,
              semester: semesters[courseId],
            });
  
            // Remove the course from prerequisites dictionaries
            delete prerequisitesAND[courseId];
            delete prerequisitesOR[courseId];
            found = true;
          }
        }
  
        // If no courses were found to add, break the loop
        if (!found) {
          break;
        }
      }
  
      // Sort the critical path by semester
      criticalPath.sort((a, b) => a.semester.localeCompare(b.semester));
    } else if (major == 'public-health') {
      // Do nothing for now
    }
    console.log("critical Path: ");
    //console.log(criticalPath);
    //setClassArray(criticalPath);
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
    setGraduationSemester
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

