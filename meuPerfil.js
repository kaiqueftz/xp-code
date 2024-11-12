// Exemplo de como pegar o id do usuário logado
const usuarioId = 'fd48273a-12b6-4615-9713-20fa888ce2ab'; 

// Construindo a URL para a requisição
const url = `http://localhost:3000/usuario/${usuarioId}`;

// Realizando a requisição para buscar dados do usuário
fetch(url)
  .then(response => response.json())
  .then(data => {
    console.log('Dados do usuário:', data);
    // Preencher os campos do formulário com os dados do usuário
    document.getElementById('nome').value = data.nome;
    document.getElementById('email').value = data.email;
    document.getElementById('cnpj').value = data.cnpj;
    document.getElementById('descricao').value = data.descricao;
    document.getElementById('cep').value = data.cep;
    document.getElementById('endereco').value = data.endereco;
    document.getElementById('telefone').value = data.telefone;
    document.getElementById('horario').value = data.horario;
  })
  .catch(error => {
    console.error('Erro ao buscar usuário:', error);
  });

// Função para buscar o endereço pelo CEP
function buscarCEP() {
  const cep = document.getElementById('cep').value;

  if (!cep) {
    console.error('CEP não informado');
    return;
  }

  // Fazendo a requisição para buscar o endereço com base no CEP
  fetch(`https://viacep.com.br/ws/${cep}/json/`)
    .then(response => response.json())
    .then(data => {
      if (data.erro) {
        console.error('CEP não encontrado');
      } else {
        // Atualiza os campos de endereço
        document.getElementById('endereco').value = data.logradouro;
      }
    })
    .catch(error => {
      console.error('Erro ao buscar CEP:', error);
    });
}

// Função para atualizar os dados do usuário
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

  if (!nome || !email || !senha || !cnpj || !cep || !endereco || !telefone) {
    alert('Por favor, preencha todos os campos obrigatórios.');
    return;
  }

  const userData = {
    nome,
    email,
    senha, // Considerando que a senha seja atualizada também
    cnpj,
    descricao,
    cep,
    endereco,
    telefone,
    horario,
  };

  // Atualizando os dados do usuário via PUT
  fetch(`http://localhost:3000/usuario/${usuarioId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })
    .then(response => response.json())
    .then(data => {
      console.log('Dados atualizados com sucesso:', data);
      document.getElementById('mensagem').textContent = 'Conta atualizada com sucesso!';
    })
    .catch(error => {
      console.error('Erro ao atualizar dados:', error);
      document.getElementById('mensagem').textContent = 'Erro ao atualizar a conta.';
    });
}

// Função para excluir a conta
function excluirConta() {
  const confirmacao = confirm('Tem certeza que deseja excluir sua conta?');

  if (confirmacao) {
    fetch(`http://localhost:3000/usuario/${usuarioId}`, {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(data => {
        console.log('Conta excluída com sucesso:', data);
        document.getElementById('mensagem').textContent = 'Conta excluída com sucesso!';
        // Redirecionar para a página de login após exclusão
        setTimeout(() => window.location.href = '/login.html', 2000);
      })
      .catch(error => {
        console.error('Erro ao excluir conta:', error);
        document.getElementById('mensagem').textContent = 'Erro ao excluir a conta.';
      });
  }
}

////checkpoint
