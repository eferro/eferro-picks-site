export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '0m';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  if (minutes > 0) {
    return `${minutes}m`;
  }
  
  return `${remainingSeconds}s`;
}

export function getSpeakerInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('');
} 