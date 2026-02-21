
import { useState, useEffect, useRef } from "react";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import "./TicketTitle.scss";

import type {TitleInputProps} from "../../models/TicketTitleInputInterface/TicketTitleInputInterface.ts"

export default function TicketTitle({
                                       value,
                                       onChange,
                                       disabled = false,
                                       commonProblems
                                   }: TitleInputProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const dropdownContentRef = useRef<HTMLDivElement>(null);

    /* ---------- Close dropdown when clicking outside ---------- */
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                dropdownContentRef.current &&
                !dropdownContentRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    /* ---------- Prevent body scroll when dropdown is open ---------- */
    useEffect(() => {
        if (isDropdownOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isDropdownOpen]);

    const toggleDropdown = () => {
        if (!disabled) {
            setIsDropdownOpen(!isDropdownOpen);
        }
    };

    const handleTitleSelect = (selectedTitle: string) => {
        onChange(selectedTitle);
        setIsDropdownOpen(false);
    };

    const handleCustomTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    const clearTitle = () => {
        onChange("");
    };

    return (
        <div className="field" ref={dropdownRef}>
            <label>عنوان تیکت</label>
            <div className="dropdown-wrapper">
                <div
                    className={`dropdown-header ${isDropdownOpen ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                    onClick={toggleDropdown}
                >
                    <input
                        type="text"
                        value={value}
                        placeholder="انتخاب مشکل یا وارد کردن عنوان"
                        readOnly
                        className="dropdown-input"
                        disabled={disabled}
                    />
                    <div className="dropdown-controls">
                        {value && !disabled && (
                            <button
                                className="clear-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearTitle();
                                }}
                                type="button"
                                aria-label="پاک کردن"
                            >
                                ✕
                            </button>
                        )}
                        <div className="dropdown-arrow">
                            {isDropdownOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </div>
                    </div>
                </div>

                {isDropdownOpen && !disabled && (
                    <div className="dropdown-content" ref={dropdownContentRef}>
                        <div className="dropdown-title">مشکلات رایج</div>
                        <div className="dropdown-options">
                            {commonProblems.map((problem, index) => (
                                <div
                                    key={index}
                                    className={`dropdown-option ${value === problem ? 'selected' : ''}`}
                                    onClick={() => handleTitleSelect(problem)}
                                >
                                    {problem}
                                </div>
                            ))}
                        </div>

                        <div className="custom-title-section">
                            <div className="section-label">عنوان دلخواه:</div>
                            <input
                                type="text"
                                value={value}
                                onChange={handleCustomTitleChange}
                                placeholder="در صورت نبود مشکل بالا، عنوان دلخواه وارد کنید"
                                className="custom-input"
                                onClick={(e) => e.stopPropagation()}
                                disabled={disabled}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}