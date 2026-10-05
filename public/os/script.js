document.addEventListener('DOMContentLoaded', () => {
    verificarSessao();
    carregarClientes();
    carregarVeiculos();
    carregarOrdensServico();

    // Formulário limpo (sem situação no cadastro)
    document.getElementById('formOS').addEventListener('submit', async (e) => {
        e.preventDefault();
        exibirMensagem('', false);

        const dados = {
            cliente_id: document.getElementById('selectCliente').value,
            veiculo_id: document.getElementById('selectVeiculo').value,
            descricao_problema: document.getElementById('descricaoProblema').value,
            valor_total: document.getElementById('valorTotal').value
        };

        try {
            const response = await fetch('/api/ordens-servico', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            const resultado = await response.json();

            if (response.ok && resultado.sucesso) {
                exibirMensagem('Ordem de Serviço aberta com sucesso!', true);
                document.getElementById('formOS').reset();
                carregarOrdensServico();
            } else {
                exibirMensagem(resultado.erro || 'Erro ao abrir Ordem de Serviço.', false);
            }
        } catch (error) {
            exibirMensagem('Erro ao conectar com o servidor.', false);
        }
    });

    document.getElementById('btnLogout').addEventListener('click', (e) => {
        e.preventDefault();
        fetch('/api/logout')
            .then(() => window.location.href = '../login/index.html')
            .catch(err => console.error('Erro ao sair:', err));
    });
});

function verificarSessao() {
    fetch('/api/usuario-logado')
        .then(res => {
            if (res.status === 401) window.location.href = '../login/index.html';
        })
        .catch(err => console.error('Erro na sessão:', err));
}

async function carregarClientes() {
    try {
        const response = await fetch('/api/clientes');
        if (!response.ok) return;
        const clientes = await response.json();
        const select = document.getElementById('selectCliente');
        clientes.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = `${c.nome} (CPF: ${c.cpf_limpo || 'Criptografado'})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
    }
}

async function carregarVeiculos() {
    try {
        const response = await fetch('/api/veiculos');
        if (!response.ok) return;
        const veiculos = await response.json();
        const select = document.getElementById('selectVeiculo');
        veiculos.forEach(v => {
            const option = document.createElement('option');
            option.value = v.id;
            option.textContent = `${v.marca} ${v.modelo} - Placa: ${v.placa} (${v.dono})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar veículos:', error);
    }
}

// FUNÇÃO PARA ENVIAR A ATUALIZAÇÃO AO BANCO DE DADOS
async function alterarSituacao(id, novaSituacao) {
    try {
        const response = await fetch(`/api/ordens-servico/${id}/situacao`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ situacao: novaSituacao })
        });
        
        if (response.ok) {
            carregarOrdensServico(); // Atualiza cores e tabela
        } else {
            alert('Erro ao atualizar a situação no servidor.');
        }
    } catch (error) {
        console.error('Erro na requisição PUT:', error);
    }
}

async function carregarOrdensServico() {
    try {
        const response = await fetch('/api/ordens-servico');
        if (!response.ok) return;
        const ordens = await response.json();
        
        const tabela = document.getElementById('tabelaOS');
        tabela.innerHTML = '';

        if (ordens.length === 0) {
            tabela.innerHTML = `<tr><td colspan="7" style="padding: 10px; text-align: center;">Nenhuma OS registrada até o momento.</td></tr>`;
            return;
        }

        ordens.forEach(os => {
            const dataFormatada = new Date(os.data_abertura).toLocaleString('pt-BR');
            const valorFormatado = parseFloat(os.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            
            let corStatus = '#6c757d'; // Não Iniciado (Cinza)
            if (os.situacao === 'Em Andamento') corStatus = '#0d6efd'; // Azul
            if (os.situacao === 'Concluído') corStatus = '#198754'; // Verde

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${os.id}</td>
                <td>${os.cliente_nome}</td>
                <td>${os.veiculo_modelo} (${os.veiculo_placa})</td>
                <td>${os.descricao_problema}</td>
                <td>
                    <!-- CORRIGIDO: Adicionado aspas simples (') ao redor de this.value para enviar como string literal -->
                    <select onchange="alterarSituacao(${os.id}, this.value)" style="background-color: ${corStatus}; color: white; padding: 4px 8px; border-radius: 4px; border: none; font-weight: 600; font-size: 12px; cursor: pointer;">
                        <option value="Não Iniciado" ${os.situacao === 'Não Iniciado' ? 'selected' : ''}>Não Iniciado</option>
                        <option value="Em Andamento" ${os.situacao === 'Em Andamento' ? 'selected' : ''}>Em Andamento</option>
                        <option value="Concluído" ${os.situacao === 'Concluído' ? 'selected' : ''}>Concluído</option>
                    </select>
                </td>
                <td style="font-weight: bold;">${valorFormatado}</td>
                <td>${dataFormatada}</td>
            `;
            tabela.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro ao carregar ordens de serviço:', error);
    }
}

function exibirMensagem(texto, sucesso) {
    const div = document.getElementById('mensagemStatus');
    if (!texto) {
        div.style.display = 'none';
        return;
    }
    div.innerText = texto;
    div.style.color = sucesso ? '#155724' : '#721c24';
    div.style.backgroundColor = sucesso ? '#d4edda' : '#f8d7da';
    div.style.display = 'block';
}
