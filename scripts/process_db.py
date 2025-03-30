#!/usr/bin/env python3

import json
import sqlite3
from pathlib import Path
import sys
from typing import Dict, List, Any, Optional
from datetime import datetime
import re
from urllib.parse import urlparse

def is_valid_url(url: str) -> bool:
    """Check if a URL is valid."""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

def validate_talk(talk: Dict[str, Any]) -> Optional[str]:
    """Validate a talk entry and return error message if invalid."""
    # Required fields
    required_fields = ['airtable_id', 'title', 'url']
    for field in required_fields:
        if not talk.get(field):
            return f"Missing required field: {field}"
    
    # URL validation
    if not is_valid_url(talk['url']):
        return f"Invalid URL: {talk['url']}"
    
    # Duration validation
    if talk.get('duration'):
        if not isinstance(talk['duration'], (int, type(None))):
            return f"Duration must be an integer or null, got: {type(talk['duration'])}"
        if isinstance(talk['duration'], int) and (talk['duration'] <= 0 or talk['duration'] > 24*60*60):
            return f"Duration must be between 1 second and 24 hours, got: {talk['duration']} seconds"
    
    # Lists validation
    if not isinstance(talk['topics'], list):
        return f"Topics must be a list, got: {type(talk['topics'])}"
    if not isinstance(talk['speakers'], list):
        return f"Speakers must be a list, got: {type(talk['speakers'])}"
    
    # Content validation
    if talk['title'] and len(talk['title'].strip()) < 3:
        return f"Title too short: {talk['title']}"
    
    if talk['description'] and len(talk['description'].strip()) < 10:
        return f"Description too short: {talk['description']}"
    
    # Lists content validation
    if not talk['topics']:
        return "Topics list is empty"
    if not talk['speakers']:
        return "Speakers list is empty"
    
    # Validate each topic and speaker is not empty
    if any(not topic.strip() for topic in talk['topics']):
        return "Found empty topic"
    if any(not speaker.strip() for speaker in talk['speakers']):
        return "Found empty speaker"
    
    return None

def generate_report(skipped_talks: List[Dict[str, Any]], output_dir: Path):
    """Generate a detailed report of skipped talks."""
    report_file = output_dir / "processing_report.md"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write("# Talk Processing Report\n\n")
        f.write(f"Generated at: {datetime.utcnow().isoformat()}\n\n")
        
        if not skipped_talks:
            f.write("✅ All talks processed successfully!\n")
            return
        
        f.write(f"## ⚠️ Skipped Talks ({len(skipped_talks)})\n\n")
        for talk in skipped_talks:
            f.write(f"### {talk['title']}\n")
            f.write(f"- **URL**: {talk['url']}\n")
            f.write(f"- **Error**: {talk['error']}\n")
            f.write(f"- **Topics**: {talk.get('topics', [])}\n")
            f.write(f"- **Speakers**: {talk.get('speakers', [])}\n")
            f.write(f"- **Duration**: {talk.get('duration')}\n")
            f.write("\n")

def process_db():
    try:
        # Get the project root directory (where the script is located)
        root_dir = Path(__file__).parent.parent
        db_path = root_dir / "database" / "picks.db"
        output_dir = root_dir / "src" / "data"
        
        if not db_path.exists():
            raise FileNotFoundError(f"Database file not found: {db_path}")
        
        # Create output directory if it doesn't exist
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Connect to the database
        with sqlite3.connect(db_path) as conn:
            # Enable dictionary cursor
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            try:
                # Get all high-rated English talks
                cursor.execute("""
                    SELECT 
                        airtable_id,
                        Name as title,
                        Url as url,
                        Duration as duration,
                        Topics_Names as topics,
                        Speakers_Names as speakers,
                        Description as description,
                        Core_Topic as core_topic
                    FROM Resources 
                    WHERE Rating = 5 
                    AND "Resource type" = 'talk' 
                    AND "Language" = 'English'
                    ORDER BY Name
                """)
            except sqlite3.OperationalError as e:
                raise Exception(f"Database query failed: {str(e)}")
            
            # Process rows
            valid_talks = []
            skipped_talks = []
            stats = {
                'total_processed': 0,
                'valid_talks': 0,
                'skipped_talks': 0,
                'total_duration': 0
            }
            
            print("\n🔍 Processing talks...")
            
            for row_num, row in enumerate(cursor, 1):
                stats['total_processed'] += 1
                try:
                    talk = dict(row)
                    # Parse JSON strings into lists
                    for field in ['topics', 'speakers']:
                        try:
                            talk[field] = json.loads(talk[field]) if talk[field] else []
                        except json.JSONDecodeError as e:
                            raise ValueError(f"Invalid JSON in {field}: {talk[field]}")
                    
                    # Clean up description
                    talk['description'] = talk['description'].strip() if talk['description'] else ''
                    
                    # Validate the talk
                    error = validate_talk(talk)
                    if error:
                        stats['skipped_talks'] += 1
                        skipped_talks.append({**talk, 'error': error})
                        print(f"⚠️ Skipping talk {row_num} - {talk['title']}: {error}")
                        continue
                    
                    stats['valid_talks'] += 1
                    if talk.get('duration'):
                        stats['total_duration'] += talk['duration']
                    
                    valid_talks.append(talk)
                    
                except Exception as e:
                    stats['skipped_talks'] += 1
                    error_msg = str(e)
                    skipped_talks.append({**talk, 'error': error_msg})
                    print(f"⚠️ Skipping talk {row_num} - {talk.get('title', 'Unknown title')}: {error_msg}")
            
            # Generate report of skipped talks
            generate_report(skipped_talks, output_dir)
            
            # Write the processed data
            output_file = output_dir / "talks.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(
                    {
                        'talks': valid_talks,
                        'metadata': {
                            'total': len(valid_talks),
                            'generated_at': datetime.utcnow().isoformat(),
                            'stats': {
                                'total_processed': stats['total_processed'],
                                'valid_talks': stats['valid_talks'],
                                'skipped_talks': stats['skipped_talks'],
                                'total_duration_hours': round(stats['total_duration'] / 3600, 2)
                            }
                        }
                    }, 
                    f, 
                    indent=2,
                    ensure_ascii=False
                )
            
            print(f"\n✅ Processing complete")
            print(f"📊 Stats:")
            print(f"  - Total processed: {stats['total_processed']}")
            print(f"  - Valid talks: {stats['valid_talks']}")
            print(f"  - Skipped talks: {stats['skipped_talks']}")
            print(f"  - Total duration: {round(stats['total_duration'] / 3600, 2)} hours")
            print(f"📝 Output written to: {output_file}")
            print(f"📋 Processing report written to: {output_dir}/processing_report.md")
            return True
            
    except Exception as e:
        print(f"❌ Error processing database: {str(e)}", file=sys.stderr)
        return False

if __name__ == "__main__":
    success = process_db()
    sys.exit(0 if success else 1) 