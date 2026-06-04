const { createClient } = supabase;

const db = createClient(
    "https://iqpyptpacglgoawlvyai.supabase.co",
    "sb_publishable_f6rQubRvqp2V1GBD-YI1yQ_Zd7A_7BW"
);

const VALOR_MINIMO = 40;
const BASE_CLIENTE = 10;
const BASE_ENTREGADOR = 8;
const VALOR_KM = 1;
const DIST_MAX_KM = 25;

let latEntrega = null;
let lngEntrega = null;
let carrinho = [];

// Haversine simplificado
function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function getCarrinho() {
    return JSON.parse(localStorage.getItem("carrinho")) || [];
}

async function carregarResumo() {
    carrinho = getCarrinho();
    const div = document.getElementById("resumoPedido");

    if (!carrinho.length) {
        div.innerHTML = "<p>Seu carrinho está vazio.</p>";
        document.getElementById("btnFinalizar").disabled = true;
        return;
    }

    let subtotal = 0;
    let html = "<h2 class='texto-3d texto-contorno'>Resumo do Pedido</h2><ul>";

    carrinho.forEach(item => {
        const totalItem = item.preco * item.quantidade;
        subtotal += totalItem;
        html += `<li>${item.nome} x ${item.quantidade} — R$ ${totalItem.toFixed(2)}</li>`;
    });

    html += "</ul>";
    html += `<p><strong>Subtotal:</strong> R$ ${subtotal.toFixed(2)}</p>`;

    if (subtotal < VALOR_MINIMO) {
        html += `<p style="color:red;">Valor mínimo para compra: R$ ${VALOR_MINIMO.toFixed(2)}</p>`;
        document.getElementById("btnFinalizar").disabled = true;
    } else {
        document.getElementById("btnFinalizar").disabled = false;
    }

    div.innerHTML = html;
}

function initMapa() {
    const map = L.map('map').setView([-22.92, -42.51], 12); // centro Saquarema aproximado

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(map);

    let marker = null;

    map.on('click', e => {
        latEntrega = e.latlng.lat;
        lngEntrega = e.latlng.lng;

        if (marker) map.removeLayer(marker);
        marker = L.marker([latEntrega, lngEntrega]).addTo(map);
    });
}

async function finalizarPedido() {
    const endereco = document.getElementById("endereco").value.trim();
    const dataEntrega = document.getElementById("dataEntrega").value;
    const horarioEntrega = document.getElementById("horarioEntrega").value;

    if (!carrinho.length) {
        alert("Carrinho vazio.");
        return;
    }

    if (!endereco) {
        alert("Informe o endereço de entrega.");
        return;
    }

    if (!dataEntrega) {
        alert("Selecione a data de entrega.");
        return;
    }

    if (!latEntrega || !lngEntrega) {
        alert("Clique no mapa para marcar o local de entrega.");
        return;
    }

    // Aqui, para simplificar, vamos usar o primeiro produtor do carrinho
    // como referência de distância. Depois dá pra refinar por rota.
    const produtorId = carrinho[0].produtor_id;

    const { data: produtores } = await db
        .from("usuarios")
        .select("id, lat, lng")
        .eq("id", produtorId)
        .maybeSingle();

    if (!produtores || !produtores.lat || !produtores.lng) {
        alert("Não foi possível calcular a distância. Produtor sem localização.");
        return;
    }

    const distanciaKm = calcularDistanciaKm(
        produtores.lat,
        produtores.lng,
        latEntrega,
        lngEntrega
    );

    if (distanciaKm > DIST_MAX_KM) {
        alert(`Distância de ${distanciaKm.toFixed(1)} km excede o limite de ${DIST_MAX_KM} km.`);
        return;
    }

    let subtotal = 0;
    carrinho.forEach(item => {
        subtotal += item.preco * item.quantidade;
    });

    if (subtotal < VALOR_MINIMO) {
        alert(`Valor mínimo para compra é R$ ${VALOR_MINIMO.toFixed(2)}.`);
        return;
    }

    const freteCliente = BASE_CLIENTE + (distanciaKm * VALOR_KM);
    const freteEntregador = BASE_ENTREGADOR + (distanciaKm * VALOR_KM);
    const lucroPlataformaFrete = freteCliente - freteEntregador;
    const totalPedido = subtotal + freteCliente;

    const clienteId = localStorage.getItem("usuario");

    const { data: pedido, error: erroPedido } = await db
        .from("pedidos")
        .insert({
            cliente_id: clienteId,
            total: totalPedido,
            frete_cliente: freteCliente,
            frete_entregador: freteEntregador,
            lucro_frete: lucroPlataformaFrete,
            status: "pendente",
            data_entrega: dataEntrega,
            horario_entrega: horarioEntrega,
            endereco_entrega: endereco,
            lat_entrega: latEntrega,
            lng_entrega: lngEntrega
        })
        .select()
        .single();

    if (erroPedido) {
        console.error(erroPedido);
        alert("Erro ao criar pedido.");
        return;
    }

    const itens = carrinho.map(item => ({
        pedido_id: pedido.id,
        produto_id: item.id,
        produtor_id: item.produtor_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco
    }));

    const { error: erroItens } = await db
        .from("itens_pedido")
        .insert(itens);

    if (erroItens) {
        console.error(erroItens);
        alert("Erro ao salvar itens do pedido.");
        return;
    }

    localStorage.removeItem("carrinho");
    alert("Pedido realizado com sucesso!");
    window.location.href = "meus-pedidos.html";
}

document.addEventListener("DOMContentLoaded", () => {
    carregarResumo();
    initMapa();
    document.getElementById("btnFinalizar").addEventListener("click", finalizarPedido);
});
