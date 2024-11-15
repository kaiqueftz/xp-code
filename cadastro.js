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

        // Armazenar os dados no localStorage
        const userData = { nome, email, cnpj, descricao, cep, telefone, endereco, horario };
        localStorage.setItem('usuario', JSON.stringify(userData));

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
            } else {
                mensagemDiv.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
            }

        } catch (error) {
            console.error('Erro ao fazer o cadastro:', error);
            document.getElementById('mensagem').innerHTML = `<div class="alert alert-danger">Erro ao fazer o cadastro</div>`;
        }
    });
    