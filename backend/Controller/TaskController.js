import UserWorksModel from "../Modells/UserWorksModel.js";
import User from "../Modells/UserModle.js"


const AddTask = async (req, res) => {
  try {
    const { workTitle, workDescription, worksComletionTime   } = req.body;

    const UserId = req.params.userId;

    if (!UserId || !workTitle || !workDescription || !worksComletionTime) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const userDetails = await User.findById(UserId)

    if(!userDetails) res.status(404).json("User not found")
    
    
    const existingUserTasks = await UserWorksModel.findOne({ userId: UserId });

    if (existingUserTasks) {
      existingUserTasks.WorkCollection.push({
        workTitle,
        workDescription,
        worksComletionTime,
      });
      await existingUserTasks.save();
      return res.status(201).json({ message: "Task added successfully" });
    }

    const newTask = new UserWorksModel({
      userId: req.params.userId,
      WorkCollection: [
        {
          workTitle,
          workDescription,
          worksComletionTime,
        },
      ],
    });
    await newTask.save();

    res.status(201).json({ message: "Task added successfully" });
  } catch (error) {
    res.status(500).json( { cause: error.message });
  }
};

const GetTasks = async (req, res) => {
  const UserId = req.params.userId 
  if(!UserId) res.status(401).json("Unauthorized")

  const UserAllTasks = await UserWorksModel.find({ userId: UserId })
  
  res.json(UserAllTasks)
}

const DeleteTask = async (req, res) => {
  const { TaskId } = req.params;
  const { UserId } = req.body;

  if (!TaskId) {
    return res.status(400).json("Please select a task to delete");
  }

  const userDoc = await UserWorksModel.findOne({
    userId: UserId,
    "WorkCollection._id": TaskId,
  });

  if (!userDoc) {
    return res.status(404).json("Task not found");
  }

  await UserWorksModel.updateOne(
    { userId: UserId },
    { $pull: { WorkCollection: { _id: TaskId } } }
  );

  return res.status(200).json({ message: "Task deleted successfully" });
};


const UpdateTask = async (req, res) => {
    const UserId = req.params.userId ;
  const {
    workTitle, workDescription, worksComletionTime, worksStatus, TaskId , TaskMasterId
  } = req.body;

  if (!TaskId) res.status(404).json("plase select a task to Update");

  if (!workTitle || !workDescription || !worksComletionTime || !worksStatus || !TaskMasterId || !UserId) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const UsersAllTaskCollection = await UserWorksModel.findById(TaskMasterId);
  if (!UsersAllTaskCollection) res.status(404).json("You have no tasks collection")
  if(UsersAllTaskCollection.userId.toString() !== UserId)
    res.status(401).json("You are not authorized to update this task collection");
  const TaskToUpdate = 
    UsersAllTaskCollection.WorkCollection.filter(
      (task) => task._id.toString() === TaskId
    )
  if (TaskToUpdate.length === 0)
    res.status(404).json("Task not found");
  

  const UpdatedUserTasks = await UserWorksModel.findOneAndUpdate(
    {
      _id: TaskMasterId,
      "WorkCollection._id": TaskId,
    },
    {
      $set: {
        "WorkCollection.$.workTitle": workTitle,
        "WorkCollection.$.workDescription": workDescription,
        "WorkCollection.$.worksComletionTime": worksComletionTime,
        "WorkCollection.$.worksStatus": worksStatus,
      },
    },
    { new: true } // return updated document
  );
  // save updated document
  await UpdatedUserTasks.save();

  const updatedItem = UpdatedUserTasks.WorkCollection.find(
    (i) => i._id.toString() === TaskId
  );

  res.status(201).json({ message: "Task updated successfully", updatedItem , UpdatedUserTasks  });
 


  
}







export default { AddTask, DeleteTask , UpdateTask , GetTasks};
