const STORAGE = {
    perfil: "cg_perfil",
    jogos: "cg_jogos",
    historico: "cg_historico",
    publicacaoPerfil: "cg_perfil_publico"
};

const API_CATALOGO =
    "https://carteirinha-gamer-api.pauloricardo59143.workers.dev";

const SITE_PUBLICO =
    "https://paulorr2000.github.io/carteirinha-gamer/";

let catalogoJogoSelecionado =
    null;

const perfilPadrao = {
    nome: "Visitante",
    avatar: "🕹️",
    plataformaFavorita: "",
    categoriaFavorita: "",
    jogoFavoritoId: "",
    habilidades: []
};


/* =========================================================
   ARMAZENAMENTO
========================================================= */

function lerJSON(chave, fallback) {

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


function salvarJSON(
    chave,
    valor
) {

    localStorage.setItem(
        chave,
        JSON.stringify(valor)
    );
}


function obterPerfil() {

    return {
        ...perfilPadrao,

        ...lerJSON(
            STORAGE.perfil,
            {}
        )
    };
}


function obterJogos() {

    return lerJSON(
        STORAGE.jogos,
        []
    );
}


function obterHistorico() {

    return lerJSON(
        STORAGE.historico,
        []
    );
}


function obterPublicacaoPerfil() {

    return {
        id: "",
        token: "",
        mostrarBiblioteca: false,
        atualizadoEm: "",
        ...lerJSON(
            STORAGE.publicacaoPerfil,
            {}
        )
    };
}


function salvarPublicacaoPerfil(
    publicacao
) {

    salvarJSON(
        STORAGE.publicacaoPerfil,
        publicacao
    );
}


/* =========================================================
   FUNÇÕES AUXILIARES
========================================================= */

function gerarId() {

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


function numero(valor) {

    const n =
        Number(valor);


    return Number.isFinite(n)
        ? n
        : 0;
}


function escaparHTML(
    texto = ""
) {

    return String(texto)

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


function lerLista(texto) {

    return texto

        .split(",")

        .map(
            item =>
                item.trim()
        )

        .filter(Boolean);
}


function formatarData(
    dataISO
) {

    if (!dataISO) {

        return "Sem data registrada";
    }


    const data =
        new Date(dataISO);


    if (
        Number.isNaN(
            data.getTime()
        )
    ) {

        return dataISO;
    }


    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    ).format(data);
}


/* =========================================================
   TEMPO DE JOGO
========================================================= */

function obterTempoTotalMinutos(
    jogo
) {

    if (!jogo) {

        return 0;
    }


    const horas =
        Math.max(
            0,
            numero(
                jogo.horas
            )
        );


    const possuiCampoMinutos =
        Object.prototype
            .hasOwnProperty
            .call(
                jogo,
                "minutos"
            );


    /*
        Compatibilidade com jogos antigos.

        Antes o projeto guardava
        somente horas.

        Inclusive poderia existir
        número decimal.
    */

    if (!possuiCampoMinutos) {

        return Math.round(
            horas * 60
        );
    }


    const horasInteiras =
        Math.floor(
            horas
        );


    const minutos =
        Math.max(
            0,

            Math.floor(
                numero(
                    jogo.minutos
                )
            )
        );


    return (
        horasInteiras *
        60
    ) + minutos;
}


function formatarTempoMinutos(
    totalMinutos
) {

    const total =
        Math.max(
            0,

            Math.floor(
                numero(
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


function formatarTempoJogo(
    jogo
) {

    return formatarTempoMinutos(
        obterTempoTotalMinutos(
            jogo
        )
    );
}


function separarTempoJogo(
    jogo
) {

    const totalMinutos =
        obterTempoTotalMinutos(
            jogo
        );


    return {

        horas:
            Math.floor(
                totalMinutos /
                60
            ),

        minutos:
            totalMinutos %
            60
    };
}


/* =========================================================
   ESTATÍSTICAS
========================================================= */

function calcularEstatisticas(
    jogos = obterJogos()
) {

    return {

        total:
            jogos.length,


        zerados:
            jogos.filter(
                jogo =>
                    jogo.status ===
                        "Zerado" ||

                    jogo.status ===
                        "100%"
            ).length,


        dropados:
            jogos.filter(
                jogo =>
                    jogo.status ===
                        "Dropado"
            ).length,


        tempoMinutos:
            jogos.reduce(
                (
                    total,
                    jogo
                ) =>

                    total +
                    obterTempoTotalMinutos(
                        jogo
                    ),

                0
            )
    };
}


/* =========================================================
   TOAST
========================================================= */

function mostrarToast(
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
        window.__toastTimer
    );


    window.__toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "mostrar"
                );

            },

            2800
        );
}


function configurarToasts() {

    document
        .querySelectorAll(
            "[data-toast]"
        )

        .forEach(
            elemento => {

                elemento
                    .addEventListener(
                        "click",
                        () => {

                            mostrarToast(
                                elemento
                                    .dataset
                                    .toast
                            );
                        }
                    );
            }
        );
}


/* =========================================================
   LOGIN LOCAL
========================================================= */

function configurarLogin() {

    const botaoLogin =
        document.querySelector(
            "#botaoLogin"
        );


    const modal =
        document.querySelector(
            "#modalLogin"
        );


    const form =
        document.querySelector(
            "#formLogin"
        );


    if (!botaoLogin) {

        return;
    }


    const perfil =
        obterPerfil();


    botaoLogin.textContent =

        perfil.nome !==
            "Visitante"

            ? `${perfil.avatar} ${perfil.nome}`

            : "Entrar";


    if (
        !modal ||
        !form
    ) {

        return;
    }


    botaoLogin
        .addEventListener(
            "click",
            () => {

                const atual =
                    obterPerfil();


                const nome =
                    document.querySelector(
                        "#loginNome"
                    );


                const avatar =
                    document.querySelector(
                        "#loginAvatar"
                    );


                if (nome) {

                    nome.value =

                        atual.nome ===
                            "Visitante"

                            ? ""

                            : atual.nome;
                }


                if (avatar) {

                    avatar.value =
                        atual.avatar ||
                        "🕹️";
                }


                modal.showModal();
            }
        );


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const atual =
                obterPerfil();


            const nome =
                document.querySelector(
                    "#loginNome"
                );


            const avatar =
                document.querySelector(
                    "#loginAvatar"
                );


            atual.nome =
                nome?.value
                    .trim() ||
                "Visitante";


            atual.avatar =
                avatar?.value ||
                "🕹️";


            salvarJSON(
                STORAGE.perfil,
                atual
            );


            modal.close();


            botaoLogin.textContent =
                `${atual.avatar} ${atual.nome}`;


            atualizarHome();


            mostrarToast(
                "Perfil local atualizado."
            );
        }
    );
}


/* =========================================================
   HOME
========================================================= */

function atualizarHome() {

    if (
        document.body
            .dataset
            .page !==
        "home"
    ) {

        return;
    }


    const perfil =
        obterPerfil();


    const jogos =
        obterJogos();


    const estatisticas =
        calcularEstatisticas(
            jogos
        );


    const favorito =
        jogos.find(
            jogo =>
                jogo.id ===
                perfil
                    .jogoFavoritoId
        );


    const campos = {

        miniAvatar:
            perfil.avatar,

        miniNome:
            perfil.nome,

        miniZerados:
            estatisticas
                .zerados,

        miniDropados:
            estatisticas
                .dropados,

        miniHoras:
            formatarTempoMinutos(
                estatisticas
                    .tempoMinutos
            ),

        miniFavorito:
            favorito
                ? favorito.nome
                : "Nenhum"
    };


    Object
        .entries(campos)

        .forEach(
            (
                [
                    id,
                    valor
                ]
            ) => {

                const elemento =
                    document
                        .getElementById(
                            id
                        );


                if (elemento) {

                    elemento
                        .textContent =
                            valor;
                }
            }
        );
}


/* =========================================================
   CENTRAL GAMER
========================================================= */

function atualizarDashboard() {

    if (
        document.body
            .dataset
            .page !==
        "dashboard"
    ) {

        return;
    }


    const perfil =
        obterPerfil();


    const estatisticas =
        calcularEstatisticas();


    const mapa = {

        dashboardAvatar:
            perfil.avatar,

        dashTotal:
            estatisticas.total,

        dashZerados:
            estatisticas.zerados,

        dashDropados:
            estatisticas.dropados,

        dashHoras:
            formatarTempoMinutos(
                estatisticas
                    .tempoMinutos
            )
    };


    Object
        .entries(mapa)

        .forEach(
            (
                [
                    id,
                    valor
                ]
            ) => {

                const elemento =
                    document
                        .getElementById(
                            id
                        );


                if (elemento) {

                    elemento
                        .textContent =
                            valor;
                }
            }
        );
}


/* =========================================================
   FILTRO DE PLATAFORMAS
========================================================= */

function criarOpcoesPlataformas(
    jogos
) {

    const select =
        document.querySelector(
            "#filtroPlataforma"
        );


    if (!select) {

        return;
    }


    const plataformas =
        [
            ...new Set(

                jogos
                    .flatMap(
                        jogo =>
                            jogo
                                .plataformas ||
                            []
                    )

                    .filter(
                        Boolean
                    )
            )
        ]

            .sort(
                (
                    a,
                    b
                ) =>

                    a.localeCompare(
                        b,
                        "pt-BR"
                    )
            );


    select.innerHTML =
        `
            <option value="todas">
                Todas as plataformas
            </option>
        `;


    plataformas.forEach(
        plataforma => {

            const option =
                document
                    .createElement(
                        "option"
                    );


            option.value =
                plataforma;


            option.textContent =
                plataforma;


            select.appendChild(
                option
            );
        }
    );
}


/* =========================================================
   BIBLIOTECA
========================================================= */

function renderizarBiblioteca() {

    if (
        document.body
            .dataset
            .page !==
        "biblioteca"
    ) {

        return;
    }


    const tbody =
        document.querySelector(
            "#tabelaJogos"
        );


    const vazio =
        document.querySelector(
            "#bibliotecaVazia"
        );


    const busca =
        document.querySelector(
            "#buscaJogo"
        );


    const status =
        document.querySelector(
            "#filtroStatus"
        );


    const plataforma =
        document.querySelector(
            "#filtroPlataforma"
        );


    if (
        !tbody ||
        !vazio ||
        !busca ||
        !status ||
        !plataforma
    ) {

        return;
    }


    const todosJogos =
        obterJogos();


    criarOpcoesPlataformas(
        todosJogos
    );


    function desenhar() {

        const textoBusca =
            (
                busca.value ||
                ""
            )

                .toLowerCase()

                .trim();


        const statusSelecionado =
            status.value;


        const plataformaSelecionada =
            plataforma.value;


        const jogos =
            todosJogos.filter(
                jogo => {

                    const bateNome =
                        jogo.nome
                            .toLowerCase()

                            .includes(
                                textoBusca
                            );


                    const bateStatus =

                        statusSelecionado ===
                            "todos" ||

                        jogo.status ===
                            statusSelecionado;


                    const batePlataforma =

                        plataformaSelecionada ===
                            "todas" ||

                        (
                            jogo.plataformas ||
                            []
                        )

                            .includes(
                                plataformaSelecionada
                            );


                    return (
                        bateNome &&
                        bateStatus &&
                        batePlataforma
                    );
                }
            );


        tbody.innerHTML =
            "";


        vazio.hidden =
            todosJogos.length >
            0;


        if (!jogos.length) {

            if (
                todosJogos.length >
                0
            ) {

                tbody.innerHTML =
                    `
                        <tr>

                            <td
                                colspan="8"
                                class="texto-suave"
                            >
                                Nenhum jogo encontrado
                                com esses filtros.
                            </td>

                        </tr>
                    `;
            }


            return;
        }


        jogos.forEach(
            jogo => {

                const conquistas =
                    `${numero(
                        jogo
                            .conquistasObtidas
                    )}/${numero(
                        jogo
                            .conquistasTotais
                    )}`;


                const tr =
                    document
                        .createElement(
                            "tr"
                        );


                tr.innerHTML =
                    `
                        <td>

                            <span
                                class="nome-jogo-tabela"
                            >
                                ${escaparHTML(
                                    jogo.nome
                                )}
                            </span>

                        </td>


                        <td>

                            ${
                                jogo.nota !== "" &&
                                jogo.nota != null

                                    ? `${escaparHTML(
                                        jogo.nota
                                    )}/10`

                                    : "—"
                            }

                        </td>


                        <td>

                            ${formatarTempoJogo(
                                jogo
                            )}

                        </td>


                        <td>

                            <span
                                class="tag-status"
                            >
                                ${escaparHTML(
                                    jogo.status
                                )}
                            </span>

                        </td>


                        <td>

                            ${conquistas}

                        </td>


                        <td>

                            ${escaparHTML(
                                (
                                    jogo.plataformas ||
                                    []
                                )
                                    .join(", ") ||
                                "—"
                            )}

                        </td>


                        <td>

                            ${escaparHTML(
                                jogo.recomenda ||
                                "—"
                            )}

                        </td>


                        <td>

                            <div
                                class="acoes-tabela"
                            >

                                <a
                                    class="
                                        botao
                                        botao-mini
                                        botao-destaque
                                    "

                                    href="detalhe.html?id=${encodeURIComponent(
                                        jogo.id
                                    )}"
                                >
                                    Ver
                                </a>


                                <a
                                    class="
                                        botao
                                        botao-mini
                                    "

                                    href="jogo.html?id=${encodeURIComponent(
                                        jogo.id
                                    )}"
                                >
                                    Editar
                                </a>


                                <button
                                    class="
                                        botao
                                        botao-mini
                                        botao-perigo
                                    "

                                    type="button"

                                    data-excluir="${escaparHTML(
                                        jogo.id
                                    )}"
                                >
                                    Excluir
                                </button>

                            </div>

                        </td>
                    `;


                tbody.appendChild(
                    tr
                );
            }
        );


        tbody
            .querySelectorAll(
                "[data-excluir]"
            )

            .forEach(
                botao => {

                    botao
                        .addEventListener(
                            "click",
                            () => {

                                excluirJogo(
                                    botao
                                        .dataset
                                        .excluir
                                );
                            }
                        );
                }
            );
    }


    busca.addEventListener(
        "input",
        desenhar
    );


    status.addEventListener(
        "change",
        desenhar
    );


    plataforma.addEventListener(
        "change",
        desenhar
    );


    desenhar();
}


/* =========================================================
   EXCLUIR JOGO
========================================================= */

function excluirJogo(
    id
) {

    const jogos =
        obterJogos();


    const jogo =
        jogos.find(
            item =>
                item.id ===
                id
        );


    if (!jogo) {

        return;
    }


    const confirmar =
        confirm(
            `Excluir "${jogo.nome}" da biblioteca?`
        );


    if (!confirmar) {

        return;
    }


    const novos =
        jogos.filter(
            item =>
                item.id !==
                id
        );


    salvarJSON(
        STORAGE.jogos,
        novos
    );


    const perfil =
        obterPerfil();


    if (
        perfil
            .jogoFavoritoId ===
        id
    ) {

        perfil
            .jogoFavoritoId =
                "";


        salvarJSON(
            STORAGE.perfil,
            perfil
        );
    }


    location.reload();
}



/* =========================================================
   CATÁLOGO DE JOGOS
========================================================= */

function obterAnoCatalogo(
    data
) {

    if (!data) {

        return "";
    }


    const ano =
        String(data)
            .slice(
                0,
                4
            );


    return /^\d{4}$/.test(
        ano
    )
        ? ano
        : "";
}


function configurarBuscaCatalogo(
    jogoExistente = null
) {

    const busca =
        document.querySelector(
            "#buscaCatalogo"
        );

    const botao =
        document.querySelector(
            "#btnBuscarCatalogo"
        );

    const resultados =
        document.querySelector(
            "#resultadosCatalogo"
        );

    const status =
        document.querySelector(
            "#statusCatalogo"
        );

    const cardSelecionado =
        document.querySelector(
            "#jogoCatalogoSelecionado"
        );

    const capaSelecionada =
        document.querySelector(
            "#catalogoCapaSelecionada"
        );

    const nomeSelecionado =
        document.querySelector(
            "#catalogoNomeSelecionado"
        );

    const metaSelecionada =
        document.querySelector(
            "#catalogoMetaSelecionada"
        );

    const desenvolvedoraSelecionada =
        document.querySelector(
            "#catalogoDesenvolvedoraSelecionada"
        );

    const plataformasDisponiveisBloco =
        document.querySelector(
            "#catalogoPlataformasDisponiveis"
        );

    const plataformasDisponiveisTags =
        document.querySelector(
            "#catalogoPlataformasTags"
        );

    const seletorPlataformas =
        document.querySelector(
            "#seletorPlataformas"
        );

    const opcoesPlataformas =
        document.querySelector(
            "#opcoesPlataformas"
        );

    const plataformasJogo =
        document.querySelector(
            "#plataformasJogo"
        );

    const botaoLimpar =
        document.querySelector(
            "#btnLimparCatalogo"
        );


    if (
        !busca ||
        !botao ||
        !resultados
    ) {

        return;
    }


    function plataformasDisponiveisDoCatalogo() {

        if (
            !catalogoJogoSelecionado
        ) {

            return [];
        }


        const lista =
            catalogoJogoSelecionado
                .plataformasDisponiveis ||
            [];


        return Array.isArray(lista)
            ? lista.filter(Boolean)
            : [];
    }


    if (
        jogoExistente?.catalogo?.fonte ===
            "RAWG"
    ) {

        const catalogoExistente =
            jogoExistente.catalogo;


        catalogoJogoSelecionado = {
            ...catalogoExistente,

            nome:
                jogoExistente.nome ||
                "",

            generos:
                [
                    ...(
                        catalogoExistente
                            .generos ||
                        jogoExistente
                            .categorias ||
                        []
                    )
                ],

            plataformasDisponiveis:
                [
                    ...(
                        catalogoExistente
                            .plataformasDisponiveis ||
                        []
                    )
                ]
        };

        busca.value =
            jogoExistente.nome ||
            "";

    } else {

        catalogoJogoSelecionado =
            null;
    }


    function mostrarStatus(
        mensagem = ""
    ) {

        if (!status) {

            return;
        }


        status.textContent =
            mensagem;

        status.hidden =
            !mensagem;
    }


    function limparResultados() {

        resultados.innerHTML =
            "";
    }


    function atualizarMarcacoesPlataformas() {

        if (
            !opcoesPlataformas ||
            !plataformasJogo
        ) {

            return;
        }


        const selecionadas =
            lerLista(
                plataformasJogo.value
            );


        opcoesPlataformas
            .querySelectorAll(
                'input[type="checkbox"]'
            )
            .forEach(
                input => {

                    input.checked =
                        selecionadas
                            .includes(
                                input.value
                            );
                }
            );
    }


    function sincronizarCampoPlataformas() {

        if (
            !opcoesPlataformas ||
            !plataformasJogo
        ) {

            return;
        }


        const disponiveis =
            plataformasDisponiveisDoCatalogo();


        const marcadas =
            [
                ...opcoesPlataformas
                    .querySelectorAll(
                        'input[type="checkbox"]:checked'
                    )
            ]
                .map(
                    input =>
                        input.value
                );


        const atuais =
            lerLista(
                plataformasJogo.value
            );


        const extras =
            atuais.filter(
                plataforma =>
                    !disponiveis.includes(
                        plataforma
                    )
            );


        plataformasJogo.value =
            [
                ...new Set(
                    [
                        ...marcadas,
                        ...extras
                    ]
                )
            ].join(", ");
    }


    function renderizarOpcoesPlataformas() {

        if (
            !seletorPlataformas ||
            !opcoesPlataformas
        ) {

            return;
        }


        const disponiveis =
            plataformasDisponiveisDoCatalogo();


        if (!disponiveis.length) {

            seletorPlataformas.hidden =
                true;

            opcoesPlataformas.innerHTML =
                "";

            return;
        }


        seletorPlataformas.hidden =
            false;

        opcoesPlataformas.innerHTML =
            "";


        const jaSelecionadas =
            plataformasJogo
                ? lerLista(
                    plataformasJogo.value
                )
                : [];


        disponiveis.forEach(
            plataforma => {

                const label =
                    document.createElement(
                        "label"
                    );

                label.className =
                    "opcao-plataforma";


                const input =
                    document.createElement(
                        "input"
                    );

                input.type =
                    "checkbox";

                input.value =
                    plataforma;

                input.checked =
                    jaSelecionadas.includes(
                        plataforma
                    );


                const texto =
                    document.createElement(
                        "span"
                    );

                texto.textContent =
                    plataforma;


                input.addEventListener(
                    "change",
                    sincronizarCampoPlataformas
                );


                label.append(
                    input,
                    texto
                );

                opcoesPlataformas
                    .appendChild(
                        label
                    );
            }
        );
    }


    function renderizarSelecionado() {

        if (!cardSelecionado) {

            return;
        }


        if (
            !catalogoJogoSelecionado
        ) {

            cardSelecionado.hidden =
                true;

            if (
                plataformasDisponiveisBloco
            ) {

                plataformasDisponiveisBloco
                    .hidden =
                        true;
            }

            renderizarOpcoesPlataformas();

            return;
        }


        cardSelecionado.hidden =
            false;


        if (nomeSelecionado) {

            nomeSelecionado.textContent =
                catalogoJogoSelecionado
                    .nome ||
                "Jogo selecionado";
        }


        const ano =
            obterAnoCatalogo(
                catalogoJogoSelecionado
                    .lancamento
            );


        const plataformasDisponiveis =
            plataformasDisponiveisDoCatalogo();


        const resumoPlataformas =
            plataformasDisponiveis
                .slice(
                    0,
                    4
                )
                .join(
                    " • "
                );


        if (metaSelecionada) {

            metaSelecionada.textContent =
                [
                    ano,
                    resumoPlataformas
                ]
                    .filter(
                        Boolean
                    )
                    .join(
                        " • "
                    ) ||
                "Informações públicas carregadas.";
        }


        const desenvolvedoras =
            (
                catalogoJogoSelecionado
                    .desenvolvedoras ||
                []
            )
                .join(
                    ", "
                );


        if (
            desenvolvedoraSelecionada
        ) {

            desenvolvedoraSelecionada
                .textContent =
                    desenvolvedoras
                        ? `Desenvolvedora: ${desenvolvedoras}`
                        : "";
        }


        if (
            plataformasDisponiveisBloco &&
            plataformasDisponiveisTags
        ) {

            plataformasDisponiveisBloco
                .hidden =
                    !plataformasDisponiveis
                        .length;

            plataformasDisponiveisTags
                .innerHTML =
                    plataformasDisponiveis
                        .map(
                            plataforma =>
                                `
                                    <span class="tag-detalhe tag-catalogo-plataforma">
                                        ${escaparHTML(
                                            plataforma
                                        )}
                                    </span>
                                `
                        )
                        .join("");
        }


        if (capaSelecionada) {

            const capa =
                catalogoJogoSelecionado
                    .capa;


            if (capa) {

                capaSelecionada.innerHTML =
                    `
                        <img
                            src="${escaparHTML(
                                capa
                            )}"
                            alt="Capa de ${escaparHTML(
                                catalogoJogoSelecionado
                                    .nome ||
                                "jogo"
                            )}"
                            loading="lazy"
                        >
                    `;

            } else {

                capaSelecionada.textContent =
                    "🎮";
            }
        }


        renderizarOpcoesPlataformas();
    }


    async function selecionarJogo(
        resumo
    ) {

        mostrarStatus(
            "Carregando informações do jogo..."
        );


        try {

            const resposta =
                await fetch(
                    `${API_CATALOGO}/jogo/${encodeURIComponent(
                        resumo.id
                    )}`
                );


            const dados =
                await resposta.json();


            if (
                !resposta.ok ||
                !dados.sucesso
            ) {

                throw new Error(
                    dados.mensagem ||
                    "Falha ao carregar detalhes."
                );
            }


            const jogo =
                dados.jogo;


            const catalogoAnteriorId =
                catalogoJogoSelecionado
                    ?.id ??
                null;


            catalogoJogoSelecionado = {
                fonte:
                    "RAWG",

                id:
                    jogo.id,

                nome:
                    jogo.nome ||
                    resumo.nome ||
                    "",

                slug:
                    jogo.slug ||
                    resumo.slug ||
                    "",

                capa:
                    jogo.capa ||
                    resumo.capa ||
                    "",

                lancamento:
                    jogo.lancamento ||
                    resumo.lancamento ||
                    "",

                notaRawg:
                    jogo.notaRawg ??
                    resumo.notaRawg ??
                    null,

                metacritic:
                    jogo.metacritic ??
                    resumo.metacritic ??
                    null,

                generos:
                    [
                        ...(
                            jogo.generos ||
                            resumo.generos ||
                            []
                        )
                    ],

                plataformasDisponiveis:
                    [
                        ...(
                            jogo.plataformas ||
                            resumo.plataformas ||
                            []
                        )
                    ],

                desenvolvedoras:
                    [
                        ...(
                            jogo.desenvolvedoras ||
                            []
                        )
                    ],

                publicadoras:
                    [
                        ...(
                            jogo.publicadoras ||
                            []
                        )
                    ],

                classificacao:
                    jogo.classificacao ||
                    ""
            };


            document.querySelector(
                "#nomeJogo"
            ).value =
                catalogoJogoSelecionado
                    .nome;


            document.querySelector(
                "#categoriasJogo"
            ).value =
                catalogoJogoSelecionado
                    .generos
                    .join(
                        ", "
                    );


            if (
                plataformasJogo &&
                catalogoAnteriorId !==
                    catalogoJogoSelecionado.id
            ) {

                plataformasJogo.value =
                    "";
            }


            busca.value =
                catalogoJogoSelecionado
                    .nome;


            limparResultados();

            mostrarStatus();

            renderizarSelecionado();


            mostrarToast(
                "Jogo encontrado. Agora selecione em qual plataforma você jogou."
            );

        } catch (erro) {

            console.error(
                "Erro ao selecionar jogo:",
                erro
            );


            mostrarStatus(
                "Não foi possível carregar este jogo. Você ainda pode preencher a ficha manualmente."
            );
        }
    }


    function renderizarResultados(
        lista
    ) {

        limparResultados();


        if (!lista.length) {

            mostrarStatus(
                "Nenhum jogo encontrado com esse nome."
            );

            return;
        }


        mostrarStatus(
            `${lista.length} resultado(s) encontrado(s).`
        );


        lista.forEach(
            jogo => {

                const item =
                    document.createElement(
                        "button"
                    );


                item.type =
                    "button";

                item.className =
                    "resultado-catalogo";


                const ano =
                    obterAnoCatalogo(
                        jogo.lancamento
                    );


                const plataformas =
                    (
                        jogo.plataformas ||
                        []
                    )
                        .slice(
                            0,
                            3
                        )
                        .join(
                            " • "
                        );


                item.innerHTML =
                    `
                        <span
                            class="resultado-catalogo-capa"
                        >
                            ${
                                jogo.capa
                                    ? `
                                        <img
                                            src="${escaparHTML(
                                                jogo.capa
                                            )}"
                                            alt=""
                                            loading="lazy"
                                        >
                                    `
                                    : `
                                        <span
                                            class="resultado-catalogo-sem-capa"
                                            aria-hidden="true"
                                        >
                                            🎮
                                        </span>
                                    `
                            }
                        </span>

                        <span
                            class="resultado-catalogo-info"
                        >
                            <strong>
                                ${escaparHTML(
                                    jogo.nome ||
                                    "Jogo sem nome"
                                )}
                            </strong>

                            <small>
                                ${escaparHTML(
                                    [
                                        ano,
                                        plataformas
                                    ]
                                        .filter(
                                            Boolean
                                        )
                                        .join(
                                            " • "
                                        ) ||
                                    "Sem informações adicionais"
                                )}
                            </small>
                        </span>

                        <span
                            class="resultado-catalogo-seta"
                            aria-hidden="true"
                        >
                            →
                        </span>
                    `;


                item.addEventListener(
                    "click",
                    () => {

                        selecionarJogo(
                            jogo
                        );
                    }
                );


                resultados.appendChild(
                    item
                );
            }
        );
    }


    async function pesquisar() {

        const termo =
            busca.value
                .trim();


        if (
            termo.length <
            3
        ) {

            limparResultados();

            mostrarStatus(
                "Digite pelo menos 3 caracteres para pesquisar."
            );

            return;
        }


        botao.disabled =
            true;

        botao.textContent =
            "Buscando...";

        mostrarStatus(
            "Pesquisando no catálogo..."
        );


        try {

            const resposta =
                await fetch(
                    `${API_CATALOGO}/buscar?q=${encodeURIComponent(
                        termo
                    )}`
                );


            const dados =
                await resposta.json();


            if (
                !resposta.ok ||
                !dados.sucesso
            ) {

                throw new Error(
                    dados.mensagem ||
                    "Falha na pesquisa."
                );
            }


            renderizarResultados(
                Array.isArray(
                    dados.jogos
                )
                    ? dados.jogos
                    : []
            );

        } catch (erro) {

            console.error(
                "Erro ao pesquisar catálogo:",
                erro
            );


            limparResultados();

            mostrarStatus(
                "Não foi possível acessar o catálogo agora. O preenchimento manual continua disponível."
            );

        } finally {

            botao.disabled =
                false;

            botao.textContent =
                "🔎 Buscar";
        }
    }


    botao.addEventListener(
        "click",
        pesquisar
    );


    busca.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                pesquisar();
            }
        }
    );


    if (plataformasJogo) {

        plataformasJogo.addEventListener(
            "input",
            atualizarMarcacoesPlataformas
        );
    }


    if (botaoLimpar) {

        botaoLimpar.addEventListener(
            "click",
            () => {

                catalogoJogoSelecionado =
                    null;

                renderizarSelecionado();

                mostrarToast(
                    "Vínculo com o catálogo removido. A ficha continua preenchida."
                );
            }
        );
    }


    renderizarSelecionado();
}


/* =========================================================
   FORMULÁRIO DE JOGO
========================================================= */

function prepararFormularioJogo() {

    if (
        document.body
            .dataset
            .page !==
        "jogo"
    ) {

        return;
    }


    const form =
        document.querySelector(
            "#formJogo"
        );


    if (!form) {

        return;
    }


    const params =
        new URLSearchParams(
            location.search
        );


    const id =
        params.get(
            "id"
        );


    const jogos =
        obterJogos();


    const existente =
        jogos.find(
            jogo =>
                jogo.id ===
                id
        );


    if (existente) {

        const tempo =
            separarTempoJogo(
                existente
            );


        const tituloFormulario =
            document.querySelector(
                "#tituloFormulario"
            );


        if (tituloFormulario) {

            tituloFormulario
                .textContent =
                    `Editar: ${existente.nome}`;
        }


        document
            .querySelector(
                "#jogoId"
            )
            .value =
                existente.id;


        document
            .querySelector(
                "#nomeJogo"
            )
            .value =
                existente.nome ||
                "";


        document
            .querySelector(
                "#notaJogo"
            )
            .value =
                existente.nota ??
                "";


        document
            .querySelector(
                "#horasJogo"
            )
            .value =
                tempo.horas;


        document
            .querySelector(
                "#minutosJogo"
            )
            .value =
                tempo.minutos;


        document
            .querySelector(
                "#statusJogo"
            )
            .value =
                existente.status ||
                "Quero jogar";


        document
            .querySelector(
                "#recomendaJogo"
            )
            .value =
                existente.recomenda ||
                "Sim";


        document
            .querySelector(
                "#conquistasObtidas"
            )
            .value =
                existente
                    .conquistasObtidas ??
                0;


        document
            .querySelector(
                "#conquistasTotais"
            )
            .value =
                existente
                    .conquistasTotais ??
                0;


        document
            .querySelector(
                "#plataformasJogo"
            )
            .value =
                (
                    existente
                        .plataformas ||
                    []
                ).join(", ");


        document
            .querySelector(
                "#categoriasJogo"
            )
            .value =
                (
                    existente
                        .categorias ||
                    []
                ).join(", ");


        document
            .querySelector(
                "#replayJogo"
            )
            .value =
                existente.replay ||
                "Médio";


        document
            .querySelector(
                "#personagemJogo"
            )
            .value =
                existente
                    .personagemFavorito ||
                "";


        document
            .querySelector(
                "#gostouJogo"
            )
            .value =
                existente.gostou ||
                "";


        document
            .querySelector(
                "#naoGostouJogo"
            )
            .value =
                existente
                    .naoGostou ||
                "";


        document
            .querySelector(
                "#comentarioJogo"
            )
            .value =
                existente
                    .comentario ||
                "";
    }


    configurarBuscaCatalogo(
        existente
    );


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const horas =
                Math.max(
                    0,

                    Math.floor(
                        numero(
                            document
                                .querySelector(
                                    "#horasJogo"
                                )
                                .value
                        )
                    )
                );


            const minutos =
                Math.max(
                    0,

                    Math.floor(
                        numero(
                            document
                                .querySelector(
                                    "#minutosJogo"
                                )
                                .value
                        )
                    )
                );


            if (
                minutos >
                59
            ) {

                mostrarToast(
                    "Os minutos devem ficar entre 0 e 59."
                );


                return;
            }


            const jogo = {

                id:
                    existente?.id ||
                    gerarId(),


                nome:
                    document
                        .querySelector(
                            "#nomeJogo"
                        )
                        .value
                        .trim(),


                nota:
                    document
                        .querySelector(
                            "#notaJogo"
                        )
                        .value,


                horas:
                    horas,


                minutos:
                    minutos,


                status:
                    document
                        .querySelector(
                            "#statusJogo"
                        )
                        .value,


                recomenda:
                    document
                        .querySelector(
                            "#recomendaJogo"
                        )
                        .value,


                conquistasObtidas:
                    numero(
                        document
                            .querySelector(
                                "#conquistasObtidas"
                            )
                            .value
                    ),


                conquistasTotais:
                    numero(
                        document
                            .querySelector(
                                "#conquistasTotais"
                            )
                            .value
                    ),


                plataformas:
                    lerLista(
                        document
                            .querySelector(
                                "#plataformasJogo"
                            )
                            .value
                    ),


                categorias:
                    lerLista(
                        document
                            .querySelector(
                                "#categoriasJogo"
                            )
                            .value
                    ),


                replay:
                    document
                        .querySelector(
                            "#replayJogo"
                        )
                        .value,


                personagemFavorito:
                    document
                        .querySelector(
                            "#personagemJogo"
                        )
                        .value
                        .trim(),


                gostou:
                    document
                        .querySelector(
                            "#gostouJogo"
                        )
                        .value
                        .trim(),


                naoGostou:
                    document
                        .querySelector(
                            "#naoGostouJogo"
                        )
                        .value
                        .trim(),


                comentario:
                    document
                        .querySelector(
                            "#comentarioJogo"
                        )
                        .value
                        .trim(),


                catalogo:
                    catalogoJogoSelecionado

                        ? {
                            fonte:
                                "RAWG",

                            id:
                                catalogoJogoSelecionado
                                    .id,

                            slug:
                                catalogoJogoSelecionado
                                    .slug ||
                                "",

                            capa:
                                catalogoJogoSelecionado
                                    .capa ||
                                "",

                            lancamento:
                                catalogoJogoSelecionado
                                    .lancamento ||
                                "",

                            notaRawg:
                                catalogoJogoSelecionado
                                    .notaRawg ??
                                null,

                            metacritic:
                                catalogoJogoSelecionado
                                    .metacritic ??
                                null,

                            generos:
                                [
                                    ...(
                                        catalogoJogoSelecionado
                                            .generos ||
                                        []
                                    )
                                ],

                            plataformasDisponiveis:
                                [
                                    ...(
                                        catalogoJogoSelecionado
                                            .plataformasDisponiveis ||
                                        []
                                    )
                                ],

                            desenvolvedoras:
                                [
                                    ...(
                                        catalogoJogoSelecionado
                                            .desenvolvedoras ||
                                        []
                                    )
                                ],

                            publicadoras:
                                [
                                    ...(
                                        catalogoJogoSelecionado
                                            .publicadoras ||
                                        []
                                    )
                                ],

                            classificacao:
                                catalogoJogoSelecionado
                                    .classificacao ||
                                ""
                        }

                        : null,


                criadoEm:
                    existente
                        ?.criadoEm ||
                    new Date()
                        .toISOString(),


                atualizadoEm:
                    new Date()
                        .toISOString()
            };


            if (
                jogo
                    .conquistasTotais >
                    0 &&

                jogo
                    .conquistasObtidas >
                jogo
                    .conquistasTotais
            ) {

                mostrarToast(
                    "Conquistas obtidas não podem ser maiores que o total."
                );


                return;
            }


            const atualizados =
                [
                    ...jogos
                ];


            if (existente) {

                registrarHistorico(
                    existente,
                    jogo
                );


                const indice =
                    atualizados
                        .findIndex(
                            item =>
                                item.id ===
                                existente.id
                        );


                atualizados[indice] =
                    jogo;

            } else {

                atualizados.push(
                    jogo
                );
            }


            salvarJSON(
                STORAGE.jogos,
                atualizados
            );


            location.href =
                "biblioteca.html";
        }
    );
}


/* =========================================================
   HISTÓRICO DE ALTERAÇÕES
========================================================= */

function registrarHistorico(
    antes,
    depois
) {

    const historico =
        obterHistorico();


    const mudancas =
        [];


    const tempoAntes =
        obterTempoTotalMinutos(
            antes
        );


    const tempoDepois =
        obterTempoTotalMinutos(
            depois
        );


    if (
        tempoAntes !==
        tempoDepois
    ) {

        mudancas.push(
            `Tempo jogado: "${formatarTempoMinutos(
                tempoAntes
            )}" → "${formatarTempoMinutos(
                tempoDepois
            )}"`
        );
    }


    const campos = [

        [
            "nota",
            "Nota"
        ],

        [
            "status",
            "Status"
        ],

        [
            "recomenda",
            "Recomendação"
        ],

        [
            "conquistasObtidas",
            "Conquistas obtidas"
        ],

        [
            "conquistasTotais",
            "Conquistas totais"
        ],

        [
            "replay",
            "Fator replay"
        ],

        [
            "personagemFavorito",
            "Personagem favorito"
        ],

        [
            "gostou",
            "O que gostou"
        ],

        [
            "naoGostou",
            "O que não gostou"
        ],

        [
            "comentario",
            "Comentário"
        ]
    ];


    campos.forEach(
        (
            [
                chave,
                rotulo
            ]
        ) => {

            if (
                String(
                    antes[chave] ??
                    ""
                ) !==

                String(
                    depois[chave] ??
                    ""
                )
            ) {

                mudancas.push(
                    `${rotulo}: "${antes[chave] ?? "—"}" → "${depois[chave] ?? "—"}"`
                );
            }
        }
    );


    const listas = [

        [
            "plataformas",
            "Plataformas"
        ],

        [
            "categorias",
            "Categorias"
        ]
    ];


    listas.forEach(
        (
            [
                chave,
                rotulo
            ]
        ) => {

            const a =
                (
                    antes[chave] ||
                    []
                )
                    .join(", ");


            const d =
                (
                    depois[chave] ||
                    []
                )
                    .join(", ");


            if (
                a !==
                d
            ) {

                mudancas.push(
                    `${rotulo}: "${a || "—"}" → "${d || "—"}"`
                );
            }
        }
    );


    if (!mudancas.length) {

        return;
    }


    historico.unshift(
        {

            id:
                gerarId(),

            jogoId:
                depois.id,

            jogoNome:
                depois.nome,

            data:
                new Date()
                    .toISOString(),

            mudancas:
                mudancas
        }
    );


    salvarJSON(
        STORAGE.historico,
        historico
    );
}


/* =========================================================
   PERFIL
========================================================= */

function prepararPerfil() {

    if (
        document.body
            .dataset
            .page !==
        "perfil"
    ) {

        return;
    }


    const perfil =
        obterPerfil();


    const jogos =
        obterJogos();


    const form =
        document.querySelector(
            "#formPerfil"
        );


    const favorito =
        document.querySelector(
            "#perfilFavoritoInput"
        );


    if (
        !form ||
        !favorito
    ) {

        return;
    }


    const nome =
        document.querySelector(
            "#perfilNomeInput"
        );


    const avatar =
        document.querySelector(
            "#perfilAvatarInput"
        );


    const plataforma =
        document.querySelector(
            "#perfilPlataformaInput"
        );


    const categoria =
        document.querySelector(
            "#perfilCategoriaInput"
        );


    nome.value =

        perfil.nome ===
            "Visitante"

            ? ""

            : perfil.nome;


    avatar.value =
        perfil.avatar;


    plataforma.value =
        perfil
            .plataformaFavorita ||
        "";


    categoria.value =
        perfil
            .categoriaFavorita ||
        "";


    jogos
        .slice()

        .sort(
            (
                a,
                b
            ) =>

                a.nome
                    .localeCompare(
                        b.nome,
                        "pt-BR"
                    )
        )

        .forEach(
            jogo => {

                const option =
                    document
                        .createElement(
                            "option"
                        );


                option.value =
                    jogo.id;


                option.textContent =
                    jogo.nome;


                favorito.appendChild(
                    option
                );
            }
        );


    favorito.value =
        perfil
            .jogoFavoritoId ||
        "";


    document
        .querySelectorAll(
            "#habilidadesCheckbox input"
        )

        .forEach(
            input => {

                input.checked =
                    perfil
                        .habilidades
                        .includes(
                            input.value
                        );
            }
        );


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const habilidades =
                [
                    ...document
                        .querySelectorAll(
                            "#habilidadesCheckbox input:checked"
                        )
                ]

                    .map(
                        input =>
                            input.value
                    );


            const atualizado = {

                nome:
                    nome
                        .value
                        .trim() ||
                    "Visitante",


                avatar:
                    avatar.value,


                plataformaFavorita:
                    plataforma
                        .value
                        .trim(),


                categoriaFavorita:
                    categoria
                        .value
                        .trim(),


                jogoFavoritoId:
                    favorito.value,


                habilidades:
                    habilidades
            };


            salvarJSON(
                STORAGE.perfil,
                atualizado
            );


            mostrarToast(
                "Perfil salvo."
            );


            setTimeout(
                () => {

                    location.href =
                        "carteirinha.html";
                },

                500
            );
        }
    );
}


/* =========================================================
   CARTEIRINHA
========================================================= */

function renderizarCarteirinha() {

    if (
        document.body
            .dataset
            .page !==
        "carteirinha"
    ) {

        return;
    }


    const perfil =
        obterPerfil();


    const jogos =
        obterJogos();


    const stats =
        calcularEstatisticas(
            jogos
        );


    const favorito =
        jogos.find(
            jogo =>
                jogo.id ===
                perfil
                    .jogoFavoritoId
        );


    const valores = {

        perfilAvatar:
            perfil.avatar,


        perfilNome:
            perfil.nome,


        perfilJogoFavorito:
            favorito?.nome ||
            "Nenhum",


        perfilPlataforma:
            perfil
                .plataformaFavorita ||
            "Não definida",


        perfilCategoria:
            perfil
                .categoriaFavorita ||
            "Não definida",


        perfilTotal:
            stats.total,


        perfilZerados:
            stats.zerados,


        perfilDropados:
            stats.dropados,


        perfilHoras:
            formatarTempoMinutos(
                stats
                    .tempoMinutos
            )
    };


    Object
        .entries(valores)

        .forEach(
            (
                [
                    id,
                    valor
                ]
            ) => {

                const elemento =
                    document
                        .getElementById(
                            id
                        );


                if (elemento) {

                    elemento
                        .textContent =
                            valor;
                }
            }
        );


    const habilidades =
        document.querySelector(
            "#perfilHabilidades"
        );


    if (habilidades) {

        if (
            perfil
                .habilidades
                .length
        ) {

            habilidades.innerHTML =
                perfil
                    .habilidades

                    .map(
                        habilidade =>
                            `
                                <span
                                    class="habilidade"
                                >
                                    ${escaparHTML(
                                        habilidade
                                    )}
                                </span>
                            `
                    )

                    .join("");

        } else {

            habilidades.innerHTML =
                `
                    <p
                        class="texto-suave"
                    >
                        Nenhuma habilidade escolhida ainda.
                        Edite seu perfil para adicionar.
                    </p>
                `;
        }
    }


    const card =
        document.querySelector(
            "#cardFavorito"
        );


    if (!card) {

        return;
    }


    if (!favorito) {

        card.innerHTML =
            `
                <div
                    class="estado-vazio"
                >

                    <span>
                        ❤️
                    </span>

                    <h3>
                        Nenhum jogo favorito definido
                    </h3>

                    <p>
                        Escolha um jogo no seu perfil.
                    </p>

                    <a
                        class="botao"
                        href="perfil.html"
                    >
                        Editar perfil
                    </a>

                </div>
            `;


        return;
    }


    card.innerHTML =
        `
            <div
                class="card-favorito"
            >

                <div
                    class="card-favorito-icone"
                >
                    🎮
                </div>


                <div>

                    <h3>
                        ${escaparHTML(
                            favorito.nome
                        )}
                    </h3>


                    <p>

                        ⭐ ${
                            favorito.nota !== ""

                                ? `${escaparHTML(
                                    favorito.nota
                                )}/10`

                                : "Sem nota"
                        }

                        •

                        ⏱️ ${formatarTempoJogo(
                            favorito
                        )}

                    </p>


                    <p>

                        🏆 ${escaparHTML(
                            favorito.status
                        )}

                        •

                        🏅 ${numero(
                            favorito
                                .conquistasObtidas
                        )}/${numero(
                            favorito
                                .conquistasTotais
                        )}
                        conquistas

                    </p>


                    <p>
                        ${escaparHTML(
                            favorito
                                .comentario ||
                            "Sem comentário registrado."
                        )}
                    </p>

                </div>

            </div>
        `;
}


/* =========================================================
   HISTÓRICO GERAL
========================================================= */

function renderizarHistorico() {

    if (
        document.body
            .dataset
            .page !==
        "historico"
    ) {

        return;
    }


    const lista =
        document.querySelector(
            "#listaHistorico"
        );


    const vazio =
        document.querySelector(
            "#historicoVazio"
        );


    if (
        !lista ||
        !vazio
    ) {

        return;
    }


    const historico =
        obterHistorico();


    if (!historico.length) {

        vazio.hidden =
            false;


        lista.innerHTML =
            "";


        return;
    }


    vazio.hidden =
        true;


    lista.innerHTML =
        historico

            .map(
                item =>
                    `
                        <article
                            class="item-historico"
                        >

                            <h3>
                                ${escaparHTML(
                                    item.jogoNome
                                )}
                            </h3>


                            <time>
                                ${escaparHTML(
                                    formatarData(
                                        item.data
                                    )
                                )}
                            </time>


                            <pre>${escaparHTML(
                                item.mudancas
                                    .join("\n")
                            )}</pre>

                        </article>
                    `
            )

            .join("");
}


/* =========================================================
   DETALHES DO JOGO
========================================================= */

function renderizarDetalheJogo() {

    if (
        document.body
            .dataset
            .page !==
        "detalhe"
    ) {

        return;
    }


    const params =
        new URLSearchParams(
            location.search
        );


    const id =
        params.get(
            "id"
        );


    const jogos =
        obterJogos();


    const jogo =
        jogos.find(
            item =>
                item.id ===
                id
        );


    if (!jogo) {

        const main =
            document.querySelector(
                "main"
            );


        if (main) {

            main.innerHTML =
                `
                    <section
                        class="
                            painel
                            estado-vazio
                        "
                    >

                        <span>
                            😵
                        </span>

                        <h1>
                            Jogo não encontrado
                        </h1>

                        <p>
                            Esse jogo não existe
                            ou foi excluído.
                        </p>

                        <a
                            class="
                                botao
                                botao-destaque
                            "

                            href="biblioteca.html"
                        >
                            Voltar para Biblioteca
                        </a>

                    </section>
                `;
        }


        return;
    }


    const preencherTexto =
        (
            seletor,
            valor
        ) => {

            const elemento =
                document.querySelector(
                    seletor
                );


            if (elemento) {

                elemento.textContent =
                    valor;
            }
        };


    preencherTexto(
        "#detalheNome",
        jogo.nome ||
        "Jogo"
    );


    preencherTexto(
        "#detalheStatus",
        jogo.status ||
        "—"
    );


    preencherTexto(
        "#detalheNota",

        jogo.nota !== "" &&
        jogo.nota != null

            ? `${jogo.nota}/10`

            : "Sem nota"
    );


    preencherTexto(
        "#detalheHoras",

        formatarTempoJogo(
            jogo
        )
    );


    preencherTexto(
        "#detalheConquistas",

        `${numero(
            jogo
                .conquistasObtidas
        )} / ${numero(
            jogo
                .conquistasTotais
        )}`
    );


    preencherTexto(
        "#detalheRecomenda",

        jogo.recomenda ||
        "—"
    );


    preencherTexto(
        "#detalheReplay",

        jogo.replay ||
        "—"
    );


    preencherTexto(
        "#detalhePersonagem",

        jogo
            .personagemFavorito ||
        "Não informado"
    );


    preencherTexto(
        "#detalheGostou",

        jogo.gostou ||
        "Nada registrado ainda."
    );


    preencherTexto(
        "#detalheNaoGostou",

        jogo
            .naoGostou ||
        "Nada registrado ainda."
    );


    preencherTexto(
        "#detalheComentario",

        jogo
            .comentario ||
        "Nenhum comentário registrado."
    );


    preencherTexto(
        "#detalheAtualizado",

        jogo.atualizadoEm ||
        jogo.criadoEm

            ? formatarData(
                jogo.atualizadoEm ||
                jogo.criadoEm
            )

            : "Sem data registrada"
    );


    const editar =
        document.querySelector(
            "#detalheEditar"
        );


    if (editar) {

        editar.href =
            `jogo.html?id=${encodeURIComponent(
                jogo.id
            )}`;
    }


    /* =====================================================
       PLATAFORMAS
    ===================================================== */

    const plataformas =
        document.querySelector(
            "#detalhePlataformas"
        );


    if (plataformas) {

        if (
            jogo.plataformas &&
            jogo.plataformas.length
        ) {

            plataformas.innerHTML =
                jogo.plataformas

                    .map(
                        plataforma =>
                            `
                                <span
                                    class="tag-detalhe"
                                >
                                    🖥️
                                    ${escaparHTML(
                                        plataforma
                                    )}
                                </span>
                            `
                    )

                    .join("");

        } else {

            plataformas.innerHTML =
                `
                    <span
                        class="texto-suave"
                    >
                        Nenhuma plataforma registrada.
                    </span>
                `;
        }
    }


    /* =====================================================
       CATEGORIAS
    ===================================================== */

    const categorias =
        document.querySelector(
            "#detalheCategorias"
        );


    if (categorias) {

        if (
            jogo.categorias &&
            jogo.categorias.length
        ) {

            categorias.innerHTML =
                jogo.categorias

                    .map(
                        categoria =>
                            `
                                <span
                                    class="tag-detalhe"
                                >
                                    🎮
                                    ${escaparHTML(
                                        categoria
                                    )}
                                </span>
                            `
                    )

                    .join("");

        } else {

            categorias.innerHTML =
                `
                    <span
                        class="texto-suave"
                    >
                        Nenhuma categoria registrada.
                    </span>
                `;
        }
    }


    /* =====================================================
       HISTÓRICO DESTE JOGO
    ===================================================== */

    const historico =
        obterHistorico()

            .filter(
                item =>
                    item.jogoId ===
                    jogo.id
            );


    const lista =
        document.querySelector(
            "#detalheHistorico"
        );


    const vazio =
        document.querySelector(
            "#detalheHistoricoVazio"
        );


    if (
        !lista ||
        !vazio
    ) {

        return;
    }


    if (!historico.length) {

        lista.innerHTML =
            "";


        vazio.hidden =
            false;


        return;
    }


    vazio.hidden =
        true;


    lista.innerHTML =
        historico

            .map(
                item =>
                    `
                        <article
                            class="item-historico"
                        >

                            <h3>
                                Atualização
                            </h3>


                            <time>
                                ${escaparHTML(
                                    formatarData(
                                        item.data
                                    )
                                )}
                            </time>


                            <pre>${escaparHTML(
                                item.mudancas
                                    .join("\n")
                            )}</pre>

                        </article>
                    `
            )

            .join("");
}


/* =========================================================
   PERFIL PÚBLICO / COMUNIDADE
========================================================= */

function criarLinkPerfilPublico(id) {
    return `${SITE_PUBLICO}jogador.html?id=${encodeURIComponent(id)}`;
}

function urlImagemSegura(valor) {
    try {
        const url = new URL(String(valor || ""));
        if (url.protocol !== "https:" && url.protocol !== "http:") {
            return "";
        }
        return url.href;
    } catch {
        return "";
    }
}

function montarBibliotecaPublica(jogos) {
    return jogos.map(jogo => ({
        id: jogo.id,
        nome: jogo.nome || "",
        capa: jogo.catalogo?.capa || "",
        nota: jogo.nota ?? "",
        status: jogo.status || "",
        tempoMinutos: obterTempoTotalMinutos(jogo),
        plataformas: Array.isArray(jogo.plataformas) ? jogo.plataformas : []
    }));
}

function montarPerfilPublico(mostrarBiblioteca) {
    const perfil = obterPerfil();
    const jogos = obterJogos();
    const estatisticas = calcularEstatisticas(jogos);
    const favorito = jogos.find(jogo => jogo.id === perfil.jogoFavoritoId);

    return {
        nome: perfil.nome || "Visitante",
        avatar: perfil.avatar || "🎮",
        jogoFavorito: favorito?.nome || "",
        plataformaFavorita: perfil.plataformaFavorita || "",
        categoriaFavorita: perfil.categoriaFavorita || "",
        habilidades: Array.isArray(perfil.habilidades) ? perfil.habilidades : [],
        totalJogos: estatisticas.total,
        jogosZerados: estatisticas.zerados,
        jogosDropados: estatisticas.dropados,
        tempoMinutos: estatisticas.tempoMinutos,
        mostrarBiblioteca: Boolean(mostrarBiblioteca),
        biblioteca: mostrarBiblioteca ? montarBibliotecaPublica(jogos) : []
    };
}

function atualizarInterfacePerfilPublico() {
    if (document.body.dataset.page !== "carteirinha") {
        return;
    }

    const publicacao = obterPublicacaoPerfil();
    const checkbox = document.querySelector("#mostrarBibliotecaPublica");
    const btnPublicar = document.querySelector("#btnPublicarPerfil");
    const btnCopiar = document.querySelector("#btnCopiarPerfil");
    const btnAbrir = document.querySelector("#btnAbrirPerfilPublico");
    const btnDespublicar = document.querySelector("#btnDespublicarPerfil");
    const status = document.querySelector("#statusPerfilPublico");

    if (!checkbox || !btnPublicar || !btnCopiar || !btnAbrir || !btnDespublicar || !status) {
        return;
    }

    checkbox.checked = Boolean(publicacao.mostrarBiblioteca);
    const publicado = Boolean(publicacao.id && publicacao.token);

    btnPublicar.textContent = publicado
        ? "🔄 Atualizar perfil público"
        : "🌐 Publicar meu perfil";

    btnCopiar.hidden = !publicado;
    btnAbrir.hidden = !publicado;
    btnDespublicar.hidden = !publicado;

    if (publicado) {
        btnAbrir.href = criarLinkPerfilPublico(publicacao.id);
        status.innerHTML = "✅ Perfil publicado. Alterações locais só aparecem online depois de clicar em <strong>Atualizar perfil público</strong>.";
    } else {
        btnAbrir.href = "#";
        status.textContent = "Seu perfil ainda não foi publicado.";
    }
}

async function publicarOuAtualizarPerfil() {
    const perfil = obterPerfil();

    if (!perfil.nome || perfil.nome === "Visitante") {
        alert("Edite seu perfil e escolha um nome de jogador antes de publicá-lo.");
        return;
    }

    const checkbox = document.querySelector("#mostrarBibliotecaPublica");
    const btnPublicar = document.querySelector("#btnPublicarPerfil");
    const mostrarBiblioteca = Boolean(checkbox?.checked);
    const publicacaoAtual = obterPublicacaoPerfil();
    const payload = montarPerfilPublico(mostrarBiblioteca);

    if (publicacaoAtual.id) {
        payload.id = publicacaoAtual.id;
    }

    const headers = {
        "Content-Type": "application/json"
    };

    if (publicacaoAtual.token) {
        headers.Authorization = `Bearer ${publicacaoAtual.token}`;
    }

    try {
        if (btnPublicar) {
            btnPublicar.disabled = true;
            btnPublicar.textContent = "Publicando...";
        }

        const resposta = await fetch(`${API_CATALOGO}/perfil`, {
            method: "POST",
            headers,
            body: JSON.stringify(payload)
        });

        const dados = await resposta.json();

        if (!resposta.ok || !dados.sucesso) {
            throw new Error(dados.mensagem || "Não foi possível publicar o perfil.");
        }

        const novaPublicacao = {
            id: dados.id || publicacaoAtual.id,
            token: dados.token || publicacaoAtual.token,
            mostrarBiblioteca,
            atualizadoEm: new Date().toISOString()
        };

        if (!novaPublicacao.id || !novaPublicacao.token) {
            throw new Error("A publicação foi criada, mas a credencial local ficou incompleta.");
        }

        salvarPublicacaoPerfil(novaPublicacao);
        atualizarInterfacePerfilPublico();
        mostrarToast(dados.criado ? "Perfil público criado." : "Perfil público atualizado.");
    } catch (erro) {
        console.error("Erro ao publicar perfil:", erro);
        alert(erro.message || "Não foi possível publicar o perfil.");
    } finally {
        if (btnPublicar) {
            btnPublicar.disabled = false;
        }
        atualizarInterfacePerfilPublico();
    }
}

async function copiarLinkPerfilPublico() {
    const publicacao = obterPublicacaoPerfil();
    if (!publicacao.id) {
        return;
    }

    const link = criarLinkPerfilPublico(publicacao.id);

    try {
        await navigator.clipboard.writeText(link);
        mostrarToast("Link do perfil copiado.");
    } catch {
        window.prompt("Copie o link do seu perfil:", link);
    }
}

async function despublicarPerfil() {
    const publicacao = obterPublicacaoPerfil();

    if (!publicacao.id || !publicacao.token) {
        return;
    }

    const confirmar = confirm(
        "Remover seu perfil público da Comunidade? Seus dados locais e sua biblioteca não serão apagados."
    );

    if (!confirmar) {
        return;
    }

    try {
        const resposta = await fetch(
            `${API_CATALOGO}/perfil/${encodeURIComponent(publicacao.id)}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${publicacao.token}`
                }
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok || !dados.sucesso) {
            throw new Error(dados.mensagem || "Não foi possível remover o perfil público.");
        }

        localStorage.removeItem(STORAGE.publicacaoPerfil);
        atualizarInterfacePerfilPublico();
        mostrarToast("Perfil removido da Comunidade.");
    } catch (erro) {
        console.error("Erro ao despublicar perfil:", erro);
        alert(erro.message || "Não foi possível remover o perfil público.");
    }
}

function configurarPerfilPublico() {
    if (document.body.dataset.page !== "carteirinha") {
        return;
    }

    document.querySelector("#btnPublicarPerfil")?.addEventListener(
        "click",
        publicarOuAtualizarPerfil
    );

    document.querySelector("#btnCopiarPerfil")?.addEventListener(
        "click",
        copiarLinkPerfilPublico
    );

    document.querySelector("#btnDespublicarPerfil")?.addEventListener(
        "click",
        despublicarPerfil
    );

    atualizarInterfacePerfilPublico();
}

function cardJogadorPublico(jogador) {
    const favorito = jogador.jogoFavorito || "Não informado";
    const plataforma = jogador.plataformaFavorita || "Não informada";

    return `
        <a
            class="card-jogador-publico"
            href="jogador.html?id=${encodeURIComponent(jogador.id)}"
        >
            <div class="avatar-jogador-publico">
                ${escaparHTML(jogador.avatar || "🎮")}
            </div>

            <div class="info-jogador-publico">
                <h2>${escaparHTML(jogador.nome || "Jogador")}</h2>
                <p>❤️ ${escaparHTML(favorito)}</p>
                <p>🖥️ ${escaparHTML(plataforma)}</p>

                <div class="resumo-jogador-publico">
                    <span>🎮 ${numero(jogador.totalJogos)}</span>
                    <span>🏆 ${numero(jogador.jogosZerados)}</span>
                    <span>⏱️ ${formatarTempoMinutos(jogador.tempoMinutos)}</span>
                </div>
            </div>

            <span class="seta-jogador-publico">→</span>
        </a>
    `;
}

async function carregarJogadores(busca = "") {
    const lista = document.querySelector("#listaJogadores");
    const status = document.querySelector("#comunidadeStatus");

    if (!lista || !status) {
        return;
    }

    status.textContent = "Carregando jogadores...";
    lista.innerHTML = "";

    try {
        const parametros = busca ? `?q=${encodeURIComponent(busca)}` : "";
        const resposta = await fetch(`${API_CATALOGO}/jogadores${parametros}`);
        const dados = await resposta.json();

        if (!resposta.ok || !dados.sucesso) {
            throw new Error(dados.mensagem || "Não foi possível carregar a Comunidade.");
        }

        const jogadores = Array.isArray(dados.jogadores) ? dados.jogadores : [];

        if (!jogadores.length) {
            status.textContent = busca
                ? "Nenhum jogador encontrado com esse nome."
                : "Ainda não há perfis públicos na Comunidade.";
            return;
        }

        status.textContent = `${jogadores.length} jogador(es) encontrado(s).`;
        lista.innerHTML = jogadores.map(cardJogadorPublico).join("");
    } catch (erro) {
        console.error("Erro na Comunidade:", erro);
        status.textContent = erro.message || "Não foi possível carregar a Comunidade.";
    }
}

function renderizarComunidade() {
    if (document.body.dataset.page !== "comunidade") {
        return;
    }

    const input = document.querySelector("#buscaJogador");
    const botao = document.querySelector("#btnBuscarJogador");
    let timer = null;

    const pesquisar = () => {
        carregarJogadores(input?.value.trim() || "");
    };

    botao?.addEventListener("click", pesquisar);

    input?.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            pesquisar();
        }
    });

    input?.addEventListener("input", () => {
        clearTimeout(timer);
        timer = setTimeout(pesquisar, 450);
    });

    carregarJogadores();
}

function renderizarBibliotecaPerfilPublico(biblioteca) {
    const bloco = document.querySelector("#blocoBibliotecaPublica");
    const lista = document.querySelector("#listaBibliotecaPublica");

    if (!bloco || !lista) {
        return;
    }

    if (!Array.isArray(biblioteca) || !biblioteca.length) {
        bloco.hidden = true;
        lista.innerHTML = "";
        return;
    }

    bloco.hidden = false;

    lista.innerHTML = biblioteca.map(jogo => {
        const capa = urlImagemSegura(jogo.capa);
        const imagem = capa
            ? `
                <img
                    src="${escaparHTML(capa)}"
                    alt="Capa de ${escaparHTML(jogo.nome || "jogo")}"
                    loading="lazy"
                >
            `
            : `<div class="capa-publica-vazia">🎮</div>`;

        const nota = jogo.nota !== "" && jogo.nota != null
            ? `${escaparHTML(jogo.nota)}/10`
            : "Sem nota";

        const plataformas = Array.isArray(jogo.plataformas)
            ? jogo.plataformas.join(", ")
            : "";

        return `
            <article class="jogo-publico-card">
                <div class="jogo-publico-capa">${imagem}</div>

                <div class="jogo-publico-info">
                    <h3>${escaparHTML(jogo.nome || "Jogo")}</h3>
                    <p>⭐ ${nota}</p>
                    <p>🏆 ${escaparHTML(jogo.status || "Sem status")}</p>
                    <p>⏱️ ${formatarTempoMinutos(jogo.tempoMinutos)}</p>
                    <p class="texto-suave">${escaparHTML(plataformas) || "Plataforma não informada"}</p>
                </div>
            </article>
        `;
    }).join("");
}

async function renderizarJogadorPublico() {
    if (document.body.dataset.page !== "jogador-publico") {
        return;
    }

    const carregando = document.querySelector("#perfilPublicoCarregando");
    const visualizacao = document.querySelector("#perfilPublicoVisualizacao");
    const params = new URLSearchParams(location.search);
    const id = params.get("id");

    if (!id) {
        if (carregando) {
            carregando.innerHTML = `
                <span>😵</span>
                <h1>Perfil não informado</h1>
                <p class="texto-suave">O link deste perfil está incompleto.</p>
                <a class="botao botao-destaque" href="comunidade.html">Ir para Comunidade</a>
            `;
        }
        return;
    }

    try {
        const resposta = await fetch(`${API_CATALOGO}/perfil/${encodeURIComponent(id)}`);
        const dados = await resposta.json();

        if (!resposta.ok || !dados.sucesso || !dados.perfil) {
            throw new Error(dados.mensagem || "Perfil público não encontrado.");
        }

        const perfil = dados.perfil;
        const mapa = {
            publicoAvatar: perfil.avatar || "🎮",
            publicoNome: perfil.nome || "Jogador",
            publicoFavorito: perfil.jogoFavorito || "Não informado",
            publicoPlataforma: perfil.plataformaFavorita || "Não informada",
            publicoCategoria: perfil.categoriaFavorita || "Não informada",
            publicoTotal: numero(perfil.totalJogos),
            publicoZerados: numero(perfil.jogosZerados),
            publicoDropados: numero(perfil.jogosDropados),
            publicoTempo: formatarTempoMinutos(perfil.tempoMinutos)
        };

        Object.entries(mapa).forEach(([elementoId, valor]) => {
            const elemento = document.getElementById(elementoId);
            if (elemento) {
                elemento.textContent = valor;
            }
        });

        document.title = `${perfil.nome || "Jogador"} | Carteirinha Gamer`;

        const habilidades = document.querySelector("#publicoHabilidades");
        if (habilidades) {
            if (Array.isArray(perfil.habilidades) && perfil.habilidades.length) {
                habilidades.innerHTML = perfil.habilidades
                    .map(habilidade => `<span class="habilidade">${escaparHTML(habilidade)}</span>`)
                    .join("");
            } else {
                habilidades.innerHTML = `<p class="texto-suave">Nenhuma habilidade pública informada.</p>`;
            }
        }

        if (perfil.mostrarBiblioteca) {
            renderizarBibliotecaPerfilPublico(perfil.biblioteca);
        }

        const atualizado = document.querySelector("#publicoAtualizado");
        if (atualizado) {
            atualizado.textContent = `Última atualização: ${formatarData(perfil.atualizadoEm)}`;
        }

        if (carregando) {
            carregando.hidden = true;
        }
        if (visualizacao) {
            visualizacao.hidden = false;
        }
    } catch (erro) {
        console.error("Erro ao abrir perfil público:", erro);
        if (carregando) {
            carregando.innerHTML = `
                <span>😵</span>
                <h1>Perfil indisponível</h1>
                <p class="texto-suave">${escaparHTML(erro.message || "Não foi possível carregar este perfil.")}</p>
                <a class="botao botao-destaque" href="comunidade.html">Voltar para Comunidade</a>
            `;
        }
    }
}


/* =========================================================
   BACKUP / RESTAURAÇÃO / LIMPEZA
========================================================= */

function nomeArquivoBackup() {

    const agora =
        new Date();


    const ano =
        agora.getFullYear();


    const mes =
        String(
            agora.getMonth() +
            1
        ).padStart(
            2,
            "0"
        );


    const dia =
        String(
            agora.getDate()
        ).padStart(
            2,
            "0"
        );


    return `carteirinha-gamer-backup-${ano}-${mes}-${dia}.json`;
}


/* =========================================================
   EXPORTAR BACKUP
========================================================= */

function exportarBackup() {

    const backup = {

        aplicativo:
            "Carteirinha Gamer",


        versaoBackup:
            2,


        exportadoEm:
            new Date()
                .toISOString(),


        dados: {

            perfil:
                obterPerfil(),


            jogos:
                obterJogos(),


            historico:
                obterHistorico(),


            publicacaoPerfil:
                obterPublicacaoPerfil()
        }
    };


    const conteudo =
        JSON.stringify(
            backup,
            null,
            2
        );


    const blob =
        new Blob(
            [
                conteudo
            ],
            {
                type:
                    "application/json;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        nomeArquivoBackup();


    document.body
        .appendChild(
            link
        );


    link.click();


    link.remove();


    setTimeout(
        () => {

            URL.revokeObjectURL(
                url
            );

        },

        1000
    );


    mostrarToast(
        "Backup baixado com sucesso."
    );
}


/* =========================================================
   VALIDAR BACKUP
========================================================= */

function backupValido(
    backup
) {

    if (
        !backup ||
        typeof backup !==
            "object"
    ) {

        return false;
    }


    if (
        backup.aplicativo !==
        "Carteirinha Gamer"
    ) {

        return false;
    }


    if (
        !backup.dados ||
        typeof backup.dados !==
            "object"
    ) {

        return false;
    }


    if (
        !Array.isArray(
            backup.dados.jogos
        )
    ) {

        return false;
    }


    if (
        !Array.isArray(
            backup.dados.historico
        )
    ) {

        return false;
    }


    if (
        !backup.dados.perfil ||

        typeof backup
            .dados
            .perfil !==
            "object" ||

        Array.isArray(
            backup.dados.perfil
        )
    ) {

        return false;
    }


    return true;
}


/* =========================================================
   IMPORTAR BACKUP
========================================================= */

async function importarBackup(
    arquivo
) {

    if (!arquivo) {

        return;
    }


    try {

        const texto =
            await arquivo.text();


        const backup =
            JSON.parse(
                texto
            );


        if (
            !backupValido(
                backup
            )
        ) {

            alert(
                "Esse arquivo não parece ser um backup válido da Carteirinha Gamer."
            );


            return;
        }


        const jogosAtuais =
            obterJogos()
                .length;


        const mensagem =

            jogosAtuais >
            0

                ? `Importar este backup vai substituir os dados atuais deste navegador.\n\nJogos atuais: ${jogosAtuais}\nJogos no backup: ${backup.dados.jogos.length}\n\nDeseja continuar?`

                : `Este backup possui ${backup.dados.jogos.length} jogo(s).\n\nDeseja restaurá-lo neste navegador?`;


        const confirmar =
            confirm(
                mensagem
            );


        if (!confirmar) {

            return;
        }


        salvarJSON(
            STORAGE.perfil,
            backup.dados.perfil
        );


        salvarJSON(
            STORAGE.jogos,
            backup.dados.jogos
        );


        salvarJSON(
            STORAGE.historico,
            backup.dados.historico
        );


        if (
            Object.prototype
                .hasOwnProperty
                .call(
                    backup.dados,
                    "publicacaoPerfil"
                )
        ) {

            const publicacao =
                backup.dados
                    .publicacaoPerfil;


            if (
                publicacao &&
                typeof publicacao ===
                    "object" &&
                !Array.isArray(
                    publicacao
                )
            ) {

                salvarJSON(
                    STORAGE.publicacaoPerfil,
                    publicacao
                );

            } else {

                localStorage.removeItem(
                    STORAGE.publicacaoPerfil
                );
            }
        }


        alert(
            "Backup restaurado com sucesso. A Carteirinha Gamer será recarregada com os dados importados."
        );


        location.href =
            "dashboard.html";

    } catch (erro) {

        console.error(
            "Erro ao importar backup:",
            erro
        );


        alert(
            "Não foi possível importar esse arquivo. Verifique se ele é um arquivo JSON de backup válido."
        );
    }
}


/* =========================================================
   APAGAR TODOS OS DADOS
========================================================= */

function apagarTodosOsDados() {

    const publicacao =
        obterPublicacaoPerfil();


    if (
        publicacao.id &&
        publicacao.token
    ) {

        alert(
            "Você possui um perfil público online. Antes de apagar seus dados locais, abra sua Carteirinha e use Despublicar. Assim você não perde a chave de edição deixando um perfil órfão na Comunidade."
        );


        return;
    }


    const primeiraConfirmacao =
        confirm(
            "Isso vai apagar deste navegador todo o perfil, biblioteca e histórico da Carteirinha Gamer.\n\nSe quiser guardar seus dados, baixe um backup antes.\n\nDeseja continuar?"
        );


    if (
        !primeiraConfirmacao
    ) {

        return;
    }


    const segundaConfirmacao =
        confirm(
            "Última confirmação: apagar TODOS os seus dados locais da Carteirinha Gamer?"
        );


    if (
        !segundaConfirmacao
    ) {

        return;
    }


    localStorage.removeItem(
        STORAGE.perfil
    );


    localStorage.removeItem(
        STORAGE.jogos
    );


    localStorage.removeItem(
        STORAGE.historico
    );


    localStorage.removeItem(
        STORAGE.publicacaoPerfil
    );


    alert(
        "Seus dados locais da Carteirinha Gamer foram apagados."
    );


    location.href =
        "index.html";
}


/* =========================================================
   CONFIGURAÇÕES / BACKUP
========================================================= */

function configurarBackup() {

    if (
        document.body
            .dataset
            .page !==
        "configuracoes"
    ) {

        return;
    }


    const btnExportar =
        document.querySelector(
            "#btnExportarBackup"
        );


    const btnImportar =
        document.querySelector(
            "#btnImportarBackup"
        );


    const btnApagar =
        document.querySelector(
            "#btnApagarDados"
        );


    const arquivoBackup =
        document.querySelector(
            "#arquivoBackup"
        );


    if (
        !btnExportar ||
        !btnImportar ||
        !btnApagar ||
        !arquivoBackup
    ) {

        return;
    }


    btnExportar.addEventListener(
        "click",
        () => {

            exportarBackup();
        }
    );


    btnImportar.addEventListener(
        "click",
        () => {

            arquivoBackup.value =
                "";


            arquivoBackup.click();
        }
    );


    arquivoBackup.addEventListener(
        "change",
        async () => {

            const arquivo =
                arquivoBackup
                    .files?.[0];


            await importarBackup(
                arquivo
            );


            arquivoBackup.value =
                "";
        }
    );


    btnApagar.addEventListener(
        "click",
        () => {

            apagarTodosOsDados();
        }
    );
}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

configurarToasts();

configurarLogin();

atualizarHome();

atualizarDashboard();

renderizarBiblioteca();

prepararFormularioJogo();

prepararPerfil();

renderizarCarteirinha();

renderizarHistorico();

renderizarDetalheJogo();

configurarBackup();

configurarPerfilPublico();

renderizarComunidade();

renderizarJogadorPublico();