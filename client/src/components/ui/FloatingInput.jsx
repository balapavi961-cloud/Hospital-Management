import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

const FloatingInput = ({
    label,
    id,
    type = 'text',
    icon: Icon,
    value,
    onChange,
    error,
    className = '',
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);

    // Default Dark Glass Styles (fallback)
    const baseInputStyles = "w-full px-10 py-3.5 rounded-lg outline-none transition-all duration-300 placeholder-transparent border text-slate-900";
    const defaultDarkStyles = "bg-white/5 border-glass-border text-text-main focus:border-accent focus:ring-1 focus:ring-accent/50";

    const inputStyles = className ? `${baseInputStyles} ${className}` : `${baseInputStyles} ${defaultDarkStyles}`;

    return (
        <div className="relative mb-6">
            <div className="relative">
                <Icon
                    size={18}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 ${isFocused || value
                        ? (className ? 'text-accent' : 'text-accent')
                        : (className ? 'text-slate-400' : 'text-text-muted')
                        }`}
                />
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`
            ${inputStyles}
            ${error
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : ''}
          `}
                    placeholder={label}
                    {...props}
                />
                <label
                    htmlFor={id}
                    className={`
            absolute left-10 transition-all duration-300 pointer-events-none
            ${isFocused || value
                            ? `-top-2.5 text-xs px-2 font-medium ${className ? 'bg-slate-50 text-accent' : 'bg-bg-dark text-accent'}`
                            : `top-1/2 -translate-y-1/2 text-sm ${className ? 'text-slate-500' : 'text-text-muted'}`}
          `}
                >
                    {label}
                    {props.required && <span className="text-red-500 ml-1">*</span>}
                </label>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute -bottom-5 right-0 flex items-center gap-1 text-xs text-red-500"
                    >
                        <AlertCircle size={10} />
                        <span>{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FloatingInput;


