import { response } from "express";
import TeamTask from "../Modells/TeamTasksModel.js";
import User from "../Modells/UserModle.js";
import TeamTasks from "../Routes/TeamTasksRoute.js";
import uploadToCloudinary from "../Utils/Cloudnary.js";


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

    const AllTeamMembers = await Promise.all(
      Team.map(async (TM) => {
        const EachUser = await User.findOne({ email: TM.memberEmail });
        if(!EachUser) res.status(404).json(`The User ${TM.memberEmail} is not avaliable`);
        return EachUser;
      })
    );
  

    // res.json({ AllMembers: AllTeamMembers, Team: Team, Tasks: Tasks });


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

export const UpdateTasks = async (req, res) => {
  try {
    const { userId, UpdatedTask } = req.body;

    const teamTask = await TeamTask.findById(req.params.id);
    if (!teamTask) {
      return res.status(404).json({ error: "Team Task not found" });
    }


    if (teamTask.owner.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "You are not allowed to edit this task" });
    }


    const UpdatedTaskId = UpdatedTask.id;

 
    const taskToUpdate = teamTask.Tasks.find(
      (t) => t._id.toString() === UpdatedTaskId
    );

    if (!taskToUpdate) {
      return res.status(404).json({ error: "Task not found in this TeamTask" });
    }


    const updatedResult = await TeamTask.updateOne(
      { _id: req.params.id, "Tasks._id": UpdatedTaskId },
      {
        $set: {
          "Tasks.$.taskTitle": UpdatedTask.taskTitle,
          "Tasks.$.taskDescription": UpdatedTask.taskDescription,
          ...(UpdatedTask.status && { "Tasks.$.status": UpdatedTask.status }),
        }
      }
    );

   
    res.status(200).json({
      message: "Task updated successfully",
      updatedResult,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateUsersInTask = async (req, res) => {
  try {
    const { userId, newUsers } = req.body;

    const teamTask = await TeamTask.findById(req.params.id);
    if (!teamTask) {
      return res.status(400).json({ error: "Team Task not found" });
    }

    if (teamTask.owner.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "You are not allowed to edit this task" });
    }

    const newUsersEmails = await Promise.all(
      newUsers.map(async (U) => {
        console.log(U.memberEmail);
        const VerificationOfEmail = await User.find({ email: U.memberEmail });
        if (VerificationOfEmail.length == 0)
          res
            .status(404)
            .json(`The User with ${U.memberEmail} email can't found!`);

        return VerificationOfEmail;
      })
    );

    const userEmails = Array.isArray(newUsers)
      ? newUsers.map((u) => u.memberEmail)
      : [newUsers.memberEmail];

    // res.json(userEmails)


    if (newUsersEmails && newUsersEmails.length > 0) {
      await TeamTask.updateOne(
        { _id: req.params.id },
        { $push: { Team: { $each: newUsers } } }
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


export const TaskSubmission = async (req, res) => {
  try {
    const userId = req.params.userId;

    const { TaskId } = req.body;

    if (!userId || !TaskId) {
      res.status(400).json("Missing Required Fields");
    }

    const UserDetails = await User.findById(userId);

    const taskDetails = await TeamTask.findById(TaskId).populate(
      "Tasks.assignedTo",
      "_id name email"
    );

    let TheUserToSubmitTask;
    const UserIsFounded = taskDetails.Team.find((U) => {
      console.log();
      if (UserDetails.email === U.memberEmail.toString()) {
        TheUserToSubmitTask = U._id;
        return U;
      }
    });

    if (!UserIsFounded) {
      res.status(401).json("You are un authorized");
    } 

    let submittedTaskUrl;
   
    if (req.file) {
      submittedTaskUrl = await uploadToCloudinary(req.file.path, {
        folder: "ToDosApp/team-task-submissions",
        resource_type: "raw",
        originalName: req.file.originalname,
      });
    }

    
    const AddedTask = await TeamTask.updateOne(
      { _id: TaskId },
      { $set: { "Team.$[elem].SubmittedTask": submittedTaskUrl } },
      { arrayFilters: [{ "elem._id": TheUserToSubmitTask }], new: true }
    );

    res.json([AddedTask, submittedTaskUrl]);

    // let TaskUrl =
  }
  catch (error) {

    res.status(201).json({ message : error.message })
    
  }
  
}
  




