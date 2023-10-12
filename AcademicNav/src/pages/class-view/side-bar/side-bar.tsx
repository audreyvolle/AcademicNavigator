import { useEffect, useState } from 'react';
import { useUser } from '../../../Providers/UserProv';
import './side-bar.scss';
import questionMark from '/public/images/question-mark.png';
import NodeInfoBox from './info-box';
import cselec from '../../../data/electives/cselec.json';
import pubheaelthelec from '../../../data/electives/pubhealthelec.json';
import pubheaelthcore from '../../../data/requirements/pubhealthcore.json';
import csbsreq from '../../../data/requirements/csbsreq.json';
import csbareq from '../../../data/requirements/csbareq.json';

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
        <li>
          <strong>Color Guide: </strong> Blue = Core Class, Yellow = Elective Class
        </li>
      </ul>
      <button onClick={onClose}>Close</button>
    </div>
  </div>
);

const SideBar = () => {
  const { classesNotTaken, setClassesNotTaken, major } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChecked, setIsChecked] = useState<"ID" | "Name">("ID");
  const [searchText, setSearchText] = useState<string>("");
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [infoBoxMessage, setInfoBoxMessage] = useState<string | null>('')
  const [infoBoxVisible, setInfoBoxVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const infoBoxDelayTime = 1500;

  const electiveList = major === 'computer-science-ba' || major === 'computer-science-bs' ? cselec : pubheaelthelec;
  let coreList: string | string[] = [];
  if (major === 'computer-science-ba') {
    coreList = csbareq;
  } else if (major === 'computer-science-bs') {
    coreList = csbsreq;
  } else if (major === 'public-health') {
    coreList = pubheaelthcore;
  }

  const onDragStart = (event: any, nodeType: any, nodeId: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('nodeId', nodeId);
  };

  useEffect(() => {
    // Track mouse position
    const handleMouseMove = (event: any) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const onDragEnd = (event: any, nodeId: string) => {
    console.log(nodeId, event);
    setClassesNotTaken((prevClasses) =>
      prevClasses.filter((classItem) => !classItem.taken)
    );
  };

  const handleNodeHover = (event: any, classId: string) => {
    console.log(event)
    const hoveredNode = classesNotTaken.find((c) => c.id === classId)
    let message = ""
    if (hoveredNode) {
      message += hoveredNode.id + "\n"
      message += hoveredNode.title + "\n"
      message += "Credit Hours: " + hoveredNode.credits + "\n"
      if (hoveredNode.prerequisitesAND.length > 0 || hoveredNode.prerequisitesOR.length > 0) {
        message += "Prerequisites: "
        if (hoveredNode.prerequisitesAND.length > 0 && hoveredNode.prerequisitesOR.length > 0) {
          for (let i = 0; i < hoveredNode.prerequisitesAND.length; i++) {
            message += hoveredNode.prerequisitesAND[i].id
            if (hoveredNode.prerequisitesAND.length != 1) {
              message += ", "
            }
            if (i === hoveredNode.prerequisitesAND.length - 1) {
              message += " and "
            }
          }
          for (let i = 0; i < hoveredNode.prerequisitesOR.length; i++) {
            message += hoveredNode.prerequisitesOR[i].id
            if (i != hoveredNode.prerequisitesOR.length - 1 && hoveredNode.prerequisitesOR.length != 2) {
              message += ", "
            }
            if (i === hoveredNode.prerequisitesOR.length - 2) {
              message += " or "
            }
          }
        }
        else if (hoveredNode.prerequisitesAND.length > 0) {
          for (let i = 0; i < hoveredNode.prerequisitesAND.length; i++) {
            message += hoveredNode.prerequisitesAND[i].id
            if (i != hoveredNode.prerequisitesAND.length - 1 && hoveredNode.prerequisitesAND.length != 2) {
              message += ", "
            }
            if (i === hoveredNode.prerequisitesAND.length - 2) {
              message += " and "
            }
          }
        }
        else if (hoveredNode.prerequisitesOR.length > 0) {
          for (let i = 0; i < hoveredNode.prerequisitesOR.length; i++) {
            message += hoveredNode.prerequisitesOR[i].id
            if (i != hoveredNode.prerequisitesOR.length - 1 && hoveredNode.prerequisitesOR.length != 2) {
              message += ", "
            }
            if (i === hoveredNode.prerequisitesOR.length - 2) {
              message += " or "
            }
          }
        }

      }

      // Use setTimeout to show the NodeInfoBox after 3 seconds
      const timeout = setTimeout(() => {
        if (classId === hoveredNode.id) {
          setInfoBoxMessage(message)
          //console.log(message)
          setInfoBoxVisible(true)
          // Set a state to make the NodeInfoBox visible
          // You can store additional node information in state if needed
          // Example: setSelectedNodeInfo(node);
        }
      }, infoBoxDelayTime);
      setTimeoutId(timeout);
    }
  };

  const handleNodeUnhover = () => {
    setInfoBoxVisible(false)
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    console.log(searchText);
  }, [searchText]);

  return (
    <aside>
      <div className='SideBarHeader'>
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
        <input className="SearchBar" type="text" placeholder={`Search class by ${isChecked}`}
          onChange={(e) => { setSearchText(e.target.value) }}
          value={searchText}
        />
        <div className='ButtonGroup'>
          <div className='RadioButton'>
            <input type="radio" id="ID" checked={isChecked === "ID" ? true : false} value="ID"
              onChange={() => {
                setIsChecked("ID");
              }} />
            <label>Search By ID</label>
          </div>
          <div className='RadioButton'>
            <input type="radio" id="Name" checked={isChecked === "Name" ? true : false}
              onChange={() => {
                setIsChecked("Name");
              }} value="Name" />
            <label>Search By Name</label>
          </div>
        </div>
      </div>
      <div className='classesContainer'>
        {classesNotTaken.map((classItem: ClassList) => {
          const isElective = electiveList.includes(classItem.id);
          const isCore = coreList.includes(classItem.id);
          if (!searchText) {
            return (
              <div
                key={classItem.id}
                className={`dndnode ${isCore ? 'core-node' : ''} ${isElective ? 'elective-node' : ''}`}
                onDragStart={(event) => onDragStart(event, classItem.title, classItem.id)}
                onDragEnd={(event) => onDragEnd(event, classItem.id)}
                onMouseEnter={(event) => handleNodeHover(event, classItem.id)}
                onMouseLeave={() => handleNodeUnhover()}
                draggable
              >
                {classItem.id} - {classItem.title}
              </div>)
          } else {
            if (classItem.id.toLowerCase().includes(searchText.toLocaleLowerCase()) && isChecked === "ID") {
              return (
                <div
                  key={classItem.id}
                  className={`dndnode ${isCore ? 'core-node' : ''} ${isElective ? 'elective-node' : ''}`}
                  onDragStart={(event) => onDragStart(event, classItem.title, classItem.id)}
                  onDragEnd={(event) => onDragEnd(event, classItem.id)}
                  onMouseEnter={(event) => handleNodeHover(event, classItem.id)}
                  onMouseLeave={() => handleNodeUnhover()}
                  draggable
                >
                  {classItem.id} - {classItem.title}
                </div>)
            } else if (classItem.title.toLowerCase().includes(searchText.toLocaleLowerCase()) && isChecked === "Name") {
              return (
                <div
                  key={classItem.id}
                  className={`dndnode ${isCore ? 'core-node' : ''} ${isElective ? 'elective-node' : ''}`}
                  onDragStart={(event) => onDragStart(event, classItem.title, classItem.id)}
                  onDragEnd={(event) => onDragEnd(event, classItem.id)}
                  onMouseEnter={(event) => handleNodeHover(event, classItem.id)}
                  onMouseLeave={() => handleNodeUnhover()}
                  draggable
                >
                  {classItem.id} - {classItem.title}
                </div>)
            }
          }
        })}
        <NodeInfoBox
          node={infoBoxMessage}
          isVisible={infoBoxVisible}
          style={{ top: `${mousePosition.y}px`, left: `${mousePosition.x - 75}px` }}
        />
      </div>

      {isModalOpen && <Modal onClose={closeModal} />}
    </aside>
  );
};

export default SideBar;