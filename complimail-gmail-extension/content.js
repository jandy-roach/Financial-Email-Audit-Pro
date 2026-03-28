console.log("✅ CompliMail Extension loaded in Gmail");

function sendToExtension(message, cb) {
  const ext = window.chrome?.runtime;
  if (!ext?.sendMessage) {
    console.error("❌ chrome.runtime.sendMessage not available");
    setStatus("❌ Extension runtime not available. Reload extension & Gmail tab.");
    return;
  }
  ext.sendMessage(message, cb);
}

// Quick template map
const TEMPLATE_MAP = {
  leave: {
    situation:
      "I need to request leave due to personal/medical reasons. Please help me write a proper leave request email.",
    style: "Professional",
    tone: "Respectful",
    length: "Medium",
  },
  payment: {
    situation:
      "I am unable to make the payment on time and need an extension. Please draft a professional payment extension request email.",
    style: "Professional",
    tone: "Apologetic",
    length: "Medium",
  },
  complaint: {
    situation:
      "I want to raise a complaint regarding poor service/product issue and request a proper resolution. Please write a firm but respectful complaint email.",
    style: "Firm",
    tone: "Neutral",
    length: "Medium",
  },
  followup: {
    situation:
      "I am following up regarding my previous email/request. Please draft a polite follow-up email asking for an update.",
    style: "Polite",
    tone: "Neutral",
    length: "Short",
  },
  apology: {
    situation:
      "I want to apologize for a mistake/delay and assure that I will resolve it. Please draft a sincere apology email.",
    style: "Professional",
    tone: "Apologetic",
    length: "Short",
  },
};

let panelOpen = false;
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;

function createButton() {
  if (document.getElementById("complimail-btn")) return;

  const btn = document.createElement("button");
  btn.id = "complimail-btn";
  btn.innerText = "✨ CompliMail AI";

  btn.onclick = () => {
    if (!panelOpen) openPanel();
    else closePanel();
  };

  document.body.appendChild(btn);
}

function openPanel() {
  if (document.getElementById("complimail-panel")) return;
  panelOpen = true;

  const panel = document.createElement("div");
  panel.id = "complimail-panel";
  panel.className = "cm-panel";

  panel.innerHTML = `
    <div class="cm-header">
      <h3 class="cm-title">CompliMail AI</h3>
      <button id="complimail-close" class="cm-close" title="Close">✕</button>
    </div>

    <div class="cm-body">

      <div class="cm-section">
        <label class="cm-label">To</label>
        <input id="complimail-to" placeholder="Type recipient name or email..." class="cm-input" />
      </div>

      <div class="cm-section">
        <label class="cm-label">Quick Templates</label>
        <select id="cm-template" class="cm-input">
          <option value="">-- Select Template --</option>
          <option value="leave">Leave request</option>
          <option value="payment">Payment extension</option>
          <option value="complaint">Complaint</option>
          <option value="followup">Follow-up email</option>
          <option value="apology">Apology</option>
        </select>
      </div>

      <div class="cm-section cm-record-row">
        <div class="cm-record-controls">
          <button id="complimail-record" class="cm-btn cm-record">🎙 Start</button>
          <button id="complimail-stop" class="cm-btn cm-stop">⏹ Stop</button>
        </div>
        <div class="cm-record-indicator" aria-hidden="true"><span class="cm-mic-dot"></span><span class="cm-record-text">Not recording</span></div>
      </div>

      <div class="cm-section">
        <label class="cm-label">Situation</label>
        <textarea id="complimail-situation" rows="4" class="cm-textarea" placeholder="Describe your situation..."></textarea>
      </div>

      <div class="cm-grid">
        <div class="cm-col">
          <label class="cm-label">Speech Language</label>
          <select id="complimailLanguage" class="cm-input">
            <option value="auto" selected>Auto Detect</option>
            <option value="en">English</option>
            <option value="ta">தமிழ்</option>
            <option value="ml">മലയാളം</option>
            <option value="hi">हिंदी</option>
          </select>
        </div>

        <div class="cm-col">
          <label class="cm-label">Output Language</label>
          <select id="complimail-output-language" class="cm-input">
            <option value="en" selected>English (en)</option>
            <option value="ta">தமிழ் (ta)</option>
            <option value="hi">हिंदी (hi)</option>
            <option value="ml">മലയാളം</option>
          </select>
        </div>

        <div class="cm-col">
          <label class="cm-label">Writing Style</label>
          <select id="complimail-style" class="cm-input">
            <option value="Auto">Auto</option>
            <option>Professional</option>
            <option>Formal</option>
            <option>Polite</option>
            <option>Friendly</option>
            <option>Firm</option>
            <option>Assertive</option>
            <option>Persuasive</option>
            <option>Simple English</option>
            <option>Angry</option>
          </select>
        </div>

        <div class="cm-col">
          <label class="cm-label">Emotional Tone</label>
          <select id="complimail-tone" class="cm-input">
            <option value="Auto">Auto</option>
            <option>Neutral</option>
            <option>Apologetic</option>
            <option>Confident</option>
            <option>Respectful</option>
            <option>Urgent</option>
            <option>Serious</option>
            <option>Calm</option>
            <option>Angry</option>
          </select>
        </div>

        <div class="cm-col">
          <label class="cm-label">Email Length</label>
          <select id="complimail-length" class="cm-input">
            <option>Short</option>
            <option selected>Medium</option>
            <option>Long</option>
          </select>
        </div>
      </div>

      <div class="cm-actions">
        <button id="complimail-generate" class="cm-primary">Generate & Insert</button>
        <div id="cm-loader" class="cm-loader" aria-hidden="true">⏳ Generating...</div>
      </div>

      <div class="cm-status">
        <p id="complimail-status"></p>
      </div>

    </div>
  `;

  document.body.appendChild(panel);

  document.getElementById("complimail-record").onclick = startRecording;
  document.getElementById("complimail-stop").onclick = stopRecording;

  // Template handler
  const templateEl = document.getElementById("cm-template");
  if (templateEl) {
    templateEl.addEventListener("change", () => {
      const key = templateEl.value;
      if (!key) return;

      const t = TEMPLATE_MAP[key];
      if (!t) return;

      const situationEl = document.getElementById("complimail-situation");
      const styleEl = document.getElementById("complimail-style");
      const toneEl = document.getElementById("complimail-tone");
      const lengthEl = document.getElementById("complimail-length");

      if (situationEl) situationEl.value = t.situation;
      if (styleEl) styleEl.value = t.style;
      if (toneEl) toneEl.value = t.tone;
      if (lengthEl) lengthEl.value = t.length;
    });
  }

  document.getElementById("complimail-close").onclick = closePanel;
  document.getElementById("complimail-generate").onclick = generateAndInsert;
}

function closePanel() {
  panelOpen = false;
  document.getElementById("complimail-panel")?.remove();
}

function setStatus(msg) {
  const status = document.getElementById("complimail-status");
  if (status) status.innerText = msg;
}

function setLoading(isLoading, msg = "Generating...") {
  const genBtn = document.getElementById("cm-generate-btn") || document.getElementById("complimail-generate");
  const stopBtn = document.getElementById("cm-stop-btn") || document.getElementById("complimail-stop");
  const loader = document.getElementById("cm-loader");

  if (loader) {
    loader.textContent = "⏳ " + msg;
    loader.style.display = isLoading ? "block" : "none";
  }

  if (genBtn) {
    genBtn.disabled = isLoading;
    genBtn.style.opacity = isLoading ? "0.6" : "1";
    genBtn.textContent = isLoading ? "Generating..." : "Generate & Insert";
  }

  if (stopBtn) {
    stopBtn.disabled = isLoading; // optional
    stopBtn.style.opacity = isLoading ? "0.6" : "1";
  }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result); // data:audio/webm;base64,...
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function startRecording() {
  if (isRecording) return;

  try {
    recordedChunks = [];

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorder = new MediaRecorder(stream);
    isRecording = true;

    setStatus("🎙 Recording started...");

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) recordedChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      // ensure recording state is cleared
      document.getElementById("complimail-panel")?.classList.remove("recording");
      setStatus("⏳ Transcribing...");
      const recText = document.querySelector(".cm-record-text");
      if (recText) recText.textContent = "Transcribing...";

      const chunkMime = (recordedChunks && recordedChunks[0] && recordedChunks[0].type) || "audio/webm";
      const audioBlob = new Blob(recordedChunks, { type: chunkMime });

      // ✅ Convert blob to base64
      const base64 = await blobToBase64(audioBlob);

      const languageEl = document.getElementById("complimailLanguage");
      const selectedLanguage = languageEl?.value || "auto";

      console.log("[CompliMail] Sending audio (base64) for transcription", { length: (base64 && base64.length) || 0, mime: chunkMime, language: selectedLanguage });

      setLoading(true, "Converting speech to text...");

      sendToExtension(
        {
          type: "TRANSCRIBE_AUDIO",
          payload: {
            base64,
            mimeType: "audio/webm",
            language: selectedLanguage,
          },
        },
        (response) => {
          setLoading(false);

          const recText = document.querySelector(".cm-record-text");

          if (!response || !response.success) {
            if (recText) recText.textContent = "Not recording";
            setStatus("❌ Transcribe failed: " + (response?.error || "No response"));
            return;
          }

          const data = response.data;

          if (!data.success) {
            if (recText) recText.textContent = "Not recording";
            setStatus("❌ Transcribe error: " + (data.error || "Unknown error"));
            return;
          }

          document.getElementById("complimail-situation").value = data.text;
          if (recText) recText.textContent = "Not recording";
          setStatus("✅ Speech converted to text!");
        }
      );
    };

    mediaRecorder.start();
    // add visual recording state
    document.getElementById("complimail-panel")?.classList.add("recording");
    const recText = document.querySelector(".cm-record-text");
    if (recText) recText.textContent = "Recording...";
  } catch (err) {
    console.error(err);
    setStatus("❌ Mic error: " + err.message);
  }
}

function stopRecording() {
  if (!mediaRecorder || !isRecording) {
    setStatus("Not recording.");
    return;
  }

  isRecording = false;
  setStatus("⏹ Stopping recording...");

  mediaRecorder.stop();

  // stop mic stream
  try {
    mediaRecorder.stream.getTracks().forEach((t) => t.stop());
  } catch (e) {
    // ignore
  }
}



async function generateAndInsert() {
  const situation = document.getElementById("complimail-situation").value.trim();
  const style = document.getElementById("complimail-style").value;
  const tone = document.getElementById("complimail-tone").value;
  const length = document.getElementById("complimail-length").value;
  const outputLanguage = document.getElementById("complimail-output-language")?.value || "en";

  if (!situation) {
    setStatus("Please type your situation.");
    return;
  }

  const toValue = document.getElementById("complimail-to").value.trim();
  if (!toValue) {
    setStatus("Please enter recipient in To field.");
    return;
  }

  const recipient = toValue; // use explicit To field value

  // Ensure To is filled in Gmail compose too
  insertToInGmail(toValue);

  setStatus("Generating email...");
  setLoading(true, "Generating email...");

  sendToExtension(
    {
      type: "GENERATE_EMAIL",
      payload: {
        situation,
        recipient,
        style,
        tone,
        instructions: "",
        length,
        outputLanguage,
        mode: "generate",
      },

    }, 
    (response) => {
      setLoading(false);

      if (!response || !response.success) {
        setStatus("❌ Failed: " + (response?.error || "No response"));
        return;
      }

      const data = response.data;

      if (!data.success) {
        setStatus("AI Error: " + (data.error || "Unknown error"));
        return;
      }

      insertIntoGmail(data.email.subject, data.email.body);
      setStatus("✅ Inserted into Gmail!");
    }
  );
}



function insertToInGmail(toText) {
  // find the open compose dialog
  const dialogs = document.querySelectorAll('div[role="dialog"]');
  const dialog = dialogs[dialogs.length - 1];
  if (!dialog) return;

  // Gmail To input (varies by layout)
  const toBox =
    dialog.querySelector('textarea[name="to"]') ||
    dialog.querySelector('input[name="to"]') ||
    dialog.querySelector('textarea[aria-label="To"]') ||
    dialog.querySelector('input[aria-label="To"]');

  if (!toBox) return;

  toBox.focus();
  toBox.value = toText;
  toBox.dispatchEvent(new Event("input", { bubbles: true }));
}

function insertIntoGmail(subject, body) {
  const subjectBox = document.querySelector('input[name="subjectbox"]');
  if (subjectBox) {
    subjectBox.value = subject || "";
    subjectBox.dispatchEvent(new Event("input", { bubbles: true }));
  }

  const bodyBox = document.querySelector('div[aria-label="Message Body"]');
  if (bodyBox) {
    bodyBox.innerHTML = (body || "").replace(/\n/g, "<br/>");
    bodyBox.dispatchEvent(new Event("input", { bubbles: true }));
  }
} 

setInterval(createButton, 2000);

window.__complimailTogglePanel = function () {
  const panel = document.getElementById("complimail-panel");
  if (!panel) {
    openPanel();
    return;
  }

  panel.style.display = panel.style.display === "none" ? "block" : "none";
};

document.addEventListener("keydown", (e) => {
  const isMac = navigator.platform.toUpperCase().includes("MAC");

  const pressed =
    (isMac ? e.metaKey : e.ctrlKey) &&
    e.shiftKey &&
    e.key.toLowerCase() === "m";

  if (pressed) {
    e.preventDefault();
    window.__complimailTogglePanel?.();
  }
});
