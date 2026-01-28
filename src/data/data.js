const DATA = {
  header: {
    logo: "Study-App",
    navLinks: [
      { name: "Home", url: "/" },
      { name: "Videos", url: "/videos" },
      { name: "Tools", url: "/bitrate" },
      { name: "Login", url: "/login" },
      { name: "Signup", url: "/signup" }
    ]
  },
  featuredVideos: [
    {
      id: 1,
      title: "Introduction to React",
      description: "Master the fundamentals of component-based architecture.",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      type: "mp4",
      duration: "10:32"
    },
    {
      id: 2,
      title: "Modern ES6+ Features",
      description: "Elevate your code with advanced JavaScript syntax patterns.",
      thumbnail: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      type: "mp4",
      duration: "08:45"
    },
    {
      id: 3,
      title: "HLS Streaming Protocol",
      description: "Deep dive into adaptive bitrate streaming technologies.",
      thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      type: "hls",
      duration: "12:15"
    }
  ],
  latestVideos: [
    {
      id: 4,
      title: "Node.js Architecture",
      description: "Building scalable backend services with Express.",
      thumbnail: "https://images.unsplash.com/photo-1627398242450-270171b0e7b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      type: "mp4",
      duration: "15:20"
    },
    {
      id: 5,
      title: "JWT Security Patterns",
      description: "Implementing stateless authentication systems.",
      thumbnail: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      type: "mp4",
      duration: "09:50"
    }
  ],
  footer: {
    copyright: "© 2026 study-app. Crafted with precision.",
    links: [
      { name: "About", url: "/about" },
      { name: "Contact", url: "/contact" },
      { name: "Privacy", url: "/privacy" }
    ]
  }
};

export default DATA;
