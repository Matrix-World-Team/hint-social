import React, { useEffect, useRef } from "react";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export const Home: React.FC = () => {
  // Create intersection observer to handle animations on scroll
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in-up");
          entry.target.style.opacity = "1";
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(
      handleIntersection,
      observerOptions
    );

    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="font-sans text-gray-800 bg-gray-50">
      <style jsx="true">{`
        .bg-glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .bg-glass-dark {
          background: rgba(17, 24, 39, 0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .animate-on-scroll {
          opacity: 0;
        }
        
        .gradient-text {
          background: linear-gradient(90deg, #6366f1, #ec4899);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        .hero-gradient {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.8), rgba(236, 72, 153, 0.8));
        }
        
        .btn-gradient {
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          transition: all 0.3s ease;
        }
        
        .btn-gradient:hover {
          background: linear-gradient(90deg, #4f46e5, #7c3aed);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -10px rgba(79, 70, 229, 0.5);
        }
        
        .feature-card {
          transition: all 0.3s ease;
        }
        
        .feature-card:hover {
          transform: translateY(-10px);
        }

        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        @keyframes slideInRight {
          0% { opacity: 0; transform: translateX(30px); }
          100% { opacity: 1; transform: translateX(0); }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out forwards;
        }

        .shadow-glass {
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
        }
      `}</style>

      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Hero background shapes */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-96 -right-40 w-[800px] h-[800px] rounded-full bg-primary-200 opacity-30 blur-3xl"></div>
          <div className="absolute top-40 -left-40 w-[600px] h-[600px] rounded-full bg-pink-500 opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-96 right-20 w-[700px] h-[700px] rounded-full bg-purple-500 opacity-20 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-24">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="lg:col-span-6 mb-12 lg:mb-0">
              <h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold font-['Poppins'] tracking-tight animate-fade-in-up opacity-0" 
                style={{ animationDelay: "0.1s" }}
              >
                The Social Platform That Connects{" "}
                <span className="gradient-text">Stories, People, and Moments</span>
              </h1>
              <p 
                className="mt-6 text-xl text-gray-600 animate-fade-in-up opacity-0" 
                style={{ animationDelay: "0.3s" }}
              >
                HINT brings together your world in one place. Share your stories,
                connect with people who matter, and capture life's most meaningful
                moments.
              </p>
              <div 
                className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-in-up opacity-0" 
                style={{ animationDelay: "0.5s" }}
              >
                <Link
                  href="/signup"
                  className="btn-gradient text-white font-bold rounded-lg px-8 py-4 text-center shadow-lg"
                >
                  Create Your Account
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-primary-600 bg-white hover:bg-gray-50 shadow-md transition-all"
                >
                  Learn How It Works
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 ml-2" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </a>
              </div>
            </div>
            <div 
              className="lg:col-span-6 animate-slide-in-right opacity-0" 
              style={{ animationDelay: "0.6s" }}
            >
              {/* A modern social connection interface mockup */}
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                {/* An interface showing a social media feed with connections */}
                <img
                  src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800"
                  alt="HINT social media interface with connected stories and people"
                  className="w-full h-auto rounded-xl"
                />

                {/* Overlay with UI elements */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent pointer-events-none"></div>

                {/* Floating UI elements for visual interest */}
                <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-glass p-4 shadow-glass">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-2 mt-2 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <button className="px-3 py-1 rounded-full btn-gradient text-xs text-white">
                      Connect
                    </button>
                  </div>
                </div>

                {/* Floating notification */}
                <div className="absolute top-4 right-4 bg-glass rounded-lg p-3 shadow-glass">
                  <div className="flex items-center space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-primary-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    <span className="text-sm font-medium">New connections</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-glass rounded-xl p-6 shadow-glass text-center animate-on-scroll">
              <p className="text-3xl font-bold text-primary-600">10M+</p>
              <p className="text-sm text-gray-600 font-medium mt-1">Active Users</p>
            </div>
            <div className="bg-glass rounded-xl p-6 shadow-glass text-center animate-on-scroll">
              <p className="text-3xl font-bold text-primary-600">50M+</p>
              <p className="text-sm text-gray-600 font-medium mt-1">Stories Shared</p>
            </div>
            <div className="bg-glass rounded-xl p-6 shadow-glass text-center animate-on-scroll">
              <p className="text-3xl font-bold text-primary-600">190+</p>
              <p className="text-sm text-gray-600 font-medium mt-1">Countries</p>
            </div>
            <div className="bg-glass rounded-xl p-6 shadow-glass text-center animate-on-scroll">
              <p className="text-3xl font-bold text-primary-600">4.9</p>
              <p className="text-sm text-gray-600 font-medium mt-1">User Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold font-['Poppins'] mb-4">
              About <span className="gradient-text">HINT</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Reimagining how we connect in the digital age
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="animate-on-scroll">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                {/* An abstract image showing connections between people */}
                <img
                  src="https://images.unsplash.com/photo-1534361960057-19889db9621e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=800"
                  alt="Abstract visualization of social connections"
                  className="w-full h-auto"
                />

                {/* Overlay with gradient */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/30 to-pink-500/30 mix-blend-overlay"></div>
              </div>
            </div>

            <div className="space-y-6 animate-on-scroll">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Our Purpose</h3>
                <p className="text-gray-600">
                  HINT was created to bring meaning back to social interactions. We
                  believe technology should enhance human connection, not replace it.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Unique Features
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 text-primary-500 mt-1 mr-2" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                    <span>
                      Story-centric design that prioritizes meaningful narratives
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 text-primary-500 mt-1 mr-2" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                    <span>
                      Privacy-first approach with complete control of your data
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 text-primary-500 mt-1 mr-2" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                    <span>
                      AI-powered connections that understand context, not just keywords
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 text-primary-500 mt-1 mr-2" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                    <span>
                      Immersive multimedia sharing with collaborative possibilities
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Our Values</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <div className="text-primary-500 text-lg font-semibold mb-1">
                      Authenticity
                    </div>
                    <p className="text-sm text-gray-600">
                      Real connections over vanity metrics
                    </p>
                  </div>
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <div className="text-primary-500 text-lg font-semibold mb-1">
                      Privacy
                    </div>
                    <p className="text-sm text-gray-600">
                      Your data belongs to you, always
                    </p>
                  </div>
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <div className="text-primary-500 text-lg font-semibold mb-1">
                      Inclusivity
                    </div>
                    <p className="text-sm text-gray-600">
                      A platform for every voice
                    </p>
                  </div>
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <div className="text-primary-500 text-lg font-semibold mb-1">
                      Innovation
                    </div>
                    <p className="text-sm text-gray-600">
                      Constantly evolving for you
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 -z-10">
          <div 
            className="absolute top-0 left-0 w-full h-full" 
            style={{ 
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1))"
            }}
          ></div>
        </div>
        {/* Pattern overlay */}
        <div className="absolute inset-0 -z-10 opacity-30">
          <div 
            className="absolute top-0 left-0 w-full h-full" 
            style={{ 
              backgroundSize: "30px 30px", 
              backgroundImage: "radial-gradient(#6366f1 0.5px, transparent 0.5px)" 
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold font-['Poppins'] mb-4">
              How <span className="gradient-text">HINT</span> Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Four simple steps to start connecting with the world
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative bg-glass rounded-xl p-8 shadow-glass feature-card animate-on-scroll" style={{ background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))" }}>
              <div className="absolute -top-5 -left-5 w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg" style={{ background: "linear-gradient(90deg, #6366f1, #ec4899)" }}>
                1
              </div>
              <div className="text-center mt-6">
                <div className="h-20 flex items-center justify-center mb-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-16 w-16 text-primary-500" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" 
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Sign Up</h3>
                <p className="text-gray-600">
                  Create your account with a few simple details to get started on
                  your HINT journey.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div 
              className="relative bg-glass rounded-xl p-8 shadow-glass feature-card animate-on-scroll" 
              style={{ 
                animationDelay: "0.1s",
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))" 
              }}
            >
              <div className="absolute -top-5 -left-5 w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg" style={{ background: "linear-gradient(90deg, #6366f1, #ec4899)" }}>
                2
              </div>
              <div className="text-center mt-6">
                <div className="h-20 flex items-center justify-center mb-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-16 w-16 text-primary-500" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" 
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Create Profile</h3>
                <p className="text-gray-600">
                  Personalize your profile to showcase your interests, experiences,
                  and story.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div 
              className="relative bg-glass rounded-xl p-8 shadow-glass feature-card animate-on-scroll" 
              style={{ 
                animationDelay: "0.2s",
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))" 
              }}
            >
              <div className="absolute -top-5 -left-5 w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg" style={{ background: "linear-gradient(90deg, #6366f1, #ec4899)" }}>
                3
              </div>
              <div className="text-center mt-6">
                <div className="h-20 flex items-center justify-center mb-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-16 w-16 text-primary-500" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Connect</h3>
                <p className="text-gray-600">
                  Find friends, family, and like-minded individuals through our
                  smart connection algorithm.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div 
              className="relative bg-glass rounded-xl p-8 shadow-glass feature-card animate-on-scroll" 
              style={{ 
                animationDelay: "0.3s",
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))" 
              }}
            >
              <div className="absolute -top-5 -left-5 w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg" style={{ background: "linear-gradient(90deg, #6366f1, #ec4899)" }}>
                4
              </div>
              <div className="text-center mt-6">
                <div className="h-20 flex items-center justify-center mb-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-16 w-16 text-primary-500" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" 
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Share</h3>
                <p className="text-gray-600">
                  Share your stories, moments, and experiences with your connections
                  and discover others.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center animate-on-scroll">
            <Link
              href="/signup"
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-bold rounded-lg text-white shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transform transition-all hover:scale-105 hover:shadow-2xl"
              style={{ 
                background: "linear-gradient(90deg, #6366f1, #ec4899)",
                boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.4), 0 5px 10px -5px rgba(236, 72, 153, 0.3)"
              }}
            >
              Get Started Today
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 ml-2" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold font-['Poppins'] mb-4">
              Features That <span className="gradient-text">Stand Out</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover what makes HINT different from other social platforms
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-glass rounded-xl overflow-hidden shadow-glass animate-on-scroll">
              <div className="relative h-48 overflow-hidden">
                {/* A modern user interface element */}
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
                  alt="Smart timeline interface on HINT"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <h3 className="text-xl font-bold text-white">Smart Timeline</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600">
                  Our AI-powered timeline shows you content that matters, not just
                  what's recent. Experience a feed that understands your interests.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div 
              className="bg-glass rounded-xl overflow-hidden shadow-glass animate-on-scroll" 
              style={{ animationDelay: "0.1s" }}
            >
              <div className="relative h-48 overflow-hidden">
                {/* Abstract connection graphics */}
                <img
                  src="https://images.unsplash.com/photo-1558655146-d09347e92766?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
                  alt="Connection mapping on HINT platform"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <h3 className="text-xl font-bold text-white">Story Frames</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600">
                  Create immersive multi-media stories that connect with others.
                  Combine photos, videos, text, and interactive elements.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div 
              className="bg-glass rounded-xl overflow-hidden shadow-glass animate-on-scroll" 
              style={{ animationDelay: "0.2s" }}
            >
              <div className="relative h-48 overflow-hidden">
                {/* Social media connections */}
                <img
                  src="https://images.unsplash.com/photo-1522542550221-31fd19575a2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
                  alt="Privacy controls on HINT"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <h3 className="text-xl font-bold text-white">Privacy Guardian</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600">
                  Take control of your digital presence with granular privacy
                  settings. Choose exactly who sees your content and how.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div 
              className="bg-glass rounded-xl overflow-hidden shadow-glass animate-on-scroll" 
              style={{ animationDelay: "0.3s" }}
            >
              <div className="relative h-48 overflow-hidden">
                {/* Modern user interface elements */}
                <img
                  src="https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
                  alt="Real-time messaging on HINT"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <h3 className="text-xl font-bold text-white">Live Connect</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600">
                  Communicate in real-time with rich messaging, voice, and video
                  calls integrated seamlessly into the platform.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div 
              className="bg-glass rounded-xl overflow-hidden shadow-glass animate-on-scroll" 
              style={{ animationDelay: "0.4s" }}
            >
              <div className="relative h-48 overflow-hidden">
                {/* Social media connections */}
                <img
                  src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
                  alt="Community groups on HINT"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <h3 className="text-xl font-bold text-white">Community Spaces</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600">
                  Create and join communities around shared interests, with powerful
                  moderation tools and inclusive features.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div 
              className="bg-glass rounded-xl overflow-hidden shadow-glass animate-on-scroll" 
              style={{ animationDelay: "0.5s" }}
            >
              <div className="relative h-48 overflow-hidden">
                {/* Abstract connection graphics */}
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
                  alt="Memory collection on HINT"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <h3 className="text-xl font-bold text-white">Memory Vault</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600">
                  Your personal archive of moments, beautifully organized and
                  searchable, with On This Day reminders of special memories.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 bg-primary-900 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 -z-10 opacity-20">
          <div 
            className="absolute top-0 right-0 w-full h-full" 
            style={{ 
              backgroundSize: "30px 30px", 
              backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 0.5px, transparent 0.5px)" 
            }}
          ></div>
        </div>
        <div className="absolute -right-40 top-20 w-96 h-96 rounded-full bg-primary-700 opacity-30 blur-3xl"></div>
        <div className="absolute -left-20 bottom-10 w-80 h-80 rounded-full bg-pink-500 opacity-30 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:max-w-xl animate-on-scroll">
              <h2 className="text-3xl md:text-4xl font-bold font-['Poppins'] text-white mb-6">
                Ready to Connect Your World?
              </h2>
              <p className="text-xl text-primary-100 mb-10">
                Join thousands of people discovering a new way to share and connect.
                Your story matters – start sharing it today.
              </p>
              <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-primary-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg transition-all"
                >
                  Create Your Account
                </Link>
                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-white text-lg font-medium rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all"
                >
                  Learn More
                </a>
              </div>
            </div>

            <div className="mt-10 lg:mt-0 lg:ml-16 animate-on-scroll">
              <div className="relative">
                {/* Mobile device mockup */}
                <div className="bg-glass-dark rounded-3xl p-3 shadow-xl rotate-3 transform hover:rotate-0 transition-all duration-300">
                  <div className="rounded-2xl overflow-hidden bg-gray-800 border-4 border-gray-700">
                    <img
                      src="https://images.unsplash.com/photo-1573867639040-6dd25fa5f597?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=800"
                      alt="HINT app mobile interface"
                      className="w-64 h-auto"
                    />

                    {/* UI overlay elements */}
                    <div className="absolute top-10 left-8 right-8 rounded-lg bg-glass-dark p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary-400 flex items-center justify-center text-white text-xs">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="h-2 bg-gray-600 rounded w-3/4"></div>
                          <div className="h-2 mt-1 bg-gray-600 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom action bar */}
                    <div className="absolute bottom-10 left-8 right-8 rounded-full bg-glass-dark py-2 px-4 flex justify-between">
                      <button className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                      </button>
                      <button className="w-8 h-8 rounded-full bg-glass-dark flex items-center justify-center text-gray-300">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      </button>
                      <button className="w-8 h-8 rounded-full bg-glass-dark flex items-center justify-center text-gray-300">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      </button>
                      <button className="w-8 h-8 rounded-full bg-glass-dark flex items-center justify-center text-gray-300">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Home;
