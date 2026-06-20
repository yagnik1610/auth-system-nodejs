import app from './src/app.js';
import connectDB from './src/config/databse.js';
import cors from "cors";

connectDB();


app.use(cors({
  origin: "http://localhost:5173",
}));


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});