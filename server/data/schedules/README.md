# Schedule Mock Data

This directory contains mock schedule data for local development and review environments.

## Purpose

Developers working locally or in Fly review environments may not have access to the production S3 bucket. This directory provides fallback data for the schedule API.

## Usage

The schedule API (`/api/v2/schedule/[stationslug]`) automatically uses mock data when:

1. `USE_MOCK_SCHEDULE=true` environment variable is set, OR
2. Running in development mode (`NODE_ENV=development` or `ENV=demo`) AND S3 bucket is not configured

## File Naming Convention

Mock files should follow this pattern:
```
schedule-{STATIONSLUG}.json
```

Examples:
- `schedule-wnyc.json` - for `/api/v2/schedule/wnyc`
- `schedule-wqxr.json` - for `/api/v2/schedule/wqxr`

**Note:** Station slugs are converted to uppercase for the filename.

## Data Format

Files should contain JSON with the following structure:

```json
{
  "episodes": [
    {
      "id": "episode-id",
      "name": "Show Name",
      "description": "Show description",
      "startTime": "2025-11-13T00:00:00Z",
      "endTime": "2025-11-13T01:00:00Z",
      "duration": "01:00:00",
      "images": [...],
      "showId": "show-id"
    }
  ],
  "presenters": []
}
```

## Adding Mock Data for New Stations

1. Download the current schedule from S3 or the production API
2. Save it as `schedule-{STATIONSLUG}.json` in this directory
3. Commit the file to the repository

## Environment Variables

### Local Development (`.env` or `.env.local`)

```bash
# Option 1: Force mock data usage
USE_MOCK_SCHEDULE=true

# Option 2: Don't set S3_SCHEDULE_BUCKET (will auto-detect and use mock)
# Leave S3_SCHEDULE_BUCKET unset
```

### Fly Review Environments

In `fly.toml` or via Fly secrets:

```toml
[env]
  USE_MOCK_SCHEDULE = "true"
```

### Production/ECS

Ensure `S3_SCHEDULE_BUCKET` is set and `USE_MOCK_SCHEDULE` is not set (or set to "false").

```bash
S3_SCHEDULE_BUCKET=webstream-metadata-demo
# USE_MOCK_SCHEDULE should not be set
```

## Updating Mock Data

Mock data should be refreshed periodically to stay current. You have two options:

### Option 1: Update Dates in Existing Mock Data (Recommended)

The easiest way to keep mock data current is to shift the dates forward:

```bash
# Update dates for WNYC schedule to today
./scripts/update-mock-schedule.sh wnyc

# Update dates for other stations
./scripts/update-mock-schedule.sh wqxr
```

This script will:
- Read the existing mock schedule file
- Calculate the date difference between the oldest episode and today
- Shift all episode dates forward to make them current
- Update episode IDs that contain dates

### Option 2: Download Fresh Data from S3

If you have AWS credentials and want to download fresh data:

```bash
# Set your S3 bucket name
export S3_SCHEDULE_BUCKET=webstream-metadata-demo

# Download fresh data
aws s3 cp "s3://${S3_SCHEDULE_BUCKET}/schedule-wnyc.json" server/data/schedules/schedule-wnyc.json

# Then update the dates to current
./scripts/update-mock-schedule.sh wnyc
```

## .gitignore

Mock files are committed to the repository to ensure all developers have access to them without needing S3 credentials.
