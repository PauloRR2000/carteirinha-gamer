/* =========================================================
   CARTEIRINHA GAMER — AVATAR ENGINE V5.7
   Customização visual real dos avatares ilustrados.
   Usa a arte original + máscaras por camada.
========================================================= */

(function () {
    "use strict";

    const AVATARS = Array.from({ length: 12 }, (_, index) => {
        const numero = String(index + 1).padStart(2, "0");
        return {
            code: `avatar-${numero}`,
            file: `assets/avatars/avatar-${numero}.png`
        };
    });

    const DEFAULTS = {
        base: "avatar-01",
        skin: "clara",
        hair: "castanho",
        headset: "roxo",
        outfit: "escura",
        accessory: "none",
        accessoryColor: "roxo"
    };

    const COLORS = {
        skin: {
            clara: "#ffd8c7",
            media: "#eab08e",
            morena: "#bd7b55",
            escura: "#7a4937",
            profunda: "#4a2d25"
        },
        hair: {
            castanho: "#5a342e",
            preto: "#221522",
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
            laranja: "#ff9f43"
        },
        outfit: {
            escura: "#25293d",
            roxa: "#6243b7",
            azul: "#356cd8",
            verde: "#287858",
            vermelha: "#ad4050",
            cinza: "#697184"
        },
        accessoryColor: {
            roxo: "#9b72ff",
            azul: "#54b7ff",
            rosa: "#ff6fb7",
            verde: "#55d9a2",
            laranja: "#ffad57"
        }
    };

    const STRENGTH = {
        skin: 0.88,
        hair: 0.82,
        headset: 0.93,
        outfit: 0.78
    };

    const imageCache = new Map();
    const renderCache = new Map();

    function avatarExiste(base) {
        return AVATARS.some(item => item.code === base);
    }

    function normalizar(config) {
        const c = {
            ...DEFAULTS,
            ...(config || {})
        };

        if (!avatarExiste(c.base)) c.base = DEFAULTS.base;
        if (!COLORS.skin[c.skin]) c.skin = DEFAULTS.skin;
        if (!COLORS.hair[c.hair]) c.hair = DEFAULTS.hair;
        if (!COLORS.headset[c.headset]) c.headset = DEFAULTS.headset;
        if (!COLORS.outfit[c.outfit]) c.outfit = DEFAULTS.outfit;
        if (!COLORS.accessoryColor[c.accessoryColor]) c.accessoryColor = DEFAULTS.accessoryColor;

        if (!["none", "glasses", "clip", "pin", "earring"].includes(c.accessory)) {
            c.accessory = DEFAULTS.accessory;
        }

        return c;
    }

    function encode(config) {
        const c = normalizar(config);

        return [
            "custom-v2",
            `base=${c.base}`,
            `skin=${c.skin}`,
            `hair=${c.hair}`,
            `headset=${c.headset}`,
            `outfit=${c.outfit}`,
            `accessory=${c.accessory}`,
            `accessoryColor=${c.accessoryColor}`
        ].join("|");
    }

    function parse(value) {
        const texto = String(value || "").trim();
        if (!texto.startsWith("custom-v2")) return null;

        const config = { ...DEFAULTS };

        texto
            .split("|")
            .slice(1)
            .forEach(parte => {
                const indice = parte.indexOf("=");
                if (indice < 1) return;

                const chave = parte.slice(0, indice);
                const valor = parte.slice(indice + 1);

                if (Object.prototype.hasOwnProperty.call(config, chave)) {
                    config[chave] = valor;
                }
            });

        return normalizar(config);
    }

    function baseFile(base) {
        const item = AVATARS.find(avatar => avatar.code === base);
        return item?.file || AVATARS[0].file;
    }

    function maskFile(base, part) {
        return `assets/avatar-masks/${base}-${part}.png`;
    }

    function loadImage(url) {
        if (imageCache.has(url)) return imageCache.get(url);

        const promise = new Promise((resolve, reject) => {
            const image = new Image();
            image.decoding = "async";
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error(`Não foi possível carregar ${url}`));
            image.src = url;
        });

        imageCache.set(url, promise);
        return promise;
    }

    function hexToRgb(hex) {
        const value = String(hex).replace("#", "");
        return {
            r: parseInt(value.slice(0, 2), 16),
            g: parseInt(value.slice(2, 4), 16),
            b: parseInt(value.slice(4, 6), 16)
        };
    }

    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        const l = (max + min) / 2;
        const d = max - min;

        if (d !== 0) {
            s = l > 0.5
                ? d / (2 - max - min)
                : d / (max + min);

            if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
            else if (max === g) h = ((b - r) / d + 2) / 6;
            else h = ((r - g) / d + 4) / 6;
        }

        return { h, s, l };
    }

    function hueToRgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }

    function hslToRgb(h, s, l) {
        let r;
        let g;
        let b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5
                ? l * (1 + s)
                : l + s - l * s;
            const p = 2 * l - q;
            r = hueToRgb(p, q, h + 1 / 3);
            g = hueToRgb(p, q, h);
            b = hueToRgb(p, q, h - 1 / 3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    function aplicarCor(imageData, maskData, targetHex, strength) {
        const targetRgb = hexToRgb(targetHex);
        const targetHsl = rgbToHsl(targetRgb.r, targetRgb.g, targetRgb.b);
        const data = imageData.data;
        const mask = maskData.data;

        for (let i = 0; i < data.length; i += 4) {
            const alphaMask = mask[i] / 255;
            if (alphaMask < 0.035) continue;

            const original = rgbToHsl(data[i], data[i + 1], data[i + 2]);
            const mix = Math.min(1, alphaMask * strength);

            let saturation = targetHsl.s * 0.88 + original.s * 0.12;
            if (targetHsl.s < 0.18) saturation *= 0.55;

            const lightnessFactor = 0.74 + targetHsl.l * 0.48;
            const lightness = Math.max(0.04, Math.min(0.96, original.l * lightnessFactor));
            const recolored = hslToRgb(targetHsl.h, saturation, lightness);

            data[i] = Math.round(data[i] * (1 - mix) + recolored.r * mix);
            data[i + 1] = Math.round(data[i + 1] * (1 - mix) + recolored.g * mix);
            data[i + 2] = Math.round(data[i + 2] * (1 - mix) + recolored.b * mix);
        }
    }

    function roundedRect(ctx, x, y, w, h, radius) {
        const r = Math.min(radius, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    function desenharAcessorio(ctx, config, size) {
        const scale = size / 512;
        const color = COLORS.accessoryColor[config.accessoryColor] || COLORS.accessoryColor.roxo;
        const outline = "#171225";

        ctx.save();
        ctx.scale(scale, scale);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (config.accessory === "glasses") {
            ctx.lineWidth = 8;
            ctx.strokeStyle = outline;
            roundedRect(ctx, 128, 205, 112, 74, 30);
            ctx.stroke();
            roundedRect(ctx, 274, 205, 112, 74, 30);
            ctx.stroke();

            ctx.lineWidth = 4;
            ctx.strokeStyle = color;
            roundedRect(ctx, 132, 209, 104, 66, 27);
            ctx.stroke();
            roundedRect(ctx, 278, 209, 104, 66, 27);
            ctx.stroke();

            ctx.lineWidth = 7;
            ctx.strokeStyle = outline;
            ctx.beginPath();
            ctx.moveTo(238, 238);
            ctx.quadraticCurveTo(256, 228, 274, 238);
            ctx.stroke();
        }

        if (config.accessory === "clip") {
            ctx.translate(360, 122);
            ctx.rotate(0.16);
            ctx.fillStyle = outline;
            roundedRect(ctx, -34, -13, 68, 26, 13);
            ctx.fill();
            ctx.fillStyle = color;
            roundedRect(ctx, -29, -9, 58, 18, 9);
            ctx.fill();
            ctx.fillStyle = "rgba(255,255,255,.85)";
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        if (config.accessory === "pin") {
            ctx.fillStyle = outline;
            ctx.beginPath();
            ctx.arc(372, 414, 29, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(372, 414, 23, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(360, 414);
            ctx.lineTo(384, 414);
            ctx.moveTo(372, 402);
            ctx.lineTo(372, 426);
            ctx.stroke();
        }

        if (config.accessory === "earring") {
            ctx.strokeStyle = outline;
            ctx.lineWidth = 7;
            ctx.beginPath();
            ctx.arc(392, 296, 17, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = color;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(392, 296, 13, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(392, 321, 8, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    async function renderCanvas(config, canvas) {
        const c = normalizar(config);
        const size = canvas.width || 512;
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const [base, skinMask, hairMask, headsetMask, outfitMask] = await Promise.all([
            loadImage(baseFile(c.base)),
            loadImage(maskFile(c.base, "skin")),
            loadImage(maskFile(c.base, "hair")),
            loadImage(maskFile(c.base, "headset")),
            loadImage(maskFile(c.base, "outfit"))
        ]);

        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(base, 0, 0, size, size);

        const imageData = ctx.getImageData(0, 0, size, size);
        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = size;
        maskCanvas.height = size;
        const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });

        const layers = [
            [skinMask, "skin", COLORS.skin[c.skin], STRENGTH.skin],
            [hairMask, "hair", COLORS.hair[c.hair], STRENGTH.hair],
            [headsetMask, "headset", COLORS.headset[c.headset], STRENGTH.headset],
            [outfitMask, "outfit", COLORS.outfit[c.outfit], STRENGTH.outfit]
        ];

        for (const [maskImage, , target, strength] of layers) {
            maskCtx.clearRect(0, 0, size, size);
            maskCtx.drawImage(maskImage, 0, 0, size, size);
            const maskData = maskCtx.getImageData(0, 0, size, size);
            aplicarCor(imageData, maskData, target, strength);
        }

        ctx.putImageData(imageData, 0, 0);
        desenharAcessorio(ctx, c, size);

        return canvas;
    }

    async function renderDataUrl(config, size = 512) {
        const c = normalizar(config);
        const key = `${encode(c)}@${size}`;

        if (renderCache.has(key)) return renderCache.get(key);

        const promise = (async () => {
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            await renderCanvas(c, canvas);
            return canvas.toDataURL("image/png");
        })();

        renderCache.set(key, promise);
        return promise;
    }

    function clearCache() {
        renderCache.clear();
    }

    window.CGAvatarEngineV57 = {
        avatars: AVATARS,
        defaults: { ...DEFAULTS },
        colors: COLORS,
        parse,
        encode,
        normalize: normalizar,
        baseFile,
        renderCanvas,
        renderDataUrl,
        clearCache
    };
})();
