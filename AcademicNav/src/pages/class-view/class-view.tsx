/*
two side bar tabs for ClassList and CriticalPath
two main tabs for BlockView and GraphView
*/


import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './class-view.scss'

function ClassView() {
    return (
      <div>
        <h1>Welcome</h1>
        <button>
          <Link to="/new-view">Input some stuff</Link>
        </button>
      </div>
    );
  }
  
  function ClassViewRoutes() {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<ClassView />} />
        </Routes>
      </Router>
    );
  }
  
  export { ClassView, ClassViewRoutes };