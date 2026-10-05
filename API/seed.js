const db = require('./db');
const bcrypt = require('bcryptjs');

async function popularBanco() {
    const usuarios = [
        { nome: 'Carlos Admin', email: 'admin@autofix.com', senha: 'admin123' },
        { nome: 'Rodrigo Mecanico', email: 'mecanico@autofix.com', senha: 'mecano123' },
        { nome: 'Ana Atendente', email: 'atendente@autofix.com', senha: 'recepcao123' }
    ];

    console.log('Limpando usuários antigos com esses e-mails...');
    const emails = usuarios.map(u => u.email);
    
    db.query('DELETE FROM usuarios WHERE email IN (?, ?, ?)', emails, async (err) => {
        if (err) {
            console.error('Erro ao limpar banco:', err.message);
            process.exit(1);
        }

        for (const user of usuarios) {
            // Gera a hash perfeitamente compatível com o seu bcryptjs do projeto
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(user.senha, salt);

            db.query('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)', 
            [user.nome, user.email, hash], (err) => {
                if (err) {
                    console.error(`Erro ao inserir ${user.nome}:`, err.message);
                } else {
                    console.log(`✅ Usuário criado: ${user.email} | Senha: ${user.senha}`);
                }
            });
        }
        
        // Aguarda um momento para fechar a conexão após os inserts
        setTimeout(() => {
            console.log('\nPronto! Banco atualizado. Pode testar o login.');
            process.exit();
        }, 1500);
    });
}

popularBanco();
