import { CSSProperties, ReactNode, MouseEvent } from 'react';
import '../../styles/components/mainButton.css';

type MainButtonProps = {
  text?: string;
  icon?: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  backgroundColor?: string;
  hoverColor?: string;
  textColor?: string;
  style?: CSSProperties;
  collapseOnMobile?: boolean;
  iconPosition?: "before" | "after";
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  small?: boolean;
};

export function MainButton({
  text,
  icon,
  onClick,
  backgroundColor,
  hoverColor = "var(--color-pink-hover)",
  textColor,
  style,
  collapseOnMobile = false,
  iconPosition = "before",
  type = 'button',
  disabled = false,
  small = false,
}: MainButtonProps) {

  const buttonStyles: CSSProperties & { [key: string]: any } = {
    backgroundColor: backgroundColor,
    color: textColor,
    '--btn-hover-color': hoverColor,
    ...style
  };

  const buttonClassName = `main-button ${collapseOnMobile ? 'main-button--responsive' : ''}`.trim();

  return (
    <button
      type={type}
      className={buttonClassName}
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: small ? !text ? '.35rem .35rem' : '.7rem 1.25rem' : '1rem 1.25rem',
        maxHeight: small ? '40px' : '48px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...buttonStyles
      }}
    >
      {icon && iconPosition === "before" && <span className="button-icon">{icon}</span>}
      {text && <span className="button-text">{text}</span>}
      {icon && iconPosition === "after" && <span className="button-icon">{icon}</span>}
    </button>
  );
}