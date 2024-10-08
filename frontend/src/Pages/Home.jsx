import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'
const Home = () => {
  const navigate = useNavigate();
  const fetchUserDetails = async() =>{
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/email')
      }
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, 
        },
      };
    const Url = `${process.env.REACT_APP_BACKEND_URL}/api/v1/user-details`;
    const response = await axios.get(Url, config);
    console.log(response.data)


    } catch (error) {
      if (error.response && error.response.data) {
    
        console.log("Error message:", error.response.data.message); 
        toast.error(error?.response?.data?.message);
        navigate('/email')

      } else {
        
        console.error("Error occurred:", error.message);
        toast.error(error.message);
        navigate('/email')
      }
    }
  }
  useEffect(()=>{
    fetchUserDetails();
  },[])
  return (
    <div>
      Home



      <section>
        <Outlet/>
      </section>
    
    </div>
  )
}

export default Home