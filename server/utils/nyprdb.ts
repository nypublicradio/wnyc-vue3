/**
 * Class to handle all database queries
 */

export class NyprDb {
    supabase: any;

    constructor(supabase) {
        this.supabase = supabase;
    }

    // Get all NPR shows
    async getNPRShows() {
        const { data } = await this.supabase
            .from('shows')
            .select('*')
            .eq('cmsSource', 'NPR')
            .order('title', { ascending: false });
        return data;
    }
    // Get NPR show by slug
    async getNPRShowBySlug(slug) {
        const { data } = await this.supabase
            .from('shows')
            .select('*')
            .eq('slug', slug);
        return data;
    }
}