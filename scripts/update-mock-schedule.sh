#!/bin/bash

# Script to update mock schedule data with current dates for testing
# This shifts all episode dates forward to make the schedule current
#
# Usage: ./scripts/update-mock-schedule.sh [STATION_SLUG]
# Example: ./scripts/update-mock-schedule.sh WNYC
#
# The script will:
# 1. Read the existing mock schedule file
# 2. Calculate the date difference between the oldest episode and today
# 3. Shift all episode dates forward by that difference
# 4. Save the updated schedule back to the file

set -e

STATION_SLUG=${1:-WNYC}
OUTPUT_DIR="server/data/schedules"
SCHEDULE_FILE="${OUTPUT_DIR}/schedule-${STATION_SLUG}.json"

if [ ! -f "${SCHEDULE_FILE}" ]; then
    echo "❌ Schedule file not found: ${SCHEDULE_FILE}"
    echo "Please ensure the mock schedule file exists first."
    exit 1
fi

echo "📅 Updating mock schedule dates for ${STATION_SLUG}..."

# Create a temporary Node.js script to update the dates
STATION_SLUG="${STATION_SLUG}" SCHEDULE_FILE="${SCHEDULE_FILE}" node << 'EOF'
const fs = require('fs');
const path = require('path');

const stationSlug = process.env.STATION_SLUG;
const scheduleFile = process.env.SCHEDULE_FILE;

try {
    // Read the schedule file
    const data = JSON.parse(fs.readFileSync(scheduleFile, 'utf-8'));
    
    if (!data.episodes || data.episodes.length === 0) {
        console.log('⚠️  No episodes found in schedule file');
        process.exit(0);
    }

    // Find the oldest episode date
    let oldestDate = null;
    data.episodes.forEach(episode => {
        const startTime = new Date(episode.startTime);
        if (!oldestDate || startTime < oldestDate) {
            oldestDate = startTime;
        }
    });

    // Calculate the difference in days between oldest date and today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffMs = today - oldestDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    console.log(`📊 Oldest episode date: ${oldestDate.toISOString().split('T')[0]}`);
    console.log(`📊 Today's date: ${today.toISOString().split('T')[0]}`);
    console.log(`📊 Shifting all dates forward by ${diffDays} days`);

    // Shift all episode dates
    data.episodes = data.episodes.map(episode => {
        const startTime = new Date(episode.startTime);
        const endTime = new Date(episode.endTime);
        
        // Add the difference in days
        startTime.setDate(startTime.getDate() + diffDays);
        endTime.setDate(endTime.getDate() + diffDays);
        
        return {
            ...episode,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString()
        };
    });

    // Update the ID if it contains a date
    data.episodes = data.episodes.map(episode => {
        if (episode.id && /_\d{8}$/.test(episode.id)) {
            // Extract the base ID and old date
            const parts = episode.id.match(/^(.+)_(\d{8})$/);
            if (parts) {
                const baseId = parts[1];
                const startTime = new Date(episode.startTime);
                const newDate = startTime.toISOString().split('T')[0].replace(/-/g, '').slice(0, 8);
                episode.id = `${baseId}_${newDate}`;
            }
        }
        return episode;
    });

    // Write the updated schedule back to file
    fs.writeFileSync(scheduleFile, JSON.stringify(data, null, 2), 'utf-8');

    const firstEpisode = data.episodes[0];
    const lastEpisode = data.episodes[data.episodes.length - 1];
    
    console.log(`✅ Updated ${data.episodes.length} episodes`);
    console.log(`📅 New date range: ${new Date(firstEpisode.startTime).toISOString().split('T')[0]} to ${new Date(lastEpisode.endTime).toISOString().split('T')[0]}`);
    
} catch (error) {
    console.error('❌ Error updating schedule:', error.message);
    process.exit(1);
}
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully updated schedule dates in ${SCHEDULE_FILE}"
    echo ""
    echo "To use this mock data locally, ensure USE_MOCK_SCHEDULE=true in your .env.local"
else
    echo "❌ Failed to update schedule dates"
    exit 1
fi

