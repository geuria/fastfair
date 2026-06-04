const { createClient } = supabase;

const db = createClient(
    "https://iqpyptpacglgoawlvyai.supabase.co",
    "sb_publishable_f6rQubRvqp2V1GBD-YI1yQ_Zd7A_7BW"
);

async function carregarUsuarios() {
    const { data } = await db.from("usuarios").select("*");
    const tabela = document.getElementById("listaUsuarios");

    tabela.innerHTML = "";

    data.forEach(u => {
        tabela.innerHTML += `
            <tr>
                <td>${u.nome}</td>
                <td>${u.email}</td>
                <td>${u.tipo}</td>
            </tr>
        `;
    });
}

async function carregarProdutos() {
    const { data } = await db
        .from("produtos")
        .select(`
            *,
            produtor:produtor_id (nome)
        `);

    const tabela = document.getElementById("listaProdutos");
    tabela.innerHTML = "";

    data.forEach(p => {
        tabela.innerHTML += `
            <tr>
                <td>${p.nome}</td>
                <td>${p.produtor?.nome}</td>
                <td>R$ ${p.preco}</td>
                <td>${p.estoque}</td>
            </tr>
        `;
    });
}

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

async function carregarFeedbacks() {
    const { data } = await db
        .from("feedbacks")
        .select(`
            *,
            cliente:cliente_id (nome)
        `);

    const tabela = document.getElementById("listaFeedbacks");
    tabela.innerHTML = "";

    data.forEach(f => {
        tabela.innerHTML += `
            <tr>
                <td>${f.cliente?.nome}</td>
                <td>${f.mensagem}</td>
            </tr>
        `;
    });
}

async function gerarRelatorio() {
    const { count: totalUsuarios } = await db.from("usuarios").select("*", { count: "exact" });
    const { count: totalProdutos } = await db.from("produtos").select("*", { count: "exact" });
    const { count: totalPedidos } = await db.from("pedidos").select("*", { count: "exact" });

    document.getElementById("relatorio").innerHTML = `
        <p>Total de usuários: ${totalUsuarios}</p>
        <p>Total de produtos: ${totalProdutos}</p>
        <p>Total de pedidos: ${totalPedidos}</p>
    `;
}
