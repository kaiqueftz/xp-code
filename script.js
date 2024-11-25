// Ao adicionar produto (POST)
document.getElementById('produtoForm').addEventListener('submit', adicionarProduto);
document.getElementById('produtoEditForm').addEventListener('submit', editarProduto);


// Função para adicionar produto (POST)
async function adicionarProduto(event) {
    const usuario = localStorage.getItem('usuario');
    const usuarioObj = JSON.parse(usuario);
    const email = usuarioObj.email;
    
    event.preventDefault();
    const nome = document.getElementById('nome').value;
    const descricao = document.getElementById('descricao').value;
    const numero = document.getElementById('numero').value;
    const preco = document.getElementById('preco').value;
    const estabelecimento = document.getElementById('estabelecimento').value;
    const dataHora = document.getElementById('dataHora').value;

    // Verificação de número com exatamente 13 dígitos
        const numeroValido =/^\d{10,11}$/.test(numero);  
        if (!numeroValido) {
            alert('Número inválido! O número deve ter 10 ou 11 dígitos (ex: 6133445555 para telefone ou 619911112222 para celular');
            return;
        }

    const whatsappLink = `https://api.whatsapp.com/send?phone=${numero}`;

    try {
        const response = await fetch(`http://localhost:3000/produtos/${email}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome, descricao, numero, whatsapp_link: whatsappLink, preco, estabelecimento, dataHora }),
        });

        if (response.ok) {
            showAlert('success', 'Produto atualizado com sucesso! <span style="color: red;">Não se esqueça de adicionar a foto</span>');
            document.getElementById('produtoForm').reset();
            await atualizarListaDeProdutos();
        } else {
            alert('Erro ao adicionar o produto.');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao se conectar ao servidor.');
    }      
}

// Função para atualizar a lista de produtos (GET)
async function atualizarListaDeProdutos() {
    const usuario = localStorage.getItem('usuario');
    const usuarioObj = usuario ? JSON.parse(usuario) : null;
    const email = usuarioObj?.email ?? "nada";
    
    try {
        const response = await fetch(`http://localhost:3000/produtos/${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const produtos = await response.json();

         // Ordena os produtos pela dataHora em ordem decrescente (do mais recente para o mais antigo)
        produtos.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));

        // Limpar os produtos existentes
        const produtosContainer = document.getElementById('produtosContainer');
        produtosContainer.innerHTML = '';

        // Verifica se o usuário está logado
        const nomeUsuario = localStorage.getItem('nome'); // Obtém o nome do usuário do localStorage
        const usuarioLogado = nomeUsuario && nomeUsuario.trim() !== ''; // Verifica se o usuário está logado

        // Adicionar novos produtos à página
        produtos.forEach(produto => {
            const produtoDiv = document.createElement('div');
            produtoDiv.classList.add('col-12', 'col-sm-6', 'col-md-4', 'col-lg-3', 'mb-4');
            produtoDiv.innerHTML = `
                <div class="card">
                     <img src="${produto.imagem_url}" class="card-img-top" alt="Prezado Estabelecimento, por favor adicione a imagem do produto clicando no botão abaixo!">
                    <div class="card-body d-flex flex-column justify-content-between">
                        <a href="perfil.html?email=${produto.emailusuario}" class="text-decoration text-muted">
                        <p class="card-text">
                            <i class="bi bi-person me-2"></i>${produto.estabelecimento}
                        </p></a><br>
                        <h5 class="card-title">${produto.nome}</h5>
                        <p class="card-text">${produto.descricao}</p>
                        <h5 id="precoProduto" class="card-title"> R$ ${produto.preco}</h5>
                        <div class="d-flex align-items-center mb-4">
                        <i class="bi bi-calendar-event me-2"></i>
                        <span class="card-text">${new Date(produto.dataHora).toLocaleString('pt-BR', { 
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}</span>
                        </div>
                        <a href="${produto.whatsapp_link}" target="_blank" class="btn btn-primary w-75 align-self-center mb-2"> <i class="bi bi-whatsapp me-2"></i>WhatsApp</a>
                        ${usuarioLogado ? `
                            <button id="btnAdicionarImagem" class="btn btn-secondary w-75 align-self-center mb-2" onclick="abrirModalUpload(${produto.id})">
                            <i class="bi bi-image me-2"></i>Adicionar Imagem
                            </button>
                            <button id="btnEditar" class="btn btn-warning w-75 align-self-center mb-2" onclick="carregarProdutoParaEdicao(${produto.id})"><i class="bi bi-pencil me-2"></i>Editar</button>
                            <button id="btnDeletar" class="btn btn-danger w-75 align-self-center" onclick="deletarProduto(${produto.id})"><i class="bi bi-trash me-2"></i>Vendido</button>
                        ` : ''}
                    </div>
                </div>
            `;
            produtosContainer.appendChild(produtoDiv);
        });

    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
    }
}

function abrirModalUpload(produtoId) {
    // Aqui você pode abrir um modal ou redirecionar para a página de upload
    // Exemplo de redirecionamento:
    window.location.href = `upload.html?produtoId=${produtoId}`;
}


// Função para carregar os dados do produto no formulário de edição
function carregarProdutoParaEdicao(id) {
    fetch(`http://localhost:3000/produtos/edit/${id}`)
        .then(response => response.json())
        .then(produto => {
            document.getElementById('editNome').value = produto.nome;
            document.getElementById('editDescricao').value = produto.descricao;
            document.getElementById('editNumero').value = produto.numero;
            document.getElementById('editPreco').value = produto.preco;
            document.getElementById('editEstabelecimento').value = produto.estabelecimento;

            // Mostra o formulário de edição e oculta o formulário de adição
            document.getElementById('produtoEditForm').style.display = 'block';
            document.getElementById('produtoForm').style.display = 'none';

            // Define o ID do produto a ser editado
            document.getElementById('produtoEditForm').dataset.produtoId = id;

            // Rolagem suave para a aba de edição
            const abaEdicao = document.getElementById('produtoEditForm'); // Localização do elemento da aba de edição
            abaEdicao.scrollIntoView({ behavior: 'smooth' }); // Rolagem suave
        })
        .catch(error => console.error('Erro ao carregar produto:', error));
}

// Função para editar produto (PUT)
async function editarProduto(event) {
    event.preventDefault();

    const id = document.getElementById('produtoEditForm').dataset.produtoId;
    const nome = document.getElementById('editNome').value;
    const descricao = document.getElementById('editDescricao').value;
    const numero = document.getElementById('editNumero').value;
    const preco = document.getElementById('editPreco').value;
    const estabelecimento = document.getElementById('editEstabelecimento').value;

    const numeroValido =/^\d{10,11}$/.test(numero);  
        if (!numeroValido) {
            alert('Número inválido! O número deve ter 10 ou 11 dígitos (ex: 6133445555 para telefone ou 619911112222 para celular');
            return;
        }

    try {
        const response = await fetch(`http://localhost:3000/produtos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome, descricao, numero, preco, estabelecimento }),
        });

        if (response.ok) {
            showAlert('success', 'Produto atualizado com sucesso!');
            document.getElementById('produtoEditForm').reset();
            document.getElementById('produtoEditForm').style.display = 'none';
            document.getElementById('produtoForm').style.display = 'block'; // Volta ao formulário de adição
            await atualizarListaDeProdutos();
        } else {
            alert('Erro ao atualizar o produto.');
        }
    } catch (error) {
        console.error('Erro ao editar o produto:', error);
        alert('Erro ao se conectar ao servidor.');
    }
}

// Função para deletar produto (DELETE)
async function deletarProduto(email) {
    try {
        const response = await fetch(`http://localhost:3000/produtos/${email}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            showAlert('success', 'Produto removido com sucesso!');
            await atualizarListaDeProdutos();
        } else {
            // Captura a mensagem de erro retornada pelo servidor
            const errorData = await response.json(); 
            console.error('Erro ao remover o produto:', errorData);
            alert(`Erro ao remover o produto: ${errorData.error || 'Erro desconhecido.'}`);
        }
    } catch (error) {
        console.error('Erro ao se conectar ao servidor:', error);
        alert('Erro ao se conectar ao servidor.');
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

    modalMessage.innerHTML = message;

    // Exibe o modal
    const genericModal = new bootstrap.Modal(document.getElementById('genericModal'));
    genericModal.show();
}

// Carrega os produtos ao iniciar a página
document.addEventListener('DOMContentLoaded', atualizarListaDeProdutos);
