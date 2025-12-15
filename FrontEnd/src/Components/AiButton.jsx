import React from "react";
import { useState } from "react";

function AiButton({ onClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mouseOver, setMouseOver] = useState(false);
  return (
    <>
      
      <div
        className="fixed right-10 bottom-7 cursor-pointer text-white z-50"
        onMouseEnter={() => setMouseOver(true)}
        onMouseLeave={() => setMouseOver(false)}
        onClick={() => {
          if (typeof onClick === "function") onClick();
          setIsOpen((v )=> !v);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 200"
          fill="none"
          className={`w-16 h-16 stroke-black fill-black transition-all duration-300 ${
            mouseOver ? "stroke-blue-500" : ""
          } hover:fill-blue-500 hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]`}
        >
          <rect
            x="30"
            y="30"
            width="140"
            height="140"
            rx="25"
            strokeWidth="12"
            className="transition-colors duration-300"
          />
          {isOpen ? (
            <path
              d="M60 60 L140 140 M140 60 L60 140"
              stroke="white"
              strokeWidth="12"
              strokeLinecap="round"
              className="transition-colors duration-300"
            />
          ) : (
            <text
              x="100"
              y="125"
              textAnchor="middle"
              fontSize="80"
              fill="white"
              fontFamily="Arial, sans-serif"
            >
              AI
            </text>
          )}

          <g transform="translate(140,45)">
            <path
              d="M10 0 L13 7 L20 10 L13 13 L10 20 L7 13 L0 10 L7 7 Z"
              className="transition-colors duration-300"
            />
            <path
              d="M25 10 L27 14 L32 16 L27 18 L25 22 L23 18 L18 16 L23 14 Z"
              className="fill-gray-500 transition-colors duration-300 hover:fill-blue-400"
            />
          </g>
        </svg>
      </div>
    </>
  );
}

export default AiButton;
