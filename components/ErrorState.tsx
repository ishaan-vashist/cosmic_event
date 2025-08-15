interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  suggestion?: string;
  errorType?: 'api' | 'date' | 'network' | 'general';
}

export default function ErrorState({ message, onRetry, suggestion, errorType = 'general' }: ErrorStateProps) {
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
      
      <h3 className="text-lg font-medium mb-2">
        {errorType === 'api' && "API Error"}
        {errorType === 'date' && "Date Range Error"}
        {errorType === 'network' && "Network Error"}
        {errorType === 'general' && "Error Loading Data"}
      </h3>
      <p className="text-muted-foreground mb-2">{message}</p>
      
      {suggestion && (
        <p className="text-sm text-amber-500 mb-4">
          <strong>Suggestion:</strong> {suggestion}
        </p>
      )}
      
      {errorType === 'date' && (
        <div className="text-xs text-muted-foreground mb-4 p-2 bg-muted rounded-md">
          <p><strong>Note:</strong> NASA API has the following limitations:</p>
          <ul className="list-disc list-inside mt-1">
            <li>Maximum date range of 7 days</li>
            <li>Start date must be before end date</li>
            <li>Dates must be in valid format (YYYY-MM-DD)</li>
          </ul>
        </div>
      )}
      
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
