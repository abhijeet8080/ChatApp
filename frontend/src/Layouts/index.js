import React from 'react'
import logo from "../Assets/logo.png"
import Logo from '../Components/Logo'
const AuthLayouts = ({children}) => {  
  return (<div className='h-[100vh]'>
        <header className='flex justify-center items-center py-3 h-20 shadow-md bg-white '>
            <Logo/>
        </header>
        {children}
        </div>
  )
}

export default AuthLayouts;
