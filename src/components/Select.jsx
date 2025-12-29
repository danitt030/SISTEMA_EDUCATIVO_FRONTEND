import React from 'react';
import './Input.css';

const Select = ({
    label,
    name,
    value,
    onChange,
    options = [],
    placeholder = 'Seleccionar...',
    error,
    required = false,
    disabled = false,
    className = '',
}) => {
    return (
        <div className={`form-group ${className}`}>
            {label && (
                <label htmlFor={name} className="form-label">
                    {label}
                    {required && <span className="required">*</span>}
                </label>
            )}
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`form-select ${error ? 'is-invalid' : ''}`}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <div className="invalid-feedback">{error}</div>}
        </div>
    );
};

export default Select;
