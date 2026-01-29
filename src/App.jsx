// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import Preloader from './components/Preloader';

// Pages
import Home from './pages/Home';
import VideoList from './pages/VideoList';
import VideoPlayer from './pages/VideoPlayer';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BitrateTool from './pages/BitrateTool';

import { Toaster } from 'react-hot-toast';

// Main App Component
const App = () => {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate initial asset loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-white">
        <Toaster position="top-center" />
        {loading && <Preloader />}
        {/* Header needs hooks from Router, so it must be inside Router */}
        <Header />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/videos" element={<VideoList />} />
              <Route path="/video/:id" element={<VideoPlayer />} />
              <Route path="/utils/bitrate" element={<BitrateTool />} />
              {/* Add support for /bitrate shortcut as user requested/tried directly */}
              <Route path="/bitrate" element={<BitrateTool />} />
            </Route>
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;
