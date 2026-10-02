document.getElementById('formLogin').addEventListener('submit', async (e) => {
            e.preventDefault();
            const divErro = document.getElementById('mensagemErro');
            divErro.style.display = 'none';

            const dados = {
                email: document.getElementById('email').value,
                senha: document.getElementById('senha').value
            };

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                });

                const resultado = await response.json();

                if (response.ok && resultado.sucesso) {
                    window.location.href = 'dashboard.html';
                } else {
                    divErro.innerText = resultado.erro || 'Falha na autenticação.';
                    divErro.style.display = 'block';
                }
            } catch (error) {
                divErro.innerText = 'Erro ao conectar ao servidor.';
                divErro.style.display = 'block';
            }
        });