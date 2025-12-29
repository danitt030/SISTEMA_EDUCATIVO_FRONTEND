import React from 'react';
import './Button.css';

const Button = ({
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    onClick,
    disabled = false,
    loading = false,
    icon: Icon,
    className = '',
    ...props
}) => {
    return (
        <button
            type={type}
            className={`btn btn-${variant} btn-${size} ${className}`}
            onClick={onClick}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className="btn-loader"></span>
            ) : (
                <>
                    {Icon && <Icon size={size === 'sm' ? 14 : 18} />}
                    {children && <span>{children}</span>}
                </>
            )}
        </button>
    );
};

export default Button;
