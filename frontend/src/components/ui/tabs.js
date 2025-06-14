import React from "react";

const Tabs = ({ children }) => (
  <div className="inline-flex h-10 overflow-x-auto rounded-md p-1">
    {children}
  </div>
);

const TabsList = ({ children }) => (
  <div className="inline-flex h-10 overflow-x-auto rounded-md p-1">
    {children}
  </div>
);

const TabsTrigger = ({ children, className = "" }) => (
  <button
    type="button"
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${className}`}
  >
    {children}
  </button>
);

const TabsContent = ({ children, className = "" }) => (
  <div className={`mt-2 ${className}`}>
    {children}
  </div>
);

export { Tabs, TabsList, TabsTrigger, TabsContent };
