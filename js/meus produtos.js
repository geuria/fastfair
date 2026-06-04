async function carregarProdutos() {
    const { data } = await db.from("produtos").select("*");
    const tabela = document.getElementById("listaProdutos");

    tabela.innerHTML = "";

    data.forEach(p => {
        tabela.innerHTML += `
            <tr>
                <td>${p.nome}</td>
                <td>R$ ${p.preco}</td>
                <td>${p.estoque}</td>
                <td>
                    <button onclick="excluir(${p.id})">Excluir</button>
                </td>
            </tr>
        `;
    });
}

async function excluir(id) {
    await db.from("produtos").delete().eq("id", id);
    carregarProdutos();
}

carregarProdutos();
