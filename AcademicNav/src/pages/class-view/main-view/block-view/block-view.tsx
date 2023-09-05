import './block-view.scss'
import { Node, ReactFlow, useNodesState } from 'reactflow';
import React, { useState, useCallback } from 'react'; //FROM GRAPH VIEW
//import { useUser } from '../../../../Providers/UserProv';
import testData from '../../../../data/scraped/test2.json';
import 'reactflow/dist/style.css';


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
  
export default BlockView;