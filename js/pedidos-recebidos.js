const { createClient } = supabase;

const db = createClient(
    "https://iqpyptpacglgoawlvyai.supabase.co",
    "sb_publishable_f6rQubRvqp2V1GBD-YI1yQ_Zd7A_7BW"
);

async function carregarPedidos() {
    const produtor = localStorage.getItem("usuario");
    const tabela = document.getElementById("listaPedidos");

    const { data: pedidos, error } = await db
        .from("pedidos")
        .select(`
            id,
            quantidade,
            total,
            status,
            cliente_id,
            produtos:produto_id (nome)
        `)
        .eq("produtor_id", produtor);

    if (error) {
        console.error(error);
        tabela.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; color:red;">
                    Erro ao carregar pedidos.
                </td>
            </tr>`;
        return;
    }

    if (!pedidos || pedidos.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; font-size:22px;">
                    Nenhum pedido recebido ainda.
                </td>
            </tr>`;
        return;
    }

    tabela.innerHTML = "";

    pedidos.forEach(p => {
        tabela.innerHTML += `
            <tr id="pedido-${p.id}">
                <td>${p.cliente_id}</td>
                <td>${p.produtos?.nome || "Produto removido"}</td>
                <td>${p.quantidade}</td>
                <td id="status-${p.id}">${p.status}</td>
                <td id="acoes-${p.id}">
                    ${p.status === "pendente" ? `
                        <button class="btn-aceitar" onclick="atualizarStatus('${p.id}', 'aceito')">Aceitar</button>
                        <button class="btn-recusar" onclick="atualizarStatus('${p.id}', 'recusado')">Recusar</button>
                    ` : "—"}
                </td>
            </tr>
        `;
    });
}

async function atualizarStatus(id, novoStatus) {
    const { error } = await db
        .from("pedidos")
        .update({ status: novoStatus })
        .eq("id", id);

    if (error) {
        alert("Erro ao atualizar status");
        return;
    }

    // Atualiza visualmente na tabela
    document.getElementById(`status-${id}`).innerText = novoStatus;
    document.getElementById(`acoes-${id}`).innerHTML = "—";
}

carregarPedidos();
