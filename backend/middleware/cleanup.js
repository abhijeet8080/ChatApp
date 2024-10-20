const cron = require('node-cron');
const mongoose = require('mongoose');
const User = require('../models/UserModel'); 
const deleteUnverifiedUsers = async () => {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000); 

    const result = await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: tenMinutesAgo },
    });

    if (result.deletedCount > 0) {
      console.log(`Deleted ${result.deletedCount} unverified user(s).`);
    }
  } catch (error) {
    console.error('Error deleting unverified users:', error);
  }
};

const startCleanupJob = () => {
  cron.schedule('* * * * *', () => {
    console.log('Running cleanup job at', new Date().toISOString());
    deleteUnverifiedUsers();
  });
};

module.exports = startCleanupJob;
