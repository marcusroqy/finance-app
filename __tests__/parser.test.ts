
import { describe, it, expect } from 'vitest';
import { parseMessage } from '../lib/parser';
import { subDays, startOfDay } from 'date-fns';

describe('Message Parser', () => {
    it('parses simple expense', () => {
        const result = parseMessage('Spent 50 on groceries');
        expect(result).toMatchObject({
            amount: 50,
            description: 'Groceries',
            category: 'Food',
            type: 'expense'
        });
    });

    it('parses simple income', () => {
        const result = parseMessage('Received 1000 salary');
        expect(result).toMatchObject({
            amount: 1000,
            category: 'Salary',
            type: 'income'
        });
    });

    it('parses date: yesterday', () => {
        const result = parseMessage('Lunch 20 yesterday');
        const yesterday = startOfDay(subDays(new Date(), 1));
        expect(result?.date).toEqual(yesterday);
    });

    it('infers category from keywords', () => {
        expect(parseMessage('Uber 15')?.category).toBe('Transport');
        expect(parseMessage('Netflix 10')?.category).toBe('Entertainment');
        expect(parseMessage('Pharmacy 50')?.category).toBe('Health');
    });

    it('handles decimal amounts', () => {
        expect(parseMessage('Coffee 4.50')?.amount).toBe(4.5);
        expect(parseMessage('Coffee 4,50')?.amount).toBe(4.5);
    });

    it('returns null for invalid input', () => {
        expect(parseMessage('Hello world')).toBeNull();
    });
});
