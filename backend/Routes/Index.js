import express from 'express';
import UserRouter from './UserRouter.js';
const Routers = express.Router();


Routers.use("/users", UserRouter)

export default Routers;