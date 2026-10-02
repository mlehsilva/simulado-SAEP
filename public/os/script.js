async function carregarDados() {
            try {
                // Carrega donos no select box
                const resClientes = await fetch('/api/clientes');
                if (resClientes.status === 401) { window.location.href = 'login.html'; return; }
                const clientes = await resClientes.json();
                const select = document.getElementById('cliente_id');
                select.innerHTML = '<option value="">-- Selecione o Proprietário --</option>';
                clientes.forEach(c => {
                    select.innerHTML += `<option value="${c.id}">${c.nome}</option>`;
                });

                // Carrega tabela de veículos
                const resVeiculos = await fetch('/api/veiculos');
                const veiculos = await resVeiculos.json();
                const tabela = document.getElementById('tabelaVeiculos');
                tabela.innerHTML = '';
                
                if (veiculos.length === 0) {
                    tabela.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #6c757d;">Nenhum veículo registrado.</td></tr>`;
                    return;
                }

                veiculos.forEach(v => {
                    tabela.innerHTML += `
                        <tr>
                            <td><strong>${v.placa}</strong></td>
                            <td>${v.marca} - ${v.modelo}</td>
                            <td>${v.ano}</td>
                            <td style="color: #0d6efd; font-weight: bold;">${v.dono}</td>
                        </tr>
                    `;
                });
            } catch (e) { console.error(e); }
        }

        document.getElementById('formVeiculo').addEventListener('submit', async (e) => {
            e.preventDefault();
            const dados = {
                placa: document.getElementById('placa').value,
                marca: document.getElementById('marca').value,
                modelo: document.getElementById('modelo').value,
                ano: document.getElementById('ano').value,
                cliente_id: document.getElementById('cliente_id').value
            };

            const response = await fetch('/api/veiculos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            if (response.ok) { document.getElementById('formVeiculo').reset(); carregarDados(); }
        });

        window.onload = carregarDados;