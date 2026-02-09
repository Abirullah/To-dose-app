import express from 'express';
import UserRouter from './UserRouter.js';
import TaskRoutes from './TaskRoutes.js';
import TeamTasks from './TeamTasksRoute.js';
import TeamRoutes from "./TeamRoutes.js";
import TeamAssignedTaskRoutes from "./TeamAssignedTaskRoutes.js";
const Routers = express.Router();


Routers.use("/users", UserRouter)
Routers.use("/tasks", TaskRoutes);
Routers.use('/TeamTasks' , TeamTasks )
Routers.use("/teams", TeamRoutes);
Routers.use("/team-tasks", TeamAssignedTaskRoutes);


export default Routers;
