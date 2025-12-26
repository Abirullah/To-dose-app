
function DropDown({ Edit, Delete, MarkAsCompleted }) {
    return (
        <>
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-30">
                <ul className="py-1">
                    {Edit && <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">{Edit}</li>}
                    {Delete && <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">{Delete}</li>}
                    {MarkAsCompleted && <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">{MarkAsCompleted}</li>}
                </ul>
            </div>
        </>
        
    )
}

export default DropDown
