// toast.jsx

export function showToast({
  title,
  description,
  status = "success",
  duration = 5000
}) {
  const colors = {
    success: "#2f9e44",
    error: "#e03131",
    warning: "#f08c00"
  };

  const position = "top-center";
  const containerId = `toast-container-${position}`;
  let container = document.getElementById(containerId);

  // Create centered container if missing
  if (!container) {
    container = document.createElement("div");
    container.id = containerId;

    container.style.position = "fixed";
    container.style.top = "20px";

    // horizontal center
    container.style.left = "50%";
    container.style.transform = "translateX(-50%)";

    container.style.zIndex = "9999";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";
    container.style.gap = "12px";

    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.style.minWidth = "260px";
  toast.style.maxWidth = "350px";
  toast.style.padding = "14px 16px";
  toast.style.borderRadius = "6px";
  toast.style.background = "#fff";
  toast.style.boxShadow = "0 2px 6px rgba(0,0,0,0.15)";
  toast.style.border = `3px solid ${colors[status]}`;
  toast.style.fontFamily = "Arial, sans-serif";

  toast.innerHTML = `
    <div style="font-weight:bold; margin-bottom:4px; color:${colors[status]}">
      ${title}
    </div>
    <div style="font-size:14px; color:#333">
      ${description}
    </div>
  `;

  container.appendChild(toast);

  // Auto-remove
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
