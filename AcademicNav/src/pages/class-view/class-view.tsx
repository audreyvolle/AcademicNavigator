/*
two side bar tabs for ClassList and CriticalPath
two main tabs for BlockView and GraphView
*/


import {Routes, Route, useNavigate} from 'react-router-dom';
import './class-view.scss'
import MainView from './main-view/main-view';
function ClassView() {
    const navigate = useNavigate();
 
  const navigateToMainView = () => {
    navigate('/main-view');
  };
 
  return (
    <div>
      <div>
        <hr />
        <button onClick={navigateToMainView}>Finished inputting class info</button>
 
        <Routes>
          <Route path="/" element={<ClassView />} />
          <Route path="/main-view" element={<MainView />} />
        </Routes>
      </div>
    </div>
  );
 }
  
  export default ClassView;