const mongoose = require("mongoose");
const startCleanupJob = require("./middleware/cleanup");
const connectDatabase = () => {
    mongoose.connect(process.env.DB_URL).then(
        (data) => {
            console.log(`MongoDB connected with server  ${data.connection.host}`);
            startCleanupJob();
        });
};

module.exports = connectDatabase;
