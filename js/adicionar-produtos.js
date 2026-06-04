document.getElementById("organico").addEventListener("change", e => {
    document.getElementById("certificacaoBox").style.display =
        e.target.value === "sim" ? "block" : "none";
});

document.getElementById("formProduto").addEventListener("submit", async e => {
    e.preventDefault();

    const produto = {
        nome: document.getElementById("nome").value,
        categoria: document.getElementById("categoria").value,
        unidade: document.getElementById("unidade").value,
        preco: Number(document.getElementById("preco").value),
        estoque: Number(document.getElementById("estoque").value),
        organico: document.getElementById("organico").value,
        certificadora: document.getElementById("certificadora").value || null,
        numero_certificado: document.getElementById("numeroCertificado").value || null,
        validade_certificado: document.getElementById("validadeCertificado").value || null
    };

    await db.from("produtos").insert(produto);

    alert("Produto cadastrado!");
    location.href = "produtor.html";
});
