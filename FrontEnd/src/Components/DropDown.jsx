import { Delete_Task } from "../APIsRelatedTasks/ApiCaller";

function DropDown({ Edit, Delete, MarkAsCompleted, workDetails }) {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    const DeleteTheTask = (userId, TaskId, token) => async () => {
        const Response = await Delete_Task(userId, TaskId, token);
        if (Response && Response.message === "Task deleted successfully")
        window.location.reload();
    }
    

    return (
        <>
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-30">
                <ul className="py-1">
                    {Edit && <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">{Edit}</li>}
                    {Delete && <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={ DeleteTheTask(userId, workDetails._id, token) }

                        >{Delete}</li>}
                    {MarkAsCompleted && <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">{MarkAsCompleted}</li>}
                </ul>
            </div>
        </>
        
    )
}

export default DropDown
