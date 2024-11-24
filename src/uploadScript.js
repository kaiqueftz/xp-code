import supabase from './supabase.js';

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const statusElement = document.getElementById('status');
  const imageUrlContainer = document.getElementById('imageUrlContainer'); // Container para exibir a URL
  
  statusElement.textContent = 'Enviando imagem...';

  const imageFile = document.getElementById('imageInput').files[0];
  
  if (!imageFile) {
    statusElement.textContent = 'Por favor, selecione uma imagem.';
    return;
  }

  try {
    // Subir a imagem no bucket do Supabase
    const filePath = `imagens/${Date.now()}_${imageFile.name}`;
    const { data, error } = await supabase.storage
      .from('imagens')
      .upload(filePath, imageFile);

    if (error) throw error;

    // Obter a URL pública da imagem
    const { data: publicData } = supabase.storage
      .from('imagens')
      .getPublicUrl(filePath);

    const publicUrl = publicData.publicUrl;

    // Exibir a URL na tela como link clicável
    imageUrlContainer.innerHTML = `
      <p>Upload concluído! <br>
      URL da imagem: <a href="${publicUrl}" target="_blank">${publicUrl}</a></p>
      <img src="${publicUrl}" alt="Imagem enviada" class="img-fluid mt-3" style="max-width: 300px;">
    `;
    statusElement.textContent = '';  // Limpa a mensagem de status

    // Captura o ID do produto da URL
    const urlParams = new URLSearchParams(window.location.search);
    const produtoId = urlParams.get('produtoId');

    if (!produtoId) {
      statusElement.textContent = 'Erro: ID do produto não encontrado.';
      return;
    }

    // Atualizar a coluna imagem_url na tabela produtos com o ID do produto
    const { error: updateError } = await supabase
      .from('produtos')
      .update({ imagem_url: publicUrl }) // Atualiza a coluna imagem_url com a URL da imagem
      .eq('id', produtoId); // Usa o ID do produto

    if (updateError) throw updateError;

    statusElement.textContent = 'Imagem atualizada com sucesso!';

    setTimeout(() => {
      window.location.href = 'index.html';  
    }, 2500);     

  } catch (error) {
    console.error('Erro:', error);
    statusElement.textContent = 'Erro ao enviar imagem.';
  }
});

// Função para upload, se precisar de alguma outra operação
async function uploadImage(file) {
  const { data, error } = await supabase
    .storage
    .from('imagens')  // Nome do bucket
    .upload(`imagens/${file.name}`, file);  // Caminho dentro do bucket

  if (error) {
    console.error("Erro no upload:", error.message);
  } else {
    // URL pública da imagem
    const imageUrl = `https://ibfkxhssnttlrjijdbbv.supabase.co/storage/v1/object/public/imagens/${file.name}`;

    // Exibe a URL na tela
    const imageContainer = document.getElementById("imageUrlContainer");
    imageContainer.innerHTML = `<p>URL da imagem: <a href="${imageUrl}" target="_blank">${imageUrl}</a></p>`;
    
    console.log("Upload bem-sucedido!", imageUrl);
  }
}

function handleUpload() {
  const file = document.getElementById('fileInput').files[0];
  if (file) {
    uploadImage(file);
  } else {
    alert("Por favor, selecione um arquivo para upload.");
  }
}
