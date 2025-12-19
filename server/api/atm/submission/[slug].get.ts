import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    let user = await serverSupabaseUser(event)
    const client = await serverSupabaseClient(event)
    const slug = getRouterParam(event, 'slug')

    // Fallback: Check Authorization header
    if (!user) {
        const authHeader = getHeader(event, 'Authorization')
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1]
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

    // Initialize Service Role Client
    const supabaseUrl = process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        console.error('[ATM Submission] Missing Supabase URL or Service Role Key')
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

    // Fetch submission
    const { data: submission, error: submissionError } = await serviceRole
        .from('atm_submissions')
        .select('*')
        .eq('video_filename', slug)
        .single()

    if (submissionError) {
        throw createError({
            statusCode: 500,
            statusMessage: submissionError.message,
        })
    }

    if (!submission) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Submission not found',
        })
    }

    // Fetch profile
    let profileData = null
    if (submission.user_id) {
        const { data, error } = await serviceRole
            .from('profiles')
            .select('*')
            .eq('id', submission.user_id)
            .single()

        if (!error && data) {
            profileData = data
        }
    }

    // Generate Video URL
    let videoUrl = null
    if (submission.video_filename) {
        const path = submission.subfolder_date
            ? `atm/${submission.subfolder_date}/${submission.video_filename}`
            : `atm/${submission.video_filename}`

        const { data: urlData } = serviceRole.storage
            .from("media")
            .getPublicUrl(path)
        videoUrl = urlData.publicUrl
    }

    return {
        ...submission,
        profiles: profileData,
        videoUrl
    }
})
