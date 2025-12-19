import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    let user = await serverSupabaseUser(event)
    const client = await serverSupabaseClient(event)

    // Fallback: Check Authorization header if user is not found via cookies
    if (!user) {
        const authHeader = getHeader(event, 'Authorization')
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1]
            // We use the regular client to verify the token signature and get the user
            const { data: { user: authUser }, error } = await client.auth.getUser(token)
            if (authUser) {
                user = authUser
            }
        }
    }

    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
        })
    }

    // Initialize Service Role Client manually to bypass RLS
    // Usage of serverSupabaseServiceRole failed previously, likely due to env var mismatch.
    const supabaseUrl = process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        console.error('[ATM Submissions] Missing Supabase URL or Service Role Key')
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

    // Verify admin status
    // We use serviceRole to check profiles because RLS might hide other users' profiles
    const { data: profile, error: profileError } = await serviceRole
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

    if (profileError || !profile?.is_admin) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
        })
    }

    // Fetch submissions
    // Note: 'profiles(*)' join failed due to missing FK, so we fetch manually and join in memory
    const { data: submissions, error: submissionsError } = await serviceRole
        .from('atm_submissions')
        .select('*')
        .order('created_at', { ascending: false })

    if (submissionsError) {
        throw createError({
            statusCode: 500,
            statusMessage: submissionsError.message,
        })
    }

    // Manual Join: Fetch profiles
    const userIds = [...new Set(submissions.map((s) => s.user_id).filter(Boolean))]
    let profilesMap = {}

    if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await serviceRole
            .from('profiles')
            .select('*')
            .in('id', userIds)

        if (!profilesError) {
            profilesData.forEach(p => {
                profilesMap[p.id] = p
            })
        }
    }

    // Merge profiles into submissions
    return submissions.map(submission => {
        return {
            ...submission,
            profiles: profilesMap[submission.user_id] || null
        }
    })
})

