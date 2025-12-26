import { useEffect, useState } from "react";
import { User_Own_Tasks } from "../../APIsRelatedTasks/ApiCaller";
import Loader from "../../Components/Loader";
import TaskDetails from "../../Components/TaskDetails";

function PendingWorks() {
  const [underProcessWorks, setUnderProcessWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workDetails, setWorkDetails] = useState(null);

  const token = localStorage.getItem("authToken");
  const userId = localStorage.getItem("userId");
  useEffect(() => {
    const getTasks = async () => {
      try {
        const [tasks, status] = await User_Own_Tasks(userId, token);

        if (status === 200 && Array.isArray(tasks)) {
          const inProgressTasks = tasks.filter(
            (task) =>
              task.worksStatus === "pending" &&
              new Date(task.worksComletionTime) >= new Date()
          );

          setUnderProcessWorks(inProgressTasks);
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    getTasks();
  }, [userId, token]);

  if (loading) {
    return (
      <>
        <div className="flex justify-center items-center h-[80vh] z-20">
          <Loader />
        </div>
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-10" />
      </>
    );
  }

  return (
    <>
      <h1 className="font-bold text-4xl">Pending Works</h1>
      <br />

      <div className="mt-2 w-[100vh] flex justify-center items-center">
        {underProcessWorks.length === 0 ? (
          <p className="text-center mt-4">
            No works are currently under process.
          </p>
        ) : workDetails ? (
            <>
              <TaskDetails
                workDetails={workDetails}
                setWorkDetails={setWorkDetails}
              />
            <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-10" />
          </>
        ) : (
          <div className="w-full flex flex-col gap-4 p-4">
            {underProcessWorks.map((work) => (
              <div
                key={work._id}
                className="p-2 rounded-lg shadow-md w-full cursor-pointer hover:scale-105 transition-all duration-300 flex"
                onClick={() => setWorkDetails(work)}
              >
                <div className="w-[80%]">
                  <h2 className="text-xl font-semibold mb-2 p-3 w-[80%]">
                    {work.workTitle}
                  </h2>
                  <p>{`Created At : ${new Date(
                    work.createdAt
                  ).toLocaleDateString()}`}</p>
                </div>
                <p>
                  Due Date:{" "}
                  {new Date(work.worksComletionTime).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default PendingWorks;
