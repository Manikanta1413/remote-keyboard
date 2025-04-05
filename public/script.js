const user = new URLSearchParams(window.location.search).get("user") || 1;

async function fetchKeys() {
  try {
    let response = await fetch("/keys");
    let data = await response.json();
    if (!Array.isArray(data)) {
      console.error("Invalid API response:", data);
      return;
    }
    console.log("Received keys are : ", data);
    renderKeyboard(data);
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

function renderKeyboard(keys) {
  const keyboard = document.getElementById("keyboard");
  keyboard.innerHTML = "";
  keys.forEach((k) => {
    const keyDiv = document.createElement("div");
    keyDiv.classList.add("key");
    keyDiv.textContent = k.key_number;
    if (k.status === "red") keyDiv.classList.add("red");
    if (k.status === "yellow") keyDiv.classList.add("yellow");
    keyDiv.onclick = () => toggleKey(k.key_number);
    keyboard.appendChild(keyDiv);
  });
}

async function takeControl() {
  await fetch("/control", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user }),
  });
}

async function toggleKey(keyNumber) {
  const keyDiv = [...document.getElementsByClassName("key")].find(
    (div) => div.textContent === keyNumber.toString()
  );

  // Toggle class locally for immediate visual feedback
  if (keyDiv.classList.contains("yellow")) {
    keyDiv.classList.remove("yellow");
    keyDiv.classList.add("red");
  } else if (keyDiv.classList.contains("red")) {
    keyDiv.classList.remove("red");
  } else {
    keyDiv.classList.add("yellow");
  }

  // Send update to server
  await fetch("/toggle-key", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key_number: keyNumber, user }),
  });
}

function toggleKeyColor(keyElement) {
  if (keyElement.classList.contains("yellow")) {
    keyElement.classList.remove("yellow");
    keyElement.classList.add("red");
  } else if (keyElement.classList.contains("red")) {
    keyElement.classList.remove("red");
  } else {
    keyElement.classList.add("yellow");
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const keysContainer = document.getElementById("keys-container");
  keysContainer.addEventListener("click", (event) => {
    const keyElement = event.target;

    if (keyElement.classList.contains("key")) {
      toggleKeyColor(keyElement);
    }
  });
});
document.getElementById("takeControl").onclick = takeControl;

// Polling for updates every 2 seconds
setInterval(fetchKeys, 20000);

fetchKeys();
