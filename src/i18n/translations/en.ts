export default {
  common: {
    ok: 'OK',
    cancel: 'Cancel',
    back: 'Back',
    save: 'Save',
    saving: 'Saving...',
    error: 'Error',
    success: 'Success',
    permission: 'Permission',
    loading: 'Loading...',
  },

  onboarding: {
    buttonNext: 'Next',
    buttonStart: 'Start',

    step1: {
      title: 'Scan effortlessly, documents in seconds',
      description:
        'Point the camera and generate your PDF in seconds. Auto-crop and crisp quality.',
    },
    step2: {
      title: 'Organize your documents easily',
      description:
        'Rename your scans and find everything fast. No mess. Everything at hand.',
    },
    step3: {
      title: 'More productivity every day',
      description:
        'Scan, rename, and share quickly. Less paper time, more focus on what matters.',
    },
  },

  home: {
    headerTitle: 'Scanner Pronto PDF',
    headerSubtitle: 'Scan in 1 tap',
    importPdfTitle: 'Import PDF',
    importPdfSubtitle: 'Choose a file from your phone',
    scanButton: 'Scan',
    mergeButton: 'Merge (%{count})',
    importedDefaultName: 'Imported',
    importedDefaultFileName: 'document.pdf',
    importErrorLog: 'PDF import error:',
  },

  scan: {
    headerTitle: 'Scan document',
    permissionMessage: 'Allow camera access to scan.',
    startError: 'Failed to open the scanner.',

    readyTitle: 'Ready to scan',
    subtitle:
      'Place the document inside the camera view. The app detects edges and auto-crops.',

    tipTitle: 'Quality tip',
    tipText:
      'When positioning the camera, it’s recommended to let the app capture automatically for better quality.',

    step1: 'Hold the phone steady and keep the document well lit',
    step2: 'Avoid shadows and reflections (especially on glossy surfaces)',
    step3: 'Let the app capture automatically',

    startButton: 'Start scanner',
    helper: 'You will return to preview to choose PDF or JPEG.',
  },

  preview: {
    headerTitle: 'Preview',
    formatLabel: 'Format',
    fileNameLabel: 'File name',
    willSaveAs: 'Will save as:',
    placeholder: 'e.g. contract_2025',

    hint: 'Tip: use short names (no accents). PDF/JPEG will be saved on the device.',

    modalSavedTitle: 'Saved',
    modalSaveErrorFallback: 'Failed to save.',
  },

  history: {
    title: 'Recent',
    savedCount: '%{count} saved',
    select: 'Select',
    cancel: 'Cancel',
    recentDocsTitle: 'Recent documents',
    empty: 'No files yet.',
    tipHoldDownload: 'Hold download to rename',

    tipTitle: 'Tip',
    tipMessage: 'Hold the download icon to rename before exporting.',

    selectHint: 'Select 2+ PDFs to merge into a single file.',
    onlyPdfHint: 'For now, merge PDFs only.',

    mergeButton: 'Merge (%{count})',

    deleteTitle: 'Delete document',
    deleteMessageWithName:
      'Are you sure you want to delete "%{name}" from the list?',
    deleteMessageFallback:
      'Are you sure you want to delete this document from the list?',

    exportFail: 'Export failed.',
    mergeFail: 'Failed to merge PDFs.',

    mergeNeedAtLeastTwo: 'Select at least 2 PDFs to merge.',
    mergePdfOnly: 'For now, merge PDFs only.',
    mergeMissingPdf: 'One of the selected PDFs no longer exists in the app.',
    mergedExported: 'Merged PDF saved and exported to Downloads.',
    mergedSavedOnly: 'Merged PDF saved. (Export to Downloads failed.)',
    mergedSuccessAlert: 'PDFs merged successfully.',
  },

  rename: {
    title: 'Rename',
    placeholder: 'New title',
    cancel: 'Cancel',
    save: 'Save',
  },

  export: {
    fileMissing: 'File no longer exists in the app (it was deleted).',
    invalidName: 'Invalid name.',
    mediaStoreUnavailable: 'MediaStore unavailable on this device.',
    permissionDeniedGallery: 'Permission denied to save to gallery.',
    permissionDeniedDownloads: 'Permission denied to save to Downloads.',
    jpegExported: 'JPEG exported to gallery.',
    pdfExported: 'PDF exported to Downloads.',
    pdfSavedOnly: 'PDF saved in the app, but export to Downloads failed.',
    alreadyExported: 'This file has already been exported.',
    nameAlreadyExists:
      'A file with this name already exists. Choose another name.',
  },

  save: {
    jpegSinglePageOnly:
      'JPEG supports only 1 page. For multiple pages, save as PDF.',
    noImagesFromScanner: 'No images received from the scanner.',

    jpegSaved: 'JPEG saved in the app and gallery.',
    pdfSavedAndExported: 'PDF saved in the app and exported to Downloads.',
    pdfSavedOnly: 'PDF saved in the app. (Export to Downloads failed.)',
  },
};
