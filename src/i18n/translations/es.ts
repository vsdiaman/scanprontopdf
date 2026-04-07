export default {
  common: {
    ok: 'OK',
    cancel: 'Cancelar',
    back: 'Volver',
    save: 'Guardar',
    saving: 'Guardando...',
    error: 'Error',
    success: 'Éxito',
    permission: 'Permiso',
    loading: 'Cargando...',
  },

  onboarding: {
    buttonNext: 'Siguiente',
    buttonStart: 'Comenzar',

    step1: {
      title: 'Escanea sin complicaciones, documentos en segundos',
      description:
        'Apunta la cámara y genera tu PDF en segundos. Recorte automático y calidad nítida.',
    },
    step2: {
      title: 'Organiza tus documentos fácilmente',
      description:
        'Renombra tus escaneos y encuentra todo rápido. Sin desorden. Todo a tu alcance.',
    },
    step3: {
      title: 'Más productividad todos los días',
      description:
        'Escanea, renombra y comparte rápido. Menos tiempo con papel, más foco en lo importante.',
    },
  },

  home: {
    headerTitle: 'Scanner Pronto PDF',
    headerSubtitle: 'Escanea en 1 toque',
    importPdfTitle: 'Importar PDF',
    importPdfSubtitle: 'Elige un archivo de tu celular',
    scanButton: 'Escanear',
    mergeButton: 'Combinar (%{count})',
    mergeEnterSelection: 'Seleccionar PDFs',
    importedDefaultName: 'Importado',
    importedDefaultFileName: 'documento.pdf',
    importErrorLog: 'Error al importar PDF:',
  },

  scan: {
    headerTitle: 'Escanear documento',
    permissionMessage: 'Permite el acceso a la cámara para escanear.',
    startError: 'Error al abrir el escáner.',

    readyTitle: 'Listo para escanear',
    subtitle:
      'Coloca el documento dentro de la cámara. La app detecta los bordes y recorta automáticamente.',

    tipTitle: 'Consejo de calidad',
    tipText:
      'Al posicionar la cámara sobre el documento, se recomienda dejar que la app tome la foto automáticamente para una mejor calidad.',

    step1: 'Mantén el celular firme y el documento bien iluminado',
    step2: 'Evita sombras y reflejos (especialmente en superficies brillantes)',
    step3: 'Deja que la app capture automáticamente',

    startButton: 'Iniciar escáner',
    helper: 'Volverás a la vista previa para elegir PDF o JPEG.',
  },

  preview: {
    headerTitle: 'Vista previa',
    formatLabel: 'Formato',
    fileNameLabel: 'Nombre del archivo',
    willSaveAs: 'Se guardará como:',
    placeholder: 'Ej: contrato_2025',

    hint: 'Consejo: usa nombres cortos (sin acentos). PDF/JPEG se guardarán en el dispositivo.',

    modalSavedTitle: 'Guardado',
    modalSaveErrorFallback: 'Error al guardar.',
  },

  history: {
    title: 'Recientes',
    savedCount: '%{count} guardados',
    select: 'Seleccionar',
    cancel: 'Cancelar',
    recentDocsTitle: 'Documentos recientes',
    empty: 'Todavía no hay archivos.',
    tipHoldDownload: 'Mantén presionado descargar para renombrar',

    tipTitle: 'Consejo',
    tipMessage:
      'Mantén presionado el ícono de descarga para renombrar antes de exportar.',

    selectHint: 'Selecciona 2+ PDFs para combinarlos en un solo archivo.',
    onlyPdfHint: 'Por ahora, combina solo PDFs.',

    mergeButton: 'Combinar (%{count})',

    deleteTitle: 'Eliminar documento',
    deleteMessageWithName:
      '¿Seguro que quieres eliminar "%{name}" de la lista?',
    deleteMessageFallback:
      '¿Seguro que quieres eliminar este documento de la lista?',

    exportFail: 'Error al exportar.',
    mergeFail: 'Error al combinar PDFs.',

    mergeNeedAtLeastTwo: 'Selecciona al menos 2 PDFs para combinar.',
    mergePdfOnly: 'Por ahora, combina solo PDFs.',
    mergeMissingPdf: 'Uno de los PDFs seleccionados ya no existe en la app.',
    mergedExported: 'PDF combinado guardado y exportado a Descargas.',
    mergedSavedOnly:
      'PDF combinado guardado en la app. (Falló la exportación a Descargas.)',
    mergedSuccessAlert: 'PDFs combinados correctamente.',
    mergeProgressTitle: 'Combinando PDFs',
    mergeProgressValidating: 'Validando archivos seleccionados...',
    mergeProgressPreparing: 'Preparando documentos...',
    mergeProgressReading: 'Leyendo PDFs...',
    mergeProgressMerging: 'Procesando combinación...',
    mergeProgressWriting: 'Guardando archivo final...',
    mergeProgressFinalizing: 'Actualizando historial...',
    mergeProgressDone: '¡Combinación completada!',

    renameAction: 'Renombrar',
    shareAction: 'Compartir',
    exportAction: 'Exportar / Guardar en el dispositivo',
    duplicateAction: 'Duplicar',
    deleteAction: 'Eliminar',
    duplicateSuccess: 'Archivo duplicado correctamente.',
    duplicateFailed: 'No se pudo duplicar el archivo.',
  },

  rename: {
    title: 'Renombrar',
    placeholder: 'Nuevo título',
    cancel: 'Cancelar',
    save: 'Guardar',
  },

  export: {
    fileMissing: 'El archivo ya no existe en la app (fue eliminado).',
    invalidName: 'Nombre inválido.',
    mediaStoreUnavailable: 'MediaStore no disponible en este dispositivo.',
    permissionDeniedGallery: 'Permiso denegado para guardar en la galería.',
    permissionDeniedDownloads: 'Permiso denegado para guardar en Descargas.',
    jpegExported: 'JPEG exportado a la galería.',
    pdfExported: 'PDF exportado a Descargas.',
    pdfSavedOnly: 'PDF guardado en la app, pero falló la exportación a Descargas.',
    alreadyExported: 'Este archivo ya fue exportado.',
    nameAlreadyExists:
      'Ya existe un archivo con ese nombre. Elige otro nombre.',
  },

  save: {
    jpegSinglePageOnly:
      'JPEG admite solo 1 página. Para múltiples páginas, guarda como PDF.',
    noImagesFromScanner: 'No se recibieron imágenes del escáner.',

    jpegSaved: 'JPEG guardado en la app y en la galería.',
    jpegSavedOnly: 'JPEG guardado en la app. (Falló la exportación a la galería.)',
    pdfSavedAndExported: 'PDF guardado en la app y exportado a Descargas.',
    pdfSavedOnly:
      'PDF guardado en la app. (Falló la exportación a Descargas.)',
  },
};
