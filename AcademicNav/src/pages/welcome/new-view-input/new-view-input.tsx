/*
   WE SHOULD MAKE A PROTOTYPE FOR THIS
   This should be able to be skipped if the user just wants the boilerplate class list
    - Add warning once that is clicked and no information is inputted
   Other inputs include:
    - Selection of already completed classes
    - The inputs that will be on the core path side bar inputs
        - prefered credit hours
        - graduation semester
   Next will redirect to the main view page.
*/
import './new-view-input.scss'
import {Routes, Route, useNavigate} from 'react-router-dom';
import ClassView from '../../class-view/class-view';

function NewView() {
   const navigate = useNavigate();

 const navigateToClassView = () => {
   navigate('/class-view');
 };


 return (
   <div>
     <div>
       <hr />
       <button onClick={navigateToClassView}>Finished inputting class info</button>

       <Routes>
         <Route path="/class-view" element={<ClassView />} />
       </Routes>
     </div>
   </div>
 );
}
 
 export default NewView;