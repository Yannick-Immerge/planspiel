"use client"

import {ReactNode, useState} from "react";

export default function CollapsingCard({ heading, children }: { heading: string, children: ReactNode })   {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCollapse = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="border border-gray-300 rounded-md shadow-sm p-4">
      {/* Header with Toggle Button */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={toggleCollapse}
      >
        <h2 className="text-lg font-semibold">{heading}</h2>
        <button
          className={`transform transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          aria-label={isOpen ? "Collapse" : "Expand"}
        >
          ▼
        </button>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="mt-2">
          {children}
        </div>
      )}
    </div>
  );
};