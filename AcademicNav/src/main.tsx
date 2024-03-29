import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import NewView from './pages/welcome/new-view-input/new-view-input';
import Home from './pages/index';
import { UserProvider } from './Providers';
import { DataProvider } from './Providers/DataProv';
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Home />}>
      <Route path="/new-view" element={<NewView />} />
    </Route>
  )
);

ReactDOM.render(
  <React.StrictMode>
    <DataProvider>
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </DataProvider>
  </React.StrictMode>,
  document.getElementById('root')
);