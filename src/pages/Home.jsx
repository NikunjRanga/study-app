import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, MonitorPlay, Sparkles } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import DATA from '../data/data';

const Home = ({ onPlay }) => (
  <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1400px] mx-auto">

    {/* Hero Section */}
    <div className="text-center mb-32 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] md:w-[800px] h-[300px] md:h-[500px] bg-indigo-50/50 blur-[60px] md:blur-[120px] -z-10 rounded-full mix-blend-multiply opacity-70 animate-pulse" />

      <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-zinc-900 tracking-tight mb-8 leading-[1.05] animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-both delay-100">
        Master the art of <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600">digital creation.</span>
      </h1>

      <p className="text-xl text-zinc-500 max-w-2xl mx-auto mb-10 font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
        Premium video courses on React, scalable architecture, and engineering leadership. Crafted for developers who care about details.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
        <Link to="/videos" className="w-full sm:w-auto bg-zinc-900 text-white px-8 py-4 rounded-full font-bold hover:bg-zinc-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 group">
          <MonitorPlay size={20} />
          Start Watching
        </Link>
      </div>
    </div>

    {/* Featured Section */}
    <section className="mb-32">
      <div className="flex justify-between items-end mb-12 border-b border-zinc-100 pb-6">
        <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Editor's Choice</h2>
        <a href="#" className="group flex items-center gap-1 text-sm font-bold text-zinc-900 hover:text-indigo-600 transition-colors">
          View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
        {DATA.featuredVideos.map((video, idx) => (
          <VideoCard key={video.id} video={video} onPlay={onPlay} featured={idx === 0} />
        ))}
      </div>
    </section>

    {/* Latest Section */}
    <section>
      <div className="flex justify-between items-end mb-12 border-b border-zinc-100 pb-6">
        <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Fresh Drops</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
        {DATA.latestVideos.map(video => (
          <VideoCard key={video.id} video={video} onPlay={onPlay} />
        ))}

        {/* Premium CTA Card */}
        <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-10 flex flex-col justify-between text-white shadow-2xl shadow-indigo-200">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-1000" />

          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6">
              <Shield className="text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Study-App Pro</h3>
            <p className="text-indigo-100 font-light leading-relaxed">
              Get unlimited access to 4K content, source code downloads, and certificate tracks.
            </p>
          </div>

          <button className="relative z-10 mt-8 bg-white text-indigo-600 font-bold py-3 px-6 rounded-xl hover:bg-indigo-50 transition-colors self-start shadow-lg">
            Upgrade Now
          </button>
        </div>
      </div>
    </section>
  </main>
);

export default Home;
