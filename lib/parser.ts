
import { startOfDay, subDays } from 'date-fns';

export interface ParsedTransaction {
    amount: number;
    description: string;
    category: string;
    date: Date;
    type: 'income' | 'expense';
    status: 'success' | 'missing_amount' | 'needs_confirmation' | 'needs_details';
    installmentTotal?: number;
    installments?: number;
    missingField?: 'amount' | 'payment_method';
    paymentMethod?: 'pix' | 'credit' | 'debit' | 'cash' | 'trust' | 'unknown';
    brand?: string;
    brandLogo?: string;
}

const CATEGORIES: Record<string, string[]> = {
    Food: [
        'groceries', 'food', 'lunch', 'dinner', 'breakfast', 'snack', 'restaurant', 'coffee', 'burger', 'pizza', 'comida', 'almoco', 'jantar', 'cafe', 'lanche', 'mercado', 'restaurante', 'ifood', 'delivery', 'bar',
        'mcdonalds', 'bk', 'burger king', 'outback', 'starbucks', 'coco bambu', 'subway', 'pao de acucar', 'carrefour', 'extra', 'dia', 'atacadao', 'assai', 'whole foods', 'trader joes'
    ],
    Transport: [
        'uber', 'taxi', 'bus', 'train', 'gas', 'fuel', 'parking', 'metro', 'transporte', 'onibus', 'trem', 'gasolina', 'combustivel', 'estacionamento', '99', 'lyft',
        'shell', 'ipiranga', 'br', 'azul', 'gol', 'latam', 'passagem', 'pedagio', 'sem parar', 'veloe'
    ],
    Utilities: [
        'water', 'electricity', 'internet', 'phone', 'bill', 'rent', 'contas', 'agua', 'luz', 'energia', 'telefone', 'aluguel', 'internet', 'net', 'vivo', 'claro', 'tim', 'oi',
        'sabesp', 'enel', 'cpfl', 'condominio', 'iptu', 'ipva'
    ],
    Shopping: [
        'clothes', 'shoes', 'electronics', 'gift', 'amazon', 'compras', 'roupa', 'sapato', 'eletronico', 'presente', 'loja', 'shopping',
        'mercadolivre', 'shopee', 'shein', 'zara', 'nike', 'adidas', 'apple', 'aliexpress', 'magalu', 'casas bahia', 'fast shop',
        'macbook', 'iphone', 'ipad', 'notebook', 'laptop', 'computador', 'pc', 'mouse', 'teclado', 'monitor', 'tv', 'televisao', 'samsung', 'lg', 'sony',
        'celular', 'smartphone', 'tablet', 'kindle', 'fone', 'headphone', 'camera', 'videogame', 'game', 'console', 'ps5', 'xbox', 'switch'
    ],
    Entertainment: [
        'movie', 'netflix', 'spotify', 'game', 'cinema', 'concert', 'lazer', 'filme', 'jogo', 'show', 'assinatura', 'festa',
        'hbo', 'disney', 'prime video', 'steam', 'playstation', 'xbox', 'ingresso', 'sympla', 'twitch', 'youtube'
    ],
    Health: [
        'doctor', 'pharmacy', 'gym', 'medicine', 'hospital', 'saude', 'medico', 'farmacia', 'academia', 'remedio', 'drogasil',
        'smart fit', 'bluefit', 'raia', 'pague menos', 'unimed', 'bradesco saude', 'sulamerica', 'dentista', 'psicologo', 'terapia'
    ],
    Salary: ['salary', 'paycheck', 'bonus', 'salario', 'pagamento', 'renda', 'extra', 'freelance', 'projeto', 'venda', 'sold'],
};

// Genius 2.0: Brand Dictionary
export const BRANDS: Record<string, { name: string, keywords: string[], logo?: string }> = {
    netflix: { name: 'Netflix', keywords: ['netflix'], logo: 'https://www.google.com/s2/favicons?domain=netflix.com&sz=128' },
    spotify: { name: 'Spotify', keywords: ['spotify'], logo: 'https://www.google.com/s2/favicons?domain=spotify.com&sz=128' },
    uber: { name: 'Uber', keywords: ['uber'], logo: 'https://www.google.com/s2/favicons?domain=uber.com&sz=128' },
    ifood: { name: 'iFood', keywords: ['ifood'], logo: 'https://www.google.com/s2/favicons?domain=ifood.com.br&sz=128' },
    amazon: { name: 'Amazon', keywords: ['amazon', 'amzn'], logo: 'https://www.google.com/s2/favicons?domain=amazon.com&sz=128' },
    apple: { name: 'Apple', keywords: ['apple', 'itunes', 'app store', 'macbook', 'iphone', 'ipad'], logo: 'https://www.google.com/s2/favicons?domain=apple.com&sz=128' },
    mcdonalds: { name: 'McDonald\'s', keywords: ['mcdonalds', 'mcdonald\'s', 'mc donalds'], logo: 'https://www.google.com/s2/favicons?domain=mcdonalds.com&sz=128' },
    burgerking: { name: 'Burger King', keywords: ['burger king', 'bk'], logo: 'https://www.google.com/s2/favicons?domain=bk.com&sz=128' },
    starbucks: { name: 'Starbucks', keywords: ['starbucks'], logo: 'https://www.google.com/s2/favicons?domain=starbucks.com&sz=128' },
    shopee: { name: 'Shopee', keywords: ['shopee'], logo: 'https://www.google.com/s2/favicons?domain=shopee.com.br&sz=128' },
    mercadolivre: { name: 'Mercado Livre', keywords: ['mercado livre', 'mercadolivre'], logo: 'https://www.google.com/s2/favicons?domain=mercadolivre.com.br&sz=128' },
    shein: { name: 'Shein', keywords: ['shein'], logo: 'https://www.google.com/s2/favicons?domain=shein.com&sz=128' },
    zara: { name: 'Zara', keywords: ['zara'], logo: 'https://www.google.com/s2/favicons?domain=zara.com&sz=128' },
    nike: { name: 'Nike', keywords: ['nike'], logo: 'https://www.google.com/s2/favicons?domain=nike.com&sz=128' },
    adidas: { name: 'Adidas', keywords: ['adidas'], logo: 'https://www.google.com/s2/favicons?domain=adidas.com&sz=128' },
    nubank: { name: 'Nubank', keywords: ['nubank', 'nu pagamentos'], logo: 'https://www.google.com/s2/favicons?domain=nubank.com.br&sz=128' },
    smartfit: { name: 'Smart Fit', keywords: ['smart fit', 'smartfit'], logo: 'https://www.google.com/s2/favicons?domain=smartfit.com.br&sz=128' },
    samsung: { name: 'Samsung', keywords: ['samsung', 'galaxy'], logo: 'https://www.google.com/s2/favicons?domain=samsung.com&sz=128' },
};

export function parseMessage(content: string): ParsedTransaction | null {
    const lower = content.toLowerCase();

    // 1. Extract amount (supporting integers and decimals)
    const amountMatch = content.match(/(\d+[.,]?\d*)/);

    let amount = 0;
    let missingField: 'amount' | undefined;
    let status: ParsedTransaction['status'] = 'success';

    if (!amountMatch) {
        status = 'missing_amount';
        missingField = 'amount';
    } else {
        const amountStr = amountMatch[1].replace(',', '.');
        amount = parseFloat(amountStr);
    }

    // 2. Identify type
    const incomeVerbs = ['received', 'earned', 'ganhei', 'recebi', 'faturei', 'entrada'];
    const incomeNouns = ['salary', 'deposit', 'bonus', 'salario', 'deposito', 'extra', 'ganho', 'renda', 'freelance', 'projeto', 'project', 'venda', 'sold'];

    const isIncome = [...incomeVerbs, ...incomeNouns, 'income'].some(k => lower.includes(k));
    const type = isIncome ? 'income' : 'expense';

    // 3. Identify Date (Time Travel 📅)
    let date = new Date();
    const todayKeywords = ['today', 'now', 'hoje', 'agora'];
    const yesterdayKeywords = ['yesterday', 'ontem', 'anteontem'];

    if (lower.includes('ontem')) {
        date = subDays(new Date(), 1);
    } else if (lower.includes('anteontem')) {
        date = subDays(new Date(), 2);
    } else if (yesterdayKeywords.some(k => lower.includes(k) && !lower.includes('ontem'))) {
        date = subDays(new Date(), 1);
    } else {
        const dayMatch = lower.match(/dia\s+(\d+)/);
        if (dayMatch) {
            const day = parseInt(dayMatch[1]);
            date.setDate(day);
            if (date > new Date(new Date().setDate(new Date().getDate() + 2))) {
                date.setMonth(date.getMonth() - 1);
            }
        }
    }

    // 4. Installment Logic (Parcelado 🇧🇷)
    let installmentInfo = "";
    let installmentTotal = 0;
    let installmentsCount = 0;

    const installmentMatch = lower.match(/(?:em\s+)?(\d+)\s*x|(?:em\s+)(\d+)\s*vezes/);
    if (installmentMatch) {
        const installments = parseInt(installmentMatch[1] || installmentMatch[2]);
        if (installments > 1 && status === 'success') {
            status = 'needs_confirmation';
            installmentTotal = amount;
            installmentsCount = installments;

            amount = amount / installments;
            amount = Math.round(amount * 100) / 100;
            installmentInfo = `(1/${installments})`;
        }
    }

    // 5. Clean description
    let description = lower;
    if (amountMatch) {
        description = lower.replace(amountMatch[0], '');
    }

    const keywordsToRemove = [
        ...incomeVerbs, 'income', ...todayKeywords, ...yesterdayKeywords,
        'spent', 'paid', 'on', 'for', 'buy', 'bought',
        'gastei', 'paguei', 'em', 'no', 'na', 'para', 'comprei', 'compras', 'com', 'de', 'do', 'da',
        'x', 'vezes', 'parcelado', 'dia', 'custou', 'valor', 'foi',
        'r$', 'rs', 'reais', 'real', '$', 'custa'
    ];

    description = description.replace(new RegExp(`\\b(${keywordsToRemove.join('|')})\\b`, 'g'), '');
    description = description.replace(/[$]/g, ''); // Remove stray $ symbols not caught by word boundary
    if (installmentMatch) description = description.replace(installmentMatch[0], '');

    description = description.replace(/\s+/g, ' ').trim();

    if (!description && status !== 'missing_amount') {
        if (type === 'income') description = 'Income';
        else description = 'Expense';
    }

    // Append Installment Info (only if success, otherwise wait for confirmation)
    if (status === 'success' && installmentInfo) {
        description = description.charAt(0).toUpperCase() + description.slice(1);
        description = `${description} ${installmentInfo}`;
    } else if (description) {
        description = description.charAt(0).toUpperCase() + description.slice(1);
    }

    // 6. Infer Category
    let category = "General";
    for (const [cat, keywords] of Object.entries(CATEGORIES)) {
        if (keywords.some(k => uniqueCheck(description, lower, k))) {
            category = cat;
            break;
        }
    }

    // Special case: Salary
    if (type === 'income') {
        if (description.toLowerCase().includes('salary') || description.toLowerCase().includes('salario') || description.toLowerCase().includes('freelance') || description.toLowerCase().includes('projeto')) {
            category = 'Salary';
        }
    }

    // 7. Payment Method
    let paymentMethod: ParsedTransaction['paymentMethod'] = 'unknown';
    if (lower.includes('pix')) paymentMethod = 'pix';
    else if (lower.includes('credito') || lower.includes('crédito') || lower.includes('cartao') || lower.includes('cartão')) paymentMethod = 'credit';
    else if (lower.includes('debito') || lower.includes('débito')) paymentMethod = 'debit';
    else if (lower.includes('dinheiro') || lower.includes('cedula') || lower.includes('cédula')) paymentMethod = 'cash';
    else if (lower.includes('a vista') || lower.includes('à vista')) paymentMethod = 'cash';
    else if (lower.includes('fiado') || lower.includes('confiança') || lower.includes('confianca') || lower.includes('pendura') || lower.includes('particular')) paymentMethod = 'trust';

    // 8. Brand Detection (Genius 2.0)
    let brand: string | undefined;
    let brandLogo: string | undefined;

    for (const [key, b] of Object.entries(BRANDS)) {
        if (b.keywords.some(k => lower.includes(k))) {
            brand = b.name;
            brandLogo = b.logo;
            // Optional: If brand is detected, we can clean the description further?
            // E.g. "Uber Trip 123" -> Brand: Uber. Description: "Uber Trip".
            // For now, let's keep description as is, but 'brand' field will be used for analytics.
            break;
        }
    }

    return {
        amount,
        description,
        category,
        date: startOfDay(date),
        type,
        status,
        installmentTotal: installmentTotal || undefined,
        installments: installmentsCount || undefined,
        missingField,
        paymentMethod,
        brand,
        brandLogo
    };
}

function uniqueCheck(desc: string, lower: string, keyword: string) {
    return desc.toLowerCase().includes(keyword) || lower.includes(keyword);
}
