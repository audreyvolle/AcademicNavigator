import 'reactflow/dist/style.css';
import './graph-view.scss'
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    Node,
    ReactFlow,
    ReactFlowInstance,
    ReactFlowProvider,
    Controls,
    useNodesState,
    useEdgesState,
    addEdge
} from 'reactflow';
import SideBar from '../../side-bar/side-bar';
import { useUser, PrerequisiteType } from '../../../../Providers/UserProv';
import cselec from '../../../../data/electives/cselec.json';
import pubheaelthelec from '../../../../data/electives/pubhealthelec.json';
import pubheaelthcore from '../../../../data/requirements/pubhealthcore.json';
import csbsreq from '../../../../data/requirements/csbsreq.json';
import csbareq from '../../../../data/requirements/csbareq.json';


//spacing
const initspacing = 25;
const xspacing = 175;
const yspacing = 50
const groupspacing = 160
const groupxposition = 33

//sizes
const groupwidth = 900;
const groupheight = 135

//counts
let groupcount = 0;
let edgeCount = 0;
let parentId = 0;
const warningMessageDuration = 4500;

//arrays
const semesters: string | string[] = [];
let semesterClassCount: number[] = [];

//colors
const semesterColor = 'rgba(225,225,225,0)'
const addSemesterColor = 'rgb(128,128,128)'


let coreList: string | string[] = [];

const semesterGroupStyle = { //Styling for the semester nodes
    backgroundColor: semesterColor,
    width: groupwidth,
    height: groupheight,
    textAlign: 'left',
    fontSize: '15px',
    fontWeight: 'bold'
};

const GraphView = () => {

    const { classArray, setClassArray, currentSemester, creditHours, major } = useUser();
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');

    const electiveList = major === 'computer-science-ba' || major === 'computer-science-bs' ? cselec : pubheaelthelec;

    if (major === 'computer-science-ba') { //sets the core list the the right one fot the major chosen
        coreList = csbareq;
    } else if (major === 'computer-science-bs') {
        coreList = csbsreq;
    } else if (major === 'public-health') {
        coreList = pubheaelthcore;
    }

    useEffect(() => {//used to set up the semesters and classes that have a semester set on them
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
            if (emptySemesters != -1) {
                const slicedSemesters = semesters.slice(0, emptySemesters)
                semesters.splice(0, semesters.length)
                slicedSemesters.forEach(function (value) {
                    semesters.push(value)
                })
            }
        }
        groupcount = 0;
        if (!semesters.includes(currentSemester)) {
            semesters.push(currentSemester);
        } //if the semester given in the settings is not present, add it
        classArray.forEach(function (value) {
            if (!semesters.includes(value.semester) && value.semester != null && value.semester != "") {
                semesters.push(value.semester);
            }
        })//adds each class's semesters to the semester array
        semesterSort(semesters) //sorts the semester array by year and Spring vs Fall
        semesterClassCount = new Array(semesters.length).fill(0);

        console.log('adding the semesters as groups')
        semesters.forEach(function (value) { //Creates the group nodes for each semester
            nodes.push({
                id: value,
                data: { label: value },
                position: { x: groupxposition, y: groupcount * groupspacing },
                className: 'light',
                style: semesterGroupStyle as React.CSSProperties,
                selectable: false,
                connectable: false,
                draggable: false
            })
            groupcount++
        })
        console.log('add semester button')
        nodes.push({ //creates the add semester button below the semesters
            id: 'addSemester',
            data: { label: 'Add Semester' },
            position: { x: groupxposition, y: groupcount * groupspacing },
            className: 'light',
            style: { backgroundColor: addSemesterColor, width: groupwidth, height: groupheight },
            selectable: false,
            connectable: false,
            draggable: false
        })
        console.log('registering the classes as nodes')
        classArray.forEach(function (value) {
            //create all the class nodes and relationship edges for the graph
            const isCore = coreList.includes(value.id);
            // Check if the class is an elective
            const isElective = electiveList.includes(value.id);

            //set color based on class type (Normal, Core, or Elective)
            const classColor = isCore ? 'rgb(158, 158, 228)' : (isElective ? 'rgb(234, 234, 153)' : 'rgb(255,255,255)');

            parentId = semesters.findIndex(item => item === value.semester)
            if (value.semester != null && value.semester != "") { //checks if the semester value of the class is valid. If so, add the class to the correct semester
                nodes.push(
                    {
                        id: value.id,
                        position: { x: semesterClassCount[parentId] * xspacing + initspacing, y: yspacing },
                        data: { label: value.id + " - " + value.title }, style: { backgroundColor: classColor },
                        parentNode: value.semester,
                        expandParent: true,
                        selectable: false,
                        draggable: false,
                        dragging: false,
                        focusable: false
                    })
            }
            if (value.prerequisitesAND.length > 0) { //creates all the edges for and AND prereqs
                edgeCount = findEdges(value.prerequisitesAND, classArray, edges, value.id, edgeCount);
            }
            if (value.prerequisitesOR.length > 0) { //edges for the OR prereqs
                edgeCount = findEdges(value.prerequisitesOR, classArray, edges, value.id, edgeCount);
            }
            semesterClassCount[parentId]++
        })
        setIsLoading(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), []);

    const onDragOver = useCallback((event: any) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback( //handles when a class is dragged over from the sidebar
        (event: any) => {
            event.preventDefault();

            const reactFlowBounds = reactFlowWrapper.current as HTMLElement | null;

            if (reactFlowBounds) {//makes sure it's in the proper bounds
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

                    //checks which group the mouse position is over if it is over a group
                    for (const element of nodes) {
                        parentId = semesters.findIndex((semester) => semester === element.id)
                        if ( //this checks all the possible nodes that the user dropped the class on. It makes sure it is a valid semester group.
                            element.width != null &&
                            element.height != null &&
                            element.id != null &&
                            parentId != -1 &&
                            position.x >= element.position.x &&
                            position.x <= element.position.x + element.width &&
                            position.y >= element.position.y &&
                            position.y <= element.position.y + element.height
                        ) {
                            console.log("The Semester dragged onto is " + element.id)
                            const classToMove = classArray.find((classItem) => classItem.title === type);
                            if (classToMove != null) {//logic behind adding the class
                                const reqAND: any[] = []
                                const reqOR: any[] = []
                                let validAddition = true;
                                
                                if (classToMove.prerequisitesAND.length > 0) { //collects all the classes in classToMove's prerequisitesAND and puts them into the local reqAND array
                                    classToMove.prerequisitesAND.forEach(function (req) {
                                        const i = classArray.findIndex((section) => section.id === req.id)
                                        if (i != -1) {
                                            reqAND.push(classArray[i])
                                        }
                                    })
                                }
                                if (classToMove.prerequisitesOR.length > 0) {
                                    classToMove.prerequisitesOR.forEach(function (req) { //collects all the classes in classToMove's prerequisitesOR and puts them into the local reqOR array
                                        const i = classArray.findIndex((section) => section.id === req.id)
                                        if (i != -1) {
                                            reqOR.push(classArray[i])
                                        }
                                    })
                                }
                                //the following if statements make sure the class dragged in has the proper requirements for being added
                                if (reqAND.length > 0 && reqAND.some((item) => item.taken === false) && reqOR.length > 0 && !reqOR.some((item) => item.taken === true)) {
                                    //if a class both prereqOR and prereqAND prereqs, makes sure that all classes in the prerequisitesAND array are marked as taken
                                    // and that at least one class in the prerequisitesOR array is marked as taken
                                    let message = ""
                                    const missingReqAND = reqAND.filter((c) => c.taken === false)
                                    const missingReqOR = reqOR.filter((c) => c.taken === false)
                                    for (let i = 0; i < missingReqAND.length; i++) { //these two for loops build the error message so that the user can see which classes they are missing
                                        message += missingReqAND[i].id
                                        if (missingReqAND.length != 1) {
                                            message += ", "
                                        }
                                        if (i === missingReqAND.length - 1) {
                                            message += " and "
                                        }
                                    }
                                    for (let i = 0; i < missingReqOR.length; i++) {
                                        message += missingReqOR[i].id
                                        if (i != missingReqOR.length - 1 && missingReqOR.length != 2) {
                                            message += ", "
                                        }
                                        if (i === missingReqOR.length - 2) {
                                            message += " or "
                                        }
                                    }
                                    console.log("Unsatisfied prereqOR and prereqAND")
                                    triggerWarning("Missing Prerequisites for " + classToMove.id + " " + classToMove.title + ": " + message)
                                    validAddition = false
                                }
                                else if (reqAND.length > 0 && reqAND.some((item) => item.taken === false)) {
                                    //if a class only has prereqAND prereqs or the prereqORs are satified, makes sure that all classes in the prerequisitesAND array are marked as taken
                                    let message = ""
                                    const missingReqAND = reqAND.filter((c) => c.taken === false)
                                    for (let i = 0; i < missingReqAND.length; i++) {
                                        message += missingReqAND[i].id
                                        if (i != missingReqAND.length - 1 && missingReqAND.length != 2) {
                                            message += ", "
                                        }
                                        if (i === missingReqAND.length - 2) {
                                            message += " and "
                                        }
                                    }
                                    console.log("Unsatisfied prereqAND")
                                    triggerWarning("Missing Prerequisites for " + classToMove.id + " " + classToMove.title + ": " + message)
                                    validAddition = false
                                }
                                else if (reqOR.length > 0 && !reqOR.some((item) => item.taken === true)) {
                                    //if a class only has prereqOR prereqs or the prereqANDs are satified, makes sure that at least one class in the prerequisitesOR array is marked as taken
                                    let message = ""
                                    const missingReqOR = reqOR.filter((c) => c.taken === false)
                                    for (let i = 0; i < missingReqOR.length; i++) { //error message building
                                        message += missingReqOR[i].id
                                        if (i != missingReqOR.length - 1 && missingReqOR.length != 2) {
                                            message += ", "
                                        }
                                        if (i === missingReqOR.length - 2) {
                                            message += " or "
                                        }
                                    }
                                    console.log("Unsatisfied prereqOR")
                                    triggerWarning("Missing Prerequisites for " + classToMove.id + " " + classToMove.title + ": " + message)
                                    validAddition = false
                                }
                                if (reqAND.length > 0 && validAddition) {
                                    //makes sure that the class is not put before or the same semester as a prereq | checks prereqAND
                                    if (reqAND.some((req) => !semesterGreaterThan(element.id, req.semester))) {
                                        console.log("Class in wrong order - PrereqAND")
                                        triggerWarning("Class " + classToMove.id + " " + classToMove.title + " cannot be in the same semester or before one of it's prerequisites")
                                        validAddition = false
                                    }
                                }
                                if (reqOR.length > 0 && validAddition) {
                                    //makes sure that the class is not put before or the same semester as a prereq | checks prereqOR
                                    if (!reqOR.some((req) => semesterGreaterThan(element.id, req.semester))) {
                                        console.log("Class in wrong order - PrereqOR")
                                        triggerWarning("Class " + classToMove.id + " " + classToMove.title + " cannot be in the same semester or before one of it's prerequisites")
                                        validAddition = false
                                    }
                                }
                                const semesterClasses = classArray.filter((classes) => classes.semester === element.id);
                                let currentCreditHours = 0;
                                semesterClasses.forEach(function (classes) { currentCreditHours += classes.credits })

                                if (currentCreditHours + classToMove.credits > creditHours && validAddition) {
                                    //checks to make sure that the current credit hours plus the classes credit hours don't exceed the max selected in the menu
                                    console.log("Credit Hour Check Failed")
                                    triggerWarning("This will set you over your desired credit hours of " + creditHours)
                                    validAddition = false;
                                }
                                if (validAddition) {
                                    //if the class passes all the checks, it gets added as a node
                                    console.log("Second Success")
                                    const isCore = coreList.includes(classToMove.id);
                                    const isElective = electiveList.includes(classToMove.id);  
                                    const classColor = isCore ? 'rgb(158, 158, 228)' : (isElective ? 'rgb(234, 234, 153)' : 'rgb(255,255,255)');
                              
                                    const newNode =
                                    {//node creation
                                        id: classToMove.id,
                                        position: { x: semesterClassCount[parentId] * xspacing + initspacing, y: yspacing },
                                        data: { label: classToMove.id + " - " + classToMove.title }, style: { backgroundColor: classColor },
                                        parentNode: element.id,
                                        expandParent: true,
                                        selectable: false,
                                        draggable: false,
                                        dragging: false,
                                        focusable: false
                                    }

                                    semesterClassCount[parentId]++
                                    if (classToMove) {
                                        // Set taken to true and set's the class's semester for the class being moved
                                        const updatedClassArray = classArray.map((classItem) =>
                                            classItem === classToMove ? { ...classItem, taken: true, semester: element.id } : classItem
                                        );
                                        setClassArray(updatedClassArray);
                                        console.log(classArray);
                                    }
                                    setNodes((nds) => nds.concat(newNode));
                                }



                            }


                        }
                    }
                }
            }
        },
        [classArray, creditHours, electiveList, nodes, reactFlowInstance, setClassArray, setNodes]
    );

    //used for node deletion
    const onNodeDoubleClick = useCallback((event: React.MouseEvent, doubleClickedNode: Node) => { //use for deleting a class node or semester node
        event.preventDefault()
        if (doubleClickedNode.id === 'addSemester') { //checks to see if the node is the addSemester button
            console.log("add semester double clicked, how did you do this...")
            return
        }
        else if (semesters.findIndex((semester) => semester === doubleClickedNode.id) != -1) { //checks to see if the node double clicked is a semester node
            const semesterLastIndex = semesters.length - 1;
            if (semesters.findIndex((semester) => semester === doubleClickedNode.id) === semesterLastIndex) { //checks to make sure the user clicked on the last semester in the list
                if (semesterClassCount[semesterLastIndex] === 0) { //checks to make sure the semester has no classes in it
                    if (semesterClassCount.length === 1) { //makes sure the user can't delete a semester if it's the only one in the list
                        triggerWarning("The semester cannot be removed because it is the only semester in the list. You must have at least one semester in the list.")
                    }
                    else { //successfull semester deletion
                        console.log("last semester double clicked")
                        const semesterToRemove = semesters[semesterLastIndex]
                        groupcount--;
                        semesters.pop()
                        semesterClassCount.pop()
                        console.log(nodes)
                        nodes.splice(nodes.findIndex((node) => node.id === semesterToRemove), 1) //removes the semester from the nodes
                        const nodeToUpdate = nodes.findIndex((nnode) => nnode.id === 'addSemester')

                        if (nodeToUpdate !== -1) { //updates the coordinates of the add semester button
                            const updatedNodes = [...nodes]
                            updatedNodes[nodeToUpdate] = {
                                ...updatedNodes[nodeToUpdate],
                                position: { x: groupxposition, y: groupcount * groupspacing },
                            };
                            setNodes(updatedNodes);
                        }
                        return
                    }

                } else { //checks to make sure the semester has no classes in it
                    triggerWarning("Cannot Remove a Semester that has classes")
                }
            } else { //checks to make sure the user clicked on the last semester in the list
                triggerWarning("Can only remove the last semester")
                console.log("non last semester double clicked")
                return
            }
        }
        else { //detects a class was double clicked
            console.log("class node doubleclicked")
            const classInfo = classArray.find((element) => element.id === doubleClickedNode.id)
            const semesterId = semesters.findIndex((semester) => semester === classInfo?.semester)
            
            semesterClassCount[semesterId]--
            const updatedNodes = nodes.filter((element) => element.id !== doubleClickedNode.id);

            if (semesterClassCount.length > 0) { //moves any classes over to prevent gaps and overlapping when another class is added to the semester
                let i = 0;
                updatedNodes.forEach(function (nnodes) {
                    if (nnodes.parentNode === classInfo?.semester) {
                        nnodes.position = { x: i * xspacing + initspacing, y: yspacing }
                        i++;
                    }
                })
            }
            setNodes(updatedNodes)

            const updatedClassArray = classArray.map((classItem) =>
                classItem === classInfo ? { ...classItem, taken: false, semester: "" } : classItem
            );                                                                                             
            setClassArray(updatedClassArray);

            return
        }
    }, [classArray, nodes, setClassArray, setNodes]);

    const onClick = useCallback((event: React.MouseEvent, clickedNode: Node) => { //used for the add semester button
        event.preventDefault()
        if (clickedNode.id === 'addSemester') {//makes sure the node clicked on is the add semester button
            let semOutput = "";
            const lastindex = semesters[semesters.length - 1]

            //determines what the next semester should be, based on the last semester in the view
            const year = parseInt(lastindex.match(/\d+/)[0])
            const isSpring = lastindex.includes("Spring")
            if (isSpring) {
                semOutput = "Fall " + year
            }
            else {
                semOutput = "Spring " + (year + 1)
            }

            //creates the new semester
            semesters.push(semOutput)
            nodes.push({
                id: semOutput,
                data: { label: semOutput },
                position: { x: groupxposition, y: groupcount * groupspacing },
                className: 'light',
                style: semesterGroupStyle as React.CSSProperties,
                selectable: false,
                connectable: false,
                draggable: false
            })
            groupcount++
            semesterClassCount.push(0)
            const nodeToUpdate = nodes.findIndex((nnode) => nnode.id === clickedNode.id)

            //updates the add semester button position to show below the new semester
            if (nodeToUpdate !== -1) {
                const updatedNodes = [...nodes]
                updatedNodes[nodeToUpdate] = {
                    ...updatedNodes[nodeToUpdate],
                    position: { x: groupxposition, y: groupcount * groupspacing },
                };
                setNodes(updatedNodes);
            }
        }
    }, [nodes, setNodes])

    if (isLoading) { //waits to render the graph until all the nodes and edges are generated
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
                <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ width: '66vw', height: '80vh' }} >
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        panOnScroll={true}
                        panOnDrag={false}
                        zoomOnDoubleClick={false}
                        onNodeClick={onClick}
                        onNodeDoubleClick={onNodeDoubleClick}
                    //fitView
                    >
                        <Controls />
                    </ReactFlow>
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findEdges(prerequisites: PrerequisiteType[], classes: any[], edgeArray: { id: string; source: string; target: string; }[] | undefined = [], checkingId: string, edgeCount: number) {
    //function that finds all the edges that the graph needs
    prerequisites.forEach(function (prereqs) {
        if (prereqs.id != "none") {
            classes.forEach(function (section) {
                if (section.id === prereqs.id) {
                    edgeCount++
                    edgeArray.push({ id: 'edge' + edgeCount, source: section.id, target: checkingId })
                }
            })
        }
    })
    return edgeCount
}

function semesterSort(arr: string[]): string[] {
    if (!arr) {
        return [];
    }

    return arr.sort((a, b) => {
        const aMatch = a.match(/\d+/);
        const bMatch = b.match(/\d+/);

        const aYear = aMatch ? parseInt(aMatch[0]) : 0;
        const bYear = bMatch ? parseInt(bMatch[0]) : 0;

        const aSeason = a.includes("Spring") ? 0 : 1;
        const bSeason = b.includes("Spring") ? 0 : 1;

        if (aYear !== bYear) {
            return aYear - bYear;
        }
        return aSeason - bSeason;
    });
}

function semesterGreaterThan(left: string, right: string): boolean {
    //checks if the left semester is later than the right semester.
    //example: Fall 2023 as left and Spring 2023 as right. Will return true since Fall 2023 is later than Spring 2023
    console.log("Left: " + left + " Right: " + right)
    const aYearMatch = left.match(/\d+/);
    const bYearMatch = right.match(/\d+/);
    if (aYearMatch && bYearMatch) {
        const aYear = parseInt(aYearMatch[0])
        const bYear = parseInt(bYearMatch[0])
        const aSeason = left.includes("Spring") ? 0 : 1
        const bSeason = right.includes("Spring") ? 0 : 1
        if (aYear > bYear) {
            return true
        }
        else if (aYear < bYear) {
            return false
        }
        else if (aSeason > bSeason) {
            return true
        }
        else {
            return false;
        }
    }
    else {
        return false
    }

}

export default GraphView;