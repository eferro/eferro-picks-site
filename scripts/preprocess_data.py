#!/usr/bin/env python3
import sqlite3
import json
from pathlib import Path
from typing import List, Dict, Any

def get_talks() -> List[Dict[str, Any]]:
    """Query the database for high-rated English talks."""
    db_path = Path(__file__).parent.parent / "database" / "picks.db"
    
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                airtable_id,
                Name,
                Url,
                Duration,
                Topics_Names,
                Speakers_Names,
                Description,
                Core_Topic 
            FROM Resources 
            WHERE Rating=5 
            AND "Resource type" == 'talk' 
            AND "Language" == 'English'
            ORDER BY Name
        """)
        
        columns = [description[0] for description in cursor.description]
        talks = []
        
        for row in cursor.fetchall():
            talk = dict(zip(columns, row))
            # Clean up the data
            talk['Topics_Names'] = json.loads(talk['Topics_Names']) if talk['Topics_Names'] else []
            talk['Speakers_Names'] = json.loads(talk['Speakers_Names']) if talk['Speakers_Names'] else []
            talk['Description'] = talk['Description'].strip() if talk['Description'] else ''
            talks.append(talk)
            
        return talks

def main():
    """Main function to preprocess data and save to JSON."""
    try:
        talks = get_talks()
        output_path = Path(__file__).parent.parent / "src" / "data" / "talks.json"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(talks, f, indent=2, ensure_ascii=False)
            
        print(f"Successfully processed {len(talks)} talks")
        
    except Exception as e:
        print(f"Error processing data: {e}")
        exit(1)

if __name__ == "__main__":
    main() 