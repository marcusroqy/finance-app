export interface Transaction {
    id: string
    user_id: string
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
