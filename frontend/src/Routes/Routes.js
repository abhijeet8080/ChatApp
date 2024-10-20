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
import VerifyEmail from '../Pages/VerifyEmail'
import Aboutme from '../Pages/Aboutme'
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
                path: "forgot-password/:token",
                element: <AuthLayouts><Forgotpassword /></AuthLayouts>
              },
              
            {
                path:"verifyemail",
                element:<AuthLayouts><VerifyEmail/></AuthLayouts>
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
            {
                path:'aboutme',
                element:<Aboutme />
            }
        ]
    }
])



export default Router