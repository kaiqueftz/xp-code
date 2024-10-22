// Função de login
async function login() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
  
    const response = await fetch('/usuario/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, senha })
    });
  
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('nome', data.nome); // Armazena o nome no localStorage
      exibirNomeUsuario(data.nome); // Exibe o nome do usuário
      // Redirecione ou faça outra ação, se necessário
    } else {
      alert(data.message); // Mostra erro
    }
}

// Função de logout
function logout() {
    // Remove o nome do usuário do localStorage
    localStorage.removeItem('nome');
    // Atualiza a interface para esconder o nome do usuário
    exibirNomeUsuario(''); // Passa uma string vazia para esconder
    alert('Você foi desconectado com sucesso!');
}

// Função para exibir o nome do usuário
function exibirNomeUsuario(nome) {
    const usuarioNomeElement = document.getElementById('usuarioNome');
    if (nome && nome.trim() !== '') {
      usuarioNomeElement.innerText = `Bem-vindo, ${nome}!`;
      usuarioNomeElement.classList.remove('d-none'); // Remove a classe d-none para exibir
    } else {
      usuarioNomeElement.classList.add('d-none'); // Adiciona d-none para esconder
    }
}

// Ao carregar a página
window.onload = function() {
    const nome = localStorage.getItem('nome');
    exibirNomeUsuario(nome);
};
