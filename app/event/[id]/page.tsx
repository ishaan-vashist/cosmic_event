"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EventDetail from "@/components/EventDetail";
import Loading from "@/components/Loading";
import ErrorState from "@/components/ErrorState";
import { NEO } from "@/types/neo";

interface EventPageProps {
  params: {
    id: string;
  };
}

export default function EventPage({ params }: EventPageProps) {
  const router = useRouter();
  const [neo, setNeo] = useState<NEO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [loadingOrbitalData, setLoadingOrbitalData] = useState(false);
  const [orbitalData, setOrbitalData] = useState<NEO['orbital_data'] | null>(null);

  // Fetch NEO data
  useEffect(() => {
    const fetchNeoData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/neos/${params.id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch NEO data: ${response.statusText}`);
        }
        
        const data = await response.json();
        setNeo(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err : new Error("Failed to fetch NEO data"));
      } finally {
        setLoading(false);
      }
    };

    fetchNeoData();
  }, [params.id]);

  // Function to fetch orbital data
  const fetchOrbitalData = async () => {
    if (orbitalData) return; // Don't fetch if we already have it
    
    try {
      setLoadingOrbitalData(true);
      const response = await fetch(`/api/neos/${params.id}?orbital=true`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch orbital data: ${response.statusText}`);
      }
      
      const data = await response.json();
      setOrbitalData(data.orbital_data);
    } catch (err: unknown) {
      console.error("Error fetching orbital data:", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingOrbitalData(false);
    }
  };

  const handleClose = () => {
    router.push("/");
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !neo) {
    return (
      <ErrorState 
        message={error?.message || "Failed to load NEO data"} 
        onRetry={() => window.location.reload()} 
      />
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <button 
        onClick={handleClose}
        className="mb-4 px-3 py-1 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
      >
        &larr; Back to List
      </button>
      
      <EventDetail 
        neo={neo} 
        orbitalData={orbitalData}
        loadingOrbitalData={loadingOrbitalData}
        onLoadOrbitalData={fetchOrbitalData}
      />
    </div>
  );
}
