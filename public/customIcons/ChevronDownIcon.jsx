import React from "react";

const ChevronDownIcon = ({ width = 12, height = 12, fill = "currentColor", className = "", ...props }) => (
    <svg
        width={width}
        height={height}
        viewBox="0 0 16 16"
        fill={fill}
        className={className}
        {...props}
    >
        <path d="m4.427 7.427 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z" />
    </svg>
);

export default ChevronDownIcon;
