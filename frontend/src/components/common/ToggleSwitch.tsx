import React from 'react';
import '../../styles/components/ToggleSwitch.css';

interface ToggleSwitchProps {
  label: string;
  description: string;
  
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  
  variant?: 'switch' | 'options';
  options?: { label: string; value: string }[];
  selectedValue?: string;
  onOptionSelect?: (value: string) => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  description,
  checked = false,
  onChange,
  variant = 'switch',
  options,
  selectedValue,
  onOptionSelect,
}) => {
  return (
    <div className="toggle-row">
      <div className="toggle-text">
        <span className="toggle-label">{label}</span>
        <span className="toggle-sub">{description}</span>
      </div>
      
      {variant === 'switch' ? (
        <label className="switch-container">
          <input 
            type="checkbox" 
            checked={checked} 
            onChange={(e) => onChange?.(e.target.checked)}
          />
          <span className="slider-pill"></span>
        </label>
      ) : (
        <div className="options-container">
          {options?.map((opt) => (
            <span 
              key={opt.value}
              className={`option-text ${selectedValue === opt.value ? 'active' : ''}`}
              onClick={() => onOptionSelect?.(opt.value)}
            >
              {opt.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};