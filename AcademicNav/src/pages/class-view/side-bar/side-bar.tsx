interface ClassList {
  id: string;
  title: string;
  credits: number;
  prerequisites: Array<string>;
  prerequisitesTaken: Array<string>;
  isReadyToTake: boolean;
  taken: boolean;
}

interface SideBarProps {
  classArray: ClassList[];
}

const SideBar = ({ classArray }: SideBarProps) => {
  const onDragStart = (event: any, nodeType: any, nodeId: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('nodeId', nodeId); // Set the node's ID for reference
  };

  // Filter classArray to get only items with taken === false
  const classesNotTaken = classArray.filter((classItem) => !classItem.taken);

  return (
    <aside>
      <h2>Class List</h2>
      <div className="description">You can drag these nodes (classes) into a semester on the left</div>
      {classesNotTaken.map((classItem: ClassList) => (
        <div
          key={classItem.id}
          className="dndnode"
          onDragStart={(event) => onDragStart(event, classItem.title, classItem.id)}
          draggable
        >
          {classItem.title}
        </div>
      ))}
    </aside>
  );
};

export default SideBar;


