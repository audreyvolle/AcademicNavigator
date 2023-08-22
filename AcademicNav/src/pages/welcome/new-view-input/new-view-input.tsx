import React, { useState } from 'react';
import MainView from '../../class-view/main-view/main-view';
import './new-view-input.scss';

function NewView() {
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [isMainViewVisible, setIsMainViewVisible] = useState(false);

  const dummyClasses = [
    'Class A',
    'Class B',
    'Class C',
    // Add more dummy classes
  ];

  const handleCheckboxChange = (className: string) => {
    if (selectedClasses.includes(className)) {
      setSelectedClasses(selectedClasses.filter((c) => c !== className));
    } else {
      setSelectedClasses([...selectedClasses, className]);
    }
  };

  const handleSkipClick = () => {
    setSelectedClasses([]);
    setIsMainViewVisible(true);
  };

  const handleContinueClick = () => {
    setIsMainViewVisible(true);
  };

  return (
    <div className="new-view-container">
      <div>
        <hr />

        <p>Selected classes you have taken or are currently taking:</p>
        <ul className="checkbox-list">
        {dummyClasses.map((className) => (
            <li key={className}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedClasses.includes(className)}
                  onChange={() => handleCheckboxChange(className)}
                />
                {className}
              </label>
            </li>
          ))}
        </ul>

        <label htmlFor="credits">Credit Hours Per Semester (between 1 and 20):</label>
        <input type="number" id="credits" name="credits" min="1" max="20" className="input-field" />

        <label htmlFor="graduation">Graduation Semester:</label>
        <input type="text" id="graduation" name="graduation" className="input-field" />

        <div className="button-container">
          <button onClick={handleSkipClick} className="button button-secondary">Skip</button>
          <button onClick={handleContinueClick} className="button">Continue</button>
        </div>

        {isMainViewVisible && <MainView />}
      </div>
    </div>
  );
}

export default NewView;