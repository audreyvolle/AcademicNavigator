import React, { useState } from 'react';
import NewView from './new-view-input/new-view-input';
import './welcome.scss';

function Welcome() {
  const [selectedValue, setSelectedValue] = useState('');

  const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(event.target.value);
  };

  return (
    <div className="welcome-container">
      <h1>Welcome to Academic Navigator</h1>
      <p>Select a Major to Get Started</p>
      <select value={selectedValue} onChange={handleDropdownChange}>
          <option value="">Select an option</option>
          <option value="computer-science-ba">Computer Science BA</option>
          <option value="computer-science-bs">Computer Science BS</option>
          <option value="public-health">Public Health</option>
        </select>
        {selectedValue && (
          <>
            <NewView />
          </>
        )}
      </div>
  );
}

export default Welcome;

