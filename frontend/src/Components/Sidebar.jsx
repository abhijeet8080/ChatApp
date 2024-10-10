import React, { useState } from 'react';
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";
import { FaUserPlus } from "react-icons/fa";
import { NavLink } from 'react-router-dom';
import { RiLogoutBoxRFill } from "react-icons/ri";
import Avatar from './Avatar';
import { useSelector } from 'react-redux';
import EditUserDetails from './EditUserDetails';
import Divider from './Divider';
import {FiArrowUpLeft} from "react-icons/fi"
import SearchUser from './SearchUser';
const Sidebar = () => {
    const user = useSelector(state => state.user);
    const [editUserOpen, setEditUserOpen] = useState(false);
    const [allUser, setAllUser] = useState([])
    const [openSearchUser, setOpenSearchUser] = useState(false);
    return (
      <div className='w-full h-full flex bg-white'>
        {/* Left Icon Section */}
        <div className='bg-slate-100 w-12 h-full rounded-tr-lg rounded-br-lg py-5 text-slate-700 flex flex-col justify-between'>
          <div>
            <NavLink 
              title='chat' 
              className={(isActive)=>(`w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded ${isActive && "bg-slate-200"}`)}>
              <IoChatbubbleEllipsesSharp size={25} />
            </NavLink>
            <div title='Add Friends' onClick={()=>(setOpenSearchUser(true))} className="w-12 h-12 flex justify-center items-center pl-1 cursor-pointer hover:bg-slate-200 rounded">
              <FaUserPlus size={25} />
            </div>
          </div>
          <div className='flex flex-col items-center'>
            <button 
              title={user.name} 
              onClick={() => setEditUserOpen(true)}  
              className="w-12 h-12 flex flex-col justify-center items-center cursor-pointer hover:bg-slate-200 rounded">
              <Avatar 
                width={25}
                height={25}
                name={user?.name}
                imageUrl={user?.profile_pic}
                userId={user?._id}
              />
            </button>
            <button title='Log Out' className="w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded">
              <RiLogoutBoxRFill size={25} />
            </button>
          </div>
        </div>

        {/* Sidebar content */}
        <div className='w-full '>
           <div className='h-16 flex items-center'>
                <h2 className='text-lg font-bold p-4 text-slate-800'>Message</h2><Divider />
           </div>
           <div className='bg-slate-200 p-[0.5px]'> 

           </div>
           <div className=' h-[calc(100vh-65px)] overflow-x-hidden overflow-y-auto scrollbar'>
                {allUser.length===0&&(
                    <div className='mt-12'>
                        <div className='flex justify-center items-center my-4 text-slate-500'>
                            <FiArrowUpLeft size={50}/>
                        </div>
                        <p className='text-lg text-center text-slate-400'> Explore users to start a conversation with.</p>
                    </div>
                )}
           </div>
           
        </div>

        {/* Edit User Details Modal */}
        {editUserOpen && (
          <EditUserDetails 
            onClose={() => setEditUserOpen(false)} 
            user={user} 
          />
        )}
        {/**Search User */}
        {
            openSearchUser&&(
                <SearchUser onClose={()=>(setOpenSearchUser(false))}/>
            )
        }
      </div>
    );
};

export default Sidebar;
