import "../../styles/components/Modal.css";
import { useEffect, useRef, type ReactNode } from 'react';
import { SvgClose } from "./Icons";
import { MainButton } from "./MainButton";

interface ModalProps {
  title: string;
  buttonText?: string;
  onClose?: () => void;
  onSubmit?: () => void;
  children?: ReactNode;

  secondaryButtonText?: string;
  onSecondarySubmit?: () => void;
  backgroundColor?: string;
  MainbuttonColor?: string;
  mainButtonHoverColor?: string;

  titleColor?: string;
  icon?: ReactNode;
  description?: string;
}


export function ModaL({
  title,
  buttonText,
  onClose,
  onSubmit,
  children,
  secondaryButtonText,
  onSecondarySubmit,
  backgroundColor,
  MainbuttonColor,
  mainButtonHoverColor,
  titleColor,
  icon,
  description
}: ModalProps) {
  const shouldClose = useRef(false);
  useEffect(() => {

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <>
      {/* Клик по фону вызывает закрытие */}
      <div className="modal-overlay"
        onMouseDown={(e) => {
          shouldClose.current = e.target === e.currentTarget;
        }}
        onMouseUp={(e) => {
          if (shouldClose.current && e.target === e.currentTarget) {
            onClose?.();
          }

          shouldClose.current = false;
        }}
      >

        {/* Клик внутри модалки не закрывает её */}
        <div
          className="modal-container"
          style={backgroundColor ? { backgroundColor } : undefined}
        >
          <div className="modal-header-container">
            <div className="modal-header">
              <div
                className="modal-title-wrapper"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: titleColor || "inherit"
                }}
              >
                {icon && <span className="modal-icon" style={{ display: "inline-flex", width: title !== "" ? "1.25em" : "9px", height: title !== "" ? "1.25em" : "9px"}}>{icon}</span>}
                <h2 className="modal-title" style={{ color: "inherit", margin: 0 }}>{title}</h2>
              </div>

              <button className="close-btn" onClick={onClose}>
                <SvgClose />
              </button>
            </div>

            {description && <div className="modal-description">
              {description}
            </div>}
          </div>

          {children && <div className="modal-content">
            {children}
          </div>}


          <div className="modal-footer" style={{marginTop: buttonText || secondaryButtonText ? "1.5em" : "0"}}>

            {/* Вторая кнопка */}
            {secondaryButtonText && (
              <MainButton
                backgroundColor="var(--color-black)"
                hoverColor="var(--color-black-hover)"
                text={secondaryButtonText}
                textColor="var(--color-white)"
                style={{ flex: 1 }}
                onClick={onSecondarySubmit || onClose}
              />
            )}

            {/* Главная кнопка */}
            {buttonText && (
              <MainButton
                backgroundColor={MainbuttonColor ? MainbuttonColor : "var(--color-black)"}
                hoverColor={mainButtonHoverColor}
                text={buttonText}
                textColor="var(--color-white)"
                style={{ flex: 1 }}
                onClick={onSubmit}
              />
            )}

          </div>

        </div>
      </div>
    </>
  );
}