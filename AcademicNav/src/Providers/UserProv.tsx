import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useData } from "./DataProv";
import computerScienceBA from '../data/Requirements/csbareq.json';
import computerScienceBS from '../data/Requirements/csbsreq.json';
import publicHealth from '../data/Requirements/pubhealthcore.json';

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
    let filteredCourses: ClassList[] = [];
  
    if (selectedValue === "public-health") {
      // Filter classes that ids are in pubhealthreq.json
      filteredCourses = courses.filter((course) => publicHealth.includes(course.id));
    } else {
      // Filter out classes that ids are in pubhealthreq.json
      filteredCourses = courses.filter((course) => !publicHealth.includes(course.id));
    }
    console.log(filteredCourses);
    setClassArray(filteredCourses);
    setClassesNotTaken(filteredCourses);
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
  
    const visited = new Set<ClassList>();
    const semesterCredits: Record<string, number> = {};
    let semesterPlacement = currentSemester;
    let currentSemesterCredits = 0;
  
    const dfs = (classToVisit: ClassList) => {
      if (visited.has(classToVisit)) {
        return;
      }
  
      visited.add(classToVisit);
  
      classToVisit.prerequisitesAND.forEach((prereq) => {
        const prereqClass = classArray.find((c) => c.id === prereq.id);
        if (prereqClass) {
          dfs(prereqClass);
        }
      });
  
      // Schedule logic starts here
      // Check if class can be scheduled in the current semester
      if (graduationOptions.indexOf(classToVisit.semester) > graduationOptions.indexOf(semesterPlacement)) {
        semesterPlacement = classToVisit.semester;
        currentSemesterCredits = 0;
      }
  
      // Check if there is a prerequisite for the class in the current semester
      const hasPrerequisiteInCurrentSemester = classToVisit.prerequisitesAND.some((prereq) => {
        const prereqClass = classArray.find((c) => c.id === prereq.id);
        return prereqClass && prereqClass.semester === semesterPlacement;
      });
  
      // If there is a prerequisite for the class in the current semester, schedule it in the next semester
      if (hasPrerequisiteInCurrentSemester) {
        const semesterIndex = graduationOptions.indexOf(semesterPlacement);
        semesterPlacement = graduationOptions[semesterIndex + 1];
        currentSemesterCredits = 0;
      }
  
      // Check if there is enough space in the semester for the class
      if (currentSemesterCredits + classToVisit.credits <= creditHours) {
        classToVisit.semester = semesterPlacement;
        classToVisit.taken = true;
        updatedPrerequisitesTaken(classToVisit);
        currentSemesterCredits += classToVisit.credits;
      } else {
        // If there is not enough space in the semester, move to the next semester
        const semesterIndex = graduationOptions.indexOf(semesterPlacement);
        semesterPlacement = graduationOptions[semesterIndex + 1];
        currentSemesterCredits = 0;
        classToVisit.semester = semesterPlacement;
        classToVisit.taken = true;
        updatedPrerequisitesTaken(classToVisit);
        currentSemesterCredits += classToVisit.credits;
      }
    };
  
    const majorRequirements = requirements[major as keyof typeof requirements];
    const requiredClasses = classArray.filter((c) => majorRequirements?.includes(c.id));
  
    requiredClasses.forEach((classToVisit) => {
      dfs(classToVisit);
    });
  };
  
  const value = {
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
    setCreditHours,
    setCurrentSemester,
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

