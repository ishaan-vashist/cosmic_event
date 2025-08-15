import React from 'react';
import { Github } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-4 border-t border-slate-800 bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex items-center space-x-2">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} Cosmic Event Tracker. All rights reserved.
            </p>
            <span className="text-slate-600">•</span>
            <p className="text-xs text-slate-500">
              Data provided by NASA NEO API
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-4">
              <Link href="/" className="text-xs text-slate-400 hover:text-blue-300 transition-colors">
                Home
              </Link>
              <Link href="/login" className="text-xs text-slate-400 hover:text-blue-300 transition-colors">
                Login
              </Link>
              <Link href="/feed" className="text-xs text-slate-400 hover:text-blue-300 transition-colors">
                Feed
              </Link>
            </div>
            <a 
              href="https://github.com/ishaan-vashist/cosmic_event" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-slate-400 hover:text-blue-300 transition-colors"
              aria-label="GitHub"
            >
              <Github size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
