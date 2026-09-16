package com.upirakshak.ui.screens

import android.Manifest
import android.content.pm.PackageManager
import android.net.Uri
import android.util.Log
import android.util.Size
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.FlashOff
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.google.mlkit.vision.barcode.BarcodeScanner
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import com.upirakshak.engine.RulesEngine
import com.upirakshak.engine.ThreatAnalysis
import com.upirakshak.engine.ThreatLevel
import com.upirakshak.ui.components.ThreatCard
import com.upirakshak.ui.theme.*
import com.upirakshak.voice.VoiceOutput
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QrScannerScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED
        )
    }
    var flashEnabled by remember { mutableStateOf(false) }
    var scanResult by remember { mutableStateOf<ThreatAnalysis?>(null) }
    var isProcessing by remember { mutableStateOf(false) }

    val permissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        hasCameraPermission = granted
    }

    LaunchedEffect(Unit) {
        if (!hasCameraPermission) {
            permissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Scan UPI QR Code", color = TextPrimary) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, "Back", tint = TextPrimary)
                    }
                },
                actions = {
                    IconButton(onClick = { flashEnabled = !flashEnabled }) {
                        Icon(
                            if (flashEnabled) Icons.Default.FlashOn else Icons.Default.FlashOff,
                            "Flash",
                            tint = TextPrimary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = NavyDark
                )
            )
        },
        containerColor = NavyDark
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            if (!hasCameraPermission) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            "Camera permission required",
                            color = TextPrimary,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(Modifier.height(16.dp))
                        Button(
                            onClick = { permissionLauncher.launch(Manifest.permission.CAMERA) },
                            colors = ButtonDefaults.buttonColors(containerColor = Emerald)
                        ) {
                            Text("Grant Permission", color = NavyDark)
                        }
                    }
                }
            } else {
                // Camera preview
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(400.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(Slate)
                ) {
                    CameraPreview(
                        onBarcodeScanned = { rawValue ->
                            if (!isProcessing) {
                                isProcessing = true
                                val analysis = analyzeQrContent(rawValue)
                                scanResult = analysis
                                VoiceOutput.speak(analysis.suggestedAction)
                                isProcessing = false
                            }
                        },
                        flashEnabled = flashEnabled
                    )

                    // Scanning overlay
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Box(
                            modifier = Modifier
                                .size(250.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .background(
                                    if (scanResult != null) {
                                        when (scanResult!!.level) {
                                            ThreatLevel.HIGH -> Danger.copy(alpha = 0.3f)
                                            ThreatLevel.MEDIUM -> Warning.copy(alpha = 0.3f)
                                            ThreatLevel.SAFE -> Emerald.copy(alpha = 0.3f)
                                        }
                                    } else {
                                        Emerald.copy(alpha = 0.1f)
                                    }
                                )
                        )
                    }

                    // Status text
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        contentAlignment = Alignment.BottomCenter
                    ) {
                        Text(
                            when {
                                scanResult != null -> when (scanResult!!.level) {
                                    ThreatLevel.HIGH -> "⚠️ FRAUD DETECTED"
                                    ThreatLevel.MEDIUM -> "⚠️ SUSPICIOUS"
                                    ThreatLevel.SAFE -> "✓ SAFE"
                                }
                                isProcessing -> "Analyzing..."
                                else -> "Point camera at UPI QR code"
                            },
                            color = when {
                                scanResult != null -> when (scanResult!!.level) {
                                    ThreatLevel.HIGH -> Danger
                                    ThreatLevel.MEDIUM -> Warning
                                    ThreatLevel.SAFE -> Emerald
                                }
                                else -> TextPrimary
                            },
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                // Results section
                scanResult?.let { analysis ->
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f)
                            .padding(16.dp)
                    ) {
                        ThreatCard(analysis = analysis)
                        Spacer(Modifier.height(16.dp))
                        Button(
                            onClick = { scanResult = null },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = Emerald)
                        ) {
                            Text("Scan Another QR", color = NavyDark)
                        }
                    }
                }
            }
        }
    }
}

@androidx.compose.runtime.Composable
fun CameraPreview(
    onBarcodeScanned: (String) -> Unit,
    flashEnabled: Boolean
) {
    val context = LocalContext.current
    val lifecycleOwner = androidx.lifecycle.compose.LocalLifecycleOwner.current
    val cameraExecutor = remember { Executors.newSingleThreadExecutor() }
    var camera by remember { mutableStateOf<Camera?>(null) }

    DisposableEffect(Unit) {
        onDispose {
            cameraExecutor.shutdown()
        }
    }

    AndroidView(
        factory = { ctx ->
            PreviewView(ctx).apply {
                scaleType = PreviewView.ScaleType.FILL_CENTER
                implementationMode = PreviewView.ImplementationMode.COMPATIBLE
            }
        },
        modifier = Modifier.fillMaxSize(),
        update = { previewView ->
            val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
            cameraProviderFuture.addListener({
                val cameraProvider = cameraProviderFuture.get()

                val preview = Preview.Builder().build().also {
                    it.setSurfaceProvider(previewView.surfaceProvider)
                }

                val imageAnalyzer = ImageAnalysis.Builder()
                    .setTargetResolution(Size(1280, 720))
                    .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                    .build()

                val options = BarcodeScannerOptions.Builder()
                    .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
                    .build()
                val scanner = BarcodeScanning.getClient(options)

                imageAnalyzer.setAnalyzer(cameraExecutor) { imageProxy ->
                    processImage(imageProxy, scanner, onBarcodeScanned)
                }

                try {
                    cameraProvider.unbindAll()
                    camera = cameraProvider.bindToLifecycle(
                        lifecycleOwner,
                        CameraSelector.DEFAULT_BACK_CAMERA,
                        preview,
                        imageAnalyzer
                    )
                    camera?.cameraControl?.enableTorch(flashEnabled)
                } catch (e: Exception) {
                    Log.e("QrScanner", "Failed to bind camera", e)
                }
            }, ContextCompat.getMainExecutor(context))
        }
    )

    LaunchedEffect(flashEnabled) {
        camera?.cameraControl?.enableTorch(flashEnabled)
    }
}

private fun processImage(
    imageProxy: ImageProxy,
    scanner: BarcodeScanner,
    onBarcodeScanned: (String) -> Unit
) {
    val mediaImage = imageProxy.image
    if (mediaImage != null) {
        val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)
        scanner.process(image)
            .addOnSuccessListener { barcodes ->
                for (barcode in barcodes) {
                    barcode.rawValue?.let { value ->
                        onBarcodeScanned(value)
                    }
                }
            }
            .addOnFailureListener { e ->
                Log.e("QrScanner", "Barcode scanning failed", e)
            }
            .addOnCompleteListener {
                imageProxy.close()
            }
    } else {
        imageProxy.close()
    }
}

private fun analyzeQrContent(content: String): ThreatAnalysis {
    // Parse UPI deep link
    if (content.startsWith("upi://pay")) {
        val uri = Uri.parse(content)
        val payeeAddress = uri.getQueryParameter("pa") ?: ""
        val payeeName = uri.getQueryParameter("pn") ?: ""
        val amount = uri.getQueryParameter("am") ?: ""
        val note = uri.getQueryParameter("tn") ?: ""

        val analysisText = buildString {
            append("UPI payment request to ")
            if (payeeName.isNotEmpty()) append("$payeeName ")
            append("($payeeAddress)")
            if (amount.isNotEmpty()) append(" for ₹$amount")
            if (note.isNotEmpty()) append(". Note: $note")
        }

        return RulesEngine.analyze("UPI QR Code", analysisText)
    }

    // Plain URL or other content
    return RulesEngine.analyze("QR Code Content", content)
}
