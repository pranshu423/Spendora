import { createServer } from 'http';
import app from './app';
import connectDB from './config/db';
import { initSocket } from './socket';
import checkRenewals from './jobs/cron';

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
const io = initSocket(httpServer);

// Connect to Database
connectDB();

// Init Cron Jobs
checkRenewals();

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
