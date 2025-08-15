"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { NEO } from "@/types/neo";
import { formatDateTimeForDisplay } from "@/lib/date";
import EventDetail from "./EventDetail";

interface EventCardProps {
  neo: NEO;
}

export default function EventCard({ neo }: EventCardProps) {
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [loadingOrbitalData, setLoadingOrbitalData] = useState(false);
  const [orbitalData, setOrbitalData] = useState<NEO['orbital_data'] | null>(null);

  const handleOpenModal = () => {
    setShowModal(true);
    // Focus the close button when modal opens
    setTimeout(() => closeButtonRef.current?.focus(), 50);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };
  
  // Handle keyboard events for modal trap
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCloseModal();
    }
    
    // Trap focus inside modal
    if (e.key === 'Tab') {
      if (!modalRef.current) return;
      
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  const handleLoadOrbitalData = async () => {
    if (orbitalData) return; // Don't fetch if we already have it
    
    try {
      setLoadingOrbitalData(true);
      const response = await fetch(`/api/neos/${neo.id}?orbital=true`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch orbital data: ${response.statusText}`);
      }
      
      const data = await response.json();
      setOrbitalData(data.orbital_data);
    } catch (err) {
      console.error("Error fetching orbital data:", err);
    } finally {
      setLoadingOrbitalData(false);
    }
  };

  return (
    <>
      <div 
        className="bg-card border border-border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        data-testid="event-card"
      >
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-lg truncate" title={neo.name}>
              {neo.name}
            </h3>
            {neo.hazardous && (
              <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                Hazardous
              </span>
            )}
          </div>
          
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Diameter:</span>{" "}
              {neo.avgDiameterKm ? `${neo.avgDiameterKm.toFixed(2)} km` : "Unknown"}
            </p>
            
            <p>
              <span className="text-muted-foreground">Closest Approach:</span>{" "}
              {neo.nearestApproach?.datetime 
                ? formatDateTimeForDisplay(neo.nearestApproach.datetime) 
                : "Unknown"}
            </p>
            
            {neo.nearestApproach?.missDistanceKm && (
              <p>
                <span className="text-muted-foreground">Miss Distance:</span>{" "}
                {Number(neo.nearestApproach.missDistanceKm).toLocaleString()} km
              </p>
            )}
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={handleOpenModal}
              className="text-primary hover:text-primary/80 text-sm font-medium"
              aria-label={`View details for ${neo.name}`}
            >
              View Details
            </button>
            
            <Link
              href={`/event/${neo.id}`}
              className="text-sm text-muted-foreground hover:text-foreground"
              aria-label={`Open full page for ${neo.name}`}
            >
              Full Page
            </Link>
          </div>
        </div>
      </div>

      {/* Modal for event details */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
          onKeyDown={handleKeyDown}
        >
          <div 
            ref={modalRef}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 id="modal-title" className="text-xl font-bold">{neo.name}</h2>
              <button
                ref={closeButtonRef}
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <EventDetail 
                neo={neo} 
                orbitalData={orbitalData}
                loadingOrbitalData={loadingOrbitalData}
                onLoadOrbitalData={handleLoadOrbitalData}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
