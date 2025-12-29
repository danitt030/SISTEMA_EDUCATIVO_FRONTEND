import React from 'react';
import './Card.css';

const Card = ({ children, title, className = '', headerActions }) => {
    return (
        <div className={`card-custom ${className}`}>
            {(title || headerActions) && (
                <div className="card-custom-header">
                    {title && <h3 className="card-custom-title">{title}</h3>}
                    {headerActions && <div className="card-custom-actions">{headerActions}</div>}
                </div>
            )}
            <div className="card-custom-body">
                {children}
            </div>
        </div>
    );
};

export default Card;
