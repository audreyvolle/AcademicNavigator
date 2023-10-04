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


//spacing
const initspacing = 25;
const xspacing = 175; 
const yspacing = 50
const groupspacing = 150
const groupxposition = 33

//sizes
const groupwidth = 800;
const groupheight = 125

//counts
let groupcount = 0;
let edgeCount = 0;
let parentId = 0;
const warningMessageDuration = 4500;

//arrays
const semesters: string | string[] = [];
let semesterClassCount: number[] = [];

//colors
const classColor = 'rgb(255,255,255)'
const semesterColor = 'rgba(225,225,225,0)'
const addSemesterColor = 'rgb(128,128,128)'

const GraphView = () => {

    //const reactFlowWrapper = useRef(null);
    const { classArray, setClassArray, currentSemester, creditHours } = useUser();
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');

    useEffect(() => {//used to set up the semesters and classes that have a semester set on them
        //cleans up the empty semesters at the end
        if (semesters.length > 0) {
            //console.log(semesters)
            let emptySemesters = -1;
            for (let i = semesters.length; i > 0; i--) {
                if (semesterClassCount[i-1] > 0 || (i === 1 && emptySemesters === - 1)) {
                    emptySemesters = i
                    break
                }
            }
            //console.log(emptySemesters)
            if (emptySemesters != -1) {
                //console.log("slicing")
                const slicedSemesters = semesters.slice(0, emptySemesters)
                semesters.splice(0,semesters.length)
                //console.log(slicedSemesters)
                slicedSemesters.forEach(function (value) {
                    semesters.push(value)
                })
            }
            //console.log(semesters)
        }
        groupcount = 0;
        if (!semesters.includes(currentSemester)) {
            semesters.push(currentSemester);
        }
        classArray.forEach(function (value) {
            if (!semesters.includes(value.semester) && value.semester != null && value.semester != "") {
                semesters.push(value.semester);
            }
        })
        customSort(semesters)
        semesterClassCount = new Array(semesters.length).fill(0);
        console.log('adding the semesters as groups')
        semesters.forEach(function (value) {
            nodes.push({
                id: value,
                data: { label: value },
                position: { x: groupxposition, y: groupcount * groupspacing },
                className: 'light',
                style: { backgroundColor: semesterColor, width: groupwidth, height: groupheight },
                selectable: false,
                connectable: false,
                draggable: false
            })
            groupcount++
        })
        console.log('add semester button')
        nodes.push({
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
            //create all the nodes and edges for the graph
            
            parentId = semesters.findIndex(item => item === value.semester)
            if (value.semester != null && value.semester != "") {
                nodes.push(
                    {
                        id: value.id,
                        position: { x: semesterClassCount[parentId] * xspacing + initspacing, y: yspacing },
                        data: { label: value.title }, style: { backgroundColor: classColor },
                        parentNode: value.semester,
                        expandParent: true,
                        selectable: false,
                        draggable: false,
                        dragging: false,
                        focusable: false
                    })
            }
            if (value.prerequisitesAND.length > 0) {
                edgeCount = findEdges(value.prerequisitesAND, classArray, edges, value.id, edgeCount);
            }
            if (value.prerequisitesOR.length > 0) {
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
                    //console.log("if (reactflowInstance) triggered")

                    //checks which group the mouse position is over if it is over a group
                    for (const element of nodes) {
                        parentId = semesters.findIndex((semester) => semester === element.id)
                        if (
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
                            if (classToMove != null) {
                                const reqAND: any[] = []
                                const reqOR: any[] = []
                                let validAddition = true;

                                if (classToMove.prerequisitesAND.length > 0) {
                                    classToMove.prerequisitesAND.forEach(function (req) {
                                        const i = classArray.findIndex((section) => section.id === req.id)
                                        if (i != -1) {
                                            reqAND.push(classArray[i])
                                        }
                                    })
                                }
                                if (classToMove.prerequisitesOR.length > 0) {
                                    classToMove.prerequisitesOR.forEach(function (req) {
                                        const i = classArray.findIndex((section) => section.id === req.id)
                                        if (i != -1) {
                                            reqOR.push(classArray[i])
                                        }
                                    })
                                }
                                
                                if (reqAND.length > 0 && reqAND.some((item) => item.taken === false) && reqOR.length > 0 && !reqOR.some((item) => item.taken === true)) {
                                    console.log("First Drop Down Restriction")
                                    triggerWarning("Missing Prerequisites for " + classToMove.id + " " + classToMove.title)
                                    validAddition = false
                                }
                                else if (reqAND.length > 0 && reqAND.some((item) => item.taken === false)) {
                                    console.log("Second Drop Down Restriction")
                                    triggerWarning("Missing Prerequisites for " + classToMove.id + " " + classToMove.title)
                                    validAddition = false
                                }
                                else if (reqOR.length > 0 && !reqOR.some((item) => item.taken === true)) {
                                    console.log("Third Drop Down Restriction")
                                    triggerWarning("Missing Prerequisites for " + classToMove.id + " " + classToMove.title)
                                    validAddition = false
                                }
                                if (reqAND.length > 0) {
                                    if (reqAND.some((req) => !semesterGreaterThan(element.id, req.semester))) {
                                        console.log("Fourth Drop Down Restriction")
                                        triggerWarning("Class " + classToMove.id + " " + classToMove.title + " cannot be in the same semester or before one of it's prerequisites")
                                        validAddition = false
                                    }
                                }
                                if (reqOR.length > 0) {
                                    if (!reqOR.some((req) => semesterGreaterThan(element.id, req.semester))) {
                                        console.log("Fifth Drop Down Restriction")
                                        triggerWarning("Class " + classToMove.id + " " + classToMove.title + " cannot be in the same semester or before one of it's prerequisites")
                                        validAddition = false
                                    }
                                }
                                const semesterClasses = classArray.filter((classes) => classes.semester === element.id);
                                let currentCreditHours = 0;
                                semesterClasses.forEach(function (classes) { currentCreditHours += classes.credits })

                                if (currentCreditHours + classToMove.credits > creditHours) {
                                    console.log("Credit Hour Check Failed")
                                    triggerWarning("This will set you over your desired credit hours of " + creditHours)
                                    validAddition = false;
                                }
                                if (validAddition) { 
                                    console.log("Second Success")
                                    const newNode = 
                                    {
                                        id: classToMove.id,
                                        position: { x: semesterClassCount[parentId] * xspacing + initspacing, y: yspacing },
                                        data: { label: `${type}` }, style: { backgroundColor: classColor },
                                        parentNode: element.id,
                                        expandParent: true,
                                        selectable: false,
                                        draggable: false,
                                        dragging: false,
                                        focusable: false
                                    }
                            
                                    semesterClassCount[parentId]++
                                    if (classToMove) {
                                        // Set taken to true for the class being moved
                                        const updatedClassArray = classArray.map((classItem) =>
                                            classItem === classToMove ? { ...classItem, taken: true, semester: element.id} : classItem // MISAEL CHANGE THIS TO ALSO UPDATE THE SEMESTER AND OTHER VARIABLES!!
                                        );                                                                                             // I WILL OK!!!
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
        [classArray, creditHours, nodes, reactFlowInstance, setClassArray, setNodes]
    );

    //used for node deletion
    const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => { //use for deleting a class node or semester node
        event.preventDefault()
        if (node.id === 'addSemester') {
            console.log("add semester double clicked, how did you do this...")
            return
        }
        else if (semesters.findIndex((semester) => semester === node.id) != -1) {
            const semesterLastIndex = semesters.length - 1;
            if (semesters.findIndex((semester) => semester === node.id) === semesterLastIndex) {
                if (semesterClassCount[semesterLastIndex] === 0) {
                    if (semesterClassCount.length === 1) {
                        triggerWarning("The semester cannot be removed because it is the only semester in the list. You must have at least one semester in the list.")
                    }
                    else {
                        console.log("last semester double clicked")
                        const semesterToRemove = semesters[semesterLastIndex]
                        groupcount--;
                        semesters.pop()
                        semesterClassCount.pop()
                        console.log(nodes)
                        nodes.splice(nodes.findIndex((node) => node.id === semesterToRemove), 1)
                        const nodeToUpdate = nodes.findIndex((nnode) => nnode.id === 'addSemester')

                        if (nodeToUpdate !== -1) {
                            const updatedNodes = [...nodes]
                            updatedNodes[nodeToUpdate] = {
                                ...updatedNodes[nodeToUpdate],
                                position: { x: groupxposition, y: groupcount * groupspacing },
                            };
                            setNodes(updatedNodes);
                        }
                        //setNodes(nodes)
                        return
                    }
                    
                } else {
                    triggerWarning("Cannot Remove a Semester that has classes")
                }
            } else {
                triggerWarning("Can only remove the last semester")
                console.log("non last semester double clicked")
                return
            }
        }
        else {
            console.log("class node doubleclicked")
            const classInfo = classArray.find((element) => element.id === node.id)
            const semesterId = semesters.findIndex((semester) => semester === classInfo.semester)

            semesterClassCount[semesterId]--
            const updatedNodes = nodes.filter((element) => element.id !== node.id);
            setNodes(updatedNodes)

            const updatedClassArray = classArray.map((classItem) =>
                classItem === classInfo ? { ...classItem, taken: false, semester: "" } : classItem // MISAEL CHANGE THIS TO ALSO UPDATE THE SEMESTER AND OTHER VARIABLES!!
            );                                                                                             // I WILL OK!!!
            setClassArray(updatedClassArray);

            return
        }
    },[classArray, nodes, setClassArray, setNodes]);

    const onClick = useCallback((event: React.MouseEvent, node: Node) => { //used for the add semester button
        event.preventDefault()
        if (node.id === 'addSemester') {
            let semOutput = "";
            const lastindex = semesters[semesters.length - 1]

            const year = parseInt(lastindex.match(/\d+/)[0])
            const isSpring = lastindex.includes("Spring")
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
                position: { x: groupxposition, y: groupcount * groupspacing },
                className: 'light',
                style: { backgroundColor: semesterColor, width: groupwidth, height: groupheight },
                selectable: false,
                connectable: false,
                draggable: false
            })
            groupcount++
            semesterClassCount.push(0)
            const nodeToUpdate = nodes.findIndex((nnode) => nnode.id === node.id)

            if (nodeToUpdate !== -1) {
                const updatedNodes = [...nodes]
                updatedNodes[nodeToUpdate] = {
                    ...updatedNodes[nodeToUpdate],
                    position: { x: groupxposition, y: groupcount * groupspacing },
                };
                setNodes(updatedNodes);
            }
        }
        //console.log(nodes)
        //console.log(groupcount)
    }, [nodes, setNodes])

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
                    onNodeDoubleClick={ onNodeDoubleClick }
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

function customSort(arr: string[]): string[] {//sorting the semesters by year and Fall/Spring
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

function semesterGreaterThan(left: string, right: string): boolean { //example: Fall 2023 as left and Spring 2023 as right. Will return true since Fall 2023 is later than Spring 2023
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