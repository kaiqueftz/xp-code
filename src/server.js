const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const supabase = require('./supabaseClient'); // Importa o cliente Supabase
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('./auth')

const app = express();
app.use(cors());
app.use(bodyParser.json());

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

// Rota para adicionar produto
app.post('/produtos', async (req, res) => {
  const { nome, descricao, numero } = req.body;

  // Verificação de número
  const numeroValido = /^\d{10,15}$/.test(numero);
  if (!numeroValido) {
      return res.status(400).send('Número inválido!');
  }

  // Gerar o link do WhatsApp
  const whatsappLink = `https://api.whatsapp.com/send?phone=${numero}`;

  try {
    const { data, error } = await supabase
      .from('produtos')
      .insert([{ nome, descricao, whatsapp_link: whatsappLink }]) // Inclua o whatsapp_link
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
  const { nome, descricao } = req.body;

  try {
    const { data, error } = await supabase
      .from('produtos')
      .update({ nome, descricao })
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

app.post('/usuario', async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    // Criptografar a senha usando bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(senha, saltRounds);

    // Inserir o usuário no banco de dados com a senha criptografada
    const { data, error } = await supabase
      .from('usuario')
      .insert([{ nome, email, senha: hashedPassword }]);

    if (error) {
      throw error;
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

    const token = jwt.sign(
      {}, 
      'sua_chave_secreta_aqui',
      {
        subject: String(usuario.idcliente),
        expiresIn: '1d'
      }
    );
    
    res.status(201).json({ token: token, idusuario: usuario.idcliente, logado: true });
    
  } catch (error) {
    console.error('Erro ao fazer login:', error.message);
    res.status(500).send('Erro ao fazer login');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

