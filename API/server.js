const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const CryptoJS = require('crypto-js');
const path = require('path');
const db = require('./db'); // Puxa a conexão do seu arquivo db.js

const app = express();
const SECRET_KEY = 'autofix_lgpd_secret'; // Chave para criptografar os CPFs

// Configurações para ler formulários e JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve os arquivos da sua pasta 'public' (HTMLs, CSS, JS frontend)
app.use(express.static(path.join(__dirname, '../public')));

// Controle de Sessão com Expiração por Inatividade (LGPD)
app.use(session({
    secret: 'sessao_segura_autofix',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 10 * 60 * 1000 } // 10 minutos de inatividade
}));

// Middleware para proteger as rotas de dados
function verificarAutenticacao(req, res, next) {
    if (req.session.usuarioId) {
        return next();
    }
    res.status(401).json({ erro: 'Não autorizado. Faça login.' });
}

// ================= ROTAS DE AUTENTICAÇÃO =================
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;
    
    db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro no servidor.' });
        if (results.length === 0) return res.status(401).json({ erro: 'Credenciais incorretas.' });

        const usuario = results[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        
        if (!senhaValida) return res.status(401).json({ erro: 'Credenciais incorretas.' });

        req.session.usuarioId = usuario.id;
        req.session.usuarioNome = usuario.nome;
        
        res.json({ sucesso: true, usuario: usuario.nome });
    });
});

app.get('/api/usuario-logado', (req, res) => {
    if (req.session.usuarioNome) {
        res.json({ nome: req.session.usuarioNome });
    } else {
        res.status(401).json({ erro: 'Ninguém logado' });
    }
});

app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ sucesso: true });
});

// ================= API GESTÃO DE CLIENTES =================
app.get('/api/clientes', verificarAutenticacao, (req, res) => {
    const busca = req.query.busca || '';
    
    db.query('SELECT * FROM clientes', (err, results) => {
        if (err) return res.status(500).json({ erro: err.message });

        // Descriptografa os CPFs na memória para filtragem e exibição em conformidade com a LGPD
        const listaClientes = results.map(c => {
            try {
                const bytes = CryptoJS.AES.decrypt(c.cpf, SECRET_KEY);
                c.cpf_limpo = bytes.toString(CryptoJS.enc.Utf8);
            } catch (e) {
                c.cpf_limpo = 'Erro LGPD';
            }
            return c;
        });

        const filtrados = listaClientes.filter(c => 
            c.nome.toLowerCase().includes(busca.toLowerCase()) || c.cpf_limpo.includes(busca)
        );

        res.json(filtrados);
    });
});

app.post('/api/clientes', verificarAutenticacao, (req, res) => {
    const { nome, cpf, telefone, email } = req.body;
    // Criptografa o CPF antes de gravar no banco de dados (LGPD)
    const cpfCriptografado = CryptoJS.AES.encrypt(cpf, SECRET_KEY).toString();

    db.query('INSERT INTO clientes (nome, cpf, telefone, email) VALUES (?, ?, ?, ?)', 
    [nome, cpfCriptografado, telefone, email], (err) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ sucesso: true });
    });
});

app.delete('/api/clientes/:id', verificarAutenticacao, (req, res) => {
    db.query('DELETE FROM clientes WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ sucesso: true });
    });
});

// ================= API GESTÃO DE VEÍCULOS =================
app.get('/api/veiculos', verificarAutenticacao, (req, res) => {
    db.query('SELECT v.*, c.nome as dono FROM veiculos v JOIN clientes c ON v.cliente_id = c.id', (err, results) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(results);
    });
});

app.post('/api/veiculos', verificarAutenticacao, (req, res) => {
    const { placa, marca, modelo, ano, cliente_id } = req.body;
    db.query('INSERT INTO veiculos (placa, marca, modelo, ano, cliente_id) VALUES (?, ?, ?, ?, ?)', 
    [placa, marca, modelo, ano, cliente_id], (err) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ sucesso: true });
    });
});

// ================= API ORDENS DE SERVIÇO (OS) =================
app.get('/api/ordens-servico', verificarAutenticacao, (req, res) => {
    const query = `
        SELECT os.*, c.nome as cliente_nome, v.modelo as veiculo_modelo, v.placa as veiculo_placa 
        FROM ordens_servico os
        JOIN clientes c ON os.cliente_id = c.id
        JOIN veiculos v ON os.veiculo_id = v.id
        ORDER BY os.data_abertura DESC`;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(results);
    });
});

app.post('/api/ordens-servico', verificarAutenticacao, (req, res) => {
    const { descricao_problema, valor_total, cliente_id, veiculo_id } = req.body;
    db.query('INSERT INTO ordens_servico (descricao_problema, valor_total, cliente_id, veiculo_id) VALUES (?, ?, ?, ?)', 
    [descricao_problema, valor_total, cliente_id, veiculo_id], (err) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ sucesso: true });
    });
});

// Inicializa o servidor na porta 3000
app.listen(3000, () => {
    console.log('API AutoFix rodando em http://localhost:3000');
});
