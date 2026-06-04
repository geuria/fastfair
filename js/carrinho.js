// carrinho.js

function getCarrinho() {
    return JSON.parse(localStorage.getItem("carrinho")) || [];
}

function salvarCarrinho(carrinho) {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

// Exemplo de produto que vai pro carrinho
// (quando o cliente clica em "Adicionar")
function adicionarAoCarrinho(produto) {
    // produto precisa vir com:
    // id, nome, preco, produtor_id, categoria, unidade_medida, peso_base, organico, foto1_url

    const carrinho = getCarrinho();
    const existente = carrinho.find(p => p.id === produto.id);

    if (existente) {
        existente.quantidade += produto.quantidade || 1;
    } else {
        carrinho.push({
            ...produto,
            quantidade: produto.quantidade || 1
        });
    }

    salvarCarrinho(carrinho);
    alert("Produto adicionado ao carrinho!");
}
