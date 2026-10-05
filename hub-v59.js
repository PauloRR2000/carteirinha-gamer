(function () {
  const STORAGE_JOGOS = "cg_jogos";

  function lerJogos() {
    try {
      const bruto = localStorage.getItem(STORAGE_JOGOS);
      const jogos = bruto ? JSON.parse(bruto) : [];
      return Array.isArray(jogos) ? jogos : [];
    } catch (erro) {
      console.error("Hub V5.9: não foi possível ler a biblioteca.", erro);
      return [];
    }
  }

  function numero(valor) {
    const n = Number(valor);
    return Number.isFinite(n) ? n : 0;
  }

  function tempoMinutos(jogo) {
    if (!jogo) return 0;

    const horas = Math.max(0, numero(jogo.horas));

    if (!Object.prototype.hasOwnProperty.call(jogo, "minutos")) {
      return Math.round(horas * 60);
    }

    return (
      Math.floor(horas) * 60 +
      Math.max(0, Math.floor(numero(jogo.minutos)))
    );
  }

  function formatarTempo(totalMinutos) {
    const total = Math.max(0, Math.floor(numero(totalMinutos)));
    const h = Math.floor(total / 60);
    const m = total % 60;

    if (!h && !m) return "0min";
    if (!h) return `${m}min`;
    if (!m) return `${h}h`;
    return `${h}h ${m}min`;
  }

  function definir(id, valor) {
    const el = document.getElementById(id);
    if (el) el.textContent = valor;
  }

  function atualizarResumo() {
    const jogos = lerJogos();
    const totalTempo = jogos.reduce((soma, jogo) => soma + tempoMinutos(jogo), 0);
    const zerados = jogos.filter(jogo => ["Zerado", "100%"].includes(jogo.status)).length;

    definir("hubTotalJogos", jogos.length);
    definir("hubTempoJogado", formatarTempo(totalTempo));
    definir("hubZerados", zerados);
  }

  document.addEventListener("DOMContentLoaded", atualizarResumo);
})();
