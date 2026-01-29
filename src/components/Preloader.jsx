import React from 'react';
import Logo from './Logo';

const Preloader = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-500">
            {/* Animated Container */}
            <div className="w-32 md:w-48 flex flex-col items-center gap-8">
                <div className="w-full h-full animate-breathe">
                    <Logo className="w-full h-full drop-shadow-2xl" />
                </div>
                {/* Optional Loading Bar */}
                <div className="w-48 h-1 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 animate-loading-bar rounded-full"></div>
                </div>
            </div>

            <style jsx>{`
                @keyframes breathe {
                    0%, 100% { transform: scale(1); opacity: 0.9; }
                    50% { transform: scale(1.05); opacity: 1; }
                }
                .animate-breathe {
                    animation: breathe 3s ease-in-out infinite;
                }
                @keyframes loading-bar {
                    0% { width: 0%; transform: translateX(-10%); }
                    50% { width: 70%; }
                    100% { width: 100%; transform: translateX(0); }
                }
                .animate-loading-bar {
                    animation: loading-bar 2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Preloader;
