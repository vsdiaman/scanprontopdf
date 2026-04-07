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
      if (password.isBlank()) {
        promise.reject("INVALID_PASSWORD", "Password cannot be empty")
        return
      }

      val sourceFile = File(inputPath)
      if (!sourceFile.exists()) {
        promise.reject("FILE_NOT_FOUND", "Input PDF does not exist")
        return
      }

      val outputFile = File(outputPath)
      outputFile.parentFile?.mkdirs()
      if (outputFile.exists()) {
        outputFile.delete()
      }

      PDDocument.load(sourceFile).use { document ->
        val accessPermission = AccessPermission().apply {
          setCanPrint(true)
        }

        val protectionPolicy = StandardProtectionPolicy(
          password,
          password,
          accessPermission,
        ).apply {
          setEncryptionKeyLength(128)
          setPermissions(accessPermission)
        }

        document.protect(protectionPolicy)
        document.save(outputFile)
      }

      promise.resolve(outputFile.absolutePath)
    } catch (error: Exception) {
      promise.reject("PDF_PROTECT_FAILED", error)
    }
  }
}
