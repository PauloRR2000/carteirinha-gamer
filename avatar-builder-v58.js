
/* =========================================================
   CARTEIRINHA GAMER — CRIADOR DE AVATAR V5.8
   Personagem modular: rosto, pele, cabelo, roupa e acessório.
========================================================= */

(function () {
    "use strict";

    const ROOT = "assets/avatar-builder-v58";

    const LABELS = {
        skin: {
            clara: "Clara",
            media: "Média",
            morena: "Morena",
            escura: "Escura",
            profunda: "Profunda"
        },
        hairColor: {
            preto: "Preto",
            castanho: "Castanho",
            loiro: "Loiro",
            ruivo: "Ruivo",
            azul: "Azul",
            roxo: "Roxo",
            rosa: "Rosa"
        },
        outfitColor: {
            preto: "Preto",
            roxo: "Roxo",
            azul: "Azul",
            verde: "Verde",
            vermelho: "Vermelho",
            cinza: "Cinza",
            rosa: "Rosa"
        },
        accessory: {
            0: "Nenhum",
            1: "Headset roxo",
            2: "Headset azul",
            3: "Headset neko",
            4: "Óculos redondos",
            5: "Óculos gamer",
            6: "Boné",
            7: "Pins",
            8: "Capuz"
        }
    };

    const DEFAULT = {
        face: 1,
        skin: "clara",
        hair: 1,
        hairColor: "preto",
        outfit: 1,
        outfitColor: "preto",
        accessory: 0
    };

    const state = { ...DEFAULT };

    const $ = selector => document.querySelector(selector);

    function pad(n) {
        return String(n).padStart(2, "0");
    }

    function encode(config = state) {
        return [
            "custom-v58",
            `face=${config.face}`,
            `skin=${config.skin}`,
            `hair=${config.hair}`,
            `hairColor=${config.hairColor}`,
            `outfit=${config.outfit}`,
            `outfitColor=${config.outfitColor}`,
            `accessory=${config.accessory}`
        ].join("|");
    }

    function parse(value) {
        const text = String(value || "").trim();
        if (!text.startsWith("custom-v58")) return null;

        const parsed = { ...DEFAULT };

        text.split("|").slice(1).forEach(part => {
            const [key, raw] = part.split("=");
            if (!key || raw == null) return;
            if (["face", "hair", "outfit", "accessory"].includes(key)) {
                parsed[key] = Number(raw) || DEFAULT[key];
            } else if (Object.prototype.hasOwnProperty.call(parsed, key)) {
                parsed[key] = raw;
            }
        });

        return parsed;
    }

    function srcBase() {
        return `${ROOT}/skin/base-${pad(state.face)}-${state.skin}.png`;
    }

    function srcHair() {
        return `${ROOT}/hair-variants/hair-${pad(state.hair)}-${state.hairColor}.png`;
    }

    function srcOutfit() {
        return `${ROOT}/outfit-variants/outfit-${pad(state.outfit)}-${state.outfitColor}.png`;
    }

    function srcAccessory() {
        return state.accessory
            ? `${ROOT}/accessory/${pad(state.accessory)}.png`
            : "";
    }

    async function loadImage(src) {
        if (!src) return null;

        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = src;
        });
    }

    async function renderDataUrl(config = state, size = 512) {
        const previous = { ...state };
        Object.assign(state, config);

        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, "#2f42ff");
        gradient.addColorStop(0.52, "#7547ef");
        gradient.addColorStop(1, "#ed4bb3");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        const sources = [srcBase(), srcOutfit(), srcHair(), srcAccessory()];
        const images = await Promise.all(
            sources.map(src => src ? loadImage(src).catch(() => null) : Promise.resolve(null))
        );

        const [baseImg, outfitImg, hairImg, accessoryImg] = images;

        if (baseImg) ctx.drawImage(baseImg, 0, 0, size, size);

        // Mesmos ajustes usados na prévia CSS, para o PNG salvo ficar igual.
        if (outfitImg) {
            const scale = 0.96;
            const w = size * scale;
            const h = size * scale;
            const x = (size - w) / 2;
            const y = size - h + (size * 0.02);
            ctx.drawImage(outfitImg, x, y, w, h);
        }

        if (hairImg) {
            const scale = 0.96;
            const w = size * scale;
            const h = size * scale;
            const x = (size - w) / 2;
            const y = (size - h) / 2 - (size * 0.01);
            ctx.drawImage(hairImg, x, y, w, h);
        }

        if (accessoryImg) {
            const scale = 0.96;
            const w = size * scale;
            const h = size * scale;
            const x = (size - w) / 2;
            const y = (size - h) / 2;
            ctx.drawImage(accessoryImg, x, y, w, h);
        }

        const url = canvas.toDataURL("image/png", 0.92);
        Object.assign(state, previous);
        return url;
    }

    function updateLayerImages() {
        const base = $("#avatarBaseLayerV58");
        const hair = $("#avatarHairLayerV58");
        const outfit = $("#avatarOutfitLayerV58");
        const accessory = $("#avatarAccessoryLayerV58");

        if (base) base.src = srcBase();
        if (hair) hair.src = srcHair();
        if (outfit) outfit.src = srcOutfit();

        if (accessory) {
            const src = srcAccessory();
            accessory.hidden = !src;
            if (src) accessory.src = src;
        }
    }

    function updateActiveButtons() {
        document.querySelectorAll("[data-v58-face]").forEach(button => {
            button.classList.toggle("ativo", Number(button.dataset.v58Face) === state.face);
        });

        document.querySelectorAll("[data-v58-skin]").forEach(button => {
            button.classList.toggle("ativo", button.dataset.v58Skin === state.skin);
        });

        document.querySelectorAll("[data-v58-hair]").forEach(button => {
            button.classList.toggle("ativo", Number(button.dataset.v58Hair) === state.hair);
        });

        document.querySelectorAll("[data-v58-hair-color]").forEach(button => {
            button.classList.toggle("ativo", button.dataset.v58HairColor === state.hairColor);
        });

        document.querySelectorAll("[data-v58-outfit]").forEach(button => {
            button.classList.toggle("ativo", Number(button.dataset.v58Outfit) === state.outfit);
        });

        document.querySelectorAll("[data-v58-outfit-color]").forEach(button => {
            button.classList.toggle("ativo", button.dataset.v58OutfitColor === state.outfitColor);
        });

        document.querySelectorAll("[data-v58-accessory]").forEach(button => {
            button.classList.toggle("ativo", Number(button.dataset.v58Accessory) === state.accessory);
        });
    }

    function updateSummary() {
        const summary = $("#avatarSummaryV58");
        if (!summary) return;

        summary.innerHTML = `
            <span>Rosto <strong>${state.face}</strong></span>
            <span>Pele <strong>${LABELS.skin[state.skin] || state.skin}</strong></span>
            <span>Cabelo <strong>${state.hair} · ${LABELS.hairColor[state.hairColor] || state.hairColor}</strong></span>
            <span>Roupa <strong>${state.outfit} · ${LABELS.outfitColor[state.outfitColor] || state.outfitColor}</strong></span>
            <span>Acessório <strong>${LABELS.accessory[state.accessory] || "Nenhum"}</strong></span>
        `;
    }

    function update(activateCustom = false) {
        updateLayerImages();
        updateActiveButtons();
        updateSummary();

        const input = $("#perfilAvatarCustomInput");
        if (input) input.value = encode(state);

        if (activateCustom) {
            const select = $("#perfilAvatarInput");
            if (select) select.value = "custom-v58";
        }
    }

    function bind(selector, key, numeric = false) {
        document.querySelectorAll(selector).forEach(button => {
            button.addEventListener("click", () => {
                const dataKey = Object.keys(button.dataset).find(name =>
                    name.toLowerCase() === selector.match(/data-v58-([a-z-]+)/i)?.[1]?.replace(/-([a-z])/g, (_, c) => c.toUpperCase()).toLowerCase()
                );

                // Explicit lookup is more robust than relying on the selector conversion.
                if (key === "face") state.face = Number(button.dataset.v58Face);
                if (key === "skin") state.skin = button.dataset.v58Skin;
                if (key === "hair") state.hair = Number(button.dataset.v58Hair);
                if (key === "hairColor") state.hairColor = button.dataset.v58HairColor;
                if (key === "outfit") state.outfit = Number(button.dataset.v58Outfit);
                if (key === "outfitColor") state.outfitColor = button.dataset.v58OutfitColor;
                if (key === "accessory") state.accessory = Number(button.dataset.v58Accessory);

                update(true);
            });
        });
    }

    function loadExisting() {
        const input = $("#perfilAvatarCustomInput");
        const profile = (() => {
            try {
                return JSON.parse(localStorage.getItem("cg_perfil") || "{}");
            } catch {
                return {};
            }
        })();

        const value = input?.value || profile.avatar || localStorage.getItem("cg_avatar_v58_config") || "";
        const parsed = parse(value);

        if (parsed) {
            Object.assign(state, parsed);
            update(true);
        } else {
            update(false);
        }
    }

    async function saveCurrent() {
        const status = $("#avatarStatusV58");
        const select = $("#perfilAvatarInput");
        const hidden = $("#perfilAvatarCustomInput");

        if (select) select.value = "custom-v58";
        if (hidden) hidden.value = encode(state);

        if (status) status.textContent = "Gerando seu avatar...";

        try {
            const image = await renderDataUrl(state, 512);
            localStorage.setItem("cg_avatar_v58_config", encode(state));
            localStorage.setItem("cg_avatar_v58_image", image);

            if (status) {
                status.textContent = "Personagem pronto. Agora clique em “Salvar perfil” para guardar no perfil.";
            }

            document.dispatchEvent(new CustomEvent("cg-avatar-v58-updated", {
                detail: {
                    config: encode(state),
                    image
                }
            }));

        } catch (error) {
            console.error("Erro ao gerar avatar V5.8:", error);
            if (status) status.textContent = "Não foi possível gerar a imagem agora.";
        }
    }

    function init() {
        if (!$("#avatarStageV58")) return;

        bind("[data-v58-face]", "face", true);
        bind("[data-v58-skin]", "skin");
        bind("[data-v58-hair]", "hair", true);
        bind("[data-v58-hair-color]", "hairColor");
        bind("[data-v58-outfit]", "outfit", true);
        bind("[data-v58-outfit-color]", "outfitColor");
        bind("[data-v58-accessory]", "accessory", true);

        $("#btnUsarAvatarV58")?.addEventListener("click", saveCurrent);

        loadExisting();
    }

    window.CGAvatarV58 = {
        parse,
        encode,
        renderDataUrl,
        imageFromStorage() {
            return localStorage.getItem("cg_avatar_v58_image") || "";
        }
    };

    document.addEventListener("DOMContentLoaded", init);
})();
