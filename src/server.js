const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const supabase = require('./supabaseClient'); // Importa o cliente Supabase
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('./auth');
const { v4: uuidv4, validate: validateUuid } = require('uuid'); // Importa funções do pacote uuid

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Servir arquivos estáticos da pasta 'public'
app.use(express.static('public'));

app.get('/produtos/:email', async (req, res) => {
  const { email } = req.params;

  if (email == "nada") {
    const { data, error } = await supabase
    .from('produtos')
    .select('*')

    res.json(data);

  } else {
    const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('emailusuario', email)

    res.json(data);
  }
});

//checkpoint

// Rota para adicionar produto
app.post('/produtos/:email', async (req, res) => {
  const { email } = req.params;
  const { nome, descricao, numero, preco, estabelecimento, dataHora } = req.body;

  // Verificação de número com código do país
  const numeroValido = /^\d{10,11}$/.test(numero); 
  if (!numeroValido) {
    return res.status(400).send('Número inválido! O número deve ter 10 ou 11 dígitos (ex: 6133445555 para telefone ou 619911112222 para celular');
  }

  // Gerar o link do WhatsApp
  const whatsappLink = `https://api.whatsapp.com/send?phone=${numero}`;

  try {
    const { data, error } = await supabase
      .from('produtos')
      .insert([{ nome, descricao, whatsapp_link: whatsappLink, preco, emailusuario: email, estabelecimento, dataHora }]) 
      .select();

    if (error) {
      console.error('Erro ao inserir no Supabase:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(500).json({ error: 'Nenhum dado retornado após a inserção.' });
    }

    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Erro ao adicionar produto:', error.message);
    res.status(500).send('Erro ao adicionar produto');
  }
});

// Rota para deletar produto
app.delete('/produtos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar produto:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(204).send(); // Responde com "No Content" se a exclusão for bem-sucedida
  } catch (error) {
    console.error('Erro ao remover produto:', error.message);
    res.status(500).send('Erro ao remover produto');
  }
});

// Rota para enviar mensagem via WhatsApp
app.post('/whatsapp', async (req, res) => {
  const { produtoId, numeroWhatsApp } = req.body;

  try {
    // Obtendo os detalhes do produto
    const { data: produto, error: produtoError } = await supabase
      .from('produtos')
      .select('*')
      .eq('id', produtoId)
      .single(); // Obtém um único produto

    if (produtoError || !produto) {
      console.error('Erro ao obter produto:', produtoError);
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Montando a mensagem
    const mensagem = `Produto: ${produto.nome}\nDescrição: ${produto.descricao}`;

    // Gerar o link do WhatsApp
    const whatsappLink = `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodeURIComponent(mensagem)}`;

    // Log para depuração

    // Redirecionar o usuário para o link do WhatsApp
    res.status(200).json({ message: 'Mensagem enviada com sucesso!', link: whatsappLink });
  } catch (error) {
    console.error('Erro ao enviar mensagem via WhatsApp:', error.message);
    res.status(500).send('Erro ao enviar mensagem via WhatsApp');
  }
});

// Rota para obter um produto pelo ID
app.get('/produtos/edit/:id', async (req, res) => {
  const { id } = req.params; // Obtém o ID do produto

  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('id', id)
      .single(); // Espera um único resultado

    if (error) {
      console.error('Erro ao acessar o banco de dados:', error.message);
      return res.status(500).send('Erro ao acessar o banco de dados');
    }

    if (!data) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    res.json(data); // Retorna o produto encontrado
  } catch (error) {
    console.error('Erro ao obter produto:', error.message);
    res.status(500).send('Erro ao obter produto');
  }
});

// Rota para editar produto
app.put('/produtos/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, numero, preco, estabelecimento } = req.body;

  try {
    const { data, error } = await supabase
      .from('produtos')
      .update({ nome, descricao, numero, preco, estabelecimento })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Erro ao atualizar produto:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data[0]);
  } catch (error) {
    console.error('Erro ao editar produto:', error.message);
    res.status(500).send('Erro ao editar produto');
  }
});


// Rota para cadastrar usuário
app.post('/usuario', async (req, res) => {
  const { nome, email, senha, cnpj, descricao, cep, endereco, telefone, horario } = req.body;

  try {
    // Verificar se o email já existe
    const { data: existingUser, error: emailCheckError } = await supabase
      .from('usuario')
      .select('*')
      .eq('email', email)
      .single();

    if (emailCheckError && emailCheckError.code !== 'PGRST116') {
      console.error('Erro ao verificar email:', emailCheckError);
      return res.status(500).json({ message: 'Erro ao verificar email', details: emailCheckError.message });
    }

    if (existingUser) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    // Criptografar a senha usando bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(senha, saltRounds);

    // Inserir o usuário no banco de dados com a senha criptografada
    const { data, error } = await supabase
      .from('usuario')
      .insert([{ nome, email, senha: hashedPassword, cnpj, descricao, cep, endereco, telefone, horario }])
      .select(); // Adiciona o .select() aqui para retornar os dados inseridos

    if (error) {
      console.error('Erro ao adicionar usuário:', error);
      return res.status(500).json({ message: 'Erro ao adicionar usuário', details: error.message });
    }

    // Verificação de dados após inserção
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(500).json({ message: 'Erro ao adicionar usuário, nenhum dado retornado' });
    }

    res.status(201).json({ message: 'Usuário criado com sucesso', user: data[0] });
  } catch (error) {
    console.error('Erro ao adicionar usuário:', error.message);
    res.status(500).send('Erro ao adicionar usuário');
  }
});

app.post('/usuario/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const { data, error } = await supabase
      .from('usuario')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return res.status(400).json({ message: 'Usuário não encontrado' });
    }

    const usuario = data;
    const match = await bcrypt.compare(senha, usuario.senha);

    if (!match) {
      return res.status(401).json({ message: 'Senha incorreta' });
    }

    // Gerar o token JWT
    const token = jwt.sign(
      {},
      process.env.JWT_SECRET,  // Usando a chave secreta armazenada
      {
        subject: String(usuario.idcliente),
        expiresIn: '1d'
      }
    );


    // Enviar a resposta ao frontend com a informação
    res.status(200).json({
      token: token,                  // O token JWT gerado para o usuário
      id: usuario.id,                // ID do usuário no banco de dados
      logado: true,                  // Indica que o usuário está logado
      nome: usuario.nome,            // Nome do usuário
      email: usuario.email,          // Email do usuário
      cnpj: usuario.cnpj,            // CNPJ do usuário
      descricao: usuario.descricao,  // Descrição da loja
      cep: usuario.cep,              // CEP da loja
      endereco: usuario.endereco,    // Endereço da loja
      telefone: usuario.telefone,    // Telefone de contato
      horario: usuario.horario,      // Horário de funcionamento
      message: 'Login realizado com sucesso!' // Mensagem de sucesso
    });


  } catch (error) {
    console.error('Erro ao fazer login:', error.message);
    res.status(500).send('Erro ao fazer login');
  }
});

app.put('/usuario/:email', async (req, res) => {
  const { email } = req.params;
  const { nome, senha, cnpj, descricao, cep, endereco, telefone, horario } = req.body;

  try {
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const { data, error } = await supabase
      .from('usuario')
      .update({
        nome,
        senha: senhaCriptografada,
        cnpj,
        descricao,
        cep,
        endereco,
        telefone,
        horario
      })
      .eq('email', email);

    if (error) {
      return res.status(400).json({ mensagem: 'Erro ao atualizar dados.', error: error.message });
    }

    res.status(200).json({ mensagem: 'Dados atualizados com sucesso.', data });
  } catch (err) {
    res.status(500).json({ mensagem: 'Erro interno no servidor.', error: err.message });
  }
});

app.delete('/usuario/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const { data, error } = await supabase
      .from('usuario')
      .delete()
      .eq('email', email);

    if (error) {
      return res.status(400).json({ mensagem: 'Erro ao excluir dados.', error: error.message });
    }

    res.status(200).json({ mensagem: 'Usuário excluído com sucesso.', data });
  } catch (err) {
    res.status(500).json({ mensagem: 'Erro interno no servidor.', error: err.message });
  }
});



// Rota para atualizar a conta
app.put('/usuario/:id', async (req, res) => {
  const { id } = req.params;

  const { nome, email, telefone, descricao, horario } = req.body;

  const { data, error } = await supabase
    .from('usuario')
    .update({ nome, email, telefone, descricao, horario })
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar conta:', error);
    return res.status(400).json({ message: 'Erro ao atualizar conta' });
  }
  res.json({ message: 'Conta atualizada com sucesso', data });
});

// Rota para excluir a conta
app.delete('/usuario/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('usuario')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao excluir conta:', error);
    return res.status(400).json({ message: 'Erro ao excluir conta' });
  }
  res.json({ message: 'Conta excluída com sucesso', data });
});

// Rota POST para enviar o perfil do usuário com base no email, excluindo as colunas especificadas
app.post('/perfil/:email', async (req, res) => {
  const { email } = req.params; // Captura o email da URL

  if (!email) {
    return res.status(400).json({ message: 'O email é obrigatório.' });
  }

  try {
    // Consulta a tabela 'usuario' no Supabase para buscar os dados do usuário com base no email
    const { data, error } = await supabase
      .from('usuario')
      .select('nome, email, descricao, cep, endereco, telefone, horario') // Apenas as colunas desejadas
      .eq('email', email)
      .single(); // Garante que apenas um registro é retornado

    if (error || !data) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Retorna os dados do usuário
    res.status(200).json({ user: data });
  } catch (err) {
    console.error('Erro ao buscar o perfil:', err.message);
    res.status(500).json({ message: 'Erro interno no servidor.', error: err.message });
  }
});

// Rota GET para buscar o perfil do usuário com base no email, excluindo as colunas especificadas
app.get('/perfil/:email', async (req, res) => {
  const { email } = req.params; // Captura o email da URL

  if (!email) {
    return res.status(400).json({ message: 'O email é obrigatório.' });
  }

  try {
    // Consulta a tabela 'usuario' no Supabase para buscar os dados do usuário com base no email
    const { data, error } = await supabase
      .from('usuario')
      .select('nome, email, descricao, cep, endereco, telefone, horario') // Apenas as colunas desejadas
      .eq('email', email)
      .single(); // Garante que apenas um registro é retornado

    if (error || !data) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Retorna os dados do usuário
    res.status(200).json({ user: data });
  } catch (err) {
    console.error('Erro ao buscar o perfil:', err.message);
    res.status(500).json({ message: 'Erro interno no servidor.', error: err.message });
  }
});

// Inicializar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
