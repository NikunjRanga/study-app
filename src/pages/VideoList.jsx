import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Filter, Activity, MonitorPlay, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import VideoCard from '../components/VideoCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

// --- Main Page Component ---

const VideoList = () => {
    // State
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('studyApp_favorites')) || []);

    // New Features State
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'popular' | 'duration'

    // Fetch Videos
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/videos');
                // Ensure we handle the response correctly (array of videos)
                setVideos(response.data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch videos:", err);
                setError("Failed to load library. Please check your connection.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchVideos();
    }, []);

    // Filtering & Sorting Logic
    const filteredVideos = useMemo(() => {
        let result = videos.filter(video => {
            const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase()));

            // Check if category keyword exists in Title OR Description
            const matchesCategory = selectedCategory === 'All' ||
                video.title.includes(selectedCategory) ||
                (video.description && video.description.includes(selectedCategory));

            return matchesSearch && matchesCategory;
        });

        // Sorting
        if (sortBy === 'duration') {
            result.sort((a, b) => parseInt(a.duration) - parseInt(b.duration)); // Simple parse
        } else if (sortBy === 'popular') {
            result.sort((a, b) => (b.views || 0) - (a.views || 0));
        } else {
            // 'newest' (assuming ID or upload_date desc)
            result.sort((a, b) => b.id - a.id);
        }

        return result;
    }, [videos, searchQuery, selectedCategory, sortBy]);

    // Handlers
    const toggleFavorite = (id) => {
        const newFavorites = favorites.includes(id)
            ? favorites.filter(favId => favId !== id)
            : [...favorites, id];
        setFavorites(newFavorites);
        localStorage.setItem('studyApp_favorites', JSON.stringify(newFavorites));
    };



    const handleShare = (video) => {
        navigator.clipboard.writeText(`${window.location.origin}/video/${video.id}`);
        toast.success('Link copied to clipboard!');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center">
                <LoadingSpinner size={48} />
                <p className="text-zinc-500 mt-4 font-medium animate-pulse">Loading Library...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle size={32} className="text-red-600" />
                </div>
                <h2 className="text-zinc-900 text-xl font-bold mb-2">Oops! Something went wrong.</h2>
                <p className="text-zinc-500 max-w-md">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-6 py-2 bg-zinc-900 text-white rounded-full font-medium hover:bg-zinc-800 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="pt-24 min-h-screen bg-zinc-50 relative">
            <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-8">

                {/* Header Section: Title & Controls */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div>
                        <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight mb-2 flex items-center gap-3">
                            <MonitorPlay className="text-indigo-600" /> Browse Library
                        </h1>
                        <p className="text-zinc-500 text-lg">
                            Explore {videos.length} premium courses and tutorials.
                        </p>
                    </div>

                    {/* Search & Unified Filter Controls */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">

                        {/* Search Input */}
                        <div className="relative group w-full sm:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search topics..."
                                className="pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            {/* Sort Dropdown */}
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-zinc-200 rounded-lg text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 cursor-pointer font-medium shadow-sm"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="popular">Most Popular</option>
                                    <option value="duration">Duration</option>
                                </select>
                                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
                            </div>

                            {/* View Toggle */}
                            <div className="hidden md:flex bg-white border border-zinc-200 rounded-lg p-1 shadow-sm">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-zinc-100 text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                                    title="Grid View"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-zinc-100 text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                                    title="List View"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 flex-wrap md:flex-nowrap md:overflow-x-auto pb-6 mb-4 scrollbar-hide border-b border-zinc-200/50">
                    {['All', 'React', 'JavaScript', 'Node.js', 'Security', 'Streaming'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${selectedCategory === cat
                                ? 'bg-zinc-900 text-white border-zinc-900'
                                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Video Grid/List Container */}
                <div className={`
                    ${viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
                        : 'flex flex-col gap-4 max-w-4xl mx-auto'
                    }
                `}>
                    {filteredVideos.map((video, idx) => (
                        <div
                            key={video.id}
                            style={{ animationDelay: `${idx * 50}ms` }}
                            className="animate-in fade-in fill-mode-both duration-500"
                        >
                            <VideoCard
                                video={video}
                                viewMode={viewMode}
                                onPlay={(v) => window.location.href = `/video/${v.id}`} // Simple nav for now
                                isFavorite={favorites.includes(video.id)}
                                onToggleFavorite={toggleFavorite}
                                onShare={handleShare}
                            />
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredVideos.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 text-zinc-400">
                        <Search size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium">No videos found matching "{searchQuery}"</p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                            className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoList;
