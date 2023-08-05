import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import Welcome from './pages/welcome/welcome';
import NewView from './pages/welcome/new-view-input/new-view-input';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Welcome />}>
      <Route path="/new-view" element={<NewView />} />
    </Route>
  )
);

ReactDOM.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
  document.getElementById('root')
);

