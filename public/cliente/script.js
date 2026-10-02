async function carregarClientes() {
            const busca = document.getElementById('inputBusca').value;
            try {
                const response = await fetch(`/api/clientes?busca=${busca}`);
                if (response.status === 401) { window.location.href = 'login.html'; return; }
                
                const clientes = await response.json();
                const tabela = document.getElementById('tabelaClientes');
                tabela.innerHTML = ''; 

                if (clientes.length === 0) {
                    tabela.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #6c757d;">Nenhum cliente cadastrado.</td></tr>`;
                    return;
                }

                clientes.forEach(c => {
                    tabela.innerHTML += `
                        <tr>
                            <td><strong>${c.nome}</strong></td>
                            <td><span class="badge">${c.cpf_limpo}</span></td>
                            <td>${c.telefone || '---'}</td>
                            <td><button class="btn btn-danger" onclick="deletarCliente(${c.id})">Excluir</button></td>
                        </tr>
                    `;
                });
            } catch (error) { console.error(error); }
        }

        document.getElementById('formCliente').addEventListener('submit', async (e) => {
            e.preventDefault();
            const dados = {
                nome: document.getElementById('nome').value,
                cpf: document.getElementById('cpf').value,
                telefone: document.getElementById('telefone').value,
                email: document.getElementById('email').value
            };
            const response = await fetch('/api/clientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            if (response.ok) { document.getElementById('formCliente').reset(); carregarClientes(); }
        });

        async function deletarCliente(id) {
            if (!confirm('Deseja mesmo excluir?')) return;
            const response = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
            if (response.ok) carregarClientes();
        }

        window.onload = carregarClientes;
    