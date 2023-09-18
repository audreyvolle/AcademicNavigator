import './new-view-input.scss';
import { useUser } from '../../../Providers/UserProv';
import { useState } from 'react';
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
      </ul>
      <button onClick={onClose}>Close</button>
    </div>
  </div>
);


function NewView() {
  const { handleContinueClick, handleSkipClick, handleCheckboxChange, selectedClasses, classArray } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  interface ClassList {
    id: string,
    title: string,
    credits: number,
    prerequisites: Array<string>,
    prerequisitesTaken: Array<string>,
    isReadyToTake: boolean,
    taken: boolean
  }

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
          <button onClick={() => { handleContinueClick() }} className="button">Continue</button>
        </div>
      </div>
      {isModalOpen && <Modal onClose={closeModal} />}
    </div>
  );
}

export default NewView;