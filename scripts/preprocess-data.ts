import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

interface Talk {
    airtable_id: string;
    Name: string;
    Url: string;
    Duration: number | null;
    Topics_Names: string | null;
    Speakers_Names: string | null;
    Description: string | null;
    Core_Topic: string | null;
}

interface ProcessedTalk {
    airtable_id: string;
    Name: string;
    Url: string;
    Duration: number | null;
    Topics_Names: string[];
    Speakers_Names: string[];
    Description: string;
    Core_Topic: string | null;
}

function getTalks(): ProcessedTalk[] {
    const dbPath = path.join(__dirname, '..', 'database', 'picks.db');
    const db = new Database(dbPath);
    
    const query = `
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
    `;
    
    const talks = db.prepare(query).all() as Talk[];
    
    return talks.map(talk => ({
        ...talk,
        Topics_Names: talk.Topics_Names ? JSON.parse(talk.Topics_Names) : [],
        Speakers_Names: talk.Speakers_Names ? JSON.parse(talk.Speakers_Names) : [],
        Description: talk.Description?.trim() || ''
    }));
}

function main(): void {
    try {
        const talks = getTalks();
        const outputPath = path.join(__dirname, '..', 'src', 'data', 'talks.json');
        
        // Ensure directory exists
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        
        // Write JSON file
        fs.writeFileSync(outputPath, JSON.stringify(talks, null, 2), 'utf-8');
        
        console.log(`Successfully processed ${talks.length} talks`);
        
    } catch (error) {
        console.error('Error processing data:', error);
        process.exit(1);
    }
}

main(); 