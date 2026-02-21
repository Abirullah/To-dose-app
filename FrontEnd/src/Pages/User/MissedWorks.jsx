import { useEffect, useState } from "react";
import { User_Own_Tasks } from "../../APIsRelatedTasks/ApiCaller";
import Loader from "../../Components/Loader";
import TaskDetails from "../../Components/TaskDetails";
import { getAuthToken, getUserId } from "../../lib/authSession";

function MissedWorks() {
  const [underProcessWorks, setUnderProcessWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workDetails, setWorkDetails] = useState(null);

  const token = getAuthToken();
  const userId = getUserId();



  useEffect(() => {
    async function getTasks() {
      const workCollection = await User_Own_Tasks(userId, token);
      const InProgressTasks = workCollection[0].filter(
          (task) => task.worksStatus != "completed" && task.worksComletionTime < new Date().toISOString()
      );
      if (workCollection[1] === 200) {
        setTimeout(() => {
          setLoading(false);
        }, 1000);

      }
      setUnderProcessWorks(InProgressTasks);
    }
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

export default MissedWorks;
