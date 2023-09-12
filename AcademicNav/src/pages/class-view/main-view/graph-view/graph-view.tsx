import 'reactflow/dist/style.css';
import './graph-view.scss'
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    Node,
    ReactFlow,
    ReactFlowInstance,
    ReactFlowProvider,
    Controls,
    WrapNodeProps,
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

//arrays
//const initnodes: Node<unknown, string | undefined>[] | { id: string; position: { x: number; y: number; }; data: { label: string; }; }[] | undefined = [];
//const edges: { id: string; source: string; target: string; }[] | undefined = [];
const semesters: string | string[] = [];

//colors
const takenColor = 'rgba(178,255,102,1)';
const readyColor = 'rgb(255,255,255)';
const unavailableColor = 'rgba(255,153,153,1)';
let setColor = 'rgb(255,255,255)';
const addSemesterColor = 'rgb(128,128,128)'

let id = 0;
const getId = () => `dndnode_${id++}`;

const GraphView = () => {
    
    //const reactFlowWrapper = useRef(null);
    const { classArray, setClassArray } = useUser();
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    //gets the class data from UserProv.tsx
    //const { classArray } = useUser();
    //console.log(classArray)
    useEffect(() => {
        classArray.forEach(function (value) {
            if (!semesters.includes(value.semester) && value.semester != null) {
                semesters.push(value.semester);
            }
        })
        customSort(semesters)
        const semesterClassCount = new Array(semesters.length).fill(0);
        console.log('adding the semesters as groups')
        semesters.forEach(function (value) {
            //const groupposition = groupcount * groupspacing
            nodes.push({
                id: value,
                data: { label: value },
                position: { x: groupxposition, y: groupcount * groupspacing },
                className: 'light',
                style: { backgroundColor: 'rgba(225,225,225,0)', width: groupwidth, height: groupheight },
                selectable: false,
                connectable: false
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
            connectable: false
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
            if (value.semester != null) {
                nodes.push(
                    {
                        id: value.id,
                        position: { x: semesterClassCount[parentId] * xspacing + initspacing, y: yspacing },
                        data: { label: value.title }, style: { backgroundColor: setColor },
                        parentNode: value.semester,
                        expandParent: true,
                        selectable: true,
                        draggable: true,
                        dragging: false,
                        focusable: true,
                    })
            }
            if (value.prerequisites.length > 0) {
                edgeCount = findEdges(value.prerequisites, classArray, edges, value.id, edgeCount);
            }
            semesterClassCount[parentId]++
        })

        console.log('right before onClick is registered')
        setIsLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), []);

    const onDragOver = useCallback((event: any) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);
    //edit this to use the group system
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
                            classItem === classToMove ? { ...classItem, taken: true } : classItem // MISAEL CHANGE THIS TO ALSO UPDATE THE SEMESTER AND OTHER VARIABLES!!
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

    const onClick = useCallback((event: React.MouseEvent, node: Node) => {
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
                connectable: false
            })
            groupcount++

            const nodeToUpdate = nodes.findIndex((nnode) => nnode.id === node.id)
            //nodes.push({
            //    id: 'addSemester',
            //    data: { label: 'Add Semester' },
            //    position: { x: groupxposition, y: groupcount * groupspacing },
            //    className: 'light',
            //    style: { backgroundColor: addSemesterColor, width: groupwidth, height: groupheight },
            //    selectable: false,
            //    connectable: false
            //})

            if (nodeToUpdate !== -1) {
                const updatedNodes = [...nodes]
                updatedNodes[nodeToUpdate] = {
                    ...updatedNodes[nodeToUpdate],
                    position: { x: groupxposition, y: groupcount * groupspacing },
                };
                setNodes(updatedNodes);
            }

            //node = { node, { data: { position: { x: 33, y: groupcount * groupspacing } } }}
        }
        console.log(nodes)
        console.log(groupcount)
    }, [nodes])
    console.log('returning')
    if (isLoading) {
        return <div>Loading...</div>;
    }
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
                    panOnScroll={true}
                    panOnDrag={false}
                    zoomOnDoubleClick={false}
                    onNodeClick={onClick}
                    //fitView
                >
                    <Controls />
                </ReactFlow>
            </div>
            <SideBar />
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

export default GraphView;