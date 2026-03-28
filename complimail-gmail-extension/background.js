chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      if (message.type === "GENERATE_EMAIL") {
        const res = await fetch("http://localhost:3000/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(message.payload),
        });

        const data = await res.json();
        sendResponse({ success: true, data });
        return;
      }

      if (message.type === "TRANSCRIBE_AUDIO") {
        const { base64, language } = message.payload || {};

        if (!base64) {
          sendResponse({ success: false, error: "No audio base64 provided" });
          return;
        }

        // Force a clean audio/webm container and filename
        const audioBlob = dataUrlToBlob(base64, "audio/webm");
        const audioFile = new File([audioBlob], "recording.webm", { type: "audio/webm" });

        const form = new FormData();
        form.append("file", audioFile);
        form.append("language", language || "auto");

        console.log("[CompliMail] Sending reconstructed file to /api/transcribe", { size: audioFile.size, mime: audioFile.type, language: language || 'auto' });

        const res = await fetch("http://localhost:3000/api/transcribe", {
          method: "POST",
          body: form,
        });

        const data = await res.json();
        sendResponse({ success: true, data });
        return;
      }

      sendResponse({ success: false, error: "Unknown message type" });
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
  })();

  return true;
});

function dataUrlToBlob(dataUrl, mime) {
  const base64 = dataUrl.split(",")[1] || "";
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);

  for (let i = 0; i < bytes.length; i++) {
    arr[i] = bytes.charCodeAt(i);
  }

  return new Blob([arr], { type: mime });
}
