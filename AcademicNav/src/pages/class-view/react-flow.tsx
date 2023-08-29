import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '../../Providers/UserProv';

const ReactFlowContext = createContext({ nodes: [] as ReactFlowNode[], addNode: (newNode: ReactFlowNode) => {} });

export const useReactFlowContext = () => useContext(ReactFlowContext);

interface ReactFlowProviderProps {
  children: React.ReactNode;
}
let edgeCount = 0;
const edges: { id: string; source: string; target: string; }[] | undefined = [];

interface ClassList { //Used to store the data retrieved from the json file
    id: string,
    title: string,
    credits: number,
    prerequisites: Array<string>,
    prerequisitesTaken: Array<string>,
    isReadyToTake: boolean,
    taken: boolean
}

function findEdges(value: string[], classes: ClassList[], edgeArray: { id: string; source: string; target: string; }[] | undefined = [], checkingId:string) {
    //function that finds all the edges that the graph needs
    value.forEach(function (prereqs) {
        classes.forEach(function (section) {
            if (section.title === prereqs) {
                edgeCount++
                edgeArray.push({id:'edge'+edgeCount, source: section.id, target:checkingId})
            }
        })
    })
}
export const ReactFlowProvider: React.FC<ReactFlowProviderProps> = ({ children }) => {
  const [nodes, setNodes] = useState<ReactFlowNode[]>([]);
  const { classArray } = useUser(); // Assuming this hook provides classArray

  useEffect(() => {
    const xspacing = 100; // Set your desired x spacing
    const yspacing = 100; // Set your desired y spacing
    const takenColor = 'blue'; // Set your desired taken color
    const readyColor = 'green'; // Set your desired ready color
    const unavailableColor = 'gray'; // Set your desired unavailable color

    const updatedNodes: ReactFlowNode[] = [];

    classArray.forEach((value, count) => {
      const position = { x: count * xspacing, y: count * yspacing };
      const backgroundColor = value.taken
        ? takenColor
        : value.isReadyToTake
        ? readyColor
        : unavailableColor;

      const node: ReactFlowNode = {
        id: value.id,
        position,
        data: { label: value.title, taken: value.taken },
        style: { backgroundColor },
      };

      updatedNodes.push(node);

      if (value.prerequisites.length > 0) {
        findEdges(value.prerequisites, classArray, edges, value.id);
      }
    });

    setNodes(updatedNodes);
  }, [classArray]);

  const addNode = (newNode: ReactFlowNode) => {
    setNodes((prevNodes) => [...prevNodes, newNode]);
  };

  return (
    <ReactFlowContext.Provider value={{ nodes, addNode }}>
      {children}
    </ReactFlowContext.Provider>
  );
};

interface ReactFlowNode {
    id: string;
    position: { x: number; y: number };
    data: { label: string; taken: boolean }; // Adjust this structure according to your needs
    style: { backgroundColor: string };
  }
  

// Define the findEdges function and edges array



