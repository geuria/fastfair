async function carregarPedidosCliente(idCliente) {
    const { data } = await db
        .from("pedidos")
        .select(`
            *,
            produto:produto_id (nome)
        `)
        .eq("cliente_id", idCliente);

    return data;
}
