import { NativeModules, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { t } from '../../i18n';

type PdfSecurityNativeModule = {
  protectPdf: (
    inputPath: string,
    outputPath: string,
    password: string,
  ) => Promise<string>;
};

const MIN_PASSWORD_LENGTH = 6;

function stripFileScheme(path: string) {
  return path.startsWith('file://') ? path.replace('file://', '') : path;
}

function getNativeModule() {
  return NativeModules.PdfSecurityModule as PdfSecurityNativeModule | undefined;
}

export function validatePdfPassword(password: string, confirmPassword: string) {
  const cleanPassword = password.trim();
  const cleanConfirmPassword = confirmPassword.trim();

  if (!cleanPassword) {
    return t('pdfProtection.passwordRequired');
  }

  if (cleanPassword.length < MIN_PASSWORD_LENGTH) {
    return t('pdfProtection.passwordMinLength', {
      min: MIN_PASSWORD_LENGTH,
    });
  }

  if (!cleanConfirmPassword) {
    return t('pdfProtection.confirmRequired');
  }

  if (cleanPassword !== cleanConfirmPassword) {
    return t('pdfProtection.passwordMismatch');
  }

  return null;
}

export async function protectPdfWithPassword(params: {
  inputPath: string;
  outputPath: string;
  password: string;
}) {
  const { inputPath, outputPath, password } = params;

  const sourcePath = stripFileScheme(inputPath);
  const destinationPath = stripFileScheme(outputPath);
  const trimmedPassword = password.trim();

  if (!trimmedPassword) {
    throw new Error(t('pdfProtection.passwordRequired'));
  }

  if (trimmedPassword.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      t('pdfProtection.passwordMinLength', { min: MIN_PASSWORD_LENGTH }),
    );
  }

  const sourceExists = await RNFS.exists(sourcePath);
  if (!sourceExists) {
    throw new Error(t('export.fileMissing'));
  }

  const nativeModule = getNativeModule();
  if (!nativeModule?.protectPdf || Platform.OS !== 'android') {
    throw new Error(t('pdfProtection.notSupportedOnDevice'));
  }

  const targetExists = await RNFS.exists(destinationPath);
  if (targetExists) {
    await RNFS.unlink(destinationPath);
  }

  const resultPath = await nativeModule.protectPdf(
    sourcePath,
    destinationPath,
    trimmedPassword,
  );

  const outputExists = await RNFS.exists(stripFileScheme(resultPath));
  if (!outputExists) {
    throw new Error(t('pdfProtection.failedToCreate'));
  }

  return stripFileScheme(resultPath);
}

export const PDF_PASSWORD_MIN_LENGTH = MIN_PASSWORD_LENGTH;
