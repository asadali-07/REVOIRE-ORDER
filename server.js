import app from './src/app.js';
import { config } from 'dotenv';
import {connectDB} from './src/db/db.js';
import {connect} from './src/broker/broker.js';

config();
connectDB();
connect();

app.get('/', (req, res) => { 
    res.json({ message: 'Order Service is running' });
 });


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});