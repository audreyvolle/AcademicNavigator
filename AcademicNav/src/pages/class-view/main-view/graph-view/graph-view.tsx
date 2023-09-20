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
import { useUser } from '../../../../Providers/UserProv';


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
const warningMessageDuration = 3500;

//arrays
const semesters: string | string[] = [];
let semesterClassCount: number[] = [];

//colors
const takenColor = 'rgba(178,255,102,1)';
const readyColor = 'rgb(255,255,255)';
const unavailableColor = 'rgba(255,153,153,1)';
let setColor = 'rgb(255,255,255)';
const addSemesterColor = 'rgb(128,128,128)'

const GraphView = () => {

    //const reactFlowWrapper = useRef(null);
    const { classArray, setClassArray, currentSemester } = useUser();
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
                if (semesterClassCount[i-1] > 0) {
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
        semesters.push(currentSemester)
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
                style: { backgroundColor: 'rgba(225,225,225,0)', width: groupwidth, height: groupheight },
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
            if (value.taken) {
                setColor = takenColor
            }
            else if (value.isReadyToTake) {
                setColor = readyColor
            }
            else {
                setColor = unavailableColor
            }
            parentId = semesters.findIndex(item => item === value.semester)
            if (value.semester != null && value.semester != "") {
                nodes.push(
                    {
                        id: value.id,
                        position: { x: semesterClassCount[parentId] * xspacing + initspacing, y: yspacing },
                        data: { label: value.title }, style: { backgroundColor: setColor },
                        parentNode: value.semester,
                        expandParent: true,
                        selectable: false,
                        draggable: false,
                        dragging: false,
                        focusable: false
                    })
            }
            if (value.prerequisites.length > 0) {
                edgeCount = findEdges(value.prerequisites, classArray, edges, value.id, edgeCount);
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
                            element.id != null &&
                            parentId != -1 &&
                            position.x >= element.position.x &&
                            position.x <= element.position.x + element.width &&
                            position.y >= element.position.y &&
                            position.y <= element.position.y + element.height
                        ) {
                            console.log("The Semester dragged onto is " + element.id)
                            const classToMove = classArray.find((classItem) => classItem.title === type);
                            
                            const newNode = 
                            {
                                id: classToMove.id,
                                position: { x: semesterClassCount[parentId] * xspacing + initspacing, y: yspacing },
                                data: { label: `${type}` }, style: { backgroundColor: setColor },
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
        },
        [classArray, nodes, reactFlowInstance, setClassArray, setNodes]
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
                } else {
                    triggerWarning("Cannot Remove a Semester that has classes")
                }
            } else {
                triggerWarning("Can only remove the last semester (Temp)")
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
                style: { backgroundColor: 'rgba(225,225,225,0)', width: groupwidth, height: groupheight },
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
function findEdges(value: string[], classes: any[], edgeArray: { id: string; source: string; target: string; }[] | undefined = [], checkingId: string, edgeCount: number) {
    //function that finds all the edges that the graph needs
    value.forEach(function (prereqs) {
        if (prereqs != "none") {
            classes.forEach(function (section) {
                if (section.title === prereqs) {
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

export default GraphView;