// Configuration - REPLACE WITH YOUR OWN URLs
const API_BASE_URL = "YOUR_API_URL_HERE"; // Example: https://your-app.vercel.app/api
const SITE_URL = "YOUR_SITE_URL_HERE"; // Example: https://your-app.vercel.app
const STORAGE_KEY = "quote_draft";

// DOM Elements
const quoteForm = document.getElementById("quoteForm");
const contentInput = document.getElementById("content");
const authorInput = document.getElementById("author");
const categoryInput = document.getElementById("category");
const submitBtn = document.getElementById("submitBtn");
const clearBtn = document.getElementById("clearBtn");
const goToSiteBtn = document.getElementById("goToSiteBtn");
const statusMessage = document.getElementById("statusMessage");
const btnText = submitBtn.querySelector(".btn-text");
const btnLoader = submitBtn.querySelector(".btn-loader");

// Load saved draft on popup open
loadDraft();

// Event Listeners
quoteForm.addEventListener("submit", handleSubmit);
clearBtn.addEventListener("click", clearForm);
goToSiteBtn.addEventListener("click", openSite);

// Auto-save draft as user types
contentInput.addEventListener("input", saveDraft);
authorInput.addEventListener("input", saveDraft);
categoryInput.addEventListener("input", saveDraft);

// Functions
async function handleSubmit(e) {
  e.preventDefault();

  const content = contentInput.value.trim();
  const author = authorInput.value.trim() || "Anonymous";
  const category = categoryInput.value.trim() || "General";

  if (!content) {
    showMessage("Lütfen bir söz girin!", "error");
    return;
  }

  // Show loading state
  setLoading(true);

  try {
    const response = await fetch(`${API_BASE_URL}/quotes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        author,
        category,
      }),
    });

    if (!response.ok) {
      throw new Error("Söz eklenirken bir hata oluştu");
    }

    const data = await response.json();

    // Success - Clear both form and saved draft
    showMessage("✅ Söz başarıyla eklendi!", "success");
    clearForm();

    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      hideMessage();
    }, 3000);
  } catch (error) {
    console.error("Error:", error);
    showMessage("❌ " + error.message, "error");
  } finally {
    setLoading(false);
  }
}

function saveDraft() {
  const draft = {
    content: contentInput.value,
    author: authorInput.value,
    category: categoryInput.value,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

function loadDraft() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const draft = JSON.parse(saved);
      contentInput.value = draft.content || "";
      authorInput.value = draft.author || "";
      categoryInput.value = draft.category || "";
    } catch (e) {
      console.error("Failed to load draft:", e);
    }
  }
}

function clearForm() {
  contentInput.value = "";
  authorInput.value = "";
  categoryInput.value = "";
  localStorage.removeItem(STORAGE_KEY); // Clear saved draft too
  contentInput.focus();
  hideMessage();
}

function openSite() {
  chrome.tabs.create({ url: SITE_URL });
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  btnText.classList.toggle("hidden", isLoading);
  btnLoader.classList.toggle("hidden", !isLoading);
}

function showMessage(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
}

function hideMessage() {
  statusMessage.classList.add("hidden");
}

// Focus on content input when popup opens
contentInput.focus();
