import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { updateCurrentUser } from '@/api/users';
import '../../styles/components/languageDropdown.css';
import { SvgArrowRight } from "./Icons";

export function LanguageDropdown({ color }: { color?: string }) {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLang = i18n.language.toUpperCase();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const changeLanguage = async (lng: string) => {
        const langCode = lng.toLowerCase();
        i18n.changeLanguage(langCode);
        setIsOpen(false);

        const token = localStorage.getItem("token");
        if (token) {
            try {
                await updateCurrentUser({ language: langCode.toUpperCase() });
            } catch (error) {
                console.error("Failed to save language preference", error);
            }
        }
    };

    return (
        <div className="language-dropdown-container" ref={dropdownRef}>
            {/* Desktop */}
            <div
                className="language-dropdown desktop-language"
                style={{ color }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{currentLang === "UK" ? "UA" : currentLang}</span>
                <div
                    style={{
                        transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                        transition: "0.2s",
                    }}
                >
                    <SvgArrowRight />
                </div>
            </div>

            {isOpen && (
                <div className="language-dropdown-menu">
                    {currentLang !== "EN" && (
                        <div
                            className="language-option"
                            onClick={() => changeLanguage("EN")}
                            style={{ color }}
                        >
                            EN
                        </div>
                    )}
                    {currentLang !== "UK" && (
                        <div
                            className="language-option"
                            onClick={() => changeLanguage("UK")}
                            style={{ color }}
                        >
                            UA
                        </div>
                    )}
                </div>
            )}

            {/* Mobile */}
            <div className="mobile-language-switcher">
                <div
                    className={`language-option ${currentLang === "EN" ? "active" : ""}`}
                    style={{ color }}
                    onClick={() => changeLanguage("EN")}
                >
                    EN
                </div>

                <div
                    className={`language-option ${currentLang === "UK" ? "active" : ""}`}
                    style={{ color }}
                    onClick={() => changeLanguage("UK")}
                >
                    UA
                </div>
            </div>
        </div>
    );
}