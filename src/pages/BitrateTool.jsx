import React, { useState } from 'react';
import { Calculator, Save, RefreshCw, FileVideo, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const BitrateTool = () => {
    // Form State
    const [duration, setDuration] = useState('');
    const [resolution, setResolution] = useState('1080p');
    const [fps, setFps] = useState(30);
    const [fileSize, setFileSize] = useState(''); // Optional, for reverse calc

    // Result State
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCalculate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            // Prepare payload
            const payload = {
                duration: parseInt(duration),
                resolution,
                fps: parseInt(fps)
            };
            if (fileSize) payload.fileSize = parseFloat(fileSize);

            const { data } = await api.post('/utils/bitrate', payload);
            setResult(data);
        } catch (err) {
            console.error("Calculation failed:", err);
            setError("Failed to calculate bitrate. Please check your inputs.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="pt-24 min-h-screen bg-zinc-50 pb-12">
            <div className="max-w-4xl mx-auto px-6">

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center justify-center gap-3 mb-2">
                        <Calculator className="text-indigo-600" /> Bitrate Calculator
                    </h1>
                    <p className="text-zinc-500">Optimize your video uploads for the best quality/size balance.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                    {/* Input Form */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
                        <h2 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                            <FileVideo size={20} className="text-zinc-400" /> Input Details
                        </h2>

                        <form onSubmit={handleCalculate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-zinc-700 mb-1">Duration (seconds)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all"
                                    placeholder="e.g. 120"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 mb-1">Resolution</label>
                                    <select
                                        value={resolution}
                                        onChange={(e) => setResolution(e.target.value)}
                                        className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all"
                                    >
                                        <option value="4k">4K (UHD)</option>
                                        <option value="1440p">1440p (QHD)</option>
                                        <option value="1080p">1080p (FHD)</option>
                                        <option value="720p">720p (HD)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 mb-1">Frame Rate</label>
                                    <select
                                        value={fps}
                                        onChange={(e) => setFps(e.target.value)}
                                        className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all"
                                    >
                                        <option value="24">24 fps</option>
                                        <option value="30">30 fps</option>
                                        <option value="60">60 fps</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-zinc-700 mb-1">Target File Size (MB) <span className="text-zinc-400 font-normal">(Optional)</span></label>
                                <input
                                    type="number"
                                    value={fileSize}
                                    onChange={(e) => setFileSize(e.target.value)}
                                    className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all"
                                    placeholder="Calculate bitrate from size..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-2 bg-zinc-900 text-white font-bold py-3 rounded-xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? <LoadingSpinner className="animate-spin" size={20} /> : <RefreshCw size={20} />}
                                Calculate
                            </button>
                        </form>
                    </div>

                    {/* Results Display */}
                    <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 p-8 rounded-2xl shadow-xl text-white relative overflow-hidden min-h-[300px] flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                        {!result && !error && (
                            <div className="text-center opacity-50">
                                <ActivityIcon className="w-16 h-16 mx-auto mb-4" />
                                <p>Enter details to see recommendation.</p>
                            </div>
                        )}

                        {error && (
                            <div className="text-center text-red-200 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                                <AlertCircle className="w-10 h-10 mx-auto mb-2" />
                                <p>{error}</p>
                            </div>
                        )}

                        {result && result.calculations && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 relative z-10">
                                <div className="text-center border-b border-white/10 pb-6">
                                    <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-1">Recommended Bitrate</p>
                                    <h3 className="text-4xl font-extrabold tracking-tight">
                                        {result.calculations[0].bitrateMbps || result.calculations[0].bitrateKbps}
                                        <span className="text-lg text-indigo-300"> Mbps</span>
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                                        <span className="text-indigo-200 text-sm">Est. File Size</span>
                                        <span className="font-bold font-mono">
                                            {result.calculations[0].estimatedFileSizeMB || "N/A"} MB
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                                        <span className="text-indigo-200 text-sm">Quality Target</span>
                                        <span className="font-bold text-sm bg-indigo-500/30 px-2 py-0.5 rounded text-indigo-100 border border-indigo-400/30">
                                            {result.calculations[0].type}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-4 text-center">
                                    <p className="text-xs text-indigo-300 bg-black/20 inline-block px-3 py-1 rounded-full">
                                        Based on {resolution} @ {fps}fps standard
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

// Placeholder icon for empty state
const ActivityIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

export default BitrateTool;
