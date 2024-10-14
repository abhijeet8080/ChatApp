const cron = require('node-cron');
const mongoose = require('mongoose');
const User = require('./models/UserModel'); // Adjust the path as necessary

// Function to delete unverified users older than 10 minutes
const deleteUnverifiedUsers = async () => {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000); // Current time minus 10 minutes

    const result = await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: tenMinutesAgo },
    });

    if (result.deletedCount > 0) {
      console.log(`Deleted ${result.deletedCount} unverified user(s).`);
      // Optionally, log this action or notify admins
    }
  } catch (error) {
    console.error('Error deleting unverified users:', error);
    // Optionally, handle the error (e.g., notify admins)
  }
};

// Schedule the job to run every minute
const startCleanupJob = () => {
  cron.schedule('* * * * *', () => {
    console.log('Running cleanup job at', new Date().toISOString());
    deleteUnverifiedUsers();
  });
};

module.exports = startCleanupJob;
