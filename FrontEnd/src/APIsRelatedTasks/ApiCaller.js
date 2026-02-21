const API_BASE_URL = (import.meta.env.VITE_API_URL || "https://to-dose-app-2ct7.vercel.app").replace(
  /\/+$/,
  ""
);

export async function User_Own_Tasks(userId, token) {
  try {
    const res = await fetch(`${API_BASE_URL}/tasks/GetTasks/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    localStorage.setItem("collectionId", data[0]._id);

    data[0].WorkCollection.forEach(element => {
      if (element.worksComletionTime < new Date().toISOString() && element.worksStatus !== "completed") {
        Update_Task(userId, {
          TaskId: element._id,
          TaskMasterId: data[0]._id,
          workTitle: element.workTitle,
          workDescription: element.workDescription,
          worksComletionTime: element.worksComletionTime,
          worksStatus: "missed"
        }, token);

      }
      
    });

    return ([data[0].WorkCollection , res.status , data[0]._id ]); 
  } catch (err) {
    console.log(err.message);
    return null; 
  }
}


export async function Update_Task(userId, taskDetails, token) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/tasks/UpdateTask/${userId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskDetails),
      }
    );
    const data = await res.json();
    return data;
  } catch (err) {
    console.log(err.message);
    return null;
  }
} 

export async function Delete_Task(UserId, TaskId, token) {
  try {
    console.log("deleting task id:", TaskId);
    const res = await fetch(
      `${API_BASE_URL}/tasks/DeleteTask/${TaskId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ UserId }),
      }
    );
    const data = await res.json();
    return data;
  } catch (err) {
    console.log(err.message);
    return null;
  }
}
