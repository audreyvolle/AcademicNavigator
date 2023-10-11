import NewView from './new-view-input/new-view-input';
import './welcome.scss';
import { useUser } from '../../Providers/UserProv';
import { useEffect } from 'react';

const Welcome = () => {
  const { major, handleDropdownChange, setClassArray, classArray, setIsMainViewVisible, setCurrentSemester } = useUser();

  const handleLoadWorkspace = () => {
    const fileInput = document.getElementById('fileInput');
    fileInput?.click();
  };

  useEffect(() => {
    console.log(classArray);
  }, [classArray]);

  const handleFileUpload = (e: any) => {
    console.log(classArray);
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const fileContent = event.target?.result as string;

        (async () => {
          const parsedContent = JSON.parse(fileContent);

          try {
            console.log(parsedContent);
            await setClassArray(parsedContent);

            // search class array for the smallest semester/year and set that as the currentSemester
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const semesters = ['Spring', 'Fall'];
            let smallestSemester = 'Fall 2050'; // Set it to a future date for comparison

            parsedContent.forEach((classObj: any) => {
              const classYear = parseInt(classObj.year, 10);
              const classSemester = `${classObj.semester} ${classYear}`;

              if (classYear <= currentYear && semesters.includes(classObj.semester)) {
                if (classYear < parseInt(smallestSemester.split(' ')[1], 10) ||
                  (classYear === parseInt(smallestSemester.split(' ')[1], 10) &&
                    semesters.indexOf(classObj.semester) < semesters.indexOf(smallestSemester.split(' ')[0]))) {
                  smallestSemester = classSemester;
                }
              }
            });

            console.log('Smallest Semester:', smallestSemester);
            setCurrentSemester(smallestSemester);
            setIsMainViewVisible(true);
          } catch (error) {
            console.error('Error parsing the file content as JSON:', error);
          }

        })();
      };
      reader.readAsText(selectedFile);
    }
  };

  return (
    <>
      {major === "" ? <div className="welcome-container">
        <div className="main-container">
          <div className="left-panel">
            <p>Select a Major to Get Started</p>
            <select value={major} onChange={(e) => { handleDropdownChange(e) }} className='major-dropdown'>
              <option value="">Select your degree option</option>
              <option value="computer-science-ba">Computer Science BA</option>
              <option value="computer-science-bs">Computer Science BS</option>
              <option value="public-health">Public Health</option>
            </select>
            <hr></hr>
            <div className="load-container">
              <p className="load-text">Returning user? </p>
              <button
                type="button"
                onClick={handleLoadWorkspace}
                className="load-workspace"
              >
                LOAD
              </button>
              <input
                type="file"
                id="fileInput"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>
          </div>
          <div className="vertical-line"></div>
          <div className="right-panel">
            <div className="welcome">
              <h1>Academic Navigator</h1>
              <p>Welcome! Select your major from the drop down to generate a schedule, or click LOAD to modify an existing schedule.</p>
            </div>
          </div>
        </div>
      </div> : <NewView />
      }
    </>
  );
}

export default Welcome;