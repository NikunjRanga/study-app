import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Play, Pause, Volume2, VolumeX, ArrowRight, Heart, Share2, Clock, Eye, MoreVertical } from 'lucide-react';

// --- Helper Components (Internal) ---
const Badge = ({ children, className = "" }) => (
  <span className={`px-2 py-0.5 border border-zinc-200 text-[10px] font-bold uppercase tracking-wider text-zinc-500 ${className}`}>
    {children}
  </span>
);

const IconButton = ({ icon: Icon, onClick, className = "", tooltip, active }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick && onClick(e); }}
    title={tooltip}
    className={`p-2 transition-all duration-200 hover:scale-110 ${className} ${active ? 'text-red-500' : 'text-zinc-400 hover:text-zinc-900'}`}
  >
    <Icon size={18} className={active ? "fill-current" : ""} />
  </button>
);

const VideoThumbnail = ({ video, isHovered }) => {
  const videoRef = useRef(null);
  const progressBarRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  // Storage Key
  const storageKey = `studyApp_video_${video.id}_data`;

  // Helper for formatting time
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Initialize state from local storage securely
  const getInitialState = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.duration && data.currentTime) {
          return {
            progress: (data.currentTime / data.duration) * 100,
            remainingTime: formatTime(data.duration - data.currentTime),
            currentTime: data.currentTime
          };
        }
      }
    } catch (e) {
      console.error("Failed to parse video data", e);
    }
    return { progress: 0, remainingTime: formatTime(video.duration), currentTime: 0 };
  };

  const [state, setState] = useState(getInitialState);
  const [realDuration, setRealDuration] = useState(null);

  // Helper to update storage
  const saveProgress = (currentTime, duration) => {
    if (!duration) return;
    localStorage.setItem(storageKey, JSON.stringify({ currentTime, duration }));
  };

  useEffect(() => {
    if (isHovered && videoRef.current) {
      if (!isPlaying) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
      }
    } else if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isHovered, isPlaying]); // Added isPlaying to dependency array to prevent unnecessary re-renders

  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const togglePlay = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    if (videoRef.current && progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const percentage = Math.min(Math.max(x / width, 0), 1);

      const duration = videoRef.current.duration || (state.currentTime / (state.progress / 100)); // fallback
      if (duration) {
        const time = duration * percentage;
        videoRef.current.currentTime = time;

        // Updates immediate state
        const left = duration - time;
        setState(prev => ({
          ...prev,
          progress: percentage * 100,
          remainingTime: formatTime(left),
          currentTime: time
        }));

        saveProgress(time, duration);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      if (total) {
        const p = (current / total) * 100;
        const left = total - current;

        // Only update state if significantly changed to avoid thrashing, or just update
        setState({
          progress: p,
          remainingTime: formatTime(left),
          currentTime: current
        });
        saveProgress(current, total);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      setRealDuration(formatTime(duration));

      // Restore saved progress if we have it and haven't played yet
      if (state.currentTime > 0 && Math.abs(videoRef.current.currentTime - state.currentTime) > 0.5) {
        videoRef.current.currentTime = state.currentTime;
      }
    }
  };

  // Buffer listeners
  const handleWaiting = () => setIsBuffering(true);
  const handlePlaying = () => {
    setIsBuffering(false);
    setIsPlaying(true);
  };
  const handlePause = () => setIsPlaying(false);


  return (
    <div className="relative w-full h-full bg-zinc-100 overflow-hidden">
      {/* Static Image */}
      <img
        src={video.thumbnail}
        alt={video.title}
        loading="lazy"
        className={`w-full h-full object-cover transition-opacity duration-500 grayscale-[20%] group-hover:grayscale-0 ${isHovered && isPlaying ? 'opacity-0' : 'opacity-100'}`}
      />

      {/* Video Preview */}
      {video.type === 'mp4' && (
        <video
          ref={videoRef}
          src={video.url}
          muted={isMuted}
          loop
          playsInline
          preload="metadata"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onWaiting={handleWaiting}
          onPlaying={handlePlaying}
          onPause={handlePause}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      {/* Classic Overlay (Darken) */}
      {!isHovered && <div className="absolute inset-0 bg-zinc-900/5 transition-colors duration-300" />}

      {/* CONTROLS OVERLAY - Hover Only */}
      <div className={`absolute inset-0 flex flex-col justify-between p-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>

        {/* Top Controls: Mute (Left) */}
        <div className="flex justify-start">
          <button
            onClick={toggleMute}
            className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors border border-white/10"
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>

        {/* Center Controls: Play/Pause/Buffer */}
        <div className="flex items-center justify-center flex-grow pointer-events-none">
          {isBuffering ? (
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <button
              onClick={togglePlay}
              className={`p-4 bg-indigo-600 rounded-full text-white pointer-events-auto hover:bg-indigo-700 hover:scale-105 transition-all shadow-xl shadow-indigo-900/20 active:scale-95 ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}
            >
              {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-1" />}
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar & Countdown - Always visible if hovered OR has progress */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-300 ${isHovered || state.progress > 0 ? 'opacity-100' : 'opacity-0'}`}>
        {/* Countdown (Hover Only or Playing) */}
        <div className={`absolute bottom-4 right-3 pointer-events-none transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="text-[10px] font-mono font-bold tracking-widest px-2 py-1 rounded bg-indigo-600 text-white shadow-lg">
            {state.remainingTime}
          </div>
        </div>

        {/* Thick Interactive Progress Bar */}
        <div
          ref={progressBarRef}
          className={`h-1.5 w-full bg-white/20 cursor-pointer group/progress relative ${isHovered ? 'h-2' : ''} transition-all`}
          onClick={handleSeek}
        >
          <div
            className="h-full bg-indigo-500 transition-all duration-75 ease-linear group-hover/progress:bg-indigo-400"
            style={{ width: `${state.progress}%` }}
          />
        </div>
      </div>

      {/* Static Duration Badge (Hidden on Hover) */}
      <div className={`absolute bottom-3 right-3 z-10 transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
        <div className="bg-zinc-900 text-white text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 font-medium">
          {realDuration || video.duration}
        </div>
      </div>

      {/* Static Play Button (Hidden on Hover) - Themed */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 pointer-events-none ${isHovered ? 'opacity-0 scale-110' : 'opacity-100'}`}>
        <div className="w-16 h-16 bg-white/90 flex items-center justify-center border border-indigo-100 shadow-xl rounded-full group-hover:scale-105 transition-transform duration-500">
          <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center shadow-inner">
            <Play size={20} className="fill-white text-white ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
const VideoCard = ({
  video,
  onPlay,
  featured,
  viewMode = 'grid',
  isFavorite,
  onToggleFavorite,
  onShare
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Mock Data / Fallbacks
  const views = video.views || "2.4k";
  // DB returns 'upload_date', frontend might expect camelCase. Handle both.
  const rawDate = video.upload_date || video.uploadDate;
  const uploadDate = rawDate ? new Date(rawDate).toLocaleDateString() : "Recently";
  const author = video.author || "Study-App Official";

  // Smart "New" Badge Logic
  const isNew = useMemo(() => {
    if (!rawDate) return false;
    const date = new Date(rawDate);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }, [rawDate]);

  // Layout Classes
  const gridLayout = "flex-col";
  const listLayout = "flex-row gap-6 items-start bg-white p-4 border border-zinc-100/50 hover:border-zinc-200";
  const isList = viewMode === 'list' && !featured;

  return (
    <div
      className={`group relative flex cursor-pointer transition-all duration-300 ${isList ? listLayout : gridLayout} ${featured ? 'md:col-span-2 md:flex-row md:items-start' : ''}`}
      onClick={() => onPlay(video)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail Section */}
      <div className={`relative shrink-0 border border-zinc-200 transition-colors group-hover:border-zinc-400 ${featured ? 'w-full md:w-3/5 aspect-video' :
        isList ? 'w-64 aspect-video' : 'w-full aspect-video'
        }`}>
        <VideoThumbnail video={video} isHovered={isHovered} />

        {/* Smart "New" Badge */}
        {isNew && (
          <div className="absolute top-2 left-2 z-20">
            <span className="flex h-2 w-2 absolute -top-1 -right-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm border border-indigo-400/50">
              NEW
            </span>
          </div>
        )}

        {/* Quick Actions (Grid Only) */}
        {!isList && (
          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 z-20">
            <IconButton
              icon={Heart}
              active={isFavorite}
              onClick={() => onToggleFavorite && onToggleFavorite(video.id)}
              className="bg-white/90 border border-zinc-200 shadow-sm"
              tooltip="Save"
            />
            <IconButton
              icon={Share2}
              onClick={() => onShare && onShare(video)}
              className="bg-white/90 border border-zinc-200 shadow-sm"
              tooltip="Share"
            />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className={`flex flex-col ${featured ? 'md:w-2/5 p-6 pt-4' : isList ? 'flex-grow py-1' : 'pt-4 px-0.5'}`}>

        {/* Top Meta: Category & Actions */}
        <div className="flex justify-between items-start mb-2">
          <Badge>{video.type}</Badge>
          {isList && (
            <div className="flex gap-1">
              <IconButton icon={Heart} active={isFavorite} onClick={() => onToggleFavorite && onToggleFavorite(video.id)} />
              <IconButton icon={Share2} onClick={() => onShare && onShare(video)} />
              <IconButton icon={MoreVertical} />
            </div>
          )}
          {!isList && !featured && (
            <button className="text-zinc-300 hover:text-zinc-600">
              <MoreVertical size={16} />
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className={`font-serif font-bold text-zinc-900 leading-tight group-hover:underline decoration-1 underline-offset-4 decoration-zinc-400 mb-2 ${featured ? 'text-3xl md:text-4xl' : isList ? 'text-xl' : 'text-lg line-clamp-2'}`}>
          {video.title}
        </h3>

        {/* Description */}
        <p className="text-zinc-600 font-light text-sm leading-relaxed line-clamp-2 mb-3">
          {video.description}
        </p>

        {/* List View : Extended Meta */}
        {isList && (
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-zinc-200 rounded-full" /> {/* Mock Avatar */}
              <span>{author}</span>
            </div>
            <span>•</span>
            <span>Updated {uploadDate}</span>
          </div>
        )}

        {/* Footer Stats */}
        <div className={`mt-auto flex items-center text-xs font-medium text-zinc-400 ${featured ? 'mt-6' : ''}`}>
          <div className="flex items-center gap-1.5 mr-4">
            <Eye size={14} />
            <span>{views} views</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>{uploadDate}</span>
          </div>

          {featured && (
            <div className="ml-auto flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-900 border-b-2 border-zinc-900 pb-0.5">
              Watch Now <ArrowRight size={14} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
