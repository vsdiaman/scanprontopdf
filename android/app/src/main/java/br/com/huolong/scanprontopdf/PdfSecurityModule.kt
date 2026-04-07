package br.com.huolong.scanprontopdf

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.lowagie.text.pdf.PdfReader
import com.lowagie.text.pdf.PdfStamper
import com.lowagie.text.pdf.PdfWriter
import java.io.File
import java.io.FileOutputStream

class PdfSecurityModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

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

      val reader = PdfReader(inputPath)
      val stream = FileOutputStream(outputFile)
      val stamper = PdfStamper(reader, stream)

      val passwordBytes = password.toByteArray(Charsets.UTF_8)

      stamper.setEncryption(
        passwordBytes,
        passwordBytes,
        PdfWriter.ALLOW_PRINTING,
        PdfWriter.ENCRYPTION_AES_128,
      )

      stamper.close()
      reader.close()
      stream.close()

      promise.resolve(outputFile.absolutePath)
    } catch (error: Exception) {
      promise.reject("PDF_PROTECT_FAILED", error)
    }
  }
}
