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

function atualizarConta() {
  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value.trim();
  const cnpj = document.getElementById('cnpj').value.trim();
  const descricao = document.getElementById('descricao').value.trim();
  const cep = document.getElementById('cep').value.trim();
  const endereco = document.getElementById('endereco').value.trim();
  const telefone = document.getElementById('telefone').value.trim();
  const horario = document.getElementById('horario').value.trim();

   // Verificação se todos os campos obrigatórios estão preenchidos
   if (!nome || !email || !senha || !cnpj || !cep || !telefone) {
    showAlert('error', 'Por favor, preencha todos os campos obrigatórios!');
    return;
  }

  const updatedUserData = { nome, email, senha, cnpj, descricao, cep, endereco, telefone, horario };

  localStorage.setItem('usuario', JSON.stringify(updatedUserData));

  fetch(`http://localhost:3000/usuario/${email}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedUserData)
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao atualizar os dados.');
      }
      return response.json();
    })
    .then((data) => {
      showAlert('success', 'Dados atualizados com sucesso.');
    })
    .catch((error) => {
      showAlert('error', 'Não foi possível atualizar os dados.');
      console.error('Erro ao atualizar conta:', error.message);
    });
}

function excluirConta() {
  if (confirm("Tem certeza de que deseja excluir sua conta?")) {
    const email = document.getElementById('email').value.trim();

    fetch(`http://localhost:3000/usuario/${email}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao excluir conta.');
        }
        return response.json();
      })
      .then(data => {
        localStorage.removeItem('usuario');
        document.getElementById('perfilForm').reset();
        showAlert('error', 'Conta excluída com sucesso!');
      })
      .catch(error => {
        console.error('Erro:', error);
        showAlert('error', 'Erro ao excluir conta. Tente novamente mais tarde.');
      });
  }

  // Limpar o localStorage
  localStorage.clear();

  // Após a confirmação de exclusão bem-sucedida, aguarde 4 segundos e redirecione
  setTimeout(() => {
      window.location.href = "entrar.html";
  }, 500); 
}

async function buscarCEP() {
  let cep = document.getElementById("cep").value;
  cep = cep.replace(/\D/g, ''); // Remove caracteres não numéricos

  if (cep.length !== 8) {
      showAlert('error', "Por favor, insira um CEP válido com 8 dígitos.");
      return;
  }

  try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
          showAlert('error', "CEP não encontrado.");
      } else {
          const endereco = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
          document.getElementById("endereco").value = endereco;
          showAlert('success', "Endereço preenchido automaticamente!");
      }
  } catch (error) {
      console.error("Erro ao buscar o CEP:", error);
      showAlert('error', "Erro ao buscar o CEP. Verifique a conexão e tente novamente.");
  }
}

function showAlert(type, message) {
  const modalTitle = document.getElementById('genericModalLabel');
  const modalMessage = document.getElementById('modalMessage');
  const modalButton = document.getElementById('modalButton');

  // Define o título e a mensagem do modal
  if (type === 'success') {
      modalTitle.textContent = 'Sucesso!';
      modalMessage.textContent = message;
      modalButton.classList.add('btn-success');
      modalButton.classList.remove('btn-danger');
  } else if (type === 'error') {
      modalTitle.textContent = 'Erro!';
      modalMessage.textContent = message;
      modalButton.classList.add('btn-danger');
      modalButton.classList.remove('btn-success');
  }

  // Exibe o modal
  const genericModal = new bootstrap.Modal(document.getElementById('genericModal'));
  genericModal.show();
}
