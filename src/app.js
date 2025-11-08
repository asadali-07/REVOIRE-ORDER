import express from 'express';
import orderRouter from './routes/order.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';



const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use('/api/orders', orderRouter);


export default app;