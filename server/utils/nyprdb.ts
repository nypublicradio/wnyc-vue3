/**
 * Class to handle all database queries
 */

export class NyprDb {
    constructor(supabase) {
        this.supabase = supabase;
    }
    
    async getNPRShows() {
        const { data, error } = await this.supabase
            .from('shows')
            .select('*')
            .eq('cmsSource', 'NPR')
            .order('title', { ascending: false });
        return data;
    }
}