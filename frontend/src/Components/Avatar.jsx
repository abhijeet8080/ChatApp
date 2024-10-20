import React from 'react';
import { PiUserCircleLight } from 'react-icons/pi';
import { useSelector } from 'react-redux';

const Avatar = ({ userId, name, imageUrl, width, height }) => {

  const onlineUser = useSelector(state=>state?.user?.onlineUser);

  let avatarName = '';
  if (name) {
    const splitName = name.split(' ');
    if (splitName.length > 1) {
      avatarName = splitName[0][0] + splitName[1][0]; // Get first letter of first and last name
    } else {
      avatarName = splitName[0][0]; // Get first letter of the name
    }
  }

  // Assign random color based on userId or fallback to random if no userId
  const bgColor = [
    'bg-slate-200',
    'bg-teal-200',
    'bg-red-200',
    'bg-green-200',
    'bg-yellow-200',
    'bg-gray-200',
    'bg-cyan-200',
    'bg-sky-200',
    'bg-blue-200'
  ];
  // //console.log(userId)
  const bgClass = bgColor[userId ? userId % bgColor.length : Math.floor(Math.random() * bgColor.length)];
  const isOnline = onlineUser.includes(userId)
  return (
    <div
      className={`text-slate-800 ${bgClass} rounded-full font-bold relative `}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className='overflow-hidden rounded-full'
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover', 
          }}
        />
      ) : name ? (
        <div
          className="flex justify-center items-center "
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          {avatarName}
        </div>
      ) : (
        <PiUserCircleLight size={width} />
      )}
      {
        isOnline&&(
          <div className='bg-green-600 p-1 absolute bottom-1 z-10 -right-0 rounded-full'></div>
        )
      }
    </div>
  );
};

export default Avatar;
