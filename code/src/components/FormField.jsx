import React from "react";

const FormField = ({
  htmlFor,
  label,
  children,
  error,
  helpText,
  required = false,
  className = "",
  labelAction,
}) => {
  const labelContent = (
    <label className="form-label" htmlFor={htmlFor}>
      {label}
      {required ? <span className="form-label-required">*</span> : null}
    </label>
  );

  return (
    <div className={`form-group ${className}`.trim()}>
      {labelAction ? (
        <div className="form-label-row">
          {labelContent}
          <div className="form-label-action">{labelAction}</div>
        </div>
      ) : (
        labelContent
      )}
      {children}
      {error ? (
        <p className="form-error-message" role="alert">
          {error}
        </p>
      ) : helpText ? (
        <p className="form-helper-text">{helpText}</p>
      ) : null}
    </div>
  );
};

export default FormField;
