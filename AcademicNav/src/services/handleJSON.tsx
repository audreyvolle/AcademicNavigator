import Course from "../assets/course";
const fs = require('fs');

function printToJson(courseList: Course[]) {
  const jsonString = JSON.stringify(courseList, null, 2);

  fs.writeFile('../data/scraped/test.json', jsonString, 'utf8', (err: any) => {
    if (err) {
      console.error('Error writing to JSON file:', err);
    } else {
      console.log('Course list has been written to JSON file:');
    }
  });
}

/*function readInClassList(jsonString: string): Course[] {
  try {
    const courseList = JSON.parse(jsonString);
    if (Array.isArray(courseList)) {
      return courseList;
    } else {
      throw new Error('Invalid JSON format: Expected an array.');
    }
  } catch (error) {
    console.error('Error reading class list:', error);
    return [];
  }
}*/

export { printToJson };
