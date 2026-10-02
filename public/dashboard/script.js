async function verificarSessao() {
    try {
        const response = await fetch('/api/usuario-logado');
        if (!response.ok) {
            window.location.href = '/login/index.html'; // Corrigido com / no início
            return;
        }
        const dados = await response.json();
        document.getElementById('nomeUsuario').innerText = dados.nome;
    } catch (e) {
        window.location.href = '/login/index.html'; // Corrigido com / no início
    }
}

async function fazerLogout() {
    await fetch('/api/logout');
    window.location.href = '/login/index.html'; // Corrigido com / no início
}

window.onload = verificarSessao;
