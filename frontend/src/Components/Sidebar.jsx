// Sidebar.js
import { FaUserPlus, FaImage, FaVideo } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { RiLogoutBoxRFill } from "react-icons/ri";
import Avatar from "./Avatar";
import { useSelector, useDispatch } from "react-redux";
import EditUserDetails from "./EditUserDetails";
import Divider from "./Divider";
import { FiArrowUpLeft } from "react-icons/fi";
import SearchUser from "./SearchUser";
import { logout } from "../redux/userSlice"; // Ensure you have this action

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [allConversations, setAllConversations] = useState([]);
  const [openSearchUser, setOpenSearchUser] = useState(false);
  const socketConnection = useSelector((state) => state.user.socketConnection);
  //console.log("Aboutme", process.env.REACT_APP_ABOUTME);

  useEffect(() => {
    if (socketConnection) {
      // Emit 'sidebar' to request conversations
      socketConnection.emit("sidebar");

      // Handle incoming 'conversation' data
      const handleConversations = (data) => {
        if (data.error) {
          console.error(data.error);
          return; // Optionally, show an error message to user
        }

        const conversationUserData = data
          .map((conv) => {
            const unSeenMsg =
              conv.lastMsg?.sender?._id === user._id ? 0 : conv.unSeenMsg;
            return {
              _id: conv._id,
              userDetails: conv.userDetails,
              unSeenMsg,
              lastMsg: conv.lastMsg,
            };
          })
          .sort((a, b) => {
            const dateA = a.lastMsg?.createdAt
              ? new Date(a.lastMsg.createdAt).getTime()
              : 0;
            const dateB = b.lastMsg?.createdAt
              ? new Date(b.lastMsg.createdAt).getTime()
              : 0;
            return dateB - dateA;
          });

        setAllConversations(conversationUserData);
      };

      // Handle 'messages-seen' event to update unSeenMsg
      const handleMessagesSeen = ({ conversationId }) => {
        setAllConversations((prevConversations) =>
          prevConversations.map((conv) =>
            conv._id === conversationId ? { ...conv, unSeenMsg: 0 } : conv
          )
        );
      };

      socketConnection.on("conversation", handleConversations);
      socketConnection.on("messages-seen", handleMessagesSeen);

      // Cleanup listeners on unmount
      return () => {
        socketConnection.off("conversation", handleConversations);
        socketConnection.off("messages-seen", handleMessagesSeen);
      };
    }
  }, [socketConnection, user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/email");
    if (socketConnection) {
      socketConnection.disconnect();
    }
  };

  const handleOpenMessagePage = (conv) => {
    // Mark messages as seen when user opens the conversation
    if (socketConnection) {
      socketConnection.emit("mark-messages-seen", {
        conversationId: conv._id,
        userId: user._id,
      });
    }
    // Navigate to the message page
    navigate(`/${conv.userDetails._id}`);

    // Update local state to set unSeenMsg to 0
    setAllConversations((prevConversations) =>
      prevConversations.map((conversation) =>
        conversation._id === conv._id
          ? { ...conversation, unSeenMsg: 0 }
          : conversation
      )
    );
  };

  return (
    <div className="w-full h-full flex bg-white">
      {/* Left Icon Section */}
      <div className="bg-slate-100 w-12 h-full rounded-tr-lg rounded-br-lg py-5 text-slate-700 flex flex-col justify-between">
        <div>
          <NavLink
            to="/"
            title="chat"
            className={({ isActive }) =>
              `w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded ${
                isActive ? "bg-slate-300" : ""
              }`
            }
          >
            <IoChatbubbleEllipsesSharp size={25} />
          </NavLink>
          <div
            title="Add Friends"
            onClick={() => setOpenSearchUser(true)}
            className="w-12 h-12 flex justify-center items-center pl-1 cursor-pointer hover:bg-slate-200 rounded"
          >
            <FaUserPlus size={25} />
          </div>
        </div>
        <div className="flex flex-col items-center">
          {process.env.REACT_APP_ABOUTME && (
            
              <a
                href={process.env.REACT_APP_ABOUTME}
                className="w-12 h-12 flex flex-col justify-center items-center cursor-pointer hover:bg-slate-200 rounded"
              >
                <Avatar
                  width={25}
                  height={25}
                  imageUrl={`https://res.cloudinary.com/daasrv6ic/image/upload/v1728474509/chat-app-file/oxdj0xdvm06evydtwpcd.png`}
                />
              </a>
          )}
          <button
            title={user.name}
            onClick={() => setEditUserOpen(true)}
            className="w-12 h-12 flex flex-col justify-center items-center cursor-pointer hover:bg-slate-200 rounded"
          >
            <Avatar
              width={25}
              height={25}
              name={user.name}
              imageUrl={user.profile_pic}
              userId={user._id}
            />
          </button>
          <button
            title="Log Out"
            onClick={handleLogout}
            className="w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded"
          >
            <RiLogoutBoxRFill size={25} />
          </button>
        </div>
      </div>

      {/* Sidebar content */}
      <div className="w-full">
        <div className="h-16 flex items-center">
          <h2 className="text-lg font-bold p-4 text-slate-800">Messages</h2>
          <Divider />
        </div>
        <div className="bg-slate-200 p-[0.5px]"></div>
        <div className="h-[calc(100vh-65px)] overflow-x-hidden overflow-y-auto scrollbar">
          {allConversations.length === 0 && (
            <div className="mt-12">
              <div className="flex justify-center items-center my-4 text-slate-500">
                <FiArrowUpLeft size={50} />
              </div>
              <p className="text-lg text-center text-slate-400">
                Explore users to start a conversation with.
              </p>
            </div>
          )}
          {allConversations.map((conv) => (
            <NavLink
              to={`/${conv.userDetails._id}`} // Corrected route
              key={conv._id}
              onClick={() => handleOpenMessagePage(conv)}
              className="flex items-center gap-2 px-2 py-3 border border-transparent hover:border-b-primary hover:bg-slate-200 rounded"
            >
              <Avatar
                width={40}
                height={40}
                imageUrl={conv.userDetails.profile_pic}
                name={conv.userDetails.name}
                userId={conv.userDetails._id}
              />
              <div className="flex flex-col w-full">
                <div className="flex justify-between items-center w-full">
                  <h3 className="text-ellipsis line-clamp-1">
                    {conv.userDetails.name}
                  </h3>
                  {conv.unSeenMsg > 0 && (
                    <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5">
                      {conv.unSeenMsg}
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  {conv.lastMsg && (
                    <p className="text-sm text-slate-500">
                      {conv.lastMsg.text ? (
                        conv.lastMsg.text.length > 28 ? (
                          `${conv.lastMsg.text.substring(0, 20)}...`
                        ) : (
                          conv.lastMsg.text
                        )
                      ) : conv.lastMsg.imageUrl ? (
                        <div className="flex items-center">
                          <FaImage size={20} className="mr-1" /> Sent an image.
                        </div>
                      ) : conv.lastMsg.videoUrl ? (
                        <div className="flex items-center">
                          <FaVideo size={20} className="mr-1" /> Sent a video.
                        </div>
                      ) : (
                        "Sent a message."
                      )}
                    </p>
                  )}
                </div>
              </div>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Edit User Details Modal */}
      {editUserOpen && (
        <EditUserDetails onClose={() => setEditUserOpen(false)} user={user} />
      )}
      {/** Search User */}
      {openSearchUser && (
        <SearchUser onClose={() => setOpenSearchUser(false)} />
      )}
    </div>
  );
};

export default Sidebar;
