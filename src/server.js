const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const supabase = require('./supabaseClient'); // Importa o cliente Supabase
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('./auth');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Servir arquivos estáticos da pasta 'public'
app.use(express.static('public'));

// Rota para listar produtos
app.get('/produtos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*');

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Erro ao listar produtos:', error.message);
    res.status(500).send('Erro ao listar produtos');
  }
});

//checkpoint

// Rota para adicionar produto
app.post('/produtos', async (req, res) => {
  const { nome, descricao, numero, preco } = req.body;

  // Verificação de número com código do país
  const numeroValido = /^\d{12,15}$/.test(numero);
  if (!numeroValido) {
    return res.status(400).send('Número inválido! Deve incluir o código do país.');
  }

  // Gerar o link do WhatsApp
  const whatsappLink = `https://api.whatsapp.com/send?phone=${numero}`;

  try {
    const { data, error } = await supabase
      .from('produtos')
      .insert([{ nome, descricao, whatsapp_link: whatsappLink, preco }]) // Inclua o whatsapp_link
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
    console.log('Número WhatsApp:', numeroWhatsApp);
    console.log('Link do WhatsApp:', whatsappLink);

    // Redirecionar o usuário para o link do WhatsApp
    res.status(200).json({ message: 'Mensagem enviada com sucesso!', link: whatsappLink });
  } catch (error) {
    console.error('Erro ao enviar mensagem via WhatsApp:', error.message);
    res.status(500).send('Erro ao enviar mensagem via WhatsApp');
  }
});

// Rota para obter um produto pelo ID
app.get('/produtos/:id', async (req, res) => {
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
  const { nome, descricao, numero, preco } = req.body;

  try {
    const { data, error } = await supabase
      .from('produtos')
      .update({ nome, descricao, numero, preco })
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
  const { nome, email, senha } = req.body;

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
      .insert([{ nome, email, senha: hashedPassword }])
      .select(); // Adiciona o .select() aqui para retornar os dados inseridos

    // Log para verificar a resposta da inserção
    console.log('Dados enviados para inserção:', { nome, email, senha: hashedPassword });
    console.log('Dados retornados após inserção:', data);
    console.log('Erro na inserção:', error);

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

    // Armazenar o nome do usuário no localStorage
    const token = jwt.sign(
      {}, 
      'sua_chave_secreta_aqui',
      {
        subject: String(usuario.idcliente),
        expiresIn: '1d'
      }
    );

    // Enviar nome e token como resposta
    res.status(201).json({ 
      token: token, 
      idusuario: usuario.idcliente, 
      logado: true,
      nome: usuario.nome // Enviando o nome do usuário
    });
    
  } catch (error) {
    console.error('Erro ao fazer login:', error.message);
    res.status(500).send('Erro ao fazer login');
  }
});

// Inicializar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
