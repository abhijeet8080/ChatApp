import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import RegisterPage from '../Pages/RegisterPage'
import CheckEmailPage from '../Pages/CheckEmailPage'
import CheckPasswordPage from '../Pages/CheckPasswordPage'
import Home from '../Pages/Home'
import MessagePage from '../Components/MessagePage'
import AuthLayouts from '../Layouts'
import Forgotpassword from '../Pages/Forgotpassword'
const Router = createBrowserRouter([
    {
        path:"/",
        element:<App />,
        children:[
            {
                path:"register",
                element:<AuthLayouts><RegisterPage /></AuthLayouts>
            },
            {
                path:"email",
                element:<AuthLayouts><CheckEmailPage/></AuthLayouts>
            },
            {
                path:"password",
                element:<AuthLayouts><CheckPasswordPage/></AuthLayouts>
            },
            {
                path:"forgot-password",
                element:<AuthLayouts><Forgotpassword/></AuthLayouts>
            },
            {
                path:"",
                element:<Home/>,
                children:[
                    {
                        path:':userId',
                        element:<MessagePage />
                    }
                ]
            },
        ]
    }
])



export default Router