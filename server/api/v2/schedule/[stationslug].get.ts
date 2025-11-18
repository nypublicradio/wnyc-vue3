/**
 * Schedule API v2 - Reads schedule data from S3
 * 
 * This endpoint fetches schedule data for a given station from an S3 bucket.
 * Authentication uses the IAM role attached to the ECS task.
 * 
 * In development/local environments without S3 access, falls back to local mock data.
 * 
 * Required Environment Variables:
 * - AWS_REGION: AWS region where the S3 bucket is located (default: us-east-1)
 * - S3_SCHEDULE_BUCKET: Name of the S3 bucket containing schedule data (default: webstream-metadata-demo)
 * - USE_MOCK_SCHEDULE: Set to 'true' to use local mock data instead of S3 (default: auto-detect)
 * 
 * S3 Object Key Format: schedule-{STATIONSLUG}.json
 * Example: schedule-WNYC.json
 * 
 * Local Mock Data Path: server/data/schedules/schedule-{STATIONSLUG}.json
 * 
 * Query Parameters:
 * - filterMode: 'next24hours' | 'specificDate' | 'dateRange' | 'all' (default: 'next24hours')
 * - startDate: (optional) ISO date string for filtering (YYYY-MM-DD)
 * - endDate: (optional) ISO date string for filtering (YYYY-MM-DD) - used with dateRange mode
 * 
 * @example
 * // Get next 24 hours of schedule
 * GET /api/v2/schedule/wnyc?filterMode=next24hours
 * 
 * @example
 * // Get schedule for a specific date
 * GET /api/v2/schedule/wnyc?filterMode=specificDate&startDate=2025-11-15
 * 
 * @example
 * // Get schedule for next 7 days
 * GET /api/v2/schedule/wnyc?filterMode=dateRange&startDate=2025-11-13&endDate=2025-11-20
 */

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import humps from 'humps'
import { readFile } from 'fs/promises'
import { join } from 'path'

// Check if we should use mock data (local/review environments)
const shouldUseMockData = (): boolean => {
    // Explicit override via environment variable
    if (process.env.USE_MOCK_SCHEDULE === 'true') {
        return true
    }
    
    // Auto-detect: use mock data in development or when S3 bucket is not configured
    const isDevEnvironment = process.env.NODE_ENV === 'development' || process.env.ENV === 'demo'
    const hasS3Config = !!process.env.S3_SCHEDULE_BUCKET
    
    return isDevEnvironment && !hasS3Config
}

// Function to read JSON data from local file system
const getScheduleFromLocalFile = async (stationSlug: string) => {
    try {
        const filePath = join(process.cwd(), 'server/data/schedules', `schedule-${stationSlug}.json`)
        const fileContent = await readFile(filePath, 'utf-8')
        const jsonData = JSON.parse(fileContent)
        
        console.log(`Using local mock schedule data for ${stationSlug}`)
        return humps.camelizeKeys(jsonData)
    } catch (error) {
        console.error('Error reading local schedule file:', error)
        throw createError({
            statusCode: 404,
            statusMessage: `Mock schedule data not found for station: ${stationSlug}`,
        })
    }
}

// Initialize S3 client - Uses IAM role credentials when running in ECS
const getS3Client = () => {
    return new S3Client({
        region: 'us-east-1',
    })
}

// Function to stream S3 object to string
const streamToString = async (stream: any): Promise<string> => {
    const chunks: Uint8Array[] = []

    return new Promise((resolve, reject) => {
        stream.on('data', (chunk: Uint8Array) => chunks.push(chunk))
        stream.on('error', reject)
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    })
}

// Function to read JSON data from S3
const getScheduleFromS3 = async (bucketName: string, key: string) => {
    try {
        const s3Client = getS3Client()

        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
        })

        const response = await s3Client.send(command)

        if (!response.Body) {
            throw new Error('No data received from S3')
        }
        console.log('S3 response received')
        const bodyString = await streamToString(response.Body)
        const jsonData = JSON.parse(bodyString)

        return humps.camelizeKeys(jsonData)
    } catch (error) {
        console.error('Error reading from S3:', error)
        throw error
    }
}

// Remove past episodes that have already aired
const removePastEpisodes = (scheduleData: any) => {
    if (!scheduleData.episodes || !Array.isArray(scheduleData.episodes)) {
        return scheduleData
    }

    const now = new Date()
    const filteredEpisodes = scheduleData.episodes.filter((episode: any) => {
        const endTime = new Date(episode.endTime)
        return endTime > now
    })

    return {
        ...scheduleData,
        episodes: filteredEpisodes
    }
}

// Filter episodes for the next 24 hours
const filterNext24Hours = (scheduleData: any) => {
    if (!scheduleData.episodes || !Array.isArray(scheduleData.episodes)) {
        return scheduleData
    }

    const now = new Date()
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    
    const filteredEpisodes = scheduleData.episodes.filter((episode: any) => {
        const startTime = new Date(episode.startTime)
        const endTime = new Date(episode.endTime)
        // Include episodes that start within the next 24 hours or are currently airing
        return endTime > now && startTime < next24Hours
    })

    return {
        ...scheduleData,
        episodes: filteredEpisodes
    }
}

// Filter episodes for a specific date (all day)
const filterByDate = (scheduleData: any, targetDate: string) => {
    if (!scheduleData.episodes || !Array.isArray(scheduleData.episodes)) {
        return scheduleData
    }

    const startOfDay = new Date(targetDate)
    startOfDay.setUTCHours(0, 0, 0, 0)
    
    const endOfDay = new Date(targetDate)
    endOfDay.setUTCHours(23, 59, 59, 999)
    
    const filteredEpisodes = scheduleData.episodes.filter((episode: any) => {
        const startTime = new Date(episode.startTime)
        const endTime = new Date(episode.endTime)
        // Include episodes that overlap with the target date
        return startTime <= endOfDay && endTime >= startOfDay
    })

    return {
        ...scheduleData,
        episodes: filteredEpisodes
    }
}

// Filter episodes for a date range
const filterByDateRange = (scheduleData: any, startDate: string, endDate: string) => {
    if (!scheduleData.episodes || !Array.isArray(scheduleData.episodes)) {
        return scheduleData
    }

    const rangeStart = new Date(startDate)
    rangeStart.setUTCHours(0, 0, 0, 0)
    
    const rangeEnd = new Date(endDate)
    rangeEnd.setUTCHours(23, 59, 59, 999)
    
    const filteredEpisodes = scheduleData.episodes.filter((episode: any) => {
        const startTime = new Date(episode.startTime)
        const endTime = new Date(episode.endTime)
        // Include episodes that overlap with the date range
        return startTime <= rangeEnd && endTime >= rangeStart
    })

    return {
        ...scheduleData,
        episodes: filteredEpisodes
    }
}

export default defineEventHandler(async (event) => {
    const slug = event?.context?.params?.stationslug as string
    const res = event?.node?.res
    const query = getQuery(event)
    const filterMode = (query?.filterMode as string) || 'next24hours'
    const startDate = query?.startDate as string | undefined
    const endDate = query?.endDate as string | undefined

    if (!slug) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Station slug is required',
        })
    }

    try {

        
        // Fetch schedule data from S3 or local mock
        let scheduleData
        if (shouldUseMockData()) {
            scheduleData = await getScheduleFromLocalFile(slug)
        } else {
            const bucketName = process.env.S3_SCHEDULE_BUCKET as string || 'webstream-metadata-demo'
            const key = `schedule-${slug}.json`
            scheduleData = await getScheduleFromS3(bucketName, key)
        }
        res.setHeader('Cache-Control', 'maxage=300, stale-while-revalidate');
        // Apply filtering based on mode
        switch (filterMode) {
            case 'next24hours':
                return filterNext24Hours(scheduleData)
            
            case 'specificDate':
                if (!startDate) {
                    throw createError({
                        statusCode: 400,
                        statusMessage: 'startDate is required for specificDate mode',
                    })
                }
                return filterByDate(scheduleData, startDate)
            
            case 'dateRange':
                if (!startDate || !endDate) {
                    throw createError({
                        statusCode: 400,
                        statusMessage: 'startDate and endDate are required for dateRange mode',
                    })
                }
                return filterByDateRange(scheduleData, startDate, endDate)
            
            case 'all':
                // Return all future episodes (remove only past ones)
                return removePastEpisodes(scheduleData)
            
            default:
                // Default to next 24 hours
                return filterNext24Hours(scheduleData)
        }
    } catch (error: any) {
        console.error('Error fetching schedule from S3:', error)

        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.message || 'Failed to fetch schedule data from S3',
        })
    }
})
