import React, { useState } from 'react';
import Welcome from './welcome/welcome';
import NewView from './welcome/new-view-input/new-view-input';
import {UserProvider} from '../Providers';
import { useUser } from '../Providers/UserProv';
import MainView from './class-view/react-flow';
const Home = () => {
    const {isMainViewVisible } = useUser();

    return (
        <>
            {!isMainViewVisible?<Welcome/>:<MainView/>}
        </>
    );
};


export default Home;