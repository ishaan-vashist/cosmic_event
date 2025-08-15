export default function Loading() {
  return (
    <div className="py-12 flex flex-col items-center justify-center" aria-live="polite" aria-busy="true">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
      <p className="text-lg font-medium">Loading data...</p>
      <p className="text-sm text-muted-foreground mt-1">Fetching near-Earth objects</p>
    </div>
  );
}
