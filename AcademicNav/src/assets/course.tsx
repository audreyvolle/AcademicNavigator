interface Course {
    id: string;
    title: string;
    credits: number;
    prerequisites: string[];
    prerequisitesTaken: string[];
    isReadyToTake: boolean;
    taken: boolean;
    semester?: string; // Optional property for semester
  }

  export default Course;