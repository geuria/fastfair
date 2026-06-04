async function carregarPedidos() {
    const { data } = await db
        .from("pedidos")
        .select(`
            *,
            cliente:cliente_id (nome),
            produto:produto_id (nome)
        `);

    const tabela = document.getElementById("listaPedidos");
    tabela.innerHTML = "";

    data.forEach(p => {
        tabela.innerHTML += `
            <tr>
                <td>${p.cliente?.nome}</td>
                <td>${p.produto?.nome}</td>
                <td>${p.quantidade}</td>
                <td>${p.status}</td>
            </tr>
        `;
    });
}

carregarPedidos();
