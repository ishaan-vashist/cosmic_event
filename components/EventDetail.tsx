import { NEO } from "@/types/neo";
import { formatDateTimeForDisplay } from "@/lib/date";

interface EventDetailProps {
  neo: NEO;
  orbitalData: NEO['orbital_data'] | null;
  loadingOrbitalData: boolean;
  onLoadOrbitalData: () => void;
  orbitalError?: string | null;
}

export default function EventDetail({
  neo,
  orbitalData,
  loadingOrbitalData,
  onLoadOrbitalData,
  orbitalError,
}: EventDetailProps) {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div>
        <h3 className="text-lg font-medium mb-2">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <div>
            <span className="text-muted-foreground">Name:</span>{" "}
            {neo.name}
          </div>
          <div>
            <span className="text-muted-foreground">ID:</span>{" "}
            {neo.id}
          </div>
          <div>
            <span className="text-muted-foreground">Potentially Hazardous:</span>{" "}
            <span className={neo.hazardous ? "text-destructive" : ""}>
              {neo.hazardous ? "Yes" : "No"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Average Diameter:</span>{" "}
            {neo.avgDiameterKm ? `${neo.avgDiameterKm.toFixed(2)} km` : "Unknown"}
          </div>
        </div>
        
        {neo.nasaUrl && (
          <div className="mt-2">
            <span className="text-muted-foreground">NASA JPL URL:</span>{" "}
            <a 
              href={neo.nasaUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View on NASA JPL
            </a>
          </div>
        )}
      </div>
      
      {/* Closest Approach */}
      <div>
        <h3 className="text-lg font-medium mb-2">Closest Approach</h3>
        {neo.nearestApproach ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div>
              <span className="text-muted-foreground">Date & Time:</span>{" "}
              {neo.nearestApproach.datetime 
                ? formatDateTimeForDisplay(neo.nearestApproach.datetime) 
                : "Unknown"}
            </div>
            <div>
              <span className="text-muted-foreground">Relative Velocity:</span>{" "}
              {neo.nearestApproach.velocityKps 
                ? `${neo.nearestApproach.velocityKps.toFixed(2)} km/s` 
                : "Unknown"}
            </div>
            <div>
              <span className="text-muted-foreground">Miss Distance:</span>{" "}
              {neo.nearestApproach.missDistanceKm 
                ? `${Number(neo.nearestApproach.missDistanceKm).toLocaleString()} km` 
                : "Unknown"}
            </div>
            <div>
              <span className="text-muted-foreground">Orbiting Body:</span>{" "}
              {neo.nearestApproach.orbitingBody || "Unknown"}
            </div>
          </div>
        ) : (
          <p>No approach data available</p>
        )}
      </div>
      
      {/* All Approaches */}
      {neo.approaches && neo.approaches.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">All Approaches</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Date & Time</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Velocity (km/s)</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Miss Distance (km)</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Orbiting Body</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {neo.approaches.map((approach, index) => (
                  <tr key={index} className="hover:bg-muted/50">
                    <td className="px-4 py-2 text-sm">
                      {approach.datetime ? formatDateTimeForDisplay(approach.datetime) : "Unknown"}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {approach.velocityKps ? approach.velocityKps.toFixed(2) : "Unknown"}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {approach.missDistanceKm 
                        ? Number(approach.missDistanceKm).toLocaleString() 
                        : "Unknown"}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {approach.orbitingBody || "Unknown"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Orbital Data */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Orbital Data</h3>
          {!orbitalData && !loadingOrbitalData && (
            <button
              onClick={onLoadOrbitalData}
              className="text-sm px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              disabled={loadingOrbitalData}
            >
              Load Orbital Data
            </button>
          )}
        </div>
        
        {loadingOrbitalData ? (
          <div className="text-center py-4">
            <p>Loading orbital data...</p>
          </div>
        ) : orbitalError ? (
          <div className="text-center py-4">
            <p className="text-destructive">{orbitalError}</p>
            <button
              onClick={onLoadOrbitalData}
              className="mt-2 text-sm px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              disabled={loadingOrbitalData}
            >
              Try Again
            </button>
          </div>
        ) : orbitalData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            {Object.entries(orbitalData).map(([key, value]) => (
              <div key={key}>
                <span className="text-muted-foreground">
                  {key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}:
                </span>{" "}
                {value !== null ? String(value) : "N/A"}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground italic">
            Click "Load Orbital Data" to view detailed orbital information
          </p>
        )}
      </div>
    </div>
  );
}
