interface TopicChipProps {
  topic: string;
  className?: string;
}

export function TopicChip({ topic, className = '' }: TopicChipProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ${className}`}>
      {topic}
    </span>
  );
} 