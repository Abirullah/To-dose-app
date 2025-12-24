
export async function User_Own_Tasks(userId, token) {
  try {
    const res = await fetch(
      `http://localhost:5000/users/GetUserTasks/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    return data[0].WorkCollection; 
  } catch (err) {
    console.log(err);
    return null; 
  }
}
