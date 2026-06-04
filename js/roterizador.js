// js/roteirizador.js
const DISTANCIA_MAX_CLIENTES = 1.5;
const DISTANCIA_MAX_TRES_CLIENTES = 1.0;
const DISTANCIA_MAX_ROTA = 25;

function distanciaKm(lat1, lon1, lat2, lon2) {
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

function capacidadePorVeiculo(entregador) {
    if (entregador.tipo_veiculo === "moto") return 3;
    if (entregador.tipo_veiculo === "carro" && entregador.tem_ar) return 7;
    if (entregador.tipo_veiculo === "carro_grande" && entregador.tem_ar) return 15;
    return 3;
}

function podeLevarTres(pedidos) {
    if (pedidos.length !== 3) return false;

    for (const p of pedidos) {
        if (!p.sensiveisEmCaixa) return false;
        if (p.quantidadeTotal > 6) return false;
        if (p.distanciaRota > DISTANCIA_MAX_ROTA) return false;
    }

    const [a, b, c] = pedidos;

    const ab = distanciaKm(a.lat, a.lng, b.lat, b.lng);
    const ac = distanciaKm(a.lat, a.lng, c.lat, c.lng);
    const bc = distanciaKm(b.lat, b.lng, c.lat, c.lng);

    if (ab > DISTANCIA_MAX_TRES_CLIENTES) return false;
    if (ac > DISTANCIA_MAX_TRES_CLIENTES) return false;
    if (bc > DISTANCIA_MAX_TRES_CLIENTES) return false;

    return true;
}

function podeLevarDois(pedidos) {
    if (pedidos.length !== 2) return false;

    const [a, b] = pedidos;

    if (!a.sensiveisEmCaixa || !b.sensiveisEmCaixa) return false;
    if (a.quantidadeTotal > 8 || b.quantidadeTotal > 8) return false;
    if (a.distanciaRota > DISTANCIA_MAX_ROTA || b.distanciaRota > DISTANCIA_MAX_ROTA) return false;

    const dist = distanciaKm(a.lat, a.lng, b.lat, b.lng);
    if (dist > DISTANCIA_MAX_CLIENTES) return false;

    return true;
}

function tipoDeRota(pedidos, entregador) {
    const capacidade = capacidadePorVeiculo(entregador);

    if (pedidos.length > capacidade) return "isolada";

    if (pedidos.length === 1) return "isolada";
    if (pedidos.length === 2 && podeLevarDois(pedidos)) return "2-pedidos";
    if (pedidos.length === 3 && podeLevarTres(pedidos)) return "3-pedidos";

    return "isolada";
}

export { distanciaKm, tipoDeRota, capacidadePorVeiculo };
