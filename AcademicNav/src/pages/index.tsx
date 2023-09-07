import React, { useState } from 'react';
import Welcome from './welcome/welcome';
import NewView from './welcome/new-view-input/new-view-input';
import {UserProvider} from '../Providers';
import { useUser } from '../Providers/UserProv';
import MainView from './class-view/main-view/main-view';
const Home = () => {
    const {isMainViewVisible } = useUser();

    return (
        <>
            {!isMainViewVisible?<Welcome/>:<MainView />}
        </>
    );
};


export default Home;