// Captura o email da query string
const params = new URLSearchParams(window.location.search);
const email = params.get('email');

if (email) {
  // Função para buscar o perfil do usuário com base no email
  async function buscarPerfil(email) {
    try {
      const response = await fetch(`http://localhost:3000/perfil/${email}`, {
        method: 'GET',
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.message || 'Erro ao buscar perfil');
      }

      // Preenche os campos do formulário com os dados do usuário
      const { nome, endereco, telefone, horario, descricao, cep } = resultado.user;

      document.getElementById('nome').value = nome || '';
      document.getElementById('endereco').value = endereco || '';
      document.getElementById('telefone').value = telefone || '';
      document.getElementById('email').value = email || ''; // Usa a variável 'email' da query string
      document.getElementById('horario').value = horario || '';
      document.getElementById('descricao').value = descricao || '';
      document.getElementById('cep').value = cep || '';
    } catch (erro) {
      console.error('Erro ao buscar o perfil:', erro.message);
      document.getElementById('mensagem').textContent = 'Erro ao carregar o perfil do usuário.';
    }
  }

  // Chama a função para buscar o perfil
  buscarPerfil(email);
} else {
  // Se o email não for fornecido, exibe uma mensagem de erro
  document.getElementById('mensagem').textContent = 'Email não especificado na URL.';
}
