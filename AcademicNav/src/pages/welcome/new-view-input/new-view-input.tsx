import './new-view-input.scss';
import { useUser } from '../../../Providers/UserProv';
import { useEffect, useState } from 'react';
import questionMark from '/public/images/question-mark.png';

interface ModalProps {
  onClose: () => void;
}

const Modal = ({ onClose }: ModalProps) => (
  <div className="modal">
    <div className="modal-content">
      <h3>Help</h3>
      <ul>
        <li>
          <strong>Class Selection:</strong> Check each box by classes you have taken, or are currently taking this far in your academic career. This will put these classes in a "done" pile and allow you to put post-requisite classes on your schedule.
        </li>
        <li>
          <strong>Credit Hours Per Semester:</strong> This is the amount of credit hours you plan on taking per semester. It is advised to pick the maximum credit hours you plan on taking, as putting in less is acceptable, but putting in more than this value will not be allowed.
        </li>
        <li>
          <strong>Graduation Semester:</strong> This is the semester that you plan on graduating. You can add a semester inside the schedule if you find this necessary. This target helps in creating a path/goal.
        </li>
        <li>
          <strong>Critical Path Load In:</strong> Checking this box will create a path of core classes for your major based on the order of prerequisites.
        </li>
      </ul>
      <button onClick={onClose}>Close</button>
    </div>
  </div>
);
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
  prerequisitesANDTaken: (string | PrerequisiteType)[];
  prerequisitesORTaken: (string | PrerequisiteType)[];
  isReadyToTake: boolean,
  taken: boolean,
  semester: string,
}

function NewView() {
  const { handleContinueClick, handleSkipClick, handleCheckboxChange, selectedClasses, classArray, setCreditHours, setCurrentSemester, setCriticalPath } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // Month is 0-indexed, so we add 1
  // Create an array of semester names
  const semesters = ['Spring', 'Fall'];

  useEffect(() => {
    // Get references to the current and graduation semester dropdowns
    const currentSemesterField = document.getElementById('current') as HTMLSelectElement;
    setCurrentSemester(currentSemesterField.value);
    
    // Populate the current semester dropdown
    for (let year = currentYear; year <= 2050; year++) {
      for (const semester of semesters) {
        if (year === currentYear && semesters.indexOf(semester) === 0 && currentMonth > 6) {
          continue;
        }
        const option = document.createElement('option');
        option.value = `${semester} ${year}`;
        option.text = `${semester} ${year}`;
        currentSemesterField?.appendChild(option);
      }
    }
    setCurrentSemester(currentSemesterField.value);
  }, [currentYear, currentMonth]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="new-view-container">
      <div>
        <h2>
          Select classes you have taken or are currently taking:
          <button className="help-button" onClick={openModal}>
            <img
              src={questionMark}
              alt="Help"
              className="question-mark-img"
            />
          </button>
        </h2>


        {<ul className="checkbox-list">
          {Object.entries(
            classArray.reduce((groupedCourses: { [level: number]: ClassList[] }, classes) => {
              const courseId = classes;
              if (courseId) {
                const level = parseInt(courseId.id.replace(/\D/g, '')[0], 10); // Parse the level from the course ID
                if (!groupedCourses[level]) {
                  groupedCourses[level] = [];
                }
                groupedCourses[level].push(courseId);
              }
              return groupedCourses;
            }, {})
          ).map(([level, coursesGroup]) => (
            <div key={level}>
              <h3>{level}00 Level Courses</h3>
              <div className='classesContainer'>
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
            </div>
          ))}
        </ul>}

        <label htmlFor="credits">Credit Hours Per Semester (between 4 and 20):</label>
        <input type="number" defaultValue={15} id="credits" name="credits" min="4" max="20" className="input-field-credits" onChange={(e) => {
            let value = parseInt(e.target.value);
            if (value < 4) value = 4;
            if (value > 20) value = 20;
            setCreditHours(value);
          }} />

        <label htmlFor="current">Current Semester: </label>
        <select id="current" name="current" className="input-field" onChange={(e) => setCurrentSemester(e.target.value)}></select>

        <div className="button-container">
          <button onClick={handleSkipClick} className="button button-secondary">Skip</button>
          <label htmlFor="critical-path"><input
            type="checkbox"
            id="critical-path"
            name="critical-path"
            className="input-field-checkbox"
            onChange={(e) => setCriticalPath(e.target.checked)}
          />
            Load Critical Path In View
          </label>
          <button onClick={() => { handleContinueClick() }} className="button">Continue</button>
        </div>
      </div>
      {isModalOpen && <Modal onClose={closeModal} />}
    </div>
  );
}

export default NewView;