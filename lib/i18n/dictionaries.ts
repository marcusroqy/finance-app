export type Locale = 'en' | 'pt';

export const dictionaries = {
    en: {
        sidebar: {
            dashboard: 'Dashboard',
            chat: 'Chat',
            settings: 'Settings',
            signOut: 'Sign Out',
            appName: 'Finance AI',
        },
        chat: {
            welcome: 'Finance AI',
            description: 'Track your money with natural language.',
            helpText: 'Try typing something like:',
            actions: {
                expense: 'Add Expense',
                income: 'Add Income',
            },
            examples: {
                expense: [
                    'Lunch at Burger King $15',
                    'Uber to work $22.50',
                    'Netflix subscription $12',
                    'Groceries at Walmart $45.00'
                ],
                income: [
                    'Salary received $5000',
                    'Freelance project $500',
                    'Sold old bike $150'
                ]
            },
            inputPlaceholder: 'Type a command (e.g., "Spent $15 on lunch")...',
            sending: 'Processing...',
            footer: 'Press Enter to send',
            user: 'You',
            ai: 'Finance AI',
        },
        dashboard: {
            title: 'Dashboard',
            overview: 'Overview of your recent financial activity.',
            recentTransactions: 'Recent Transactions',
            totalBalance: 'Total Balance',
            income: 'Income',
            expenses: 'Expenses',
            loading: 'Loading...',
            noTransactions: 'No transactions found. Start chatting to add some!',
            chartTitle: 'Last 7 Days Activity',
        },
        transactions: {
            income: 'Income',
            expense: 'Expense',
            edit: 'Edit',
            delete: 'Delete',
            successfullyDeleted: 'Transaction deleted',
            deleteError: 'Could not delete transaction',
            successfullyUpdated: 'Transaction updated',
            updateError: 'An error occurred',
            title: 'Edit Transaction',
            type: 'Type',
            amount: 'Amount',
            description: 'Description',
            category: 'Category',
            save: 'Save changes',
            selectType: 'Select type',
        },
        categories: {
            Food: 'Food',
            Transport: 'Transport',
            Utilities: 'Utilities',
            Shopping: 'Shopping',
            Entertainment: 'Entertainment',
            Health: 'Health',
            Salary: 'Salary',
            General: 'General',
            Income: 'Income',
        },
        settings: {
            language: 'Language',
            theme: 'Theme',
            selectLanguage: 'Select your preferred language',
            selectTheme: 'Choose your interface theme',
        }
    },
    pt: {
        sidebar: {
            dashboard: 'Painel',
            chat: 'Chat',
            settings: 'Configurações',
            signOut: 'Sair',
            appName: 'Finanças IA',
        },
        chat: {
            welcome: 'Finanças IA',
            description: 'Controle seu dinheiro usando linguagem natural.',
            helpText: 'Tente digitar algo como:',
            actions: {
                expense: 'Adicionar Despesa',
                income: 'Adicionar Receita',
            },
            examples: {
                expense: [
                    'Almoço no Burger King R$15',
                    'Uber para o trabalho R$22,50',
                    'Assinatura Netflix R$12',
                    'Compras no mercado R$150'
                ],
                income: [
                    'Recebi salário R$5000',
                    'Projeto freelance R$500',
                    'Vendi bicicleta velha R$150'
                ]
            },
            inputPlaceholder: 'Digite um comando (ex: "Gastei R$15 no almoço")...',
            sending: 'Processando...',
            footer: 'Pressione Enter para enviar',
            user: 'Você',
            ai: 'Finanças IA',
        },
        dashboard: {
            title: 'Painel',
            overview: 'Visão geral da sua atividade financeira recente.',
            recentTransactions: 'Transações Recentes',
            totalBalance: 'Saldo Total',
            income: 'Receitas',
            expenses: 'Despesas',
            loading: 'Carregando...',
            noTransactions: 'Nenhuma transação encontrada. Comece a conversar para adicionar!',
            chartTitle: 'Atividade dos Últimos 7 Dias',
        },
        transactions: {
            income: 'Receita',
            expense: 'Despesa',
            edit: 'Editar',
            delete: 'Excluir',
            successfullyDeleted: 'Transação excluída com sucesso',
            deleteError: 'Erro ao excluir transação',
            successfullyUpdated: 'Transação atualizada',
            updateError: 'Erro ao atualizar',
            title: 'Editar Transação',
            type: 'Tipo',
            amount: 'Valor',
            description: 'Descrição',
            category: 'Categoria',
            save: 'Salvar alterações',
            selectType: 'Selecione o tipo',
        },
        categories: {
            Food: 'Alimentação',
            Transport: 'Transporte',
            Utilities: 'Contas',
            Shopping: 'Compras',
            Entertainment: 'Lazer',
            Health: 'Saúde',
            Salary: 'Salário',
            General: 'Geral',
            Income: 'Receita',
        },
        settings: {
            language: 'Idioma',
            theme: 'Tema',
            selectLanguage: 'Selecione seu idioma preferido',
            selectTheme: 'Escolha o tema da interface',
        }
    }
};
