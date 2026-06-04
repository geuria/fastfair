import { db } from "./db.js";

async function uploadArquivo(arquivo, caminho) {
    const { error } = await db.storage
        .from("entregadores")
        .upload(caminho, arquivo, { upsert: true });

    if (error) throw error;

    const { data } = db.storage
        .from("entregadores")
        .getPublicUrl(caminho);

    return data.publicUrl;
}

async function salvarCadastro() {
    const usuarioId = localStorage.getItem("usuario");

    const tipoVeiculo = document.getElementById("tipoVeiculo").value;
    const temAr = document.getElementById("temAr").value === "true";
    const placa = document.getElementById("placa").value;

    const fotoVeiculo = document.getElementById("fotoVeiculo").files[0];
    const cnhFrente = document.getElementById("cnhFrente").files[0];
    const cnhVerso = document.getElementById("cnhVerso").files[0];
    const selfieCnh = document.getElementById("selfieCnh").files[0];

    const base = `entregador_${usuarioId}`;

    const fotoVeiculoUrl = await uploadArquivo(fotoVeiculo, `${base}/foto_veiculo.jpg`);
    const cnhFrenteUrl = await uploadArquivo(cnhFrente, `${base}/cnh_frente.jpg`);
    const cnhVersoUrl = await uploadArquivo(cnhVerso, `${base}/cnh_verso.jpg`);
    const selfieCnhUrl = await uploadArquivo(selfieCnh, `${base}/selfie_cnh.jpg`);

    await db.from("usuarios")
        .update({
            tipo: "entregador",
            tipo_veiculo: tipoVeiculo,
            tem_ar: temAr,
            placa,
            foto_veiculo_url: fotoVeiculoUrl,
            cnh_frente_url: cnhFrenteUrl,
            cnh_verso_url: cnhVersoUrl,
            selfie_cnh_url: selfieCnhUrl
        })
        .eq("id", usuarioId);

    alert("Cadastro salvo!");
    window.location.href = "entregador.html";
}

document.getElementById("btnSalvar").addEventListener("click", salvarCadastro);
