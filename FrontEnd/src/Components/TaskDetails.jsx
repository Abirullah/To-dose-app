import DropDown from "./DropDown";
import { useState } from "react";
import { Update_Task , Delete_Task } from "../APIsRelatedTasks/ApiCaller";

function TaskDetails({ workDetails, setWorkDetails }) {
    const [DropDownStatus, setDropDownStatus] = useState(false);


    

    const HandleDropDownOperation = () => {
        if (workDetails.worksStatus === "completed") {
            return (
                <div className="absolute right-10 bottom-65 w-48 bg-white rounded shadow-lg">
                    <DropDown
                        Delete="Delete Task"
                        workDetails={workDetails}
                    />
                </div>
            );
        }
        else if (workDetails.worksStatus === "in-progress") {
            return (
                <div className="absolute right-10 bottom-65 w-48 bg-white rounded shadow-lg">
                    <DropDown
                        Edit="Edit Task"
                        Delete="Delete Task"
                        MarkAsCompleted="Mark as Completed"
                        workDetails={workDetails}
                    />
                </div>
            );
        }
        else if (workDetails.worksStatus === "pending") {
            return (
                <div className="absolute right-10 bottom-65 w-48 bg-white rounded shadow-lg">
                    <DropDown
                        Edit="Edit Task"
                        Delete="Delete Task"
                        MarkAsCompleted="Start Task"
                        workDetails={workDetails}
                    />
                </div>
            );
        }
        else {
            return (
              <div className="absolute right-10 bottom-65 w-48 bg-white rounded shadow-lg">
                <DropDown
                  Edit="Edit Task"
                  Delete="Delete Task"
                  MarkAsCompleted="Change Due Date"
                 workDetails={workDetails}
                />
              </div>
            );
        }
        
    }

  return (
    <>
      <div className="absolute z-20 top-20 left-1/2 -translate-x-1/2 bg-blue-50 p-6 rounded-lg shadow-md w-[90%] h-[80vh] flex flex-col">
        {/* 🔹 TOP SECTION */}
        <div className="flex items-center justify-between border-b pb-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setWorkDetails(null)}
          >
            ← Back
          </button>

          <h2 className="text-2xl font-bold text-center flex-1">
            {workDetails.workTitle}
          </h2>

          {/* Spacer to keep title centered */}
          <div className="w-[88px]" />
        </div>

        {/* 🔹 MIDDLE SECTION (DESCRIPTION) */}
        <div className="flex-1 overflow-y-auto mt-4 p-4 bg-white rounded-md shadow-inner">
          <p className="text-gray-700 leading-relaxed">
            {workDetails.workDescription}
          </p>
        </div>

        {/* 🔹 ACTION BUTTONS */}
        <div className="flex items-center mt-4 justify-between px-6">
          <button>
            Status: {workDetails.worksStatus}
          </button>
          {/* three dots button and dropdown */}
                  <button className="ml-4 relative px-4  py-1 bg-blue-400 rounded hover:bg-blue-500 text-white text-2xl font-bold "
            onClick={() => setDropDownStatus(!DropDownStatus)}
                  >
           { DropDownStatus?"x": "⋮"}
          </button>
          {DropDownStatus && 
            HandleDropDownOperation()
            }
        </div>

        {/* 🔹 BOTTOM SECTION */}
        <div className="flex justify-between items-center mt-4 border-t pt-3 text-sm text-gray-600">
          <span>
            Created: {new Date(workDetails.createdAt).toLocaleDateString()}
          </span>

          <span>
            Due: {new Date(workDetails.worksComletionTime).toLocaleDateString()}
          </span>
        </div>
      </div>
    </>
  );
}

export default TaskDetails;
