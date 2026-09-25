const STEAM_API =
    "https://carteirinha-gamer-api.pauloricardo59143.workers.dev";

const STEAM_STORAGE = {
    jogos: "cg_jogos",
    historico: "cg_historico",
    perfilSteam: "cg_steam_perfil"
};

let steamIdAtual = "";
let jogosSteam = [];
let filtroSteam = "";
let importacaoEmAndamento = false;


/* =========================================================
   ARMAZENAMENTO
========================================================= */

function lerJSONSteam(chave, fallback) {

    try {

        const valor =
            localStorage.getItem(chave);

        return valor
            ? JSON.parse(valor)
            : fallback;

    } catch (erro) {

        console.error(
            `Erro ao ler ${chave}:`,
            erro
        );

        return fallback;
    }
}


function salvarJSONSteam(
    chave,
    valor
) {

    localStorage.setItem(
        chave,
        JSON.stringify(valor)
    );
}


function obterJogosLocais() {

    const jogos =
        lerJSONSteam(
            STEAM_STORAGE.jogos,
            []
        );

    return Array.isArray(jogos)
        ? jogos
        : [];
}


function obterHistoricoSteam() {

    const historico =
        lerJSONSteam(
            STEAM_STORAGE.historico,
            []
        );

    return Array.isArray(historico)
        ? historico
        : [];
}


/* =========================================================
   AUXILIARES
========================================================= */

function gerarIdSteam() {

    if (
        window.crypto &&
        typeof window.crypto.randomUUID ===
            "function"
    ) {

        return window.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;
}


function escaparHTMLSteam(
    valor = ""
) {

    return String(valor)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}


function numeroSteam(valor) {

    const numero =
        Number(valor);

    return Number.isFinite(numero)
        ? numero
        : 0;
}


function formatarTempoSteam(
    totalMinutos
) {

    const total =
        Math.max(
            0,
            Math.floor(
                numeroSteam(
                    totalMinutos
                )
            )
        );

    const horas =
        Math.floor(
            total / 60
        );

    const minutos =
        total % 60;

    if (
        horas === 0 &&
        minutos === 0
    ) {

        return "0min";
    }

    if (
        horas === 0
    ) {

        return `${minutos}min`;
    }

    if (
        minutos === 0
    ) {

        return `${horas}h`;
    }

    return `${horas}h ${minutos}min`;
}


function obterTempoLocalMinutos(
    jogo
) {

    if (!jogo) {

        return 0;
    }

    const horas =
        Math.max(
            0,
            numeroSteam(
                jogo.horas
            )
        );

    const possuiMinutos =
        Object.prototype
            .hasOwnProperty
            .call(
                jogo,
                "minutos"
            );

    if (!possuiMinutos) {

        return Math.round(
            horas * 60
        );
    }

    return (
        Math.floor(horas) *
        60
    ) +
        Math.max(
            0,
            Math.floor(
                numeroSteam(
                    jogo.minutos
                )
            )
        );
}


function normalizarNomeSteam(
    valor
) {

    return String(
        valor ||
        ""
    )

        .normalize(
            "NFD"
        )

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .toLowerCase()

        .replace(
            /®|™/g,
            ""
        )

        .replace(
            /[^a-z0-9]+/g,
            " "
        )

        .trim()

        .replace(
            /\s+/g,
            " "
        );
}


function simplificarNomeSteam(
    valor
) {

    return normalizarNomeSteam(
        valor
    )

        .replace(
            /\b(remake|remastered|remaster|hd|edition|complete|definitive|deluxe|goty|game of the year)\b/g,
            " "
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();
}


/* =========================================================
   ENCONTRAR JOGO JÁ EXISTENTE
========================================================= */

function encontrarJogoLocal(
    jogoSteam
) {

    const jogos =
        obterJogosLocais();

    const appid =
        Number(
            jogoSteam.appid
        );


    /* Primeiro tenta pelo AppID salvo */

    const porAppId =
        jogos.find(
            jogo =>
                Number(
                    jogo
                        ?.steam
                        ?.appid
                ) ===
                appid
        );

    if (porAppId) {

        return porAppId;
    }


    /* Depois tenta nome idêntico */

    const nomeSteam =
        normalizarNomeSteam(
            jogoSteam.nome
        );

    const porNome =
        jogos.find(
            jogo =>
                normalizarNomeSteam(
                    jogo.nome
                ) ===
                nomeSteam
        );

    if (porNome) {

        return porNome;
    }


    /*
        Por último tenta ignorar palavras
        como Remake / Remastered / HD.
    */

    const simplificado =
        simplificarNomeSteam(
            jogoSteam.nome
        );

    if (
        simplificado.length <
        5
    ) {

        return null;
    }

    return jogos.find(
        jogo =>
            simplificarNomeSteam(
                jogo.nome
            ) ===
            simplificado
    ) || null;
}


/* =========================================================
   ÍCONE STEAM
========================================================= */

function urlIconeSteam(
    jogo
) {

    if (
        !jogo?.appid ||
        !jogo?.iconeHash
    ) {

        return "";
    }

    return (
        "https://media.steampowered.com/" +
        "steamcommunity/public/images/apps/" +
        `${encodeURIComponent(
            jogo.appid
        )}/` +
        `${encodeURIComponent(
            jogo.iconeHash
        )}.jpg`
    );
}


/* =========================================================
   TOAST
========================================================= */

function mostrarToastSteam(
    mensagem
) {

    const toast =
        document.querySelector(
            "#toast"
        );

    if (!toast) {

        return;
    }

    toast.textContent =
        mensagem;

    toast.classList.add(
        "mostrar"
    );

    clearTimeout(
        window.__steamToastTimer
    );

    window.__steamToastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "mostrar"
                );

            },
            2800
        );
}


/* =========================================================
   STATUS
========================================================= */

function mostrarStatusSteam(
    mensagem,
    tipo = ""
) {

    const status =
        document.querySelector(
            "#steamStatus"
        );

    if (!status) {

        return;
    }

    status.hidden =
        !mensagem;

    status.textContent =
        mensagem ||
        "";

    status.classList.remove(
        "erro",
        "sucesso"
    );

    if (tipo) {

        status.classList.add(
            tipo
        );
    }
}


function esperarSteam(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );
}


/* =========================================================
   RESOLVER PERFIL
========================================================= */

async function resolverPerfilSteam(
    entrada
) {

    const resposta =
        await fetch(
            `${STEAM_API}/steam/resolver?perfil=${encodeURIComponent(
                entrada
            )}`,
            {
                cache:
                    "no-store"
            }
        );

    const dados =
        await resposta.json();

    if (
        !resposta.ok ||
        !dados.sucesso
    ) {

        throw new Error(
            dados.mensagem ||
            "Não foi possível identificar o perfil Steam."
        );
    }

    return dados.steamId;
}


/* =========================================================
   CARREGAR BIBLIOTECA
========================================================= */

async function carregarBibliotecaSteam(
    steamId,
    incluirNaoJogados
) {

    const sufixo =
        incluirNaoJogados
            ? "?incluirNaoJogados=1"
            : "";

    const resposta =
        await fetch(
            `${STEAM_API}/steam/jogos/${encodeURIComponent(
                steamId
            )}${sufixo}`,
            {
                cache:
                    "no-store"
            }
        );

    const dados =
        await resposta.json();

    if (
        !resposta.ok ||
        !dados.sucesso
    ) {

        throw new Error(
            dados.mensagem ||
            "Não foi possível carregar a biblioteca Steam."
        );
    }

    return dados;
}


/* =========================================================
   RESUMO
========================================================= */

function atualizarResumoSteam(
    dados
) {

    const totalBiblioteca =
        document.querySelector(
            "#steamTotalBiblioteca"
        );

    const totalJogados =
        document.querySelector(
            "#steamTotalJogados"
        );

    const totalExibidos =
        document.querySelector(
            "#steamTotalExibidos"
        );

    if (totalBiblioteca) {

        totalBiblioteca.textContent =
            dados.totalBiblioteca ??
            0;
    }

    if (totalJogados) {

        totalJogados.textContent =
            dados.totalJogados ??
            0;
    }

    if (totalExibidos) {

        totalExibidos.textContent =
            dados.totalRetornados ??
            0;
    }
}


/* =========================================================
   FILTRO
========================================================= */

function jogosSteamFiltrados() {

    const busca =
        normalizarNomeSteam(
            filtroSteam
        );

    if (!busca) {

        return jogosSteam;
    }

    return jogosSteam.filter(
        jogo =>
            normalizarNomeSteam(
                jogo.nome
            ).includes(
                busca
            )
    );
}


/* =========================================================
   RENDERIZAR JOGOS
========================================================= */

function renderizarJogosSteam() {

    const lista =
        document.querySelector(
            "#listaSteam"
        );

    if (!lista) {

        return;
    }

    const jogos =
        jogosSteamFiltrados();

    if (!jogos.length) {

        lista.innerHTML =
            `
                <div class="steam-vazio">

                    <span>
                        🎮
                    </span>

                    <strong>
                        Nenhum jogo encontrado.
                    </strong>

                    <p>
                        Tente alterar sua pesquisa.
                    </p>

                </div>
            `;

        atualizarContadorSteam();

        return;
    }

    lista.innerHTML =
        jogos

            .map(
                jogo => {

                    const existente =
                        encontrarJogoLocal(
                            jogo
                        );

                    const icone =
                        urlIconeSteam(
                            jogo
                        );

                    const selecionado =
                        jogo.selecionado ===
                        true;

                    const importarConquistas =
                        document.querySelector(
                            "#importarConquistasSteam"
                        )
                            ?.checked !==
                        false;

                    const textoConquistas =
                        importarConquistas
                            ? "🏆 será consultado ao importar"
                            : "🏆 não será importado";

                    return `
                        <article
                            class="
                                steam-jogo
                                ${
                                    selecionado
                                        ? "selecionado"
                                        : ""
                                }
                            "
                            data-steam-appid="${escaparHTMLSteam(
                                jogo.appid
                            )}"
                        >

                            <label class="steam-jogo-selecao">

                                <input
                                    type="checkbox"
                                    data-steam-selecionar="${escaparHTMLSteam(
                                        jogo.appid
                                    )}"
                                    ${
                                        selecionado
                                            ? "checked"
                                            : ""
                                    }
                                >

                            </label>


                            <div class="steam-jogo-capa">

                                ${
                                    icone
                                        ? `
                                            <img
                                                src="${escaparHTMLSteam(
                                                    icone
                                                )}"
                                                alt=""
                                                loading="lazy"
                                            >
                                        `
                                        : "🎮"
                                }

                            </div>


                            <div class="steam-jogo-conteudo">

                                <h3>
                                    ${escaparHTMLSteam(
                                        jogo.nome
                                    )}
                                </h3>


                                <div class="steam-jogo-meta">

                                    <span>
                                        ⏱️
                                        ${formatarTempoSteam(
                                            jogo
                                                .tempoTotalMinutos
                                        )}
                                    </span>

                                    <span>
                                        🆔
                                        ${escaparHTMLSteam(
                                            jogo.appid
                                        )}
                                    </span>

                                    <span class="steam-conquistas">
                                        ${textoConquistas}
                                    </span>

                                </div>

                            </div>


                            <div class="steam-jogo-estado">

                                <span
                                    class="
                                        steam-tag
                                        ${
                                            existente
                                                ? "existente"
                                                : "novo"
                                        }
                                    "
                                >

                                    ${
                                        existente
                                            ? "Já cadastrado"
                                            : "Novo"
                                    }

                                </span>


                                ${
                                    existente
                                        ? `
                                            <small class="texto-suave">

                                                ${escaparHTMLSteam(
                                                    existente.nome
                                                )}

                                            </small>
                                        `
                                        : ""
                                }

                            </div>

                        </article>
                    `;
                }
            )

            .join("");


    lista
        .querySelectorAll(
            "[data-steam-selecionar]"
        )

        .forEach(
            checkbox => {

                checkbox.addEventListener(
                    "change",
                    () => {

                        const appid =
                            Number(
                                checkbox
                                    .dataset
                                    .steamSelecionar
                            );

                        const jogo =
                            jogosSteam.find(
                                item =>
                                    Number(
                                        item.appid
                                    ) ===
                                    appid
                            );

                        if (jogo) {

                            jogo.selecionado =
                                checkbox.checked;
                        }

                        const card =
                            checkbox.closest(
                                ".steam-jogo"
                            );

                        card
                            ?.classList
                            .toggle(
                                "selecionado",
                                checkbox.checked
                            );

                        atualizarContadorSteam();
                    }
                );
            }
        );

    atualizarContadorSteam();
}


/* =========================================================
   CONTADOR DE SELEÇÃO
========================================================= */

function atualizarContadorSteam() {

    const contador =
        document.querySelector(
            "#contadorSelecionadosSteam"
        );

    if (!contador) {

        return;
    }

    const quantidade =
        jogosSteam.filter(
            jogo =>
                jogo.selecionado
        ).length;

    contador.textContent =
        `${quantidade} selecionado${
            quantidade === 1
                ? ""
                : "s"
        }`;
}


/* =========================================================
   CONQUISTAS
========================================================= */

async function obterConquistasSteam(
    steamId,
    appid
) {

    const resposta =
        await fetch(
            `${STEAM_API}/steam/conquistas/${encodeURIComponent(
                steamId
            )}/${encodeURIComponent(
                appid
            )}`,
            {
                cache:
                    "no-store"
            }
        );

    const dados =
        await resposta.json();

    if (
        !resposta.ok ||
        !dados.sucesso
    ) {

        throw new Error(
            dados.mensagem ||
            "Não foi possível consultar conquistas."
        );
    }

    return {

        disponivel:
            dados.disponivel ===
            true,

        obtidas:
            Math.max(
                0,
                Math.floor(
                    numeroSteam(
                        dados.obtidas
                    )
                )
            ),

        total:
            Math.max(
                0,
                Math.floor(
                    numeroSteam(
                        dados.total
                    )
                )
            )
    };
}


/* =========================================================
   HISTÓRICO
========================================================= */

function registrarHistoricoImportacaoSteam(
    depois,
    mudancas
) {

    if (!mudancas.length) {

        return;
    }

    const historico =
        obterHistoricoSteam();

    historico.unshift(
        {

            id:
                gerarIdSteam(),

            jogoId:
                depois.id,

            jogoNome:
                depois.nome,

            data:
                new Date()
                    .toISOString(),

            mudancas
        }
    );

    salvarJSONSteam(
        STEAM_STORAGE.historico,
        historico
    );
}


/* =========================================================
   TEMPO
========================================================= */

function separarMinutosSteam(
    totalMinutos
) {

    const total =
        Math.max(
            0,
            Math.floor(
                numeroSteam(
                    totalMinutos
                )
            )
        );

    return {

        horas:
            Math.floor(
                total / 60
            ),

        minutos:
            total % 60
    };
}


/* =========================================================
   NOVO JOGO
========================================================= */

function criarNovoJogoSteam(
    jogoSteam,
    conquistas,
    opcoes
) {

    const tempo =
        opcoes.importarTempo
            ? separarMinutosSteam(
                jogoSteam
                    .tempoTotalMinutos
            )
            : {
                horas:
                    0,

                minutos:
                    0
            };

    return {

        id:
            gerarIdSteam(),

        nome:
            jogoSteam.nome ||
            "Jogo Steam",

        nota:
            "",

        horas:
            tempo.horas,

        minutos:
            tempo.minutos,

        /*
            Para jogo novo precisamos
            de um status inicial.

            Depois você pode editar.
        */

        status:
            jogoSteam
                .tempoTotalMinutos >
            0

                ? "Jogando"
                : "Quero jogar",

        recomenda:
            "",

        conquistasObtidas:
            opcoes
                .importarConquistas &&
            conquistas
                ?.disponivel

                ? conquistas.obtidas
                : 0,

        conquistasTotais:
            opcoes
                .importarConquistas &&
            conquistas
                ?.disponivel

                ? conquistas.total
                : 0,

        plataformas:
            opcoes.definirPc
                ? [
                    "PC"
                ]
                : [],

        categorias:
            [],

        replay:
            "",

        personagemFavorito:
            "",

        gostou:
            "",

        naoGostou:
            "",

        comentario:
            "",

        catalogo:
            null,

        steam: {

            appid:
                Number(
                    jogoSteam.appid
                ),

            fonte:
                "Steam",

            iconeHash:
                jogoSteam
                    .iconeHash ||
                "",

            ultimaVezJogadoEm:
                jogoSteam
                    .ultimaVezJogadoEm ||
                null,

            sincronizadoEm:
                new Date()
                    .toISOString()
        },

        criadoEm:
            new Date()
                .toISOString(),

        atualizadoEm:
            new Date()
                .toISOString()
    };
}


/* =========================================================
   ATUALIZAR JOGO EXISTENTE
========================================================= */

function atualizarJogoExistenteSteam(
    existente,
    jogoSteam,
    conquistas,
    opcoes
) {

    const atualizado = {

        ...existente,

        steam: {

            ...(
                existente.steam ||
                {}
            ),

            appid:
                Number(
                    jogoSteam.appid
                ),

            fonte:
                "Steam",

            iconeHash:
                jogoSteam
                    .iconeHash ||
                "",

            ultimaVezJogadoEm:
                jogoSteam
                    .ultimaVezJogadoEm ||
                null,

            sincronizadoEm:
                new Date()
                    .toISOString()
        },

        atualizadoEm:
            new Date()
                .toISOString()
    };


    const mudancas =
        [];


    /* TEMPO */

    if (
        opcoes.importarTempo
    ) {

        const antesMinutos =
            obterTempoLocalMinutos(
                existente
            );

        const depoisMinutos =
            Math.max(
                0,
                Math.floor(
                    numeroSteam(
                        jogoSteam
                            .tempoTotalMinutos
                    )
                )
            );

        const tempo =
            separarMinutosSteam(
                depoisMinutos
            );

        atualizado.horas =
            tempo.horas;

        atualizado.minutos =
            tempo.minutos;

        if (
            antesMinutos !==
            depoisMinutos
        ) {

            mudancas.push(
                `Tempo Steam: "${formatarTempoSteam(
                    antesMinutos
                )}" → "${formatarTempoSteam(
                    depoisMinutos
                )}"`
            );
        }
    }


    /* CONQUISTAS */

    if (
        opcoes
            .importarConquistas &&

        conquistas
            ?.disponivel
    ) {

        const antesObtidas =
            Math.max(
                0,
                Math.floor(
                    numeroSteam(
                        existente
                            .conquistasObtidas
                    )
                )
            );

        const antesTotal =
            Math.max(
                0,
                Math.floor(
                    numeroSteam(
                        existente
                            .conquistasTotais
                    )
                )
            );

        atualizado.conquistasObtidas =
            conquistas.obtidas;

        atualizado.conquistasTotais =
            conquistas.total;

        if (
            antesObtidas !==
                conquistas.obtidas ||

            antesTotal !==
                conquistas.total
        ) {

            mudancas.push(
                `Conquistas Steam: "${antesObtidas}/${antesTotal}" → "${conquistas.obtidas}/${conquistas.total}"`
            );
        }
    }


    /* PC */

    if (
        opcoes.definirPc
    ) {

        const plataformas =
            Array.isArray(
                existente.plataformas
            )

                ? [
                    ...existente
                        .plataformas
                ]

                : [];

        if (
            !plataformas.includes(
                "PC"
            )
        ) {

            plataformas.push(
                "PC"
            );

            atualizado.plataformas =
                plataformas;

            mudancas.push(
                "Plataforma Steam adicionada: PC"
            );
        }
    }


    registrarHistoricoImportacaoSteam(
        atualizado,
        mudancas
    );

    return atualizado;
}


/* =========================================================
   PROGRESSO
========================================================= */

function atualizarProgressoSteam(
    atual,
    total,
    texto
) {

    const painel =
        document.querySelector(
            "#progressoSteam"
        );

    const mensagem =
        document.querySelector(
            "#textoProgressoSteam"
        );

    const barra =
        document.querySelector(
            "#barraProgressoSteam"
        );

    if (painel) {

        painel.hidden =
            false;
    }

    if (mensagem) {

        mensagem.textContent =
            texto;
    }

    if (barra) {

        const porcentagem =
            total > 0

                ? Math.round(
                    (
                        atual /
                        total
                    ) *
                    100
                )

                : 0;

        barra.style.width =
            `${Math.min(
                100,
                porcentagem
            )}%`;
    }
}


/* =========================================================
   IMPORTAR SELECIONADOS
========================================================= */

async function importarSelecionadosSteam() {

    if (
        importacaoEmAndamento
    ) {

        return;
    }

    const selecionados =
        jogosSteam.filter(
            jogo =>
                jogo.selecionado
        );

    if (
        !selecionados.length
    ) {

        mostrarToastSteam(
            "Selecione pelo menos um jogo."
        );

        return;
    }


    const importarTempo =
        document.querySelector(
            "#importarTempoSteam"
        )
            ?.checked !==
        false;


    const importarConquistas =
        document.querySelector(
            "#importarConquistasSteam"
        )
            ?.checked !==
        false;


    const definirPc =
        document.querySelector(
            "#definirPcSteam"
        )
            ?.checked !==
        false;


    const opcoes = {

        importarTempo,

        importarConquistas,

        definirPc
    };


    importacaoEmAndamento =
        true;


    const botao =
        document.querySelector(
            "#btnImportarSteam"
        );


    if (botao) {

        botao.disabled =
            true;

        botao.textContent =
            "Importando...";
    }


    let jogosLocais =
        obterJogosLocais();


    let novos =
        0;

    let atualizados =
        0;

    let conquistasIndisponiveis =
        0;

    let erros =
        0;


    try {

        for (
            let indice = 0;
            indice <
                selecionados.length;
            indice += 1
        ) {

            const jogoSteam =
                selecionados[
                    indice
                ];


            atualizarProgressoSteam(
                indice,
                selecionados.length,
                `Preparando ${jogoSteam.nome}...`
            );


            let conquistas =
                null;


            /* CONSULTAR CONQUISTAS */

            if (
                importarConquistas
            ) {

                atualizarProgressoSteam(
                    indice,
                    selecionados.length,
                    `Consultando conquistas de ${jogoSteam.nome}...`
                );

                try {

                    conquistas =
                        await obterConquistasSteam(
                            steamIdAtual,
                            jogoSteam.appid
                        );

                    if (
                        !conquistas
                            .disponivel
                    ) {

                        conquistasIndisponiveis +=
                            1;
                    }

                } catch (erro) {

                    console.error(
                        `Conquistas de ${jogoSteam.nome}:`,
                        erro
                    );

                    conquistasIndisponiveis +=
                        1;

                    conquistas =
                        null;
                }


                /*
                    Pequena pausa para não
                    disparar tudo ao mesmo tempo.
                */

                await esperarSteam(
                    80
                );
            }


            /*
                Procura novamente aqui porque
                a biblioteca pode ter mudado
                durante a própria importação.
            */

            const existente =
                encontrarJogoLocal(
                    jogoSteam
                );


            try {

                if (existente) {

                    const atualizado =
                        atualizarJogoExistenteSteam(
                            existente,
                            jogoSteam,
                            conquistas,
                            opcoes
                        );


                    const posicao =
                        jogosLocais
                            .findIndex(
                                jogo =>
                                    jogo.id ===
                                    existente.id
                            );


                    if (
                        posicao >=
                        0
                    ) {

                        jogosLocais[
                            posicao
                        ] =
                            atualizado;
                    }


                    atualizados +=
                        1;

                } else {

                    const novo =
                        criarNovoJogoSteam(
                            jogoSteam,
                            conquistas,
                            opcoes
                        );


                    jogosLocais.push(
                        novo
                    );


                    novos +=
                        1;
                }


                salvarJSONSteam(
                    STEAM_STORAGE.jogos,
                    jogosLocais
                );


            } catch (erro) {

                console.error(
                    `Erro ao importar ${jogoSteam.nome}:`,
                    erro
                );

                erros +=
                    1;
            }


            atualizarProgressoSteam(
                indice + 1,
                selecionados.length,
                `${jogoSteam.nome} processado.`
            );
        }


        atualizarProgressoSteam(
            selecionados.length,
            selecionados.length,
            "Importação concluída."
        );


        renderizarJogosSteam();


        const partes = [

            `${novos} novo${
                novos === 1
                    ? ""
                    : "s"
            }`,

            `${atualizados} atualizado${
                atualizados === 1
                    ? ""
                    : "s"
            }`
        ];


        if (
            conquistasIndisponiveis >
            0
        ) {

            partes.push(
                `${conquistasIndisponiveis} sem conquistas disponíveis`
            );
        }


        if (
            erros >
            0
        ) {

            partes.push(
                `${erros} erro${
                    erros === 1
                        ? ""
                        : "s"
                }`
            );
        }


        mostrarStatusSteam(
            `Importação concluída: ${partes.join(
                " • "
            )}.`,

            erros > 0
                ? "erro"
                : "sucesso"
        );


        mostrarToastSteam(
            "Importação da Steam concluída."
        );


    } finally {

        importacaoEmAndamento =
            false;


        if (botao) {

            botao.disabled =
                false;

            botao.textContent =
                "⬇️ Importar selecionados";
        }
    }
}


/* =========================================================
   PREPARAR PÁGINA
========================================================= */

function prepararPaginaSteam() {

    if (
        document.body
            .dataset
            .page !==
        "steam"
    ) {

        return;
    }


    const form =
        document.querySelector(
            "#formSteam"
        );


    const campoPerfil =
        document.querySelector(
            "#perfilSteam"
        );


    const incluirNaoJogados =
        document.querySelector(
            "#incluirNaoJogados"
        );


    const resultados =
        document.querySelector(
            "#steamResultados"
        );


    const busca =
        document.querySelector(
            "#buscaSteam"
        );


    const selecionarTodos =
        document.querySelector(
            "#btnSelecionarTodosSteam"
        );


    const limparSelecao =
        document.querySelector(
            "#btnLimparSelecaoSteam"
        );


    const importar =
        document.querySelector(
            "#btnImportarSteam"
        );


    const importarConquistas =
        document.querySelector(
            "#importarConquistasSteam"
        );


    if (
        !form ||
        !campoPerfil
    ) {

        return;
    }


    /* =====================================================
       RECUPERAR PERFIL SALVO
    ===================================================== */

    const perfilSalvo =
        localStorage.getItem(
            STEAM_STORAGE
                .perfilSteam
        );


    if (perfilSalvo) {

        campoPerfil.value =
            perfilSalvo;
    }


    /* =====================================================
       CARREGAR STEAM
    ===================================================== */

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const entrada =
                campoPerfil
                    .value
                    .trim();


            if (!entrada) {

                mostrarToastSteam(
                    "Informe seu perfil da Steam."
                );

                return;
            }


            const botao =
                document.querySelector(
                    "#btnCarregarSteam"
                );


            if (botao) {

                botao.disabled =
                    true;

                botao.textContent =
                    "Carregando...";
            }


            mostrarStatusSteam(
                "Identificando seu perfil Steam..."
            );


            if (resultados) {

                resultados.hidden =
                    true;
            }


            try {

                const steamId =
                    await resolverPerfilSteam(
                        entrada
                    );


                steamIdAtual =
                    steamId;


                localStorage.setItem(
                    STEAM_STORAGE
                        .perfilSteam,

                    entrada
                );


                mostrarStatusSteam(
                    "Perfil encontrado. Carregando biblioteca..."
                );


                const dados =
                    await carregarBibliotecaSteam(
                        steamId,

                        incluirNaoJogados
                            ?.checked ===
                        true
                    );


                jogosSteam =
                    (
                        Array.isArray(
                            dados.jogos
                        )

                            ? dados.jogos

                            : []
                    ).map(
                        jogo => ({

                            ...jogo,

                            selecionado:
                                false
                        })
                    );


                filtroSteam =
                    "";


                if (busca) {

                    busca.value =
                        "";
                }


                atualizarResumoSteam(
                    dados
                );


                renderizarJogosSteam();


                if (resultados) {

                    resultados.hidden =
                        false;
                }


                mostrarStatusSteam(
                    `Biblioteca carregada. SteamID: ${steamId}.`,
                    "sucesso"
                );


            } catch (erro) {

                console.error(
                    "Erro ao carregar Steam:",
                    erro
                );


                mostrarStatusSteam(
                    erro.message ||
                    "Não foi possível carregar a Steam.",
                    "erro"
                );


            } finally {

                if (botao) {

                    botao.disabled =
                        false;

                    botao.textContent =
                        "🎮 Carregar minha biblioteca";
                }
            }
        }
    );


    /* =====================================================
       PESQUISA
    ===================================================== */

    busca?.addEventListener(
        "input",
        () => {

            filtroSteam =
                busca.value;

            renderizarJogosSteam();
        }
    );


    /* =====================================================
       SELECIONAR TODOS VISÍVEIS
    ===================================================== */

    selecionarTodos
        ?.addEventListener(
            "click",
            () => {

                const visiveis =
                    new Set(

                        jogosSteamFiltrados()

                            .map(
                                jogo =>
                                    Number(
                                        jogo.appid
                                    )
                            )
                    );


                jogosSteam.forEach(
                    jogo => {

                        if (
                            visiveis.has(
                                Number(
                                    jogo.appid
                                )
                            )
                        ) {

                            jogo.selecionado =
                                true;
                        }
                    }
                );


                renderizarJogosSteam();
            }
        );


    /* =====================================================
       LIMPAR SELEÇÃO
    ===================================================== */

    limparSelecao
        ?.addEventListener(
            "click",
            () => {

                jogosSteam.forEach(
                    jogo => {

                        jogo.selecionado =
                            false;
                    }
                );


                renderizarJogosSteam();
            }
        );


    /* =====================================================
       ALTERAR EXIBIÇÃO DAS CONQUISTAS
    ===================================================== */

    importarConquistas
        ?.addEventListener(
            "change",
            renderizarJogosSteam
        );


    /* =====================================================
       IMPORTAR
    ===================================================== */

    importar
        ?.addEventListener(
            "click",
            importarSelecionadosSteam
        );
}


/* =========================================================
   INICIAR
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    prepararPaginaSteam
);