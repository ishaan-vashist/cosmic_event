interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div 
      className="bg-card border border-destructive/20 rounded-lg p-6 text-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="text-destructive mb-4">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="40" 
          height="40" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="mx-auto"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      
      <h3 className="text-lg font-medium mb-2">Error Loading Data</h3>
      <p className="text-muted-foreground mb-4">{message}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          aria-label="Retry loading data"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
