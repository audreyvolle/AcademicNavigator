import './new-view-input.scss';
import { useUser } from '../../../Providers/UserProv';

function NewView() {
  const {handleContinueClick,handleSkipClick,handleCheckboxChange, selectedClasses, classArray } = useUser();

  interface ClassList {
    id: string,
    title: string,
    credits: number,
    prerequisites: Array<string>,
    prerequisitesTaken: Array<string>,
    isReadyToTake: boolean,
    taken: boolean
  }

  return (
    <div className="new-view-container">
      <div>
        <h2>Select classes you have taken or are currently taking:</h2>

        <ul className="checkbox-list">
          {Object.entries(
            classArray.reduce((groupedCourses: { [level: number]: ClassList[] }, course) => {
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
          <button onClick={()=>{handleContinueClick()}} className="button">Continue</button>
        </div>
      </div>
    </div>
  );
}

export default NewView;