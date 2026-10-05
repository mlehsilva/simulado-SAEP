async function verificarSessao() {
    try {
        const response = await fetch('/api/usuario-logado');
        if (!response.ok) {
            window.location.href = '/login/index.html';
            return;
        }
        const dados = await response.json();
        document.getElementById('nomeUsuario').innerText = dados.nome;
    } catch (e) {
        window.location.href = '/login/index.html';
    }
}

async function fazerLogout() {
    await fetch('/api/logout');
    window.location.href = '/login/index.html';
}

window.onload = verificarSessao;
