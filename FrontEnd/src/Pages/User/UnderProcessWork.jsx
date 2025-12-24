import React, { useEffect, useState } from "react";

function UnderProcessWork() {
  const [underProcessWorks, setUnderProcessWorks] = useState([]);
  const [TaskId, setTaskId] = useState("");
  const [UpdateWorkStatus, setUpdateWorkStatus] = useState(0);
  // const [Rerender , setRerender] = useState(false);


  const token = localStorage.getItem("authToken");
  const userId = localStorage.getItem("userId");


  function triggerRerender() {
    console.log("Rerender triggered");
    window.location.reload();
    // setRerender(prev => prev + 1);
  }

  useEffect(() => {
    if (token) {
      fetch(`http://localhost:5000/users/GetUserTasks/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
            setTaskId(data[0]._id);
          const inProcessWorks = data[0].WorkCollection;

          const inProgress = inProcessWorks.filter(
            (work) => work.worksStatus.trim() === "in-progress"
          );

          setUnderProcessWorks(inProgress);
        })
        .catch((error) => {
          console.error("Error fetching under process works:", error);
        });
    }
  }, [token, userId]);


  return (
    <>
      <h1 className="font-bold text-4xl"> UnderProcessWork </h1>
      <br />
      <div className=" mt-2 w-[100%] flex justify-center items-center ">
        {underProcessWorks.length === 0 ? (
          <p className="text-center mt-4">
            No works are currently under process.
          </p>
        ) : (
          <div className="w-[100%] flex flex-col gap-4 bg-white p-4 rounded-lg shadow-md">
            {underProcessWorks.map((work) => (
              <div
                key={work._id}
                className=" p-4 rounded-lg shadow-md flex flex-col items-center "
              >
                <h2 className="text-2xl font-semibold mb-2 p-3">
                  {work.workTitle}
                </h2>
                <p className="p-3 max-w-[50%]">{work.workDescription}</p>
                <div className="w-full flex ">
                  <p className="p-4 rounded-lg shadow-md flex flex-col ">
                    Due Date:{" "}
                            {new Date(work.worksComletionTime).toLocaleDateString()}
                        </p>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-3 ml-auto "
                    onClick={() => {
                      fetch(
                        `http://localhost:5000/users/UpdateTask/${userId}`,
                        {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                            body: JSON.stringify({
                            TaskMasterId: TaskId,
                            TaskId: work._id,
                            workTitle: work.workTitle,
                            workDescription: work.workDescription,
                            worksComletionTime: work.worksComletionTime,
                            worksStatus: "completed",
                          }),
                        }
                      )
                        .then((res) => res.json())
                        .then((data) => {
                          console.log("Work status updated:", data);
                          setUpdateWorkStatus(!UpdateWorkStatus);
                        })
                        .catch((error) => {
                          console.error("Error updating work status:", error.message);
                        });
                      
                      
                        triggerRerender();
                    }
                    }
                  >
                    Mark Completed
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default UnderProcessWork;
