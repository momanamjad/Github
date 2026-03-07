import React from "react";

const XIcon = ({ width = 24, height = 24, fill = "none", stroke = "currentColor", className = "", ...props }) => (
    <svg
        className={className}
        fill={fill}
        stroke={stroke}
        viewBox="0 0 24 24"
        width={width}
        height={height}
        {...props}
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export default XIcon;
