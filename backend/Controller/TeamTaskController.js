import TeamTask from "../Modells/TeamTasksModel.js";
import User from "../Modells/UserModle.js";
import TeamTasks from "../Routes/TeamTasksRoute.js";

export const AddTask = async (req, res) => {
  try {
    const { Team, Tasks } = req.body;
    const ownerId = req.params.userId;

    const Owner = await User.findById(ownerId);

    if (!Owner) {
      return res
        .status(400)
        .json({ error: "You are not authorized to create a team task" });
    }

    if (!Team || !Tasks) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newTask = await TeamTask.create({
      owner: Owner._id,
      Team,
      Tasks,
    });

    return res.status(201).json({
      message: "Team task created successfully!",
      data: newTask,
    });
  } catch (error) {
    res.status(500).json({ cause: error.message });
  }
};

export const updateUsersInTask = async (req, res) => {
  try {
    const { userId, newUsers, newTasks } = req.body;

   
    const teamTask = await TeamTask.findById(req.params.id);
    if (!teamTask) {
      return res.status(400).json({ error: "Team Task not found" });
    }

    
    if (teamTask.owner.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "You are not allowed to edit this task" });
    }

   
    if (newUsers && newUsers.length > 0) {
      await TeamTask.updateOne(
        { _id: req.params.id },
        { $push: { Team: { $each: newUsers } } }
      );
    }

 
    if (newTasks && newTasks.length > 0) {
      await TeamTask.updateOne(
        { _id: req.params.id },
        { $push: { Tasks: { $each: newTasks } } }
      );
    }

    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


export const getTeamTaskDetails = async (req, res) => {
  try {
    const userId = req.params.userId;

   
    const ownerTasks = await TeamTask.find({ owner: userId })
      .populate("owner", "name email")
      .populate("Team.memberEmail", "name email");

   
    const memberTasks = await TeamTask.find({
      "Team.memberId": userId,
      owner: { $ne: userId },
    })
      .populate("owner", "name email")
      .populate("Team.memberEmail", "name email")
     
    

   
    res.status(200).json({
      ownerTasks,
      memberTasks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


export const DeleteTask = async (req, res) => {
  try {
    const userId = req.params.userId; 
    const { teamTaskId, taskId } = req.body; 

    
    if (!userId || !teamTaskId || !taskId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    
    const teamTask = await TeamTask.findById(teamTaskId)
      .populate("owner", "_id name email")
      .populate("Tasks.assignedTo", "_id name email");

    if (!teamTask) {
      return res.status(404).json({ error: "Team task not found" });
    }

   
   const taskToDelete = teamTask.Tasks.find((t) => t._id.toString() === taskId);


    if (!taskToDelete) {
      return res.status(404).json({ error: "Task not found" });
    }

    
    const isOwner = teamTask.owner._id.toString() === userId;
    const isAssigned =
      taskToDelete.assignedTo &&
      taskToDelete.assignedTo._id.toString() === userId;

    if (!isOwner && !isAssigned) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this task" });
    }

   
    teamTask.Tasks = teamTask.Tasks.filter((t) => t._id.toString() !== taskId);


  
    await teamTask.save();

   
    res.status(200).json({
      message: "Task deleted successfully",
      deletedTaskId: taskId,
      remainingTasks: teamTask.Tasks.length,
    });
  } catch (error) {
    console.error("Delete Task Error:", error);
    res.status(500).json({
      error: error.message,
      context: "Error occurred in DeleteTask controller",
    });
  }
};


export const TaskReplay = async (req, res) => {
  try {
    const userId = req.params.userId;
   
    const { TaskId, TaskReplay } = req.body;

    if (!userId || !TaskId || !TaskReplay) {
      res.status(400).json("Missing Required Fields")
    }

    const taskDetails = await TeamTask.findById(TaskId)
      .populate("owner", "_id name email")
      .populate("Tasks.assignedTo", "_id name email");
  
  
    res.status(200).json(taskDetails);
  }
  catch (error) {

    res.status(201).json({ message : error.message })
    
  }


  
   
  
  

  
}
  





