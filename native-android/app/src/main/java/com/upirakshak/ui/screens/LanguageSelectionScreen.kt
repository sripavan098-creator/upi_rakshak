package com.upirakshak.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Language
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.res.stringResource
import com.upirakshak.R
import com.upirakshak.ui.language.AppLanguage
import com.upirakshak.ui.language.LanguageManager
import com.upirakshak.ui.language.supportedLanguages
import com.upirakshak.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LanguageSelectionScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    var currentLang by remember {
        mutableStateOf(LanguageManager.getCurrentLanguage(context))
    }
    var showConfirmation by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.language), color = TextPrimary) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, "Back", tint = TextPrimary)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = NavyDark)
            )
        },
        containerColor = NavyDark
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // System Default option
            item {
                LanguageRow(
                    language = AppLanguage("system", "System Default", "सिस्टम डिफ़ॉल्ट"),
                    isSelected = currentLang == "system" || currentLang == "",
                    onClick = {
                        LanguageManager.resetToSystem(context)
                        currentLang = "system"
                        showConfirmation = true
                    }
                )
            }

            item {
                Text(
                    text = "Indian Languages",
                    color = TextSecondary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(vertical = 8.dp)
                )
            }

            items(supportedLanguages) { language ->
                LanguageRow(
                    language = language,
                    isSelected = currentLang == language.code,
                    onClick = {
                        LanguageManager.setLanguage(context, language.code)
                        currentLang = language.code
                        showConfirmation = true
                    }
                )
            }

            item {
                Spacer(Modifier.height(16.dp))
            }
        }
    }

    // Confirmation snackbar
    if (showConfirmation) {
        LaunchedEffect(Unit) {
            kotlinx.coroutines.delay(2000)
            showConfirmation = false
        }
    }
}

@Composable
fun LanguageRow(
    language: AppLanguage,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) Emerald.copy(alpha = 0.15f) else Slate
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                Icons.Default.Language,
                contentDescription = null,
                tint = if (isSelected) Emerald else TextSecondary,
                modifier = Modifier.size(24.dp)
            )
            Spacer(Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = language.nativeLabel,
                    color = TextPrimary,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium
                )
                if (language.label != language.nativeLabel) {
                    Text(
                        text = language.label,
                        color = TextSecondary,
                        fontSize = 12.sp
                    )
                }
            }
            if (isSelected) {
                Icon(
                    Icons.Default.Check,
                    contentDescription = "Selected",
                    tint = Emerald,
                    modifier = Modifier.size(24.dp)
                )
            }
        }
    }
}
