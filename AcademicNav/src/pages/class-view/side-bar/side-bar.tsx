import { useState } from 'react';
import { useUser } from '../../../Providers/UserProv';

interface ClassList {
  id: string;
  title: string;
  credits: number;
  prerequisites: Array<string>;
  prerequisitesTaken: Array<string>;
  isReadyToTake: boolean;
  taken: boolean;
}

const SideBar = () => {
  const { classArray } = useUser();
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

  return (
    <aside>
      <h2>Class List</h2>
      <div className="description">You can drag these nodes (classes) into a semester on the left</div>
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
    </aside>
  );
};

export default SideBar;