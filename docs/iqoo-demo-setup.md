# iQOO Demo Setup (Do This Before You Present)

## 1. Install the APK

Connect iQOO via USB → run `adb install -r app-debug.apk`
Or: copy APK to phone → open Files → tap APK → Allow install

## 2. Grant Notification Access (CRITICAL)

```
Settings → Apps → Special access → Notification access → UPI Rakshak → Allow
```

## 3. Grant Overlay Permission (CRITICAL)

```
Settings → Apps → Special access → Display over other apps → UPI Rakshak → Allow
```

## 4. Bypass Funtouch Battery Killer (CRITICAL)

```
Settings → Battery → Background power consumption management → UPI Rakshak → Allow
Settings → Apps → UPI Rakshak → Battery → Unrestricted
Settings → Apps → UPI Rakshak → Autostart → Enable
```

## 5. Lock in Recents

Open UPI Rakshak → Recents → swipe down on the app card → tap lock icon

## 6. Test the Flow

1. Open UPI Rakshak — you should see green "Rakshak is protecting you"
2. Open WhatsApp
3. From another phone, send this message to yourself:
   ```
   URGENT: Your electricity will be disconnected tonight! Pay via QR to bselscare@icici
   ```
4. Red overlay should appear over WhatsApp within 2 seconds
5. Tap the overlay → app opens with full explanation

## 7. If Overlay Doesn't Appear

- Check notification access is enabled
- Check overlay permission is enabled
- Check battery is unrestricted
- Reboot the phone (Funtouch caches permissions)

## 8. Demo Day Checklist

- [ ] Phone charged to 100%
- [ ] WhatsApp open in background
- [ ] Second phone ready with scam message
- [ ] Screen recording started (backup)
- [ ] Airplane mode OFF (for WhatsApp to receive)
- [ ] Test message sent and overlay confirmed working
- [ ] Backup web demo ready on laptop
