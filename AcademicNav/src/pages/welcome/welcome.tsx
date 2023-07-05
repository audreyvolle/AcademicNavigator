/*
    will be the first page the user sees that includes:
    - major is selected
    - load previous project
    - how to use description on the side
    grey out "NEXT" until major is selected then redirect to "new-view-input" for more necessary input 

    welcome service will use our web scraping choice. The inputted major should be sent and used for scraping once next is clicked.
*/
import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './welcome.scss';
import NewView from './new-view-input/new-view-input';
import puppeteer from 'puppeteer';

function Welcome() {
  const navigate = useNavigate();
  const [selectedValue, setSelectedValue] = useState('');

  const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(event.target.value);
  };

  const buildUrl = () => {
    // Implement your logic to build the URL based on the selected value
    // For simplicity, let's assume it's a simple concatenation with a base URL
    const baseUrl = 'https://example.com/';
    const url = baseUrl + selectedValue;
    return url;
  };

  const runWebScraping = async () => {
    const url = buildUrl();
    // Implement your web scraping logic using Puppeteer or other libraries
    // based on the URL obtained from buildUrl()
    // For example:
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    await page.screenshot({ path: 'screenshot.png' });
    await browser.close();
  };

  const navigateToNewView = () => {
    runWebScraping();
    navigate('/new-view');
  };

  return (
    <div>
      <div>
        <hr />
        <select value={selectedValue} onChange={handleDropdownChange}>
          <option value="">Select an option</option>
          <option value="computer-science-ba">Computer Science BA</option>
          <option value="computer-science-bs">Computer Science BS</option>
          <option value="public-health">Public Health</option>
        </select>
        <button onClick={navigateToNewView}>Input Class Info</button>

        <Routes>
          <Route path="/new-view" element={<NewView />} />
        </Routes>
      </div>
    </div>
  );
}

export default Welcome;
