import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRouter from './routes/auth';
import sweetsRouter from './routes/sweets';

dotenv.config();
const app = express();
export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/sweets', sweetsRouter);

export default app;
