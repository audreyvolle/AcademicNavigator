import { useState } from 'react';
import { useUser } from '../../../Providers/UserProv';
import './side-bar.scss';
import questionMark from '/public/images/question-mark.png';
interface ClassList {
  id: string,
  title: string,
  credits: number,
  prerequisites: Array<string>,
  prerequisitesTaken: Array<string>,
  isReadyToTake: boolean,
  taken: boolean,
  semester: string
}

interface ModalProps {
  onClose: () => void;
}

const Modal = ({ onClose }: ModalProps) => (
  <div className="modal">
    <div className="modal-content">
      <h3>Help</h3>
      <ul>
        <li>
          <strong>Class List:</strong> This is a list of classes that you have not taken or added to your schedule yet. You may move any class that does not have prerequisites that have not been placed into either view on the left. Moving a class into either view will also add it to the other view.
        </li>
      </ul>
      <button onClick={onClose}>Close</button>
    </div>
  </div>
);

const SideBar = () => {
  const { classArray } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classesNotTaken, setClassesNotTaken] = useState(
    classArray.filter((classItem) => !classItem.taken)
  );

  const onDragStart = (event: any, nodeType: any, nodeId: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('nodeId', nodeId);
  };

  const onDragEnd = (event: any, nodeId: string) => {
    console.log(event);
    setClassesNotTaken((prevClasses) =>
      prevClasses.filter((classItem) => classItem.id !== nodeId)
    );
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  return (
    <aside>
      <div>
        <h2>
          Class List
          <button className="help-button" onClick={openModal}>
            <img
              src={questionMark}
              alt="Help"
              className="question-mark-img"
            />
          </button>
        </h2>
        <div className="description">
          You can drag these classes into a semester on the left
        </div>
      </div>
      {classesNotTaken.map((classItem: ClassList) => (
        <div
          key={classItem.id}
          className="dndnode"
          onDragStart={(event) => onDragStart(event, classItem.title, classItem.id)}
          onDragEnd={(event) => onDragEnd(event, classItem.id)}
          draggable
        >
          {classItem.title}
        </div>
      ))}
      {isModalOpen && <Modal onClose={closeModal} />}
    </aside>
  );
};

export default SideBar;