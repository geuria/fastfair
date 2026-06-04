import { db } from "./db.js";
import { tipoDeRota } from "./roteirizador.js";

async function carregarEntregador() {
    const id = localStorage.getItem("usuario");

    const { data } = await db
        .from("usuarios")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (!data.tipo_veiculo) {
        window.location.href = "entregador-cadastro.html";
        return null;
    }

    return data;
}

async function carregarPedidos(entregador) {
    const { data: pedidos } = await db
        .from("pedidos")
        .select(`
            id,
            endereco_entrega,
            lat_entrega,
            lng_entrega,
            distancia,
            horario_entrega,
            data_entrega,
            itens_pedido (
                quantidade,
                produtos (sensivel, em_caixa)
            )
        `)
        .eq("entregador_id", entregador.id)
        .eq("status", "pendente");

    if (!pedidos || pedidos.length === 0) {
        document.getElementById("listaPedidos").innerHTML = "Nenhum pedido.";
        return;
    }

    const processados = pedidos.map(p => {
        let qtd = 0;
        let sensiveis = true;

        p.itens_pedido.forEach(i => {
            qtd += i.quantidade;
            if (i.produtos.sensivel && !i.produtos.em_caixa) sensiveis = false;
        });

        return {
            id: p.id,
            lat: p.lat_entrega,
            lng: p.lng_entrega,
            quantidadeTotal: qtd,
            sensiveisEmCaixa: sensiveis,
            distanciaRota: p.distancia,
            endereco: p.endereco_entrega,
            horario: p.horario_entrega,
            data: p.data_entrega
        };
    });

    const tipo = tipoDeRota(processados, entregador);

    exibirPedidos(processados, tipo);
}

function exibirPedidos(lista, tipo) {
    const div = document.getElementById("listaPedidos");
    div.innerHTML = `<h2>Rota: ${tipo}</h2>`;

    lista.forEach(p => {
        div.innerHTML += `
            <div class="pedido">
                <p><b>ID:</b> ${p.id}</p>
                <p><b>Endereço:</b> ${p.endereco}</p>
                <p><b>Quantidade:</b> ${p.quantidadeTotal}</p>
                <p><b>Sensíveis em caixa:</b> ${p.sensiveisEmCaixa ? "Sim" : "Não"}</p>
            </div>
        `;
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    const entregador = await carregarEntregador();
    if (entregador) carregarPedidos(entregador);
});
