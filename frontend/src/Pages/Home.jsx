import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { logout, setUser,setOnlineUser, setSocketConnection } from "../redux/userSlice";
import Sidebar from "../Components/Sidebar";
import logo from "../Assets/logo.png"
import io from "socket.io-client"
import Logo from "../Components/Logo";
const Home = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/email");
      }
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const Url = `${process.env.REACT_APP_BACKEND_URL}/api/v1/user-details`;
      const response = await axios.get(Url, config);
      // //console.log(response)
      dispatch(setUser(response?.data?.data));
      
    } catch (error) {
      //console.log(error)
      if(error?.response?.data?.logout){
        dispatch(logout());
        navigate('/email');
      }
      if (error?.response && error?.response?.data) {
        //console.log("Error message:", error?.response?.data?.message);
        navigate("/email");
      } else {
        console.error("Error occurred:", error?.message);
        navigate("/email");
      }
    }
  };
  useEffect(() => {
    fetchUserDetails();
  }, []);

  /**Socket Connection */
useEffect(() => {
  const socketConnection = io(process.env.REACT_APP_BACKEND_URL,{
    auth:{
      token:localStorage.getItem('token')
    }
  })

  socketConnection.on('onlineUser', (data)=>{

    dispatch(setOnlineUser(data))
  })
  dispatch(setSocketConnection(socketConnection))
  //console.log("SocketConnction",socketConnection)
  return ()=>{  
    socketConnection.disconnect()
  }
}, [])

  
  // //console.log(location)
  const basePath = location.pathname==="/"
  return (
    // <div className="">
    <div className=" grid lg:grid-cols-[300px,1fr] h-screen max-h-screen">
      <section className={`bg-white ${!basePath&&'hidden'} lg:block`}>
        <Sidebar />
      </section>

      <section className={`${basePath&&"hidden"}`}>
        <Outlet />
      </section>


      <div className={` justify-center items-center flex-col gap-2 hidden ${!basePath ? "hidden" : "lg:flex" }`}>
            <div className="text-7xl font-bold text-white uppercase">
              {/* <img
                src={logo}
                width={250}
                alt='logo'
              /> */}
              ChatWave
            </div>
            <p className='text-xl mt-2 text-slate-200 font-semibold '>Connect Instantly, Chat Effortlessly</p>

            <p className='text-base mt-2 text-slate-200 '>Select user to send message</p>
        </div>
    </div>
  );
};

export default Home;
