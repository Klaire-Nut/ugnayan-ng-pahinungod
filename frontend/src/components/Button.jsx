import React from "react";
import { User } from "lucide-react"; // default icon if none is passed

function Button({
    text,
    variant = "primary", // primary, secondary, outlined, text
    type = "text", // text or icon
    disabled = false,
    onClick,
    icon, // optional custom icon
}) {
    const baseStyle = {
        fontWeight: "600",
        borderRadius: type === "icon" ? "50%" : "9999px",
        padding: type === "icon" ? "0.8rem" : "0.6rem 1.5rem",
        fontSize: "0.95rem",
        transition: "all 0.25s ease",
        cursor: disabled ? "not-allowed" : "pointer",
        border: "none",
        outline: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: text && icon ? "0.5rem" : "0",
    };

    const variants = {
        primary: {
        backgroundColor: "#7B1113",
        color: "white",
        border: "2px solid #7B1113",
        },
        secondary: {
        backgroundColor: "white",
        color: "#7B1113",
        border: "1px solid #7B1113",
        },
        outlined: {
        backgroundColor: "transparent",
        color: "#FFFFFF",
        border: "1px solid #FFFFFF",
        },
        text: {
        backgroundColor: "transparent",
        color: "white",
        border: "none",
        },
    };

    const disabledStyle = {
        backgroundColor: "#D3D3E0",
        color: "#A0A0A0",
        border: "2px solid #D3D3E0",
        opacity: 0.8,
        boxShadow: "none",
        transform: "none",
    };

    const handleMouseEnter = (e) => {
        if (disabled) return;
        const btn = e.currentTarget;
        btn.style.transform = "scale(1.05)";
        btn.style.boxShadow = "0 4px 12px rgba(123, 17, 19, 0.3)";

        if (variant === "text") {
        btn.style.color = "#F4F4F4";
        } else {
        btn.style.color = "white";
        if (variant === "outlined" || variant === "secondary") {
            btn.style.backgroundColor = "#7B1113";
        }
        }
    };

    const handleMouseLeave = (e) => {
        if (disabled) return;
        const btn = e.currentTarget;
        btn.style.transform = "scale(1)";
        btn.style.boxShadow = "none";
        btn.style.filter = "brightness(1)";

        if (variant === "text") {
        btn.style.color = "white";
        btn.style.backgroundColor = "transparent";
        } else if (variant === "outlined") {
        btn.style.color = "white";
        btn.style.backgroundColor = "transparent";
        btn.style.border = "1px solid #FFFFFF";
        } else {
        btn.style.color = variant === "primary" ? "white" : "#7B1113";
        btn.style.backgroundColor =
            variant === "primary"
            ? "#7B1113"
            : variant === "secondary"
            ? "white"
            : "transparent";
        }
    };

    const handleMouseDown = (e) => {
        if (disabled) return;
        const btn = e.currentTarget;
        btn.style.transform = "scale(1.1)";
        btn.style.boxShadow = "0 6px 16px rgba(123, 17, 19, 0.4)";
        btn.style.filter = "brightness(1.1)";

        if (variant === "text") {
        btn.style.color = "#D3D3E0";
        } else {
        btn.style.backgroundColor = "#7B1113";
        btn.style.color = "white";
        }
    };

    const handleMouseUp = (e) => {
        if (disabled) return;
        const btn = e.currentTarget;
        btn.style.transform = "scale(1.05)";
        btn.style.filter = "brightness(1)";
        btn.style.boxShadow = "0 4px 12px rgba(123, 17, 19, 0.3)";

        if (variant === "text") {
        btn.style.color = "white";
        btn.style.backgroundColor = "transparent";
        } else if (variant === "outlined") {
        btn.style.color = "white";
        btn.style.backgroundColor = "transparent";
        btn.style.border = "1px solid #FFFFFF";
        } else {
        btn.style.backgroundColor =
            variant === "primary"
            ? "#7B1113"
            : variant === "secondary"
            ? "white"
            : "transparent";
        btn.style.color = variant === "primary" ? "white" : "#7B1113";
        }
    };

    const style = {
        ...baseStyle,
        ...(disabled ? disabledStyle : variants[variant]),
    };

    const IconComponent = icon || User;

    return (
        <button
        style={style}
        onClick={!disabled ? onClick : undefined}
        disabled={disabled}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        >
        {type === "icon" ? (
            <IconComponent size={20} />
        ) : (
            <>
            {icon && <IconComponent size={18} />}
            {text}
            </>
        )}
        </button>
    );
}

export default Button;