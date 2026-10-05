/* =========================================================
   CARTEIRINHA GAMER — AVATAR CUSTOMIZER V5.6
   Mantém o mesmo avatar ilustrado escolhido na grade.
   As preferências visuais são salvas separadamente para a
   futura versão em camadas, sem substituir a arte por SVG.
========================================================= */

(() => {
    "use strict";

    const STORAGE_KEY = "cg_avatar_custom_v2";

    const LABELS = {
        "avatar-01": "Casual",
        "avatar-02": "Competitivo",
        "avatar-03": "Survival",
        "avatar-04": "RPG",
        "avatar-05": "Futurista",
        "avatar-06": "Retrô",
        "avatar-07": "Streamer",
        "avatar-08": "Indie",
        "avatar-09": "Aventura",
        "avatar-10": "Sci-Fi",
        "avatar-11": "Stealth",
        "avatar-12": "Co-op"
    };

    const FILES = Object.fromEntries(
        Object.keys(LABELS).map(code => [code, `assets/avatars/${code}.png`])
    );

    const DEFAULTS = {
        base: "avatar-01",
        skin: "Clara",
        hair: "Castanho",
        headset: "Roxo",
        outfit: "Escura",
        accessory: "Nenhum"
    };

    function lerSalvo() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return { ...DEFAULTS };
            const parsed = JSON.parse(raw);
            return { ...DEFAULTS, ...(parsed || {}) };
        } catch (erro) {
            console.warn("Não foi possível carregar a personalização do avatar:", erro);
            return { ...DEFAULTS };
        }
    }

    function salvar(estado) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
    }

    function iniciar() {
        const select = document.querySelector("#perfilAvatarInput");
        const grade = document.querySelector("#avatarGridV5");
        const preview = document.querySelector("#avatarBasePreviewV56");
        const nomeBase = document.querySelector("#avatarBaseNameV56");
        const status = document.querySelector("#avatarStatusV56");
        const botaoSalvar = document.querySelector("#btnSalvarAvatarV56");

        if (!select || !grade || !preview) return;

        let estado = lerSalvo();

        // Migração segura de um teste antigo com custom-v1.
        const valorSelect = String(select.value || "");
        if (LABELS[valorSelect]) {
            estado.base = valorSelect;
        } else if (!LABELS[estado.base]) {
            estado.base = DEFAULTS.base;
        }

        function atualizarPreview() {
            const base = LABELS[estado.base] ? estado.base : DEFAULTS.base;
            preview.src = FILES[base];
            preview.alt = `Prévia do personagem ${LABELS[base]}`;
            if (nomeBase) nomeBase.textContent = LABELS[base];

            document.querySelectorAll("[data-v56-summary]").forEach(el => {
                const chave = el.dataset.v56Summary;
                if (chave && Object.prototype.hasOwnProperty.call(estado, chave)) {
                    el.textContent = estado[chave];
                }
            });

            document.querySelectorAll("[data-v56-part]").forEach(botao => {
                const parte = botao.dataset.v56Part;
                const valor = botao.dataset.v56Value;
                const ativo = estado[parte] === valor;
                botao.classList.toggle("ativo", ativo);
                botao.setAttribute("aria-pressed", ativo ? "true" : "false");
            });
        }

        function selecionarBase(code) {
            if (!LABELS[code]) return;
            estado.base = code;
            select.value = code;
            atualizarPreview();
            salvar(estado);
            if (status) status.textContent = `${LABELS[code]} selecionado.`;
        }

        grade.querySelectorAll("[data-avatar-choice]").forEach(botao => {
            botao.addEventListener("click", () => {
                selecionarBase(botao.dataset.avatarChoice);
            });
        });

        document.querySelectorAll("[data-v56-part]").forEach(botao => {
            botao.addEventListener("click", () => {
                const parte = botao.dataset.v56Part;
                const valor = botao.dataset.v56Value;
                if (!parte || !valor) return;
                estado = { ...estado, [parte]: valor };
                atualizarPreview();
                salvar(estado);
                if (status) status.textContent = "Preferência atualizada.";
            });
        });

        botaoSalvar?.addEventListener("click", () => {
            // O avatar real salvo no perfil continua sendo a base ilustrada.
            select.value = estado.base;
            salvar(estado);
            atualizarPreview();
            if (status) status.textContent = "Personalização salva. Agora salve o perfil.";
        });

        // Garante que testes antigos não mantenham o seletor preso no SVG custom-v1.
        if (!LABELS[select.value]) {
            select.value = estado.base;
            grade.querySelector(`[data-avatar-choice="${estado.base}"]`)?.click();
        }

        atualizarPreview();
    }

    document.addEventListener("DOMContentLoaded", iniciar);

    window.CG_AVATAR_CUSTOM_V2 = {
        storageKey: STORAGE_KEY,
        defaults: { ...DEFAULTS }
    };
})();
