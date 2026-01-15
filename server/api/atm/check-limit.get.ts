import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    // Prevent caching
    setResponseHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')
    setResponseHeader(event, 'Pragma', 'no-cache')
    setResponseHeader(event, 'Expires', '0')

    let user = await serverSupabaseUser(event)
    const client = await serverSupabaseClient(event)

    // Fallback: Check Authorization header if user is not found via cookies
    if (!user) {
        const authHeader = getHeader(event, 'Authorization')
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1]
            const { data: { user: authUser }, error } = await client.auth.getUser(token)
            if (error) {
                throw createError({
                    statusCode: 401,
                    statusMessage: error.message,
                })
            }
            if (authUser) {
                user = authUser
            }
        }
    }

    if (!user) {
        // If not logged in, they can't have reached a user-specific limit,
        // unless we want to block anon users entirely (which we probably do, but the UI handles login)
        return {
            questionLimitReached: false,
            lastSubmissionDate: null
        }
    }

    // Initialize Service Role Client to ensure we can read submissions regardless of RLS for this check
    // (Pattern followed from submissions.get.ts)
    const supabaseUrl = process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        console.error('[ATM Check Limit] Missing Supabase URL or Service Role Key')
        throw createError({
            statusCode: 500,
            statusMessage: 'Server Configuration Error',
        })
    }

    const serviceRole = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    // Query for the specific user's latest submission
    const { data: submissions, error } = await serviceRole
        .from('atm_submissions')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

    if (error) {
        console.error('[ATM Check Limit] Error querying submissions:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Database Error',
        })
    }

    const latestSubmission = submissions?.[0]

    let questionLimitReached = false
    let lastSubmissionDate = null

    const query = getQuery(event)
    const limitDays = parseInt(query.days as string) || 1

    if (latestSubmission) {
        lastSubmissionDate = latestSubmission.created_at
        const lastDate = new Date(lastSubmissionDate)
        const now = new Date()
        const limitInMs = limitDays * 24 * 60 * 60 * 1000

        // Check if less than the limit duration has passed
        if (now.getTime() - lastDate.getTime() < limitInMs) {
            questionLimitReached = true
        }
    }

    return {
        questionLimitReached,
        lastSubmissionDate
    }
})
