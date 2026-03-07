import React from "react";

const DragIcon = ({ width = 16, height = 16, fill = "#8b949e", className = "", ...props }) => (
    <svg
        aria-hidden="true"
        height={height}
        viewBox="0 0 16 16"
        version="1.1"
        width={width}
        data-view-component="true"
        fill={fill}
        className={className}
        {...props}
    >
        <path d="M10 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm-4 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm5-9a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path>
    </svg>
);

export default DragIcon;
