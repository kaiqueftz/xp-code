// Função para preencher os campos com os dados armazenados no localStorage
function preencherFormulario() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (usuario) {
      document.getElementById('nome').value = usuario.nome || '';
      document.getElementById('email').value = usuario.email || '';
      document.getElementById('senha').value = usuario.senha || '';
      document.getElementById('cnpj').value = usuario.cnpj || '';
      document.getElementById('descricao').value = usuario.descricao || '';
      document.getElementById('cep').value = usuario.cep || '';
      document.getElementById('endereco').value = usuario.endereco || '';
      document.getElementById('telefone').value = usuario.telefone || '';
      document.getElementById('horario').value = usuario.horario || '';
  }
}

// Função chamada ao carregar a página para preencher o formulário
window.onload = function() {
  preencherFormulario();
};

// Função para atualizar a conta com os dados do formulário
function atualizarConta() {
  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  const cnpj = document.getElementById('cnpj').value;
  const descricao = document.getElementById('descricao').value;
  const cep = document.getElementById('cep').value;
  const endereco = document.getElementById('endereco').value;
  const telefone = document.getElementById('telefone').value;
  const horario = document.getElementById('horario').value;

  // Salvar os dados atualizados no localStorage
  const updatedUserData = { nome, email, senha, cnpj, descricao, cep, endereco, telefone, horario };
  localStorage.setItem('usuario', JSON.stringify(updatedUserData));

  // Exibir mensagem de sucesso
  const mensagemDiv = document.getElementById('mensagem');
  mensagemDiv.innerHTML = `<div class="alert alert-success">Conta atualizada com sucesso!</div>`;
}

// Função para excluir a conta
function excluirConta() {
  if (confirm("Tem certeza de que deseja excluir sua conta?")) {
      // Remover os dados do localStorage
      localStorage.removeItem('usuario');

      // Limpar os campos do formulário
      document.getElementById('perfilForm').reset();

      // Exibir mensagem de exclusão
      const mensagemDiv = document.getElementById('mensagem');
      mensagemDiv.innerHTML = `<div class="alert alert-danger">Conta excluída com sucesso!</div>`;
  }
}