/*
    will be the first page the user sees that includes:
    - major is selected
    - load previous project
    - how to use description on the side
    grey out "NEXT" until major is selected then redirect to "new-view-input" for more necessary input 

    welcome service will use our web scraping choice. The inputted major should be sent and used for scraping once next is clicked.
*/
import {Routes, Route, useNavigate} from 'react-router-dom';
import './welcome.scss'
import  NewView  from './new-view-input/new-view-input';

function Welcome() {
    const navigate = useNavigate();

  const navigateToNiewView = () => {
    navigate('/new-view');
  };


  return (
    <div>
      <div>
        <hr />
        <button onClick={navigateToNiewView}>Input Class Info</button>

        <Routes>
          <Route path="/new-view" element={<NewView />} />
        </Routes>
      </div>
    </div>
  );
}
  
  export default Welcome;