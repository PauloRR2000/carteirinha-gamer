/* =========================================================
   CARTEIRINHA GAMER — CUSTOMIZER V5.7
   Prévia ao vivo usando o Avatar Engine V5.7.
========================================================= */

(function () {
    "use strict";

    const LABELS = {
        skin: {
            clara: "Clara",
            media: "Média clara",
            morena: "Morena",
            escura: "Escura",
            profunda: "Profunda"
        },
        hair: {
            castanho: "Castanho",
            preto: "Preto",
            loiro: "Loiro",
            ruivo: "Ruivo",
            azul: "Azul",
            roxo: "Roxo"
        },
        headset: {
            roxo: "Roxo",
            azul: "Azul",
            rosa: "Rosa",
            verde: "Verde",
            laranja: "Laranja"
        },
        outfit: {
            escura: "Escura",
            roxa: "Roxa",
            azul: "Azul",
            verde: "Verde",
            vermelha: "Vermelha",
            cinza: "Cinza"
        },
        accessory: {
            none: "Nenhum",
            glasses: "Óculos",
            clip: "Presilha",
            pin: "Pin gamer",
            earring: "Brinco"
        },
        accessoryColor: {
            roxo: "Roxo",
            azul: "Azul",
            rosa: "Rosa",
            verde: "Verde",
            laranja: "Laranja"
        }
    };

    const BASE_NAMES = {
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

    function lerPerfil() {
        try {
            return JSON.parse(localStorage.getItem("cg_perfil") || "{}") || {};
        } catch {
            return {};
        }
    }

    function iniciar() {
        const engine = window.CGAvatarEngineV57;
        if (!engine) return;

        const canvas = document.querySelector("#avatarCanvasV57");
        const baseName = document.querySelector("#avatarBaseNameV57");
        const status = document.querySelector("#avatarStatusV57");
        const btnSalvar = document.querySelector("#btnSalvarAvatarV57");
        const selectAvatar = document.querySelector("#perfilAvatarInput");
        const hiddenAvatar = document.querySelector("#perfilAvatarCustomInput");
        const grid = document.querySelector("#avatarGridV5");

        if (!canvas || !selectAvatar || !hiddenAvatar || !grid) return;

        const perfil = lerPerfil();
        const salvo = engine.parse(perfil.avatar);
        let state = engine.normalize(salvo || engine.defaults);
        let renderToken = 0;

        if (!salvo) {
            const baseInicial = String(perfil.avatar || "").startsWith("avatar-")
                ? String(perfil.avatar)
                : "avatar-01";
            state = engine.normalize({ ...state, base: baseInicial });
        }

        function atualizarResumo() {
            Object.keys(LABELS).forEach(part => {
                const target = document.querySelector(`[data-v57-summary="${part}"]`);
                if (!target) return;
                target.textContent = LABELS[part][state[part]] || state[part];
            });
        }

        function atualizarBotoes() {
            document.querySelectorAll("[data-v57-part]").forEach(botao => {
                const part = botao.dataset.v57Part;
                const value = botao.dataset.v57Value;
                const ativo = state[part] === value;
                botao.classList.toggle("ativo", ativo);
                botao.setAttribute("aria-pressed", ativo ? "true" : "false");
            });
        }

        function atualizarBase() {
            if (baseName) baseName.textContent = BASE_NAMES[state.base] || state.base;
        }

        async function render() {
            const meuToken = ++renderToken;
            if (status) status.textContent = "Atualizando prévia...";

            try {
                await engine.renderCanvas(state, canvas);
                if (meuToken !== renderToken) return;
                if (status) status.textContent = "Prévia atualizada. Escolha outras opções ou use esta personalização.";
            } catch (erro) {
                console.error("Erro ao renderizar avatar V5.7:", erro);
                if (status) status.textContent = "Não foi possível atualizar a prévia.";
            }
        }

        function atualizarTudo() {
            atualizarResumo();
            atualizarBotoes();
            atualizarBase();
            render();
        }

        grid.querySelectorAll("[data-avatar-choice]").forEach(botao => {
            botao.addEventListener("click", () => {
                const base = botao.dataset.avatarChoice;
                if (!base) return;

                state = engine.normalize({ ...state, base });
                atualizarTudo();
            });
        });

        document.querySelectorAll("[data-v57-part]").forEach(botao => {
            botao.addEventListener("click", () => {
                const part = botao.dataset.v57Part;
                const value = botao.dataset.v57Value;
                if (!part || !value) return;

                state = engine.normalize({ ...state, [part]: value });
                atualizarTudo();
            });
        });

        btnSalvar?.addEventListener("click", async () => {
            const encoded = engine.encode(state);
            hiddenAvatar.value = encoded;
            selectAvatar.value = "custom-v2";

            localStorage.setItem("cg_avatar_custom_v57", encoded);

            if (status) {
                status.textContent = "Personalização pronta. Agora clique em “Salvar perfil” no fim da página.";
            }

            const preview = document.querySelector("#avatarPreviewV5");
            if (preview) {
                preview.dataset.avatarCode = encoded;
                preview.dataset.avatarRenderizado = "";
                preview.textContent = encoded;
            }

            document.dispatchEvent(new CustomEvent("cg-avatar-v57-updated", {
                detail: { encoded }
            }));
        });

        hiddenAvatar.value = engine.encode(state);
        atualizarTudo();
    }

    document.addEventListener("DOMContentLoaded", iniciar);
})();
