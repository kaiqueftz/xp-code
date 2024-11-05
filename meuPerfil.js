let usuarioId; // Declare a variável fora da função para que ela esteja no escopo global

async function buscarDadosUsuario() {
    usuarioId = localStorage.getItem('token'); // Obtém o token como ID do usuário
    console.log('ID do Usuário:', usuarioId); // Verifique se está correto

    if (!usuarioId) {
        console.error('Token não encontrado. Usuário não está logado.');
        alert('Você precisa estar logado para ver seus dados.');
        return;
    }

    // Decodifica o token para obter o ID do usuário
    try {
        const decoded = jwt_decode(usuarioId); // Usa jwt_decode para decodificar o token
        console.log('Decodificado:', decoded); // Mostra toda a estrutura decodificada

        // Aqui, você deve alterar 'sub' para o campo correto que contém o ID
        usuarioId = decoded.sub || decoded.id || decoded.user_id; // Ajuste conforme a estrutura do seu token

        console.log('ID do Usuário após decodificação:', usuarioId); // Verifique se está correto

        if (!usuarioId) {
            console.error('ID do Usuário inválido após decodificação:', usuarioId);
            alert('Erro ao obter o ID do usuário.');
            return;
        }

        const response = await fetch(`http://localhost:3000/usuario/${usuarioId}`);
        const usuario = await response.json();

        if (response.ok) {
            document.getElementById('nome').value = usuario.nome || '';
            document.getElementById('email').value = usuario.email || '';
            document.getElementById('cnpj').value = usuario.cnpj || '';
            document.getElementById('descricao').value = usuario.descricao || '';
            document.getElementById('cep').value = usuario.cep || '';
            document.getElementById('telefone').value = usuario.telefone || '';
            document.getElementById('horario').value = usuario.horario || '';
        } else {
            alert(usuario.message || 'Erro ao buscar os dados do usuário.');
        }
    } catch (error) {
        console.error('Erro ao buscar os dados do usuário:', error);
        alert('Erro ao buscar os dados do usuário');
    }
}

// Chama a função ao carregar a página
window.onload = buscarDadosUsuario;


async function atualizarConta() {
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const cnpj = document.getElementById('cnpj').value;
    const descricao = document.getElementById('descricao').value;
    const cep = document.getElementById('cep').value;
    const telefone = document.getElementById('telefone').value;
    const endereco = document.getElementById('endereco').value;
    const horario = document.getElementById('horario').value;

    try {
        const response = await fetch(`http://localhost:3000/usuario/${usuarioId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome, email, senha, cnpj, descricao, cep, telefone, endereco, horario }),
        });

        const data = await response.json();
        const mensagemDiv = document.getElementById('mensagem');

        if (response.ok) {
            mensagemDiv.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
        } else {
            mensagemDiv.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
        }
    } catch (error) {
        console.error('Erro ao atualizar a conta:', error);
        document.getElementById('mensagem').innerHTML = `<div class="alert alert-danger">Erro ao atualizar a conta</div>`;
    }
}

async function excluirConta() {
    if (confirm("Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.")) {
        try {
            const response = await fetch(`http://localhost:3000/usuario/${usuarioId}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            alert(data.message);
            // Redirecionar ou realizar outra ação após a exclusão
        } catch (error) {
            console.error('Erro ao excluir a conta:', error);
            alert('Erro ao excluir a conta');
        }
    }
}

// Carregar os dados do usuário ao carregar a página
window.onload = buscarDadosUsuario;
