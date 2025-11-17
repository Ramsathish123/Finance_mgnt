// toast.jsx

export function showToast({
  title,
  description,
  status = "success",
  duration = 5000,
}) {
  const colors = {
    success: "#2f9e44",
    error: "#e03131",
    warning: "#f08c00",
  };

  const position = "top-right";
  const containerId = `toast-container-${position}`;
  let container = document.getElementById(containerId);

  // Create TOP-RIGHT container
  if (!container) {
    container = document.createElement("div");
    container.id = containerId;

    container.style.position = "fixed";
    container.style.top = "20px";
    container.style.right = "20px"; // FIXED: aligns RIGHT
    container.style.zIndex = "9999";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "flex-end"; // align right
    container.style.gap = "12px";

    document.body.appendChild(container);
  }

  // Toast Box
  const toast = document.createElement("div");
  toast.className = "custom-toast-box";

  toast.style.minWidth = "260px";
  toast.style.maxWidth = "350px";
  toast.style.padding = "14px 16px";
  toast.style.borderRadius = "8px";
  toast.style.background = "#fff";
  toast.style.boxShadow = "0 3px 10px rgba(0,0,0,0.15)";
  toast.style.border = `3px solid ${colors[status]}`;
  toast.style.fontFamily = "Inter, sans-serif";
  toast.style.transition = "all 0.3s ease";

  toast.innerHTML = `
    <div style="font-weight:600; margin-bottom:4px; color:${colors[status]}">
      ${title}
    </div>
    <div style="font-size:13px; color:#333;">
      ${description || ""}
    </div>
  `;

  container.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(20px)";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
