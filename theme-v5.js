/* =========================================================
   CARTEIRINHA GAMER — TEMA V6.1
   20 avatares ilustrados fixos + migração segura dos avatares antigos.
========================================================= */

(function () {
    "use strict";

    const AVATARS = [
        { code: "avatar-01", file: "assets/avatars/avatar-01.png", label: "Pulse" },
        { code: "avatar-02", file: "assets/avatars/avatar-02.png", label: "Nova" },
        { code: "avatar-03", file: "assets/avatars/avatar-03.png", label: "Ember" },
        { code: "avatar-04", file: "assets/avatars/avatar-04.png", label: "Pixel" },
        { code: "avatar-05", file: "assets/avatars/avatar-05.png", label: "Orbit" },
        { code: "avatar-06", file: "assets/avatars/avatar-06.png", label: "Vibe" },
        { code: "avatar-07", file: "assets/avatars/avatar-07.png", label: "Blaze" },
        { code: "avatar-08", file: "assets/avatars/avatar-08.png", label: "Luna" },
        { code: "avatar-09", file: "assets/avatars/avatar-09.png", label: "Echo" },
        { code: "avatar-10", file: "assets/avatars/avatar-10.png", label: "Astra" },
        { code: "avatar-11", file: "assets/avatars/avatar-11.png", label: "Rift" },
        { code: "avatar-12", file: "assets/avatars/avatar-12.png", label: "Mika" },
        { code: "avatar-13", file: "assets/avatars/avatar-13.png", label: "Volt" },
        { code: "avatar-14", file: "assets/avatars/avatar-14.png", label: "Nia" },
        { code: "avatar-15", file: "assets/avatars/avatar-15.png", label: "Cosmo" },
        { code: "avatar-16", file: "assets/avatars/avatar-16.png", label: "Aya" },
        { code: "avatar-17", file: "assets/avatars/avatar-17.png", label: "Flux" },
        { code: "avatar-18", file: "assets/avatars/avatar-18.png", label: "Zuri" },
        { code: "avatar-19", file: "assets/avatars/avatar-19.png", label: "Byte" },
        { code: "avatar-20", file: "assets/avatars/avatar-20.png", label: "Kira" }
    ];

    const avatarMap = new Map(AVATARS.map(item => [item.code, item]));

    const LEGACY_AVATAR_MAP = new Map([
        ["🕹️", "avatar-01"],
        ["🎮", "avatar-02"],
        ["👾", "avatar-05"],
        ["🧙", "avatar-04"],
        ["🥷", "avatar-11"],
        ["🧟", "avatar-03"]
    ]);

    const ICONS = {
        gamepad: "assets/icons/gamepad.svg",
        trophy: "assets/icons/trophy.svg",
        drop: "assets/icons/drop.svg",
        clock: "assets/icons/clock.svg"
    };

    const CUSTOM_DEFAULT = {
        skin: "clara",
        hair: "preto",
        headset: "roxo",
        hoodie: "preto",
        accessory: "none",
        accent: "roxo"
    };

    const CUSTOM_COLORS = {
        skin: {
            clara: "#ffd8c7",
            media: "#eab08e",
            morena: "#bd7b55",
            escura: "#7a4937",
            profunda: "#4a2d25"
        },
        hair: {
            preto: "#221522",
            castanho: "#5a342e",
            loiro: "#d6ab5e",
            ruivo: "#a84d32",
            azul: "#3e67bd",
            roxo: "#65409a"
        },
        headset: {
            roxo: "#8b5cf6",
            azul: "#39a8ff",
            rosa: "#f05ab9",
            verde: "#40d49a",
            vermelho: "#ef5b69",
            laranja: "#ff9d4d"
        },
        hoodie: {
            preto: "#171521",
            azul: "#254b87",
            roxo: "#4b2d85",
            verde: "#245f50",
            vinho: "#712c40",
            cinza: "#4a5064"
        },
        accent: {
            roxo: "#9b72ff",
            azul: "#54b7ff",
            rosa: "#ff6fb7",
            verde: "#55d9a2",
            laranja: "#ffad57"
        }
    };

    function lerPerfilLocal() {
        try {
            return JSON.parse(localStorage.getItem("cg_perfil") || "{}") || {};
        } catch {
            return {};
        }
    }

    function parseCustomAvatar(valor) {
        const texto = String(valor || "").trim();
        const config = { ...CUSTOM_DEFAULT };

        if (!texto.startsWith("custom-v1")) return null;

        texto.split("|").slice(1).forEach(parte => {
            const [chave, valorParte] = parte.split("=");
            if (!chave || !valorParte) return;
            if (Object.prototype.hasOwnProperty.call(config, chave)) {
                config[chave] = valorParte;
            }
        });

        if (!CUSTOM_COLORS.skin[config.skin]) config.skin = CUSTOM_DEFAULT.skin;
        if (!CUSTOM_COLORS.hair[config.hair]) config.hair = CUSTOM_DEFAULT.hair;
        if (!CUSTOM_COLORS.headset[config.headset]) config.headset = CUSTOM_DEFAULT.headset;
        if (!CUSTOM_COLORS.hoodie[config.hoodie]) config.hoodie = CUSTOM_DEFAULT.hoodie;
        if (!CUSTOM_COLORS.accent[config.accent]) config.accent = CUSTOM_DEFAULT.accent;
        if (!["none", "glasses", "cap", "clip"].includes(config.accessory)) {
            config.accessory = CUSTOM_DEFAULT.accessory;
        }

        return config;
    }

    function encodeCustomAvatar(config) {
        const c = { ...CUSTOM_DEFAULT, ...(config || {}) };
        return [
            "custom-v1",
            `skin=${c.skin}`,
            `hair=${c.hair}`,
            `headset=${c.headset}`,
            `hoodie=${c.hoodie}`,
            `accessory=${c.accessory}`,
            `accent=${c.accent}`
        ].join("|");
    }

    function normalizarAvatar(valor) {
        const texto = String(valor || "").trim();

        // V6.1: o criador por camadas foi removido. Qualquer avatar antigo
        // personalizado migra com segurança para o primeiro avatar fixo.
        if (
            texto.startsWith("data:image/") ||
            texto.startsWith("custom-v58|") ||
            texto.startsWith("custom-v2") ||
            texto.startsWith("custom-v1")
        ) {
            return "avatar-01";
        }

        if (avatarMap.has(texto)) return texto;
        return LEGACY_AVATAR_MAP.get(texto) || "";
    }

    function avatarValido(valor) {
        return Boolean(normalizarAvatar(valor));
    }

    function escapeSvg(value) {
        return String(value).replace(/[&<>\"]/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;"
        }[char]));
    }

    function criarSvgAvatarCustom(config) {
        const c = { ...CUSTOM_DEFAULT, ...(config || {}) };
        const skin = CUSTOM_COLORS.skin[c.skin] || CUSTOM_COLORS.skin.clara;
        const hair = CUSTOM_COLORS.hair[c.hair] || CUSTOM_COLORS.hair.preto;
        const headset = CUSTOM_COLORS.headset[c.headset] || CUSTOM_COLORS.headset.roxo;
        const hoodie = CUSTOM_COLORS.hoodie[c.hoodie] || CUSTOM_COLORS.hoodie.preto;
        const accent = CUSTOM_COLORS.accent[c.accent] || CUSTOM_COLORS.accent.roxo;
        const outline = "#171225";
        const skinShadow = c.skin === "profunda" ? "#36211d" : c.skin === "escura" ? "#5f352b" : "#d89075";
        const hairShadow = "#120d17";

        let accessory = "";

        if (c.accessory === "glasses") {
            accessory = `
                <g fill="none" stroke="${escapeSvg(accent)}" stroke-width="5" opacity=".96">
                    <circle cx="72" cy="96" r="20"/>
                    <circle cx="128" cy="96" r="20"/>
                    <path d="M92 96h16"/>
                </g>`;
        } else if (c.accessory === "cap") {
            accessory = `
                <path d="M45 57 Q82 20 132 43 Q151 49 157 67 Q113 57 73 72Z" fill="${escapeSvg(accent)}" stroke="${outline}" stroke-width="5"/>
                <path d="M126 61 Q160 58 174 72 Q149 76 124 72Z" fill="${escapeSvg(accent)}" stroke="${outline}" stroke-width="5"/>`;
        } else if (c.accessory === "clip") {
            accessory = `
                <g transform="translate(139 62) rotate(12)">
                    <rect x="-12" y="-5" width="24" height="10" rx="5" fill="${escapeSvg(accent)}" stroke="${outline}" stroke-width="3"/>
                    <circle cx="0" cy="0" r="3" fill="#fff"/>
                </g>`;
        }

        return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
            <defs>
                <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stop-color="#5d43c7"/>
                    <stop offset=".55" stop-color="#8b5cf6"/>
                    <stop offset="1" stop-color="${escapeSvg(accent)}"/>
                </linearGradient>
                <linearGradient id="hood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="${escapeSvg(hoodie)}"/>
                    <stop offset="1" stop-color="#0b0b13"/>
                </linearGradient>
            </defs>

            <rect x="3" y="3" width="194" height="194" rx="34" fill="url(#bg)"/>
            <circle cx="30" cy="35" r="3" fill="#fff" opacity=".78"/>
            <path d="M22 56l10 0M27 51l0 10M166 30l12 0M172 24l0 12" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".72"/>

            <path d="M22 200 Q28 153 58 143 Q79 135 100 136 Q121 135 143 143 Q172 153 178 200Z" fill="url(#hood)" stroke="${outline}" stroke-width="6"/>
            <path d="M58 153 Q80 170 100 169 Q121 170 143 153" fill="none" stroke="#090910" stroke-width="7" stroke-linecap="round" opacity=".65"/>
            <path d="M88 154l-4 29M112 154l4 29" stroke="${escapeSvg(accent)}" stroke-width="5" stroke-linecap="round"/>
            <circle cx="84" cy="184" r="5" fill="${escapeSvg(accent)}"/>
            <circle cx="116" cy="184" r="5" fill="${escapeSvg(accent)}"/>

            <rect x="84" y="129" width="32" height="31" rx="14" fill="${escapeSvg(skin)}" stroke="${outline}" stroke-width="5"/>
            <circle cx="50" cy="97" r="17" fill="${escapeSvg(skin)}" stroke="${outline}" stroke-width="5"/>
            <circle cx="150" cy="97" r="17" fill="${escapeSvg(skin)}" stroke="${outline}" stroke-width="5"/>

            <path d="M42 92 Q42 48 70 35 Q97 20 128 35 Q158 49 158 94 L150 115 Q140 143 101 148 Q62 143 51 115Z" fill="${escapeSvg(skin)}" stroke="${outline}" stroke-width="6"/>
            <path d="M53 114 Q66 135 101 140 Q137 135 149 113 Q140 146 101 151 Q63 146 53 114Z" fill="${escapeSvg(skinShadow)}" opacity=".13"/>

            <path d="M43 82 Q39 48 64 31 Q91 11 124 24 Q153 35 161 62 Q166 81 156 102 Q151 67 136 56 Q121 43 103 43 Q72 43 52 71Z" fill="${escapeSvg(hair)}" stroke="${outline}" stroke-width="6"/>
            <path d="M58 62 Q73 35 94 35 Q86 60 72 76 Q88 51 111 36 Q108 65 92 81 Q112 56 137 48 Q132 72 115 84 Q136 69 154 68 Q150 94 139 105" fill="${escapeSvg(hair)}" stroke="${outline}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M49 84 Q42 119 58 133 Q51 112 61 97" fill="${escapeSvg(hairShadow)}" opacity=".45"/>

            <path d="M48 70 Q51 36 79 26 Q100 15 126 27 Q151 39 155 71" fill="none" stroke="${escapeSvg(headset)}" stroke-width="10" stroke-linecap="round"/>
            <rect x="34" y="70" width="24" height="54" rx="12" fill="${escapeSvg(headset)}" stroke="${outline}" stroke-width="5"/>
            <rect x="142" y="70" width="24" height="54" rx="12" fill="${escapeSvg(headset)}" stroke="${outline}" stroke-width="5"/>
            <rect x="40" y="79" width="11" height="36" rx="6" fill="#191225" opacity=".75"/>
            <rect x="149" y="79" width="11" height="36" rx="6" fill="#191225" opacity=".75"/>
            <circle cx="154" cy="97" r="5" fill="#fff" opacity=".72"/>

            <ellipse cx="76" cy="98" rx="14" ry="18" fill="#241722"/>
            <ellipse cx="124" cy="98" rx="14" ry="18" fill="#241722"/>
            <ellipse cx="72" cy="92" rx="5" ry="7" fill="#fff"/>
            <ellipse cx="120" cy="92" rx="5" ry="7" fill="#fff"/>
            <ellipse cx="82" cy="118" rx="12" ry="5" fill="#ff8b8b" opacity=".45"/>
            <ellipse cx="137" cy="118" rx="12" ry="5" fill="#ff8b8b" opacity=".45"/>
            <path d="M92 122 Q100 129 109 122" fill="none" stroke="#6d3542" stroke-width="4" stroke-linecap="round"/>
            <path d="M98 108 Q101 112 105 108" fill="none" stroke="#8c4b48" stroke-width="3" stroke-linecap="round"/>

            ${accessory}
        </svg>`;
    }

    function svgToDataUrl(svg) {
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }

    function criarImagemAvatar(code, classe = "cg-avatar-img") {
        const normalizado = normalizarAvatar(code);
        if (!normalizado) return null;

        const img = document.createElement("img");
        img.className = classe;
        img.loading = "eager";
        img.decoding = "async";

        if (normalizado.startsWith("data:image/")) {
            img.src = normalizado;
            img.alt = "Personagem personalizado";
        } else if (normalizado.startsWith("custom-v58|")) {
            const cached =
                localStorage.getItem("cg_avatar_v58_image") ||
                "";

            img.alt = "Personagem personalizado";

            if (cached) {
                img.src = cached;
            } else {
                const builder = window.CGAvatarV58;
                const config = builder?.parse(normalizado);

                if (!builder || !config) return null;

                builder
                    .renderDataUrl(config, 512)
                    .then(url => {
                        img.src = url;
                        localStorage.setItem("cg_avatar_v58_image", url);
                    })
                    .catch(erro => {
                        console.error("Erro ao renderizar avatar V5.8:", erro);
                    });
            }
        } else if (normalizado.startsWith("custom-v2")) {
            const engine = window.CGAvatarEngineV57;
            const config = engine?.parse(normalizado);

            if (!engine || !config) return null;

            img.src = engine.baseFile(config.base);
            img.alt = "Personagem personalizado";

            engine
                .renderDataUrl(config, 512)
                .then(url => {
                    img.src = url;
                })
                .catch(erro => {
                    console.error("Erro ao renderizar avatar personalizado:", erro);
                });
        } else {
            const item = avatarMap.get(normalizado);
            if (!item) return null;
            img.src = item.file;
            img.alt = `Avatar ${item.label}`;
        }

        return img;
    }

    function renderizarAvatarElemento(elemento) {
        if (!elemento) return;

        let code = normalizarAvatar(elemento.dataset?.avatarCode || "");

        if (!code) {
            const texto = String(elemento.textContent || "").trim();
            code = normalizarAvatar(texto);
        }

        if (!code) return;

        if (
            elemento.dataset.avatarRenderizado === code &&
            elemento.querySelector("img.cg-avatar-img")
        ) {
            return;
        }

        const img = criarImagemAvatar(code);
        if (!img) return;

        elemento.dataset.avatarCode = code;
        elemento.dataset.avatarRenderizado = code;
        elemento.replaceChildren(img);
    }

    function aplicarAvatares() {
        const seletores = [
            "#dashboardAvatar",
            "#miniAvatar",
            "#perfilAvatar",
            "#publicoAvatar",
            ".avatar-jogador-publico",
            ".avatar-grande",
            ".avatar-topo"
        ];

        document.querySelectorAll(seletores.join(",")).forEach(renderizarAvatarElemento);
        renderizarBotaoLogin();
    }

    function renderizarBotaoLogin() {
        // O sistema de conta V6.2 controla sozinho o botão Entrar/conta.
        // Isso evita que o perfil local reapareça no topo depois do logout.
        if (window.CGAuth) return;

        const botao = document.querySelector("#botaoLogin");
        if (!botao) return;

        const perfil = lerPerfilLocal();
        const code = normalizarAvatar(perfil.avatar);
        const nome = String(perfil.nome || "Visitante");

        if (!code) return;
        if (botao.dataset.avatarLogin === code && botao.querySelector("img")) return;

        const img = criarImagemAvatar(code, "avatar-login-v5");
        if (!img) return;
        img.alt = "";

        const span = document.createElement("span");
        span.textContent = nome;

        botao.dataset.avatarLogin = code;
        botao.replaceChildren(img, span);
    }

    function atualizarBotoesBuilder(config) {
        document.querySelectorAll("[data-custom-part]").forEach(botao => {
            const parte = botao.dataset.customPart;
            const valor = botao.dataset.customValue;
            const ativo = config[parte] === valor;
            botao.classList.toggle("ativo", ativo);
            botao.setAttribute("aria-pressed", ativo ? "true" : "false");
        });
    }

    function renderizarPreviewCustom(config) {
        const preview = document.querySelector("#avatarCustomPreviewV55");
        if (!preview) return;
        const encoded = encodeCustomAvatar(config);
        preview.dataset.avatarCode = encoded;
        preview.dataset.avatarRenderizado = "";
        preview.textContent = encoded;
        renderizarAvatarElemento(preview);
    }

    function prepararSeletorPerfil() {
        const select = document.querySelector("#perfilAvatarInput");
        const grade = document.querySelector("#avatarGridV5");
        const hiddenCustom = document.querySelector("#perfilAvatarCustomInput");

        if (!select || !grade) return;

        select.classList.add("avatar-select-fallback");

        const perfil = lerPerfilLocal();
        const salvo = normalizarAvatar(perfil.avatar) || "avatar-01";

        function atualizarPreview(code) {
            const preview = document.querySelector("#avatarPreviewV5");
            if (!preview) return;

            preview.dataset.avatarCode = code;
            preview.dataset.avatarRenderizado = "";
            preview.textContent = code;
            renderizarAvatarElemento(preview);
        }

        function marcarPremade(code) {
            const normalizado = normalizarAvatar(code);
            if (!normalizado || normalizado.startsWith("custom-v2")) return;

            select.value = normalizado;

            grade.querySelectorAll("[data-avatar-choice]").forEach(botao => {
                const ativo = botao.dataset.avatarChoice === normalizado;
                botao.classList.toggle("ativo", ativo);
                botao.setAttribute("aria-pressed", ativo ? "true" : "false");
            });

            atualizarPreview(normalizado);
        }

        function marcarCustom(encoded) {
            const normalizado = normalizarAvatar(encoded);
            if (!normalizado || !normalizado.startsWith("custom-v2")) return;

            select.value = "custom-v2";
            if (hiddenCustom) hiddenCustom.value = normalizado;

            grade.querySelectorAll("[data-avatar-choice]").forEach(botao => {
                botao.classList.remove("ativo");
                botao.setAttribute("aria-pressed", "false");
            });

            atualizarPreview(normalizado);
        }

        grade.querySelectorAll("[data-avatar-choice]").forEach(botao => {
            botao.addEventListener("click", () => marcarPremade(botao.dataset.avatarChoice));
        });

        document.addEventListener("cg-avatar-v57-updated", event => {
            const encoded = event.detail?.encoded;
            if (encoded) marcarCustom(encoded);
        });

        if (salvo.startsWith("custom-v2")) {
            marcarCustom(salvo);
        } else {
            marcarPremade(salvo);
        }
    }

    function substituirIcone(elemento, arquivo) {
        if (!elemento || elemento.querySelector("img[data-cg-icon]")) return;
        elemento.textContent = "";
        const img = document.createElement("img");
        img.src = arquivo;
        img.alt = "";
        img.dataset.cgIcon = "1";
        elemento.appendChild(img);
    }

    function aplicarIconesEstatisticas() {
        document.querySelectorAll(".estatisticas-grandes article > span").forEach(span => {
            const texto = String(span.textContent || "").trim();

            if (texto.includes("🎮")) substituirIcone(span, ICONS.gamepad);
            else if (texto.includes("🏆")) substituirIcone(span, ICONS.trophy);
            else if (texto.includes("❌") || texto.includes("✕")) substituirIcone(span, ICONS.drop);
            else if (texto.includes("⏱") || texto.includes("◷")) substituirIcone(span, ICONS.clock);
        });
    }

    function atualizarTudo() {
        aplicarAvatares();
        aplicarIconesEstatisticas();
    }

    document.addEventListener("DOMContentLoaded", () => {
        prepararSeletorPerfil();
        atualizarTudo();

        setTimeout(atualizarTudo, 40);
        setTimeout(atualizarTudo, 250);

        const observer = new MutationObserver(() => atualizarTudo());
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    });

    window.CG_AVATARS = AVATARS;
    window.CG_CUSTOM_AVATAR = window.CGAvatarEngineV57 || {
        defaults: { ...CUSTOM_DEFAULT },
        parse: parseCustomAvatar,
        encode: encodeCustomAvatar
    };
})();
