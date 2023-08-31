import React, { useState, useEffect } from 'react';
import rawData from './scraped/class.json';

type TransformedData = {
  id: string;
  title: string;
  credits: number;
  prerequisites: string;
  prerequisitesTaken: string[];
  isReadyToTake: boolean;
  taken: boolean;
  description: string;
};

export const CourseConverter = () => {
  const [courses, setCourses] = useState<TransformedData[]>([]);

  useEffect(() => {

    const transformedData: TransformedData[] = rawData.map(item => {
      const idMatch = item.match(/(\w+\s\d+)/);
      const titleMatch = item.match(/-\s(.*?)\n/);
      const descriptionMatch = item.match(/Description: (.*?)\n\n/);
      const prerequisites = item.match(/Prerequisite\(s\): (.*?)\n/);
      const creditsMatch = item.match(/Credit Hours: (\d+)/);

      return {
        id: idMatch ? idMatch[1] : "",
        title: titleMatch ? titleMatch[1] : "",
        credits: creditsMatch ? parseInt(creditsMatch[1], 10) : 0,
        prerequisites: prerequisites ? prerequisites[1] : "",
        prerequisitesTaken: [],
        isReadyToTake: false,
        taken: false,
        description: descriptionMatch ? descriptionMatch[1] : "",
      };
    });

    setCourses(transformedData);
    
  }, []);

  console.log(courses);
}

