// frontend/src/components/common/Loader.jsx
import React, { useEffect } from 'react';
import * as feather from 'feather-icons';

const Loader = ({ size = 'md', message = 'Loading...' }) => {
    // Sizes are mapped to Tailwind classes
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-10 h-10',
    };
    
    const spinnerClass = sizeClasses[size] || sizeClasses.md;
    
    // Replaces Feather icons on mount
    useEffect(() => {
        feather.replace();
    }, [size]);

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center text-gray-700">
            <i 
                data-feather="loader" 
                className={`${spinnerClass} animate-spin text-primary-600`}
            ></i>
            <p className="mt-3 text-sm font-medium text-gray-600">{message}</p>
        </div>
    );
};

export default Loader;