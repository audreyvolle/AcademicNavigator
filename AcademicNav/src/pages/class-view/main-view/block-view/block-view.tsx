import { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
    Node,
    ReactFlowProvider,
    useNodesState,
    ReactFlowInstance,
} from 'reactflow';   //removed addEdge, useEdgesState, Controls
import 'reactflow/dist/style.css';
import SideBar from '../../side-bar/side-bar';
import './block-view.scss';
import { useUser } from '../../../../Providers/UserProv';
//import testData from '../../../../data/scraped/test2.json';



//arrays
const coreSemesters: string | string[] = [];

//colors
const takenColor = 'rgba(178,255,102,1)';
const readyColor = 'rgb(255,255,255)';
const unavailableColor = 'rgba(255,153,153,1)';
let setColor = 'rgb(255,255,255)';
const addSemesterColor = 'rgb(128,128,128)'




let id = 0;
const getId = () => `dndnode_${id++}`;

const BlockView = () => {
    const { classArray, setClassArray } = useUser();
    //const classArray = testData;
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [hoverSem, setHoverSem] = useState("");

    //let hoverSem
    let groupCount = 0;
    let parentID = 0;
    let col = 0;


    //populate the semesters array
    classArray.forEach(function (value) {

        if (!coreSemesters.includes(value.semester) && value.semester != null && value.semester != "") {
            coreSemesters.push(value.semester);
        }
    })

    //sort semesters by year/season
    customSort(coreSemesters)


    const semesters: string[] = fillSemesters(lastSemester(coreSemesters)); //coreSemesters[coreSemesters.length - 1]
    const semesterClassCount = new Array(semesters.length).fill(0);

    //create nodes for each semester
    semesters.forEach(function (value) {
        if (value == hoverSem) {
            nodes.push({
                id: value,
                data: { label: value },
                position: { x: 25 + (col * 425), y: 25 + (groupCount * 275) },
                className: 'light',
                style: { backgroundColor: 'rgba(225,225,225,0)', width: 400, height: 250, fontSize: 20, borderColor: 'green', borderWidth: 'thick' },
                selectable: false,
                connectable: false
            })
        }
        else {
            nodes.push({
                id: value,
                data: { label: value },
                position: { x: 25 + (col * 425), y: 25 + (groupCount * 275) },
                className: 'light',
                style: { backgroundColor: 'rgba(225,225,225,0)', width: 400, height: 250, fontSize: 20 },
                selectable: false,
                connectable: false
            })
        }

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
        if (value.semester != null && value.semester != "") {
            //if it has untaken prereqs, make it red
            if (value.prerequisites && value.prerequisites.length > value.prerequisitesTaken.length) {
                setColor = unavailableColor
            }

            if (!value.taken) {
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

                semesterClassCount[parentID]++
            }
        }
    })

    const onClick = useCallback((event: React.MouseEvent, node: Node) => {
        event.preventDefault()
        if (node.id === 'addSemester') {
            let semOutput = "";
            const lastindex = semesters[semesters.length - 1]

            const matchResult = lastindex.match(/\d+/);
            let year;
            if (matchResult) {
                year = parseInt(matchResult[0])
            }
            else {
                return
                //year = new Date().getFullYear()
            }
            const isSpring = lastindex.includes("Spring")
            //const groupposition = groupcount * groupspacing

            if (isSpring) {
                semOutput = "Fall " + year
            }
            else {
                semOutput = "Spring " + (year + 1)
            }
            semesters.push(semOutput)
            coreSemesters.push(semOutput)

            nodes.push({
                id: semOutput,
                data: { label: semOutput },
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
            console.log(nodes)
            console.log(groupCount)
        }
        else {
            if (node.parentNode) {
                setHoverSem(node.parentNode)
            }
            else {
                setHoverSem(node.id);
            }
        }

    }, [groupCount, nodes, col, semesters, coreSemesters, setHoverSem])


    useEffect(() => {
        if (reactFlowInstance) {
            // reactFlowInstance is available, perform initialization here
            console.log('Component is initialized');
        }
    }, [reactFlowInstance]);

    //Drag Event Handler
    const onDragOver = useCallback((event: any) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';

    }, []);

    //Drop Event Handler
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

                //find the class in the classArray
                /*classArray.forEach(function (value) {
                    if (value.title == type) {
                        //set it's semester to the label of the parent node
                        value.semester = hoverSem
                    }
                })*/

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
                            classItem === classToMove ? { ...classItem, semester: hoverSem } : classItem // DARIN CHANGE THIS TO ALSO UPDATE THE SEMESTER AND OTHER VARIABLES!!
                        );
                        setClassArray(updatedClassArray);
                        console.log(classArray);
                    }
                    //setNodes((nds) => nds.concat(newNode));
                    setNodes((nds) =>
                        nds.map((node) => (node.id === newNode.id ? newNode : node))
                    );
                }

            }
        },
        [reactFlowInstance, setNodes, classArray, setClassArray, hoverSem]
    );

    //sets hoverSem to the id of the semester block being moused over
    /*
    const mouseOver = useCallback((event: React.MouseEvent, node: Node) => {
        event.preventDefault()

        if (node.parentNode) {
            setHoverSem(node.parentNode)
        }
        else {
            setHoverSem(node.id);
        }

    }, [setHoverSem])
    

    const nodeClick = useCallback((node: Node) => {
        //event.preventDefault()

        if (node.parentNode) {
            setHoverSem(node.parentNode)
        }
        else {
            setHoverSem(node.id);
        }

    }, [setHoverSem])
    */

    return (
        <div className="dndflow">
            <ReactFlowProvider>
                <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ width: '66vw', height: '80vh' }}>
                    <ReactFlow
                        nodes={nodes}
                        onNodesChange={onNodesChange}
                        panOnScroll={true}
                        panOnDrag={false}
                        zoomOnDoubleClick={false}
                        onInit={setReactFlowInstance}
                        onNodeClick={onClick}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        fitView
                    />
                </div>
                <SideBar />
            </ReactFlowProvider>
        </div>
    );
}

//sorts semesters by year and season
function customSort(arr: string[]): string[] {
    return arr.sort((a, b) => {
        const matchA = a.match(/\d+/)
        const matchB = b.match(/\d+/)
        let aYear, bYear
        if (matchA) {

            aYear = parseInt(matchA[0])
        }
        else {
            aYear = 0;
        }

        if (matchB) {
            bYear = parseInt(matchB[0])
        }
        else {
            bYear = 0;
        }
        const aSeason = a.includes("Spring") ? 0 : 1
        const bSeason = b.includes("Spring") ? 0 : 1

        if (aYear !== bYear) {
            return aYear - bYear
        }
        return aSeason - bSeason
    });
}

//returns the latest semester in the array of semester
function lastSemester(arr: string[]): string {
    arr.sort((a, b) => {
        const matchA = a.match(/\d+/)
        const matchB = b.match(/\d+/)
        let aYear, bYear
        if (matchA) {

            aYear = parseInt(matchA[0])
        }
        else {
            aYear = 0;
        }

        if (matchB) {
            bYear = parseInt(matchB[0])
        }
        else {
            bYear = 0;
        }
        const aSeason = a.includes("Spring") ? 0 : 1
        const bSeason = b.includes("Spring") ? 0 : 1

        if (aYear !== bYear) {
            return aYear - bYear
        }
        return aSeason - bSeason
    });
    return arr[arr.length - 1]
}

//given the last semester in the critical path, this method will return an array of semester strings from now till then
function fillSemesters(target: string): string[] {
    const today = new Date()
    let curYear = parseInt(today.getFullYear().toString()) //describes the year of the starting semester
    let isSpring //describes the season of the starting semester
    let targetYear //describes the year of the last semester
    let targetIsSpring //describes the season of the last semester
    const filled: string[] = []; //the return array

    //assign the current season
    if (today.getMonth() < 6) {
        isSpring = true;
    }
    else {
        isSpring = false;
    }

    //parse the target year and season from the string
    const hasInt = target.match(/\d+/)
    if (hasInt) {
        targetYear = parseInt(hasInt[0]);
        if (target.includes("Spring")) {
            targetIsSpring = true;
        }
        else {
            targetIsSpring = false;
        }
    }
    else {
        targetYear = curYear;
        targetIsSpring = isSpring;
    }

    //format the semester strings
    let sem
    while (curYear < targetYear || isSpring != targetIsSpring) { //exit case is when curYear and isSpring
        if (isSpring) {
            sem = "Spring " + curYear;
        }
        else {
            sem = "Fall " + curYear;
            curYear++;
        }
        isSpring = !isSpring

        //add the formatted semester to the array
        filled.push(sem);

    }

    //add the last semester
    if (isSpring) {
        sem = "Spring " + curYear;
    }
    else {
        sem = "Fall " + curYear;
        curYear++;
    }
    isSpring = !isSpring

    //add the formatted semester to the array
    filled.push(sem);
    

    return filled
}


export default BlockView;





////THIS IS WHERE THE MAIN CODE STARTS ---- GUT IT AND MOVE ON


/*



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

*/