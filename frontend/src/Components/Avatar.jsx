import React from 'react';
import { PiUserCircleLight } from 'react-icons/pi';

const Avatar = ({ userId, name, imageUrl, width, height }) => {
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
  const bgClass = bgColor[userId ? userId % bgColor.length : Math.floor(Math.random() * bgColor.length)];

  return (
    <div
      className={`text-slate-800 overflow-hidden rounded-full shadow border text-xl font-bold ${bgClass}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover', // Ensure the image covers the circle fully
          }}
        />
      ) : name ? (
        <div
          className="flex justify-center items-center"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          {avatarName}
        </div>
      ) : (
        <PiUserCircleLight size={width} />
      )}
    </div>
  );
};

export default Avatar;
