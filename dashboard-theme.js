/* =========================================================
   CARTEIRINHA GAMER — DASHBOARD VISUAL V5
   Complementa script.js sem alterar a lógica principal.
========================================================= */

(function () {
    "use strict";

    if (document.body?.dataset?.page !== "dashboard") return;

    function lerJSON(chave, fallback) {
        try {
            const valor = localStorage.getItem(chave);
            return valor ? JSON.parse(valor) : fallback;
        } catch (erro) {
            console.warn("Carteirinha Gamer: não foi possível ler", chave, erro);
            return fallback;
        }
    }

    function texto(valor, fallback) {
        const resultado = String(valor ?? "").trim();
        return resultado || fallback;
    }

    function numero(valor) {
        const n = Number(valor);
        return Number.isFinite(n) ? n : 0;
    }

    function obterTempoMinutos(jogo) {
        const horas = Math.max(0, numero(jogo?.horas));
        const possuiMinutos = Object.prototype.hasOwnProperty.call(jogo || {}, "minutos");

        if (!possuiMinutos) return Math.round(horas * 60);

        return (
            Math.floor(horas) * 60 +
            Math.max(0, Math.floor(numero(jogo?.minutos)))
        );
    }

    function formatarTempo(totalMinutos) {
        const total = Math.max(0, Math.floor(numero(totalMinutos)));
        const horas = Math.floor(total / 60);
        const minutos = total % 60;

        if (!horas && !minutos) return "0min";
        if (!horas) return `${minutos}min`;
        if (!minutos) return `${horas}h`;
        return `${horas}h ${minutos}min`;
    }

    const perfil = lerJSON("cg_perfil", {});
    const jogos = lerJSON("cg_jogos", []);
    const listaJogos = Array.isArray(jogos) ? jogos : [];

    const favorito = listaJogos.find(
        jogo => jogo?.id && jogo.id === perfil?.jogoFavoritoId
    );

    const zerados = listaJogos.filter(jogo =>
        ["Zerado", "100%"].includes(jogo?.status)
    ).length;

    const dropados = listaJogos.filter(jogo =>
        jogo?.status === "Dropado"
    ).length;

    const tempoMinutos = listaJogos.reduce(
        (total, jogo) => total + obterTempoMinutos(jogo),
        0
    );

    const mapa = {
        dashPerfilNome: texto(perfil?.nome, "Jogador"),
        dashPerfilFavorito: texto(favorito?.nome, "Nenhum favorito"),
        dashPerfilPlataforma: texto(perfil?.plataformaFavorita, "Não definida"),
        dashPerfilCategoria: texto(perfil?.categoriaFavorita, "Não definida"),
        miniDashJogos: listaJogos.length,
        miniDashZerados: zerados,
        miniDashDropados: dropados,
        miniDashTempo: formatarTempo(tempoMinutos)
    };

    Object.entries(mapa).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.textContent = valor;
    });

    const avatar = document.getElementById("dashboardAvatar");
    if (avatar && perfil?.avatar) avatar.textContent = perfil.avatar;

    const capa = document.getElementById("dashMiniFavoritoCapa");
    const urlCapa = favorito?.catalogo?.capa || favorito?.capa || "";

    if (capa && urlCapa) {
        capa.src = urlCapa;
        capa.hidden = false;
        capa.alt = favorito?.nome ? `Capa de ${favorito.nome}` : "Capa do jogo favorito";
    }

    const habilidades = document.getElementById("dashPerfilHabilidades");
    if (habilidades) {
        const lista = Array.isArray(perfil?.habilidades)
            ? perfil.habilidades.filter(Boolean).slice(0, 4)
            : [];

        habilidades.innerHTML = "";

        (lista.length ? lista : ["Gamer"]).forEach(habilidade => {
            const tag = document.createElement("span");
            tag.textContent = habilidade;
            habilidades.appendChild(tag);
        });
    }
})();
