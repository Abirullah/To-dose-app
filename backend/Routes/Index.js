import express from 'express';
import UserRouter from './UserRouter.js';
import TaskRoutes from './TaskRoutes.js';
import TeamTasks from './TeamTasksRoute.js';
const Routers = express.Router();


Routers.use("/users", UserRouter)
Routers.use("/tasks", TaskRoutes);
Routers.use('/Tasks' , TeamTasks )


export default Routers;