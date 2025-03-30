export interface Talk {
  airtable_id: string;
  title: string;
  url: string;
  duration: number;
  topics: string[];
  speakers: string[];
  description: string;
  core_topic: string;
}

export interface TalksData {
  talks: Talk[];
} 