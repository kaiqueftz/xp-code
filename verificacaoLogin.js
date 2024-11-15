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
    // Armazena o token, nome e ID do usuário no localStorage
    localStorage.setItem('nome', data.nome); 
    localStorage.setItem('id', data.id);  // Ajustado para 'idusuario' com base no backend
    localStorage.setItem('token', data.token); // Armazena o token JWT
    exibirNomeUsuario(data.nome); // Exibe o nome do usuário na interface
    // Exibe a mensagem de usuário logado na interface
    alert(`Bem-vindo, ${data.nome}! Você está logado.`);
    // Redirecionar ou realizar outra ação, se necessário
  } else {
    alert(data.message); // Mostra erro, se houver
  }
}


// Função de logout
function logout() {
  // Remove o nome e o ID do usuário do localStorage
  localStorage.clear();
  // Atualiza a interface para esconder o nome do usuário
  exibirNomeUsuario(''); // Passa uma string vazia para esconder
  alert('Você foi desconectado com sucesso!');
  location.reload(); // Recarrega a página
}

// Função para exibir o nome do usuário
function exibirNomeUsuario(nome) {
  const usuarioNomeElement = document.getElementById('usuarioNome');
  const cadastroLink = document.getElementById('cadastroLink');
  const entrarLink = document.getElementById('entrarLink');
  const logoutButton = document.getElementById('logoutButton');

  if (nome && nome.trim() !== '') {
    usuarioNomeElement.innerText = `Bem-vindo, ${nome}!`;
    usuarioNomeElement.classList.remove('d-none'); // Remove a classe d-none para exibir
    cadastroLink.classList.add('d-none'); // Oculta o link de cadastro
    entrarLink.classList.add('d-none'); // Oculta o link de entrar
    logoutButton.classList.remove('d-none'); // Mostra o botão de logout
  } else {
    usuarioNomeElement.classList.add('d-none'); // Adiciona d-none para esconder
    cadastroLink.classList.remove('d-none'); // Mostra o link de cadastro
    entrarLink.classList.remove('d-none'); // Mostra o link de entrar
    logoutButton.classList.add('d-none'); // Oculta o botão de logout
  }
}

// Função para exibir o botão de adicionar produto com base no login do usuário
function exibirBotaoAdicionarProduto() {
  const nomeUsuario = localStorage.getItem('nome'); // Obtém o nome do usuário do localStorage
  const usuarioLogado = nomeUsuario && nomeUsuario.trim() !== ''; // Verifica se o usuário está logado
  const btnAdicionarProduto = document.getElementById('btnAdicionarProduto');

  if (usuarioLogado) {
    btnAdicionarProduto.classList.remove('d-none'); // Mostra o botão se o usuário estiver logado
  } else {
    btnAdicionarProduto.classList.add('d-none'); // Oculta o botão se o usuário não estiver logado
  }
}

// Ao carregar a página
window.onload = function() {
  const nome = localStorage.getItem('nome');
  const usuarioId = localStorage.getItem('usuarioId'); // Obtém o ID do usuário

  exibirNomeUsuario(nome);
  exibirBotaoAdicionarProduto();

  if (nome && nome.trim() !== '') {
    // Se o usuário estiver logado, exibe a mensagem de logado

  }
};
