import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 32, className = "" }) => {
    return (
        <div className={`flex items-center justify-center p-4 ${className}`}>
            <Loader2 className="animate-spin text-indigo-600" size={size} />
        </div>
    );
};

export default LoadingSpinner;
