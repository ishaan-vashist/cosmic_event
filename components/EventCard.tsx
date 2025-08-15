"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { NEO } from "@/types/neo";
import { formatDateTimeForDisplay } from "@/lib/date";
import EventDetail from "./EventDetail";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EventCardProps {
  neo: NEO;
}

export default function EventCard({ neo }: EventCardProps) {
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [loadingOrbitalData, setLoadingOrbitalData] = useState(false);
  const [orbitalData, setOrbitalData] = useState<NEO['orbital_data'] | null>(null);
  const [orbitalError, setOrbitalError] = useState<string | null>(null);

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
      setOrbitalError(null); // Reset any previous errors
      
      const response = await fetch(`/api/neos/${neo.id}?orbital=true`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || response.statusText;
        throw new Error(`Failed to fetch orbital data: ${errorMessage}`);
      }
      
      const data = await response.json();
      
      if (!data.orbital_data) {
        throw new Error('No orbital data available for this object');
      }
      
      setOrbitalData(data.orbital_data);
    } catch (err) {
      console.error("Error fetching orbital data:", err);
      const error = err as Error;
      setOrbitalError(error.message || 'Failed to load orbital data');
    } finally {
      setLoadingOrbitalData(false);
    }
  };

  return (
    <>
      <Card 
        className="hover:shadow-md transition-shadow h-full"
        data-testid="event-card"
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-medium truncate" title={neo.name}>
              {neo.name}
            </CardTitle>
            {neo.hazardous && (
              <Badge variant="destructive" className="ml-2">
                Hazardous
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 pt-2">
          <div className="space-y-2 text-sm">
            <p className="flex justify-between">
              <span className="text-muted-foreground">Diameter:</span>
              <span className="font-medium">{neo.avgDiameterKm ? `${neo.avgDiameterKm.toFixed(2)} km` : "Unknown"}</span>
            </p>
            
            <p className="flex justify-between">
              <span className="text-muted-foreground">Closest Approach:</span>
              <span className="font-medium">{neo.nearestApproach?.datetime 
                ? formatDateTimeForDisplay(neo.nearestApproach.datetime) 
                : "Unknown"}</span>
            </p>
            
            {neo.nearestApproach?.missDistanceKm && (
              <p className="flex justify-between">
                <span className="text-muted-foreground">Miss Distance:</span>
                <span className="font-medium">{Number(neo.nearestApproach.missDistanceKm).toLocaleString()} km</span>
              </p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-2">
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
        </CardFooter>
      </Card>

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
            className="bg-background border border-border p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg"
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
                orbitalError={orbitalError}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
