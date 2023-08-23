import React, { useState } from 'react';
import Welcome from './welcome/welcome';
import NewView from './welcome/new-view-input/new-view-input';

const Home = () => {
    const [selectedValue, setSelectedValue] = useState('');

    if(selectedValue === '')
        return <Welcome setSelectedValue={setSelectedValue} selectedValue={selectedValue}/>;
    
    return (
        <>
            <NewView />
        </>
    );
};


export default Home;