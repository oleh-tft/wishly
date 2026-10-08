import React, { useRef } from 'react';
import '../../styles/components/InputField.css';
import { SvgCalendar } from './Icons';

interface InputFieldProps {
  label: string;
  value: string;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  type = 'text',
  placeholder,
  icon,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpenPicker = () => {
    if (type === 'date' && inputRef.current) {
      inputRef.current.showPicker();
    }
  };

  const isDateEmpty = type === 'date' && !value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "number" && Number(e.target.value) < 0) {
      return;
    }

    onChange(e);
  };

  return (
    <div className="input-group">
      <label className="input-label">{label.toUpperCase()}</label>
      <div className="input-wrapper">
        {icon && <div className="input-icon-container">{icon}</div>}
        <input
          ref={inputRef}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
          onClick={handleOpenPicker}
          min={type === "number" ? 0 : undefined}
          className={`form-input ${icon ? 'has-icon' : ''} ${isDateEmpty ? 'date-placeholder' : ''}`}
        />
        {type === 'date' && (
          <div className="input-right-icon-container" onClick={handleOpenPicker}>
            <SvgCalendar />
          </div>
        )}
      </div>
    </div>
  );
};