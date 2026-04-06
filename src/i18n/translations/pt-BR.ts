export default {
  common: {
    ok: 'OK',
    cancel: 'Cancelar',
    back: 'Voltar',
    save: 'Salvar',
    saving: 'Salvando...',
    error: 'Erro',
    permission: 'Permissão',
    loading: 'Carregando...',
  },

  onboarding: {
    buttonNext: 'Próximo',
    buttonStart: 'Começar',

    step1: {
      title: 'Escaneie sem complicação, documentos em segundos',
      description:
        'Aponte a câmera e gere seu PDF em segundos. Recorte automático e qualidade nítida.',
    },
    step2: {
      title: 'Organize seus documentos facilmente',
      description:
        'Renomeie seus scans e encontre tudo rápido. Sem bagunça. Tudo ao seu alcance.',
    },
    step3: {
      title: 'Mais produtividade no dia a dia',
      description:
        'Escaneie, renomeie e compartilhe rápido. Menos tempo com papel, mais foco no que importa.',
    },
  },

  home: {
    headerTitle: 'Scanner Pronto PDF',
    headerSubtitle: 'Escaneie em 1 toque 😊',

    heroTitle: 'Scaneie seu documento',
    heroDesc: 'Fluxo simples: capturar → escolher formato → salvar.',
    heroButton: 'Escanear agora',
  },

  scan: {
    headerTitle: 'Escanear documento',
    permissionMessage: 'Permita acesso à câmera para escanear.',
    startError: 'Falha ao abrir o scanner.',

    readyTitle: 'Pronto para escanear',
    subtitle:
      'Posicione o documento dentro da câmera. O app detecta as bordas e recorta automaticamente.',

    tipTitle: 'Dica de qualidade',
    tipText:
      'Ao posicionar a câmera no documento, recomenda-se deixar que o próprio aplicativo tire a foto, assim vai sair um documento com melhor qualidade.',

    step1: 'Mantenha o celular firme e o documento bem iluminado',
    step2: 'Evite sombras e reflexos (principalmente em mesa brilhante)',
    step3: 'Deixe o app capturar automaticamente',

    startButton: 'Iniciar scanner',
    helper: 'Você vai voltar para a prévia para escolher PDF ou JPEG.',
  },

  preview: {
    headerTitle: 'Pré-visualização',
    formatLabel: 'Formato',
    fileNameLabel: 'Nome do arquivo',
    willSaveAs: 'Vai salvar como:',
    placeholder: 'Ex: contrato_2025',

    hint: 'Dica: use nomes curtos (sem acentos). PDF/JPEG serão salvos no aparelho.',

    modalSavedTitle: 'Salvo',
    modalSaveErrorFallback: 'Erro ao salvar.',
  },

  history: {
    title: 'Recentes',
    savedCount: '%{count} salvos',
    select: 'Selecionar',
    cancel: 'Cancelar',

    empty: 'Nenhum arquivo ainda.',
    tipHoldDownload: 'Segure o download para renomear',

    tipTitle: 'Dica',
    tipMessage: 'Segure no ícone de download para renomear antes de exportar.',

    selectHint: 'Selecione 2+ PDFs para juntar em um único arquivo.',
    onlyPdfHint: 'Por enquanto, junte apenas PDFs.',

    mergeButton: 'Juntar (%{count})',

    deleteTitle: 'Apagar documento',
    deleteMessageWithName: 'Tem certeza que quer apagar "%{name}" da listagem?',
    deleteMessageFallback:
      'Tem certeza que quer apagar este documento da listagem?',

    exportFail: 'Falha ao exportar.',
    mergeFail: 'Falha ao juntar PDFs.',

    mergeNeedAtLeastTwo: 'Selecione pelo menos 2 PDFs para juntar.',
    mergePdfOnly: 'Por enquanto, junte apenas PDFs.',
    mergeMissingPdf: 'Um dos PDFs selecionados não existe mais no app.',
    mergedExported: 'PDF unificado salvo no app e exportado para Downloads.',
    mergedSavedOnly:
      'PDF unificado salvo no app. (Falhou exportar para Downloads.)',
  },

  rename: {
    title: 'Renomear',
    placeholder: 'Novo título',
    cancel: 'Cancelar',
    save: 'Salvar',
  },

  export: {
    fileMissing: 'Arquivo não existe mais no app (foi apagado).',
    invalidName: 'Nome inválido.',
    mediaStoreUnavailable: 'MediaStore indisponível neste aparelho.',
    permissionDeniedGallery: 'Permissão negada para salvar na galeria.',
    permissionDeniedDownloads: 'Permissão negada para salvar em Downloads.',
    jpegExported: 'JPEG exportado para a Galeria.',
    pdfExported: 'PDF exportado para Downloads.',
    pdfSavedOnly: 'PDF salvo no app, mas falhou exportar para Downloads.',
    alreadyExported: 'Este arquivo já foi exportado.',
    nameAlreadyExists:
      'Já existe um arquivo com esse nome. Escolha outro nome.',
  },

  save: {
    jpegSinglePageOnly:
      'JPEG suporta apenas 1 página. Para múltiplas páginas, salve como PDF.',
    noImagesFromScanner: 'Nenhuma imagem recebida do scanner.',

    jpegSaved: 'JPEG salvo no app e na galeria.',
    pdfSavedAndExported: 'PDF salvo no app e salvo em Downloads.',
    pdfSavedOnly:
      'PDF salvo no app. (Falhou exportar para Downloads neste aparelho.)',
  },
};
