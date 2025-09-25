import React from 'react'

function Header() {
    return (
       <header className="bg-white bg-opacity-10 backdrop-blur-md shadow-md sticky top-0 z-10 ">
         <div className="container mx-auto px-6 py-4 flex justify-between items-center">
         <div className="text-2xl font-bold text-gray-800 flex items-center space-x-5">
          <img className='w-10 h-10'  src="https://img.freepik.com/premium-vector/todo-app-icon_1076610-59732.jpg" alt="" />
       TaskMaster
      </div>
       <nav className="flex space-x-6">
      <a
        className="text-gray-600 hover:text-gray-900 cursor-pointer font-extrabold"
        href="#about"
      >
         AUTHOR
      </a>
      <a
        href="#skills"
        className="text-gray-600 hover:text-gray-900 font-extrabold"
      >
        ABOUT
      </a>
      
      <a
        href="#contact"
        className="text-gray-600 hover:text-gray-900 font-extrabold"
      >
        CONTACT
      </a>
    </nav>
  </div>
</header>

    )
}

export default Header
