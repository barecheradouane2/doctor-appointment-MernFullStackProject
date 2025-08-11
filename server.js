const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');






dotenv.config();

const app = express();



app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// DB connection
connectDB();

// Routes
const userRoutes = require('./routes/userRoutes');
app.use('/user', userRoutes);

app.use("/files", express.static("uploads"));

const availableSlotRoutes = require('./routes/availableSlotRoutes');

app.use('/available-slots',  availableSlotRoutes);



// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
