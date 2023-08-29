/*
    import react flow and have nodes that do not belong in the main view yet stored in this side bar to be dragged over.
    be able to search for classes as well
*/
import { useReactFlowContext } from '../../react-flow';

function ClassList() {
  const { nodes } = useReactFlowContext();

  // Filter out the classes that are not taken yet
  const classesNotTaken = nodes.filter((node) => !node.data.taken || node.data.taken);
  //color the node red if there are prerequisites not placed that are blocking it
  return (
    <div className="class-list">
      <h2>Classes Left to Take</h2>
      <p>(Drag classes over to desired position)</p>
      <ul>
        {classesNotTaken.map((node) => (
          <li key={node.data.label}>{node.data.label}</li>
        ))}
      </ul>
    </div>
  );
}

export default ClassList;

