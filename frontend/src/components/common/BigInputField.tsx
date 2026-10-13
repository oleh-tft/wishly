import React from 'react';
import '../../styles/components/BigInputField.css';

interface BigInputFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const BigInputField: React.FC<BigInputFieldProps> = ({
  label,
  value,
  placeholder,
  onChange,
}) => {
  return (
    <div className="input-group">
      <label className="input-label">{label.toUpperCase()}</label>
      <div className="input-wrapper text-area-wrapper">
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          className={`form-input big-input`}
        />
      </div>
    </div>
  );
};