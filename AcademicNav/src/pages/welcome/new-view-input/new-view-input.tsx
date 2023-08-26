import { useState } from 'react';
import MainView from '../../class-view/main-view/main-view';
import './new-view-input.scss';
import classData from '../../../data/scraped/test.json';
import { printToJson } from '../../../services/handleJSON';

function NewView() {
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [isMainViewVisible, setIsMainViewVisible] = useState(false);

  interface ClassList { //Used to store the data retrieved from the json file
    id: string,
    title: string,
    credits: number,
    prerequisites: Array<string>,
    prerequisitesTaken: Array<string>,
    isReadyToTake: boolean,
    taken: boolean
  }

  //converts the data in the json file into an interface array
  const ClassArray: ClassList[] = classData as ClassList[];

  const handleCheckboxChange = (courseId: string) => {
    const updatedClasses = ClassArray.map(course => {
      if (course.id === courseId) {
        return {
          ...course,
          taken: true
        };
      }
      return course;
    });

    setSelectedClasses(selectedClasses.includes(courseId)
      ? selectedClasses.filter((id) => id !== courseId)
      : [...selectedClasses, courseId]
    );
    //printToJson(updatedClasses);
  };

  const handleSkipClick = () => {
    setSelectedClasses([]);
    setIsMainViewVisible(true);
  };

  const handleContinueClick = () => {
    setIsMainViewVisible(true);
  };

  return (
    <div className="new-view-container">
      <div>
        <p>Selected classes you have taken or are currently taking:</p>

        <ul className="checkbox-list">
          {Object.entries(
            ClassArray.reduce((groupedCourses: { [level: number]: ClassList[] }, course) => {
              const courseId = course.id;
              if (courseId) {
                const level = parseInt(courseId.substring(2, 3)); // Parse the level from the course ID
                if (!groupedCourses[level]) {
                  groupedCourses[level] = [];
                }
                groupedCourses[level].push(course);
              }
              return groupedCourses;
            }, {})
          ).map(([level, coursesGroup]) => (
            <div key={level}>
              <h3>{level}00 Level Courses</h3>
              <ul>
                {coursesGroup.map((course) => (
                  <li key={course.id}>
                    <label htmlFor={course.id}>
                      <input
                        type="checkbox"
                        id={course.id}
                        checked={selectedClasses.includes(course.id)}
                        onChange={() => handleCheckboxChange(course.id)}
                      />
                      {course.id}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </ul>

        <label htmlFor="credits">Credit Hours Per Semester (between 1 and 20):</label>
        <input type="number" id="credits" name="credits" min="1" max="20" className="input-field" />

        <label htmlFor="graduation">Graduation Semester:</label>
        <input type="text" id="graduation" name="graduation" className="input-field" />

        <div className="button-container">
          <button onClick={handleSkipClick} className="button button-secondary">Skip</button>
          <button onClick={handleContinueClick} className="button">Continue</button>
        </div>

        {isMainViewVisible && <MainView />}
      </div>
    </div>
  );
}

export default NewView;