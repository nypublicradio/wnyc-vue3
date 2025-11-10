import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Interface for show data
 */
interface Show {
    readonly id?: number;
    readonly showId?: number | null;
    readonly title?: string | null;
    readonly slug?: string | null;
    readonly description?: string | null;
    readonly cmsSource?: string | null;
    readonly featured?: boolean | null;
    readonly createdAt?: string;
    readonly guid?: string | null;
}

/**
 * Interface for transaction data
 */
interface Transaction {
    readonly id?: number;
    readonly salesforce_id?: string | null;
    readonly springboard_id?: number | null;
    readonly type?: string | null;
    readonly status?: string | null;
    readonly created_at?: string;
    readonly updated_at?: string | null;
}

/**
 * Interface for transaction insert data
 */
interface TransactionInsert {
    readonly salesforce_id?: string | null;
    readonly springboard_id?: number | null;
    readonly type?: string | null;
    readonly status?: string | null;
    readonly new_amount?: number | null;
}

/**
 * Interface for transaction update data
 */
interface TransactionUpdate {
    readonly salesforce_id?: string | null;
    readonly springboard_id?: string | null;
    readonly type?: string | null;
    readonly status?: string | null;
    readonly new_amount?: number | null;
    readonly updated_at?: string | null;
}

/**
 * Class to handle all database queries
 */

export class NyprDb {
    supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    // Get all NPR shows
    async getNPRShows(): Promise<Show[] | null> {
        const { data } = await this.supabase
            .from('shows')
            .select('*')
            .eq('cmsSource', 'NPR')
            .order('title', { ascending: false });
        return data;
    }

    // Get NPR show by slug
    async getNPRShowBySlug(slug: string): Promise<Show[] | null> {
        const { data } = await this.supabase
            .from('shows')
            .select('*')
            .eq('slug', slug);
        return data;
    }

    // return the slug for NPR shows from Supabase by providing the showId
    async getNPRSlugFromSupabase(showId: number): Promise<string | null> {
        const { data, error } = await this.supabase
            .from("shows")
            .select("slug")
            .eq("showId", showId)
            .single()

        if (error) {
            console.error("Error fetching slug:", error)
            return null
        }
        return data?.slug ?? null
    }

    /**
     * Insert a new transaction
     */
    async insertTransaction(transaction: TransactionInsert): Promise<Transaction | null> {
        const { data, error } = await this.supabase
            .from('transaction')
            .insert(transaction)
            .select()
            .single();

        if (error) {
            console.error('Error inserting transaction:', error);
            return null;
        }

        return data;
    }

    /**
     * Update an existing transaction by id
     */
    async updateTransaction(id: number, updates: TransactionUpdate): Promise<Transaction | null> {
        const { data, error } = await this.supabase
            .from('transaction')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating transaction:', error);
            return null;
        }

        return data;
    }

    /**
     * Update transaction by salesforce_id
     */
    async updateTransactionBySalesforceId(salesforce_id: string, updates: TransactionUpdate): Promise<Transaction | null> {
        const { data, error } = await this.supabase
            .from('transaction')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('salesforce_id', salesforce_id)
            .select()
            .single();

        if (error) {
            console.error('Error updating transaction by salesforce_id:', error);
            return null;
        }

        return data;
    }

    /**
     * Update transaction by springboard_id
     */
    async updateTransactionBySpringboardId(springboard_id: string, updates: TransactionUpdate): Promise<Transaction | null> {
        const { data, error } = await this.supabase
            .from('transaction')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('springboard_id', springboard_id)
            .select()
            .single();

        if (error) {
            console.error('Error updating transaction by springboard_id:', error);
            return null;
        }

        return data;
    }

}