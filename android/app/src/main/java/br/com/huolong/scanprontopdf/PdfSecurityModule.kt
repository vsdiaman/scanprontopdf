package br.com.huolong.scanprontopdf

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.tom_roush.pdfbox.android.PDFBoxResourceLoader
import com.tom_roush.pdfbox.pdmodel.PDDocument
import com.tom_roush.pdfbox.pdmodel.encryption.AccessPermission
import com.tom_roush.pdfbox.pdmodel.encryption.StandardProtectionPolicy
import java.io.File

class PdfSecurityModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  init {
    PDFBoxResourceLoader.init(reactApplicationContext)
  }

  override fun getName(): String = "PdfSecurityModule"

  @ReactMethod
  fun protectPdf(inputPath: String, outputPath: String, password: String, promise: Promise) {
    try {
      val trimmedPassword = password.trim()
      if (trimmedPassword.isEmpty()) {
        promise.reject("INVALID_PASSWORD", "Password cannot be empty")
        return
      }

      val sourceFile = File(inputPath)
      if (!sourceFile.exists()) {
        promise.reject("FILE_NOT_FOUND", "Input PDF does not exist")
        return
      }

      val outputFile = File(outputPath)
      if (sourceFile.absolutePath == outputFile.absolutePath) {
        promise.reject("INVALID_OUTPUT_PATH", "Output path must be different from input path")
        return
      }

      outputFile.parentFile?.mkdirs()

      // Save into a temp file first so the final output is only replaced after successful encryption.
      val tempOutputFile = File(outputFile.parentFile ?: sourceFile.parentFile, "${outputFile.name}.tmp")
      if (tempOutputFile.exists()) {
        tempOutputFile.delete()
      }

      PDDocument.load(sourceFile).use { document ->
        val accessPermission = AccessPermission().apply {
          setCanPrint(true)
        }

        val protectionPolicy = StandardProtectionPolicy(
          trimmedPassword,
          trimmedPassword,
          accessPermission,
        ).apply {
          setEncryptionKeyLength(128)
          setPermissions(accessPermission)
        }

        document.protect(protectionPolicy)
        document.save(tempOutputFile)
      }

      if (outputFile.exists() && !outputFile.delete()) {
        promise.reject("OUTPUT_DELETE_FAILED", "Unable to replace existing output file")
        return
      }

      if (!tempOutputFile.renameTo(outputFile)) {
        promise.reject("OUTPUT_RENAME_FAILED", "Unable to move protected PDF to destination")
        return
      }

      promise.resolve(outputFile.absolutePath)
    } catch (error: Exception) {
      promise.reject("PDF_PROTECT_FAILED", error)
    }
  }
}
