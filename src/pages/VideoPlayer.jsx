import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { ThumbsUp, Share2, MoreHorizontal, ChevronDown, Play, Clock, AlertCircle, PlayCircle, GraduationCap } from 'lucide-react';

import api from '../utils/api';
import VideoCard from '../components/VideoCard';
import LoadingSpinner from '../components/LoadingSpinner';

// --- Memphis Pop Component ---
const MemphisPop = () => {
    // Geometric shapes with random trajectories
    // Increased spread (50px+) to start outside the button
    const shapes = [
        { color: 'bg-yellow-400', type: 'circle', tx: '-45px', ty: '-55px', rot: '0deg', delay: '0s' },
        { color: 'bg-pink-500', type: 'triangle', tx: '45px', ty: '-55px', rot: '45deg', delay: '0.1s' },
        { color: 'bg-indigo-500', type: 'square', tx: '-55px', ty: '20px', rot: '20deg', delay: '0.05s' },
        { color: 'bg-cyan-400', type: 'squiggle', tx: '55px', ty: '20px', rot: '-30deg', delay: '0.15s' },
        { color: 'bg-purple-500', type: 'cross', tx: '0px', ty: '-65px', rot: '90deg', delay: '0.08s' },
    ];

    return (
        <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center z-[-1]">
            {shapes.map((s, i) => (
                <div
                    key={i}
                    className={`absolute w-3 h-3 ${s.type === 'circle' ? 'rounded-full' : 'rounded-sm'} ${s.color}`}
                    style={{
                        clipPath: s.type === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined,
                        '--tx': s.tx,
                        '--ty': s.ty,
                        '--rot': s.rot,
                        animation: `memphis-fly 0.6s cubic-bezier(0.17, 0.67, 0.83, 0.67) forwards ${s.delay}`
                    }}
                />
            ))}
        </div>
    );
};

// --- Custom Styles for Cinematic Video Player & Animations ---
const customPlayerStyles = `
  @keyframes elastic-bounce {
      0% { transform: scale(1); }
      40% { transform: scale(1.4); }
      70% { transform: scale(0.9); }
      100% { transform: scale(1); }
  }
  @keyframes shockwave {
      0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.6); opacity: 1; }
      100% { transform: scale(2.5); box-shadow: 0 0 0 20px rgba(99, 102, 241, 0); opacity: 0; }
  }
  @keyframes memphis-fly {
      0% { transform: translate(0,0) rotate(0deg) scale(0.5); opacity: 0; }
      20% { opacity: 1; }
      100% { transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(1.2); opacity: 0; }
  }
  
  /* Thick Progress Bar */
  .video-js .vjs-progress-control {
      height: 1.5em; 
      top: -1.5em; 
  }
  .video-js .vjs-progress-holder {
      height: 100% !important;
      margin: 0;
  }
  .video-js .vjs-play-progress {
      background-color: #6366f1 !important; /* Indigo-500 */
  }
  .video-js .vjs-play-progress:before {
      display: none; 
  }
  .video-js .vjs-slider {
      background-color: rgba(255,255,255,0.2);
  }
  .video-js .vjs-load-progress {
      background: rgba(255,255,255,0.3);
  }
  .video-js .vjs-control-bar {
      background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
      height: 4em;
  }
`;

// --- VideoJS Component (Reusable) ---
const VideoJS = ({ options, onReady }) => {
    const videoRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {
        // Ensure player is only initialized once
        if (!playerRef.current) {
            // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode
            const videoElement = document.createElement("video-js");
            videoElement.classList.add('vjs-big-play-centered');
            videoElement.classList.add('vjs-theme-forest');

            if (videoRef.current) {
                videoRef.current.appendChild(videoElement);
            }

            const player = (playerRef.current = videojs(videoElement, options, () => {
                videojs.log('player is ready');
                onReady && onReady(player);
            }));
        } else {
            // Update existing player
            const player = playerRef.current;
            player.autoplay(options.autoplay);
            player.src(options.sources);
        }
    }, [options, videoRef]);

    // Dispose player on unmount
    useEffect(() => {
        const player = playerRef.current;

        return () => {
            if (player && !player.isDisposed()) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, [playerRef]);

    return (
        <div data-vjs-player>
            <div ref={videoRef} />
        </div>
    );
};

// --- Main Player Page ---

const VideoPlayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Autoplay State
    // --- STATE DEFINITIONS ---

    // Autoplay State
    const [autoplay, setAutoplay] = useState(() => {
        return localStorage.getItem('studyApp_autoplay') === 'true';
    });

    // Data State
    const [video, setVideo] = useState(null);
    const [relatedVideos, setRelatedVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);

    // Engagement State
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [allProgress, setAllProgress] = useState({});

    // Progress State
    const [savedProgress, setSavedProgress] = useState(0);

    // UI State
    const [showFullDesc, setShowFullDesc] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);
    const [showCertModal, setShowCertModal] = useState(false);

    // Refs
    const playerRef = useRef(null);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!playerRef.current) return;
            const player = playerRef.current;

            // Ignore if typing in an input (though we don't have many inputs here)
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault(); // Prevent page scroll
                    player.paused() ? player.play() : player.pause();
                    break;
                case 'f':
                    player.isFullscreen() ? player.exitFullscreen() : player.requestFullscreen();
                    break;
                case 'm':
                    player.muted(!player.muted());
                    toast(player.muted() ? 'Muted' : 'Unmuted', { icon: player.muted() ? '🔇' : '🔊', duration: 1000 });
                    break;
                case 'arrowright':
                case 'l':
                    player.currentTime(player.currentTime() + 5);
                    break;
                case 'arrowleft':
                case 'j':
                    player.currentTime(player.currentTime() - 5);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlayerReady]);


    // Autoplay Logic Effect
    useEffect(() => {
        const player = playerRef.current;
        // Strict Mode Safety: Ensure player exists and is not disposed
        if (!player || !isPlayerReady || player.isDisposed()) return;

        const handleEnded = () => {
            if (autoplay) {
                if (relatedVideos.length > 0) {
                    toast.loading(`Up Next: ${relatedVideos[0].title}`, { duration: 4000 });
                    setTimeout(() => {
                        navigate(`/video/${relatedVideos[0].id}`);
                    }, 4000);
                }
            }
        };

        try {
            player.on('ended', handleEnded);
        } catch (e) {
            console.warn("Could not attach ended listener", e);
        }

        return () => {
            if (player && !player.isDisposed()) {
                try {
                    player.off('ended', handleEnded);
                } catch (e) {
                    console.warn("Could not remove ended listener", e);
                }
            }
        };
    }, [autoplay, relatedVideos, isPlayerReady]);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                // 1. Fetch current video progress
                if (id) {
                    const progRes = await api.get(`/progress/${id}`);
                    if (progRes.data && progRes.data.progress) {
                        setSavedProgress(progRes.data.progress);
                    }

                    // 2. Fetch Like Status
                    const likeRes = await api.get(`/videos/${id}/like`);
                    setIsLiked(likeRes.data.liked);
                }

                // 3. Fetch ALL Progress (for Up Next list)
                const allProgRes = await api.get('/progress');
                setAllProgress(allProgRes.data);

            } catch (err) {
                console.error("Failed to load user data", err);
            }
        };
        fetchUserData();
    }, [id]);

    // UI State


    // Fetch Video Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Fetch current video
                const videoRes = await api.get(`/videos/${id}`);
                setVideo(videoRes.data);
                setLikesCount(videoRes.data.likes || 0); // Assuming API returns likes count or we default 0

                // Fetch recommendations (for now, simply all videos excluding current)
                // In a real app, this would be a separate /recommendations endpoint
                const allRes = await api.get('/videos');
                setRelatedVideos(allRes.data.filter(v => v.id !== parseInt(id)));

            } catch (err) {
                console.error("Error loading video:", err);
                setError("Unable to load video. It might have been removed.");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    // Handle Like with Glitter
    const handleToggleLike = async () => {
        // Optimistic Update
        const newState = !isLiked;
        setIsLiked(newState);
        setLikesCount(prev => newState ? prev + 1 : prev - 1);

        if (newState) {
            // Effect handled via CSS
        }

        try {
            await api.post(`/videos/${id}/like`);
        } catch (err) {
            console.error("Like failed", err);
            // Revert
            setIsLiked(!newState);
            setLikesCount(prev => newState ? prev - 1 : prev + 1);
        }
    };

    // Certificate Download Logic


    const handleClaimCertificate = () => {
        setIsClaiming(true);
        // Simulate generation delay
        setTimeout(() => {
            setIsClaiming(false);
            setShowCertModal(true);
        }, 1000);
    };

    const downloadCertificateImage = () => {
        const link = document.createElement('a');
        link.href = 'https://placehold.co/800x600/EEE/31343C?text=Certificate+of+Completion';
        link.download = 'Certificate.png';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Calculate Certification Progress
    const completedCount = useMemo(() => {
        return relatedVideos.filter(vid => {
            const progSecs = allProgress[vid.id] || 0;
            // Parse duration "MM:SS" -> seconds
            // If duration is missing, assume uncompleted or fallback 10 mins?? Let's try to parse.
            let durationSecs = 600; // Default 10 mins
            if (vid.duration && typeof vid.duration === 'string') {
                const parts = vid.duration.split(':').map(Number);
                if (parts.length === 2) durationSecs = parts[0] * 60 + parts[1];
                else if (parts.length === 3) durationSecs = parts[0] * 3600 + parts[1] * 60 + parts[2];
            } else if (typeof vid.duration === 'number') {
                durationSecs = vid.duration; // If API gives number
            }

            // Completion Threshold: 90%
            return (progSecs / durationSecs) > 0.9;
        }).length;
    }, [relatedVideos, allProgress]);

    // Total = related + current
    const totalCourseVideos = relatedVideos.length + (video ? 1 : 0);

    // Check if current video is also complete
    const currentIsComplete = useMemo(() => {
        if (!video || !savedProgress) return 0;
        let durationSecs = 600;
        if (video.duration && typeof video.duration === 'string') {
            const parts = video.duration.split(':').map(Number);
            if (parts.length === 2) durationSecs = parts[0] * 60 + parts[1];
        }
        return (savedProgress / durationSecs) > 0.9 ? 1 : 0;
    }, [video, savedProgress]);

    // Progress = (Completed Related + Current Completed) / Total
    const displayCompletedCount = completedCount + currentIsComplete;
    // const certProgress = totalCourseVideos > 0 ? (displayCompletedCount / totalCourseVideos) * 100 : 0;
    const certProgress = 100; // FOR TESTING ONLY


    // VideoJS Options
    const videoJsOptions = useMemo(() => {
        if (!video) return null;

        return {
            autoplay: false, // Don't auto-blast audio
            controls: true,
            responsive: true,
            fluid: true,
            playbackRates: [0.5, 1, 1.25, 1.5, 2],
            sources: [{
                src: video.url,
                type: video.type === 'hls' ? 'application/x-mpegURL' : 'video/mp4'
            }],
            poster: video.thumbnail // Use high-res thumbnail as poster
        };
    }, [video]);

    const handlePlayerReady = (player) => {
        playerRef.current = player;
        setIsPlayerReady(true);

        player.on('waiting', () => {
            videojs.log('player is waiting');
        });

        player.on('dispose', () => {
            videojs.log('player will dispose');
            setIsPlayerReady(false);
        });

        // Save progress logic (Throttled)
        let lastSaveTime = 0;
        player.on('timeupdate', () => {
            const currentTime = player.currentTime();
            const NOW = Date.now();
            // Save every 5 seconds
            if (NOW - lastSaveTime > 5000 && currentTime > 0) {
                lastSaveTime = NOW;
                api.post('/progress', {
                    videoId: id,
                    progress: Math.floor(currentTime)
                }).catch(err => console.error("Save progress failed", err));
            }
        });
    };

    // Effect to Resume Video when Progress Loads
    useEffect(() => {
        const player = playerRef.current;
        if (!player || player.isDisposed()) return;

        if (savedProgress > 0 && video) {
            const handleSeek = () => {
                if (player.isDisposed()) return;
                console.log("Seeking to stored progress:", savedProgress);
                player.currentTime(savedProgress);
            };

            // Safety check for readyState to avoid "Html5 unavailable" error
            // We verify tech is ready by checking if we can get readyState without error, or just rely on events
            try {
                if (player.readyState() >= 1) {
                    handleSeek();
                } else {
                    player.one('loadedmetadata', handleSeek);
                }
            } catch (e) {
                // If readyState throws (e.g. tech not ready), wait for loadedmetadata
                player.one('loadedmetadata', handleSeek);
            }
        }
    }, [savedProgress, video, isPlayerReady]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
                <LoadingSpinner size={48} className="text-white" />
                <p className="mt-4 animate-pulse text-zinc-400">Loading Class...</p>
            </div>
        );
    }

    if (error || !video) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center text-white">
                <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                    <AlertCircle size={32} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Video Unavailable</h2>
                <p className="text-zinc-400 max-w-md mb-8">{error || "We couldn't find the video you're looking for."}</p>
                <button
                    onClick={() => navigate('/videos')}
                    className="px-6 py-3 bg-white text-zinc-900 rounded-full font-bold hover:bg-zinc-200 transition-colors"
                >
                    Back to Library
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 font-sans selection:bg-indigo-500/30">
            <style>{customPlayerStyles}</style>

            {/* Certificate Modal */}
            {showCertModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-zinc-50/50">
                            <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                                <GraduationCap className="text-indigo-600" />
                                Course Completed!
                            </h3>
                            <button
                                onClick={() => setShowCertModal(false)}
                                className="p-2 hover:bg-zinc-200 rounded-full transition-colors text-zinc-500"
                            >
                                X
                            </button>
                        </div>

                        {/* Certificate Preview */}
                        <div className="p-8 flex flex-col items-center bg-zinc-100/50">
                            <div className="relative shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] border-8 border-white rounded-lg overflow-hidden group">
                                <img
                                    src="https://placehold.co/800x600/EEE/31343C?text=Certificate+of+Completion"
                                    alt="Certificate"
                                    className="w-full h-auto max-h-[50vh] object-contain"
                                />
                            </div>
                            <p className="mt-6 text-zinc-500 text-sm text-center max-w-md">
                                This certificate verifies that you have successfully completed the <b>{video?.title || 'Course'}</b>.
                            </p>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-zinc-100 bg-white flex justify-end gap-3">
                            <button
                                onClick={() => setShowCertModal(false)}
                                className="px-4 py-2 text-zinc-600 font-medium hover:bg-zinc-100 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={downloadCertificateImage}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2"
                            >
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* === CINEMATIC HEADER (Dark Mode Player) === */}
            <div className="bg-zinc-950 pt-20 pb-8 md:pb-12 border-b border-zinc-800">
                <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                        {/* Main Player Column */}
                        <div className="lg:col-span-9 animate-in fade-in zoom-in-95 duration-500">
                            <div className="relative rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-zinc-800 bg-zinc-900 ring-1 ring-white/10">
                                {videoJsOptions && (
                                    <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
                                )}
                            </div>

                            {/* Mobile Info (Visible on < lg) */}
                            <div className="lg:hidden mt-6 space-y-4">
                                {/* Autoplay Toggle (Mobile) */}
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                                    <span className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                        <PlayCircle size={16} /> Autoplay Next
                                    </span>
                                    <button
                                        onClick={() => {
                                            const newState = !autoplay;
                                            setAutoplay(newState);
                                            localStorage.setItem('studyApp_autoplay', newState);
                                            toast.success(newState ? 'Autoplay On' : 'Autoplay Off', {
                                                icon: newState ? '▶️' : '⏸️',
                                                style: { background: '#333', color: '#fff' }
                                            });
                                        }}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoplay ? 'bg-indigo-600' : 'bg-zinc-700'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoplay ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-zinc-400 px-1">
                                    <Clock size={16} />
                                    <span>{video.duration} MIN</span>
                                </div>
                            </div>
                        </div>

                        {/* Side Info / Context (Desktop) - Course Progress Style */}
                        <div className="hidden lg:flex lg:col-span-3 flex-col justify-center h-full text-zinc-400 space-y-4 pl-4 border-l border-zinc-900">

                            {/* Autoplay Toggle */}
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                                <span className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                    <PlayCircle size={16} /> Autoplay Next
                                </span>
                                <button
                                    onClick={() => {
                                        const newState = !autoplay;
                                        setAutoplay(newState);
                                        localStorage.setItem('studyApp_autoplay', newState);
                                        toast.success(newState ? 'Autoplay On' : 'Autoplay Off', {
                                            icon: newState ? '▶️' : '⏸️',
                                            style: { background: '#333', color: '#fff' }
                                        });
                                    }}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoplay ? 'bg-indigo-600' : 'bg-zinc-700'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoplay ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Clock size={16} />
                                <span>{video.duration} MIN</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <AlertCircle size={16} /> {/* Replaced MonitorPlay */}
                                <span>{video.views ? video.views.toLocaleString() : 0} Learners</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* === CONTENT SECTION (Light Mode) === */}
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Column: Metadata & Comments */}
                    <div className="lg:col-span-8">

                        {/* Title & Accordion Description */}
                        <div
                            className="mb-6 cursor-pointer group"
                            onClick={() => setShowFullDesc(!showFullDesc)}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors select-none">
                                    {video.title}
                                </h1>
                                <button className={`p-2 rounded-full bg-zinc-100 text-zinc-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all ${showFullDesc ? 'rotate-180' : ''}`}>
                                    <ChevronDown size={24} />
                                </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-500 mb-4">
                                <span className="text-zinc-900">{video.views ? video.views.toLocaleString() : 0} views</span>
                                <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                                <span>{video.upload_date ? new Date(video.upload_date).toLocaleDateString() : 'Recently'}</span>
                                <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                                <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">Pro</span>
                            </div>
                        </div>

                        {/* Description Card - Accordion Content */}
                        <div className={`grid transition-all duration-300 ease-in-out overflow-hidden ${showFullDesc ? 'grid-rows-[1fr] opacity-100 mb-10' : 'grid-rows-[0fr] opacity-0 mb-0'}`}>
                            <div className="min-h-0">
                                <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm text-zinc-600 leading-relaxed text-lg">
                                    <p>{video.description}</p>
                                    <p className="mt-4 text-sm text-zinc-400 italic">
                                        Content provided by {video.author || "Study App Official"}.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="flex flex-wrap items-center gap-3 py-4 border-y border-zinc-200 mb-10">
                            <button
                                onClick={handleToggleLike}
                                className={`
                                    relative flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all duration-300 isolate
                                    ${isLiked
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
                                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:scale-105'}
                                `}
                            >
                                <ThumbsUp
                                    size={20}
                                    className={`transition-transform duration-300 ${isLiked ? 'fill-white animate-[elastic-bounce_0.5s_ease-out]' : '-rotate-12'}`}
                                    strokeWidth={isLiked ? 0 : 2.5}
                                />
                                <span className={isLiked ? '' : ''}>{isLiked ? 'Liked' : 'Like'}</span>
                                <span className={`ml-2 pl-2 text-sm border-l ${isLiked ? 'border-indigo-400' : 'border-zinc-300'}`}>
                                    {likesCount}
                                </span>

                                {/* Shockwave Effect on Click */}
                                {isLiked && (
                                    <>
                                        <span className="absolute inset-0 rounded-full bg-indigo-500/20 animate-[shockwave_0.6s_ease-out] pointer-events-none -z-10"></span>
                                        <MemphisPop />
                                    </>
                                )}
                            </button>
                            <button className="flex items-center gap-2 px-6 py-2.5 bg-zinc-100 text-zinc-700 rounded-full font-medium hover:bg-zinc-200 transition-colors">
                                <Share2 size={18} /> Share
                            </button>
                            <button className="p-2.5 rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors ml-auto">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>



                    </div>

                    {/* Right Column: Up Next / Course Playlist */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-zinc-900">Up Next</h3>
                            <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-2 py-1 rounded-full">{completedCount}/{totalCourseVideos} Completed</span>
                        </div>

                        <div className="bg-zinc-50 rounded-xl border border-zinc-200 overflow-hidden">
                            {relatedVideos.map((item, index) => {
                                const progSecs = allProgress[item.id] || 0;
                                // Estimate duration: assuming 10 mins (600s) if we don't know it, or parse item.duration "10:32" -> seconds
                                // Simple mock parsing or assumed scale (10 mins)
                                const progPercent = Math.min((progSecs / 600) * 100, 100);

                                return (
                                    <Link
                                        key={item.id}
                                        to={`/video/${item.id}`}
                                        className="group relative flex gap-3 p-3 hover:bg-white hover:shadow-sm border-b border-zinc-100 last:border-0 transition-all"
                                    >
                                        <div className="relative w-28 aspect-video rounded-lg overflow-hidden shrink-0 bg-zinc-200">
                                            <img src={item.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-bold px-1 rounded">
                                                {item.duration || "10:00"}
                                            </div>
                                            {/* Progress Bar Overlay - Thicker */}
                                            {progSecs > 0 && (
                                                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                                                    <div className="h-full bg-indigo-500" style={{ width: `${progPercent}%` }}></div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col justify-center min-w-0">
                                            <h4 className="font-bold text-zinc-800 text-sm leading-tight mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                                {index + 1}. {item.title}
                                            </h4>
                                            <p className="text-xs text-zinc-500 truncate">{item.author || "Study App Official"}</p>
                                        </div>
                                        {/* Status Icon */}
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <PlayCircle size={16} className="text-indigo-600 fill-indigo-100" />
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>

                        <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                    <GraduationCap size={18} />
                                </div>
                                <h4 className="font-bold text-indigo-900 text-sm">Get Certified</h4>
                            </div>
                            <p className="text-xs text-indigo-700 leading-relaxed mb-3">
                                Complete {Math.round(certProgress)}% of the course to earn your official completion certificate.
                            </p>
                            {/* Certification Progress Bar */}
                            <div className="w-full h-2 bg-indigo-200/50 rounded-full overflow-hidden mb-3">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                                    style={{ width: `${certProgress}%` }}
                                ></div>
                            </div>

                            {/* Conditional Certificate Button */}
                            {certProgress >= 100 ? (
                                <button
                                    onClick={handleClaimCertificate}
                                    className={`
                                        w-full py-2 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95
                                        ${isClaiming
                                            ? 'bg-indigo-500 animate-pulse'
                                            : 'bg-green-600 hover:bg-green-700 animate-[pulse_2s_infinite]'
                                        }
                                    `}
                                    disabled={isClaiming}
                                >
                                    <GraduationCap size={14} />
                                    {isClaiming ? 'Generating...' : 'Claim Certificate'}
                                </button>
                            ) : (
                                <div className="text-center text-[10px] text-zinc-400 font-medium pt-1">
                                    Keep watching to unlock
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// Helper for Eye Icon
const Eye = ({ size = 24, className = "" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

export default VideoPlayer;
