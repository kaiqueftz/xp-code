async function buscarCEP() {
    let cep = document.getElementById("cep").value;
    cep = cep.replace(/\D/g, ''); // Remove caracteres não numéricos

    if (cep.length !== 8) {
        alert("Por favor, insira um CEP válido com 8 dígitos.");
        return;
    }

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (data.erro) {
            alert("CEP não encontrado.");
        } else {
            const endereco = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
            document.getElementById("endereco").value = endereco;
            alert("Endereço preenchido automaticamente!");
        }
    } catch (error) {
        console.error("Erro ao buscar o CEP:", error);
        alert("Erro ao buscar o CEP. Verifique a conexão e tente novamente.");
    }
}

    document.getElementById('cadastroForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        const cnpj = document.getElementById('cnpj').value;
        const descricao = document.getElementById('descricao').value;
        const cep = document.getElementById('cep').value;
        const telefone = document.getElementById('telefone').value;
        const endereco = document.getElementById('endereco').value;
        const horario = document.getElementById('horario').value;

        // apagar depois
        // // Armazenar os dados no localStorage
        // const userData = { nome, email, cnpj, descricao, cep, telefone, endereco, horario };
        // localStorage.setItem('usuario', JSON.stringify(userData));

        try {
            const response = await fetch('http://localhost:3000/usuario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nome, email, senha, cnpj, descricao, cep, telefone, endereco, horario }),
            });

            const data = await response.json();
            const mensagemDiv = document.getElementById('mensagem');

            if (response.ok) {
                mensagemDiv.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
                
                // Redireciona para a tela de login (entrar.html)
            setTimeout(() => {
                window.location.href = "entrar.html"; // Redirecionamento após 2 segundos
            }, 1000);

            } else {
                mensagemDiv.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
            }

        } catch (error) {
            console.error('Erro ao fazer o cadastro:', error);
            document.getElementById('mensagem').innerHTML = `<div class="alert alert-danger">Erro ao fazer o cadastro</div>`;
        }
    });

    // Máscara e validação do telefone
document.getElementById('telefone').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, ''); // Remove tudo que não for número
});

// Salva telefone no localStorage após cadastro bem-sucedido
document.getElementById('cadastroForm').addEventListener('submit', async function (e) {
    // Outros códigos...
    
    const telefone = document.getElementById('telefone').value;
    
    // Salva o telefone em localStorage
    localStorage.setItem('telefone', telefone);
    
    // Restante do código de envio...
});

// Função para aplicar a máscara de CNPJ
function aplicarMascaraCNPJ(cnpj) {
    return cnpj.replace(/\D/g, '')  // Remove todos os caracteres não numéricos
        .replace(/^(\d{2})(\d)/, '$1.$2')  // Adiciona o ponto após os 2 primeiros números
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')  // Adiciona o ponto após os 3 primeiros números
        .replace(/\.(\d{3})(\d)/, '.$1/$2')  // Adiciona a barra
        .replace(/(\d{4})(\d)/, '$1-$2')  // Adiciona o hífen
        .slice(0, 18);  // Limita o tamanho a 18 caracteres
}

// Função para aplicar a máscara de CEP
function aplicarMascaraCEP(cep) {
    return cep.replace(/\D/g, '')  // Remove todos os caracteres não numéricos
        .replace(/^(\d{5})(\d)/, '$1-$2')  // Adiciona o hífen
        .slice(0, 10);  // Limita o tamanho a 10 caracteres
}

// Função para formatar o campo CNPJ ao digitar
document.getElementById("cnpj").addEventListener("input", function() {
    this.value = aplicarMascaraCNPJ(this.value);
});

// Função para formatar o campo CEP ao digitar
document.getElementById("cep").addEventListener("input", function() {
    this.value = aplicarMascaraCEP(this.value);
});
    