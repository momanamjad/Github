import React from "react";

const FilterIcon = ({ width = 16, height = 16, fill = "currentColor", className = "", ...props }) => (
    <svg
        aria-hidden="true"
        height={height}
        viewBox="0 0 16 16"
        version="1.1"
        width={width}
        data-view-component="true"
        className={className}
        fill={fill}
        {...props}
    >
        <path d="M.75 3h14.5a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1 0-1.5ZM3 7.75A.75.75 0 0 1 3.75 7h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 3 7.75Zm3 4a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z"></path>
    </svg>
);

export default FilterIcon;
