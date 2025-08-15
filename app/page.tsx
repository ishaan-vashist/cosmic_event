import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Star, Activity } from "lucide-react";

export default function Home() {
  return (
    <>
      <Header />
      {/* Hero Section with space background */}
      <section className="relative overflow-hidden bg-gradient-to-b from-black to-slate-900 py-20 md:py-32">
        {/* Animated stars background */}
        <div className="absolute inset-0 opacity-30">
          <div className="stars-sm"></div>
          <div className="stars-md"></div>
          <div className="stars-lg"></div>
        </div>
        
        <div className="container relative mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div>
                <h1 className="animate-fade-in text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
                  Cosmic Event Tracker
                </h1>
                <p className="animate-fade-in-delay text-xl md:text-2xl text-slate-300 max-w-xl mx-auto lg:mx-0">
                  Explore the universe beyond our planet with real-time data on Near-Earth Objects.
                </p>
              </div>
              
              <div className="animate-fade-in-delay-200 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/login">
                  <Button size="lg" className="text-lg px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-indigo-500/30">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg" className="text-lg px-8 border-blue-500 text-blue-300 hover:bg-blue-900/50 hover:text-white transition-all duration-300 shadow-md">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative flex items-center justify-center animate-float hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <div className="relative w-[400px] h-[400px] mx-auto">
                <Image 
                  src="/asteroid-new.svg" 
                  alt="Near Earth Object" 
                  width={400} 
                  height={400}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Discover Cosmic Events</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform provides comprehensive tools to track and monitor Near-Earth Objects using NASA's official data.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <Activity className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-time Data</h3>
              <p className="text-muted-foreground">Access the latest information about asteroids and other objects near Earth with daily updates from NASA's NEO feed.</p>
            </div>
            
            <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <Shield className="h-7 w-7 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Hazard Tracking</h3>
              <p className="text-muted-foreground">Filter and monitor potentially hazardous objects approaching Earth with advanced visualization and alert systems.</p>
            </div>
            
            <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <Star className="h-7 w-7 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Save Favorites</h3>
              <p className="text-muted-foreground">Create a personal collection of interesting cosmic events to follow and receive notifications about their trajectory updates.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-900 to-slate-900 text-white relative overflow-hidden">
        {/* Background stars */}
        <div className="absolute inset-0 opacity-20">
          <div className="stars-sm"></div>
          <div className="stars-md"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto bg-slate-900/50 backdrop-blur-sm p-10 rounded-2xl border border-blue-500/20 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
              Ready to Explore the Cosmos?
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
              Join our community of space enthusiasts and stay informed about cosmic events happening around our planet.
            </p>
            <Link href="/login">
              <Button size="lg" className="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all duration-300 shadow-lg hover:shadow-blue-500/30">
                Start Tracking Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
}
