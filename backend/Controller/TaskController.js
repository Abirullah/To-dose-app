import UserWorksModel from "../Modells/UserWorksModel.js";
import User from "../Modells/UserModle.js"

const parseDueDate = (value) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split("-").map(Number);
      return new Date(y, m - 1, d, 23, 59, 59, 999);
    }
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};


const AddTask = async (req, res) => {
  try {
    const { workTitle, workDescription, worksComletionTime   } = req.body;

    const UserId = req.params.userId;

    if (!UserId || !workTitle || !workDescription || !worksComletionTime) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const dueDate = parseDueDate(worksComletionTime);
    if (!dueDate) {
      return res.status(400).json({ error: "Invalid due date/time" });
    }
    if (dueDate.getTime() < Date.now()) {
      return res.status(400).json({ error: "Due date/time cannot be in the past" });
    }

    const userDetails = await User.findById(UserId)

    if(!userDetails) res.status(404).json("User not found")
    
    
    const existingUserTasks = await UserWorksModel.findOne({ userId: UserId });

    if (existingUserTasks) {
      existingUserTasks.WorkCollection.push({
        workTitle,
        workDescription,
        worksComletionTime: dueDate,
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
          worksComletionTime: dueDate,
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
  const UserId = req.user?._id;

  if (!TaskId) {
    return res.status(400).json("Please select a task to delete");
  }
  if (!UserId) {
    return res.status(401).json("Unauthorized");
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

  const dueDate = parseDueDate(worksComletionTime);
  if (!dueDate) {
    return res.status(400).json({ error: "Invalid due date/time" });
  }

  const existingDue = new Date(TaskToUpdate[0].worksComletionTime).getTime();
  if (dueDate.getTime() < Date.now() && dueDate.getTime() !== existingDue) {
    return res
      .status(400)
      .json({ error: "Due date/time cannot be set in the past" });
  }
  

  const UpdatedUserTasks = await UserWorksModel.findOneAndUpdate(
    {
      _id: TaskMasterId,
      "WorkCollection._id": TaskId,
    },
    {
      $set: {
        "WorkCollection.$.workTitle": workTitle,
        "WorkCollection.$.workDescription": workDescription,
        "WorkCollection.$.worksComletionTime": dueDate,
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
