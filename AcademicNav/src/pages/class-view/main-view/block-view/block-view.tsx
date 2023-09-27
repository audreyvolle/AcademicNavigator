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


//formatting

const spacing = 25;
const horizontalSpacing = 425;
const verticalSpacing = 275;

const semWidth = 400;
const semHeight = 250;
const classWidth = 350;

//colors
const takenColor = 'rgba(178,255,102,1)';
const readyColor = 'rgb(255,255,255)';
const unavailableColor = 'rgba(255,153,153,1)';
let setColor = 'rgb(255,255,255)';
const addSemesterColor = 'rgb(128,128,128)'

//arrays
const semesters: string | string[] = [];
let semesterClassCount: number[] = [];

//counts
let groupCount = 0;
let parentID = 0;
let col = 0;
const warningMessageDuration = 3500;


const BlockView = () => {
    const { classArray, setClassArray, currentSemester } = useUser();
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');


    useEffect(() => {

        //cleans up the empty semesters at the end
        if (semesters.length > 0) {
            //console.log(semesters)
            let emptySemesters = -1;
            for (let i = semesters.length; i > 0; i--) {
                if (semesterClassCount[i - 1] > 0 || (i === 1 && emptySemesters === - 1)) {
                    emptySemesters = i
                    break
                }
            }
            //console.log(emptySemesters)
            if (emptySemesters != -1) {
                //console.log("slicing")
                const slicedSemesters = semesters.slice(0, emptySemesters)
                semesters.splice(0, semesters.length)
                //console.log(slicedSemesters)
                slicedSemesters.forEach(function (value) {
                    semesters.push(value)
                })
            }
            //console.log(semesters)
        }

        //set up the arrays for the display formatting
        groupCount = 0;
        col = 0;

        /*
        if (!semesters.includes(currentSemester)) {
            semesters.push(currentSemester);
        }
        */


        classArray.forEach(function (value) {
            if (!semesters.includes(value.semester) && value.semester != null && value.semester != "") {
                semesters.push(value.semester);
            }
        })
        customSort(semesters)
        semesterClassCount = new Array(semesters.length).fill(0);


        //make a new Block for each semester
        console.log('adding the semesters as groups')
        semesters.forEach(function (value) {
            nodes.push({
                id: value,
                data: { label: value },
                position: { x: spacing + (col * horizontalSpacing), y: spacing + (groupCount * verticalSpacing) },
                className: 'light',
                style: { backgroundColor: 'rgba(225,225,225,0)', width: semWidth, height: semHeight, fontSize: 20 },
                selectable: false,
                connectable: false,
                draggable: false
            })
            if (col == 0) {
                col++
            }
            else {
                col--
                groupCount++
            }

            console.log('Semester added: ' + value)
        })

        //Add an extra block for the add semester button
        console.log('adding semester button')
        nodes.push({
            id: 'addSemester',
            data: { label: 'Add Semester' },
            position: { x: spacing + (col * horizontalSpacing), y: spacing + (groupCount * verticalSpacing) },
            className: 'light',
            style: { backgroundColor: addSemesterColor, width: semWidth, height: semHeight, fontSize: 30, verticalAlign: 'middle' },
            selectable: false,
            connectable: false,
            draggable: false
        })
        console.log('semester button added')

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
                
                if (!value.taken) {
                    nodes.push(
                        {
                            id: value.id,
                            position: { x: spacing, y: 20 + (semesterClassCount[parentID] + 1) * 30 },
                            data: { label: value.id + ": " + value.title },
                            style: { backgroundColor: setColor, width: classWidth },
                            parentNode: value.semester,
                            expandParent: true,
                            selectable: false,
                            draggable: false,
                            dragging: false,
                            focusable: true,
                            connectable: false
                        })
                    semesterClassCount[parentID]++
                }
            }
        })

        setColor = readyColor
        setIsLoading(false)

    }, []);


    //Click Event Handler
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

            nodes.push({
                id: semOutput,
                data: { label: semOutput },
                position: { x: 25 + (col * 425), y: 25 + (groupCount * 275) },
                className: 'light',
                style: { backgroundColor: 'rgba(225,225,225,0)', width: 400, height: 250, fontSize: 20 },
                selectable: false,
                connectable: false,
                draggable: false
            })
            if (col == 0) {
                col++
            }
            else {
                groupCount++
                col--
            }
            semesterClassCount.push(0);

            const nodeToUpdate = nodes.findIndex((nnode) => nnode.id === node.id)

            if (nodeToUpdate !== -1) {
                const updatedNodes = [...nodes]
                updatedNodes[nodeToUpdate] = {
                    ...updatedNodes[nodeToUpdate],
                    position: { x: 25 + (col * 425), y: 25 + (groupCount * 275) },
                };
                setNodes(updatedNodes);
            }

            //console.log(nodes)
            //console.log(groupCount)
        }

    }, [nodes, setNodes])

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

                if (reactFlowInstance) {
                    const position = reactFlowInstance.project({
                        x: event.clientX - reactFlowBounds.getBoundingClientRect().left,
                        y: event.clientY - reactFlowBounds.getBoundingClientRect().top,
                    });

                    //loop through all nodes
                    for (const element of nodes) {
                        parentID = semesters.findIndex((semester) => semester === element.id);

                        //if the target node's ID is a semester with a block and the cursor is over it
                        if (
                            element.id != null &&
                            parentID != -1 &&
                            position.x >= element.position.x &&
                            position.x <= element.position.x + element.width &&
                            position.y >= element.position.y &&
                            position.y <= element.position.y + element.height
                        ) {
                            console.log("The Semester dragged onto is " + element.id)
                            const classToMove = classArray.find((classItem) => classItem.title === type);


                            if (classToMove) {

                                const newNode = {
                                    id: classToMove.id,
                                    position: { x: spacing, y: 20 + (semesterClassCount[parentID] + 1) * 30 },
                                    data: { label: classToMove.id + ": " + classToMove.title },
                                    style: { backgroundColor: setColor, width: classWidth },
                                    parentNode: element.id,
                                    expandParent: true,
                                    selectable: false,
                                    draggable: false,
                                    dragging: false,
                                    focusable: true,
                                    connectable: false
                                }

                                const updatedClassArray = classArray.map((classItem) => classItem === classToMove ? {
                                    ...classItem, taken: true, semester: element.id
                                } : classItem);

                                semesterClassCount[parentID]++
                                setClassArray(updatedClassArray);
                                console.log(classArray);

                                setNodes((nds) => nds.concat(newNode));
                            }


                        } //end of if
                    }
                    
                }

            }
        },
        [reactFlowInstance, setClassArray, classArray, nodes, setNodes]
    );

    //used for node deletion
    const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => { //use for deleting a class node or semester node
        event.preventDefault()
        if (node.id === 'addSemester') {
            console.log("add semester double clicked, how did you do this...")
            return
        }
        else if (semesters.findIndex((semester) => semester === node.id) != -1) { //if its a semester node
            const semesterLastIndex = semesters.length - 1;

            //if it's the last semester in the array
            if (semesters.findIndex((semester) => semester === node.id) === semesterLastIndex) {

                //if last semester in the array is empty (no classes)
                if (semesterClassCount[semesterLastIndex] === 0) {
                    console.log("last semester double clicked")
                    const semesterToRemove = semesters[semesterLastIndex]
                    if (col == 0) {
                        col++
                        groupCount--
                    }
                    else {
                        col--
                    }
                    semesters.pop()
                    semesterClassCount.pop()
                    console.log(nodes)
                    nodes.splice(nodes.findIndex((node) => node.id === semesterToRemove), 1)
                    const nodeToUpdate = nodes.findIndex((nnode) => nnode.id === 'addSemester')

                    if (nodeToUpdate !== -1) {
                        const updatedNodes = [...nodes]
                        updatedNodes[nodeToUpdate] = {
                            ...updatedNodes[nodeToUpdate],
                            position: { x: spacing + (col * horizontalSpacing), y: spacing + (groupCount * verticalSpacing) },
                        };
                        setNodes(updatedNodes);
                    }
                    //setNodes(nodes)
                    return
                } else {
                    triggerWarning("Cannot Remove a Semester that has classes")
                }
            } else {
                triggerWarning("Can only remove the last semester (Temp)")
                console.log("non last semester double clicked")
                return
            }
        }
        else { //it's a class node
            console.log("class node doubleclicked")
            const classInfo = classArray.find((element) => element.id === node.id)
            const semesterId = semesters.findIndex((semester) => semester === classInfo.semester)

            semesterClassCount[semesterId]--
            const updatedNodes = nodes.filter((element) => element.id !== node.id);

            //condense the remaining class nodes 
            let x = 0
            updatedNodes.forEach((node) => {
                if (node.parentNode === classInfo.semester) {
                    x++

                    node.position = { x: spacing, y: 20 + x * 30 }
                }
            })

            setNodes(updatedNodes)


            const updatedClassArray = classArray.map((classItem) =>
                classItem === classInfo ? { ...classItem, taken: false, semester: "" } : classItem //Update the class array
            );
            setClassArray(updatedClassArray);

            return
        }
    }, [classArray, nodes, setClassArray, setNodes]);

    if (isLoading) {
        return <div>Loading...</div>;
    }


    const triggerWarning = (message: React.SetStateAction<string>) => { //used to alert the user of a warning or some error
        setShowWarning(false);
        console.log('Triggering warning...');
        setWarningMessage(message);
        setShowWarning(true);

        setTimeout(() => {
            setShowWarning(false);
            console.log('Disabling warning...');
        }, warningMessageDuration);
    };

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
                        onNodeDoubleClick={onNodeDoubleClick}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        fitView
                    />
                </div>
                <SideBar />
                {
                    <div className={`warning-box ${showWarning ? 'show' : 'hide'}`} >
                        <div className="message">{warningMessage}</div>
                    </div>
                }
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