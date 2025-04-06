export interface Talk {
  id: string;
  title: string;
  url: string;
  duration: number;
  topics: string[];
  speakers: string[];
  description: string;
  core_topic: string;
  notes?: string;  // Optional field for rich text notes
  year?: number;  // Optional field for the talk's year
} 