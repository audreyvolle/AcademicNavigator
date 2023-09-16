import { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import SideBar from '../../side-bar/side-bar';
import './block-view.scss';
import { useUser } from '../../../../Providers/UserProv';
import testData from '../../../../data/scraped/test2.json';


//arrays
const semesters: string | string[] = [];

//colors
const takenColor = 'rgba(178,255,102,1)';
const readyColor = 'rgb(255,255,255)';
const unavailableColor = 'rgba(255,153,153,1)';
let setColor = 'rgb(255,255,255)';
const addSemesterColor = 'rgb(128,128,128)'


const BlockView = () => {

    let groupCount = 0;
    let parentID = 0;
    let col = 0;

    const [nodes, setNodes, onNodesChange] = useNodesState([]);

    //get class data
    //const { classArray } = useUser(); //Use this when incorporating UserProv
    const classArray = testData;

    //populate the semesters array
    classArray.forEach(function (value) {
        if (!semesters.includes(value.semester) && value.semester != null) {
            semesters.push(value.semester);
        }
    })

    //sort semesters by year/season
    customSort(semesters)

    const semesterClassCount = new Array(semesters.length).fill(0);

    //create nodes for each semester
    semesters.forEach(function (value) {
        nodes.push({
            id: value,
            data: { label: value },
            position: { x: 25 + (col * 425), y: 25 + (groupCount * 275) },
            className: 'light',
            style: { backgroundColor: 'rgba(225,225,225,0)', width: 400, height: 250, fontSize: 20 },
            selectable: false,
            connectable: false
        })
        if (col == 0) {
            col++
        }
        else {
            groupCount++
            col--
        }
    })

    //add a button node to add additional semesters
    nodes.push({
        id: 'addSemester',
        data: { label: 'Add Semester' },
        position: { x: 25 + (col * 425), y: 25 + (groupCount * 275) },
        className: 'light',
        style: { backgroundColor: addSemesterColor, width: 400, height: 250, fontSize: 30, verticalAlign: 'middle' },
        selectable: false,
        connectable: false
    })

    //Add classes to the display
    classArray.forEach(function (value) {
        //set color based off class status
        if (value.taken) {
            setColor = takenColor
        }
        else if (value.isReadyToTake) {
            setColor = readyColor
        }
        else {
            setColor = unavailableColor
        }

        parentID = semesters.findIndex(item => item === value.semester)
        if (value.semester != null) {
            nodes.push(
                {
                    id: value.id,
                    position: { x: 25, y: 20 + (semesterClassCount[parentID] + 1) * 30 },
                    data: { label: value.id + ": " + value.title },
                    style: { backgroundColor: setColor, width: 350 },
                    parentNode: value.semester,
                    extent: 'parent',
                    expandParent: true,
                    selectable: true,
                    draggable: true,
                    dragging: false,
                    focusable: true,
                    connectable: false
                })
        }
        semesterClassCount[parentID]++
    })

    const onClick = useCallback((event: React.MouseEvent, node: Node) => {
        event.preventDefault()
        if (node.id === 'addSemester') {
            let semOutput = "";
            const lastindex = semesters[semesters.length - 1]

            const year = parseInt(lastindex.match(/\d+/)[0])
            const isSpring = lastindex.includes("Spring")
            //const groupposition = groupcount * groupspacing

            if (isSpring) {
                semOutput = "Fall " + year
            }
            else {
                semOutput = "Spring " + (year + 1)
            }
            semesters.push(semOutput)
            nodes.push({
                id: semOutput,
                data: { label: semOutput },
                position: { x: 25 + (col * 425), y: 25 + (groupCount * 275) },
                className: 'light',
                style: { backgroundColor: 'rgba(225,225,225,0)', width: 400, height: 250, fontSize: 20 },
                selectable: false,
                connectable: false
            })
            groupCount++
            console.log(nodes)
            console.log(groupCount)
        }
    }, [groupCount, nodes, col])

    return (
        <div>
            <div style={{ width: '66vw', height: '80vh' }}>
                <ReactFlow
                    nodes={nodes}
                    onNodesChange={onNodesChange}
                    panOnScroll={true}
                    panOnDrag={false}
                    zoomOnDoubleClick={false}
                    onNodeClick={onClick}
                />
            </div>
        </div>
    );
}

function customSort(arr: string[]): string[] {
    return arr.sort((a, b) => {
        const aYear = parseInt(a.match(/\d+/)[0])
        const bYear = parseInt(b.match(/\d+/)[0])
        const aSeason = a.includes("Spring") ? 0 : 1
        const bSeason = b.includes("Spring") ? 0 : 1

        if (aYear !== bYear) {
            return aYear - bYear
        }
        return aSeason - bSeason
    });
}
  
let id = 0;
const getId = () => `dndnode_${id++}`;

const BlockView = () => {
  const { classArray, setClassArray } = useUser();
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Use useEffect to mimic onInit when reactFlowInstance changes
  useEffect(() => {
    if (reactFlowInstance) {
      // reactFlowInstance is available, perform initialization here
      console.log('Component is initialized');
    }
  }, [reactFlowInstance]);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), []);

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current as HTMLElement | null;

      if (reactFlowBounds) {
        const type = event.dataTransfer.getData('application/reactflow');

        // check if the dropped element is valid
        if (typeof type === 'undefined' || !type) {
          return;
        }

        if (reactFlowInstance) {
          const position = reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.getBoundingClientRect().left,
            y: event.clientY - reactFlowBounds.getBoundingClientRect().top,
          });

          const newNode = {
            id: getId(),
            type,
            position,
            data: { label: `${type}` },
          };
          
          const classToMove = classArray.find((classItem) => classItem.title === type);

          if (classToMove) {
            // Set taken to true for the class being moved
            const updatedClassArray = classArray.map((classItem) =>
              classItem === classToMove ? { ...classItem, taken: true } : classItem // DARIN CHANGE THIS TO ALSO UPDATE THE SEMESTER AND OTHER VARIABLES!!
              );
            setClassArray(updatedClassArray);
            console.log(classArray);
          }
            setNodes((nds) => nds.concat(newNode));
        }
      }
    },
    [reactFlowInstance]
  );

  return (
    <div className="dndflow">
      <ReactFlowProvider>
        <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ width: '66vw', height: '80vh' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
          >
            <Controls />
          </ReactFlow>
        </div>
        <SideBar />
      </ReactFlowProvider>
    </div>
  );
};

export default BlockView;