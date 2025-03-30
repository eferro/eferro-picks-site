export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return 'Duration not available';
  
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
} 