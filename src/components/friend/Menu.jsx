import { useCallback, useEffect, useRef, useState } from "react";
import { Users, UserPlus, Ban, Users2, ChevronDown } from "lucide-react";
import { useParams } from "react-router";

const options = [
    { value: "all", label: "Bạn bè", icon: Users2 },
    { value: "request", label: "Lời mời kết bạn", icon: UserPlus },
    { value: "suggest", label: "Gợi ý kết bạn", icon: Users },
    { value: "blocked", label: "Danh sách chặn", icon: Ban },
];

export const Menu = ({ currentTab }) => {
    const params = useParams();
    const [tab, setTab] = useState(params.tab || "all");
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = options.find((option) => option.value === tab);

    const handleTabChange = useCallback((value) => {
        setTab(value);
        setIsOpen(false);
        currentTab(value);
    }, [currentTab]);

    const toggleDropdown = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen]);

    return (
        <div ref={dropdownRef} className="flex items-center justify-center mb-4 gap-2">
            <span className="font-medium text-white-theme dark:text-b-wt">
                {selectedOption.label}
            </span>

            <div className="relative">
                <button
                    onClick={toggleDropdown}
                    className="group w-6 h-6 flex items-center justify-center rounded-full bg-[#F1F4F7] dark:bg-gray-600/30 hover:border dark:hover:border-b-wt hover:border-white-theme transition-transform duration-300 hover:scale-105"
                    aria-label="Toggle menu"
                >
                    <ChevronDown
                        size={16}
                        className={`text-white-theme dark:text-b-wt transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                            }`}
                    />
                </button>

                {isOpen && (
                    <div className="absolute top-8 z-50 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                        {options.map((option) => {
                            const Icon = option.icon;
                            const isSelected = tab === option.value;

                            return (
                                <button
                                    key={option.value}
                                    onClick={() => handleTabChange(option.value)}
                                    className={`w-full flex items-center px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition ${isSelected ? "bg-gray-100 dark:bg-gray-700" : ""
                                        }`}
                                >
                                    <Icon className="w-4 h-4 mr-2 text-gray-700 dark:text-gray-200" />
                                    <span className="text-sm text-gray-800 dark:text-gray-100">
                                        {option.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
