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
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </p>
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