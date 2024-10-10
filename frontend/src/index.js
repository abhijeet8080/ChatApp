import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {Route, RouterProvider} from 'react-router-dom'
import Router from "./Routes/Routes"
import { store } from './redux/store';
import {Provider} from "react-redux"
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
  <Provider store={store}>

    <RouterProvider router={Router}>
    <App />
    </RouterProvider>
  </Provider>
  </React.StrictMode>
);
