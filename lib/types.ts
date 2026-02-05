export interface Transaction {
    id: string
    user_id: string
    household_id?: string
    type: 'income' | 'expense'
    amount: number
    category: string
    description: string
    date: string
    created_at: string
    brand?: string
    brand_logo_url?: string
}

export type CreateTransactionDTO = Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export interface Profile {
    id: string
    updated_at: string
    full_name?: string
    avatar_url?: string
    website?: string
    email?: string // Usually from auth, but maybe stored for display
}

// Household types
export interface Household {
    id: string
    name: string
    created_by: string
    created_at: string
}

export interface HouseholdMember {
    id: string
    household_id: string
    user_id: string
    role: 'owner' | 'member'
    joined_at: string
    // Joined from profiles table
    profile?: {
        full_name?: string
        email?: string
        avatar_url?: string
    }
}

export interface HouseholdInvite {
    id: string
    household_id: string
    email: string
    invited_by: string
    status: 'pending' | 'accepted' | 'rejected' | 'expired'
    token: string
    expires_at: string
    created_at: string
    // Joined data
    household?: Household
}

