import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {Route, RouterProvider} from 'react-router-dom'
import Router from "./Routes/Routes"
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={Router}>
    <App />
    </RouterProvider>
  </React.StrictMode>
);
