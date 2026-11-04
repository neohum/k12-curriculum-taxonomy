import fs from "node:fs";

const targetFiles = ["public/taxonomy-dashboard.html", "public/index.html"];

for (const filePath of targetFiles) {
  let content = fs.readFileSync(filePath, "utf8");

  // 1. Update dynamic background grid
  const oldGrid = `      // Background Grid Dots
      ctx.fillStyle = isDark ? "#1e2436" : "#cbd5e1";
      const gridSize = 40;
      for (let x = -400; x < 1800; x += gridSize) {
        for (let y = -400; y < 1400; y += gridSize) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }`;

  const newGrid = `      // Dynamic Viewport Background Grid Dots
      ctx.fillStyle = isDark ? "#1e2436" : "#cbd5e1";
      const gridSize = 50;
      const startX = Math.floor((-state.pan.x / state.zoom) / gridSize) * gridSize - gridSize;
      const endX = startX + Math.ceil(((canvas.width / dpr) / state.zoom) / gridSize) * gridSize + (gridSize * 2);
      const startY = Math.floor((-state.pan.y / state.zoom) / gridSize) * gridSize - gridSize;
      const endY = startY + Math.ceil(((canvas.height / dpr) / state.zoom) / gridSize) * gridSize + (gridSize * 2);

      for (let x = startX; x <= endX; x += gridSize) {
        for (let y = startY; y <= endY; y += gridSize) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }`;

  if (content.includes(oldGrid)) {
    content = content.replace(oldGrid, newGrid);
    console.log(`Updated viewport grid in ${filePath}`);
  }

  // 2. Update arrow head calculation with true angle to target
  const oldArrow = `          // Arrow Head
          const arrowLen = 10;
          ctx.beginPath();
          ctx.moveTo(node.x - 24, node.y);
          ctx.lineTo(node.x - 32, node.y - 5);
          ctx.lineTo(node.x - 32, node.y + 5);
          ctx.fillStyle = isEdgeActive ? (isDark ? "#818cf8" : "#4f46e5") : (isDeficit ? "#e11d48" : (isDark ? "#475569" : "#94a3b8"));
          ctx.fill();`;

  const newArrow = `          // Arrow Head oriented towards target boundary
          const angle = Math.atan2(node.y - p.y, node.x - p.x);
          const targetR = 24;
          const arrowTipX = node.x - Math.cos(angle) * targetR;
          const arrowTipY = node.y - Math.sin(angle) * targetR;
          const arrowLen = 9;
          const arrowAngle = Math.PI / 7;

          ctx.beginPath();
          ctx.moveTo(arrowTipX, arrowTipY);
          ctx.lineTo(
            arrowTipX - arrowLen * Math.cos(angle - arrowAngle),
            arrowTipY - arrowLen * Math.sin(angle - arrowAngle)
          );
          ctx.lineTo(
            arrowTipX - arrowLen * Math.cos(angle + arrowAngle),
            arrowTipY - arrowLen * Math.sin(angle + arrowAngle)
          );
          ctx.closePath();
          ctx.fillStyle = isEdgeActive ? (isDark ? "#818cf8" : "#4f46e5") : (isDeficit ? "#e11d48" : (isDark ? "#475569" : "#94a3b8"));
          ctx.fill();`;

  if (content.includes(oldArrow)) {
    content = content.replace(oldArrow, newArrow);
    console.log(`Updated oriented arrows in ${filePath}`);
  }

  // 3. Truncate name label under node to prevent horizontal text collision
  const oldText = `        // Name underneath
        ctx.fillStyle = isDark ? "#f1f5f9" : "#1e293b";
        ctx.font = isSelected ? "bold 12px Pretendard, sans-serif" : "600 11px Pretendard, sans-serif";
        ctx.fillText(node.name, node.x, node.y + radius + 15);`;

  const newText = `        // Compact Name underneath (prevents text overlap)
        ctx.fillStyle = isDark ? "#f1f5f9" : "#1e293b";
        ctx.font = isSelected ? "bold 12px Pretendard, sans-serif" : "600 11px Pretendard, sans-serif";
        const cleanName = (node.name || "").replace(/^[^\:]+\:\s*/, "");
        const displayName = isSelected 
          ? (cleanName.length > 22 ? cleanName.slice(0, 20) + "..." : cleanName)
          : (cleanName.length > 15 ? cleanName.slice(0, 13) + "..." : cleanName);
        ctx.fillText(displayName, node.x, node.y + radius + 14);`;

  if (content.includes(oldText)) {
    content = content.replace(oldText, newText);
    console.log(`Updated compact text labels in ${filePath}`);
  }

  // 4. Update fitGraphToNodes zoom clamping (allow zoom out down to 0.08)
  const oldZoomClamp = `const fitZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.5), 1.15);`;
  const newZoomClamp = `const fitZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.08), 1.15);`;
  if (content.includes(oldZoomClamp)) {
    content = content.replace(oldZoomClamp, newZoomClamp);
    console.log(`Updated fitZoom clamp in ${filePath}`);
  }

  // 5. Update selectTopicNode auto zoom-in when centered
  const oldSelectCenter = `      if (centerInView && canvas) {
        const wrapper = document.getElementById("canvasWrapper");
        const w = (wrapper && wrapper.clientWidth > 0) ? wrapper.clientWidth : (canvas.width / (window.devicePixelRatio || 1));
        const h = (wrapper && wrapper.clientHeight > 0) ? wrapper.clientHeight : (canvas.height / (window.devicePixelRatio || 1));
        state.pan.x = (w / 2) - (node.x * state.zoom);
        state.pan.y = (h / 2) - (node.y * state.zoom);
      }`;

  const newSelectCenter = `      if (centerInView && canvas) {
        const wrapper = document.getElementById("canvasWrapper");
        const w = (wrapper && wrapper.clientWidth > 0) ? wrapper.clientWidth : (canvas.width / (window.devicePixelRatio || 1));
        const h = (wrapper && wrapper.clientHeight > 0) ? wrapper.clientHeight : (canvas.height / (window.devicePixelRatio || 1));
        if (state.zoom < 0.6) state.zoom = 0.85;
        state.pan.x = (w / 2) - (node.x * state.zoom);
        state.pan.y = (h / 2) - (node.y * state.zoom);
      }`;

  if (content.includes(oldSelectCenter)) {
    content = content.replace(oldSelectCenter, newSelectCenter);
    console.log(`Updated selectTopicNode auto zoom in ${filePath}`);
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Successfully updated ${filePath}`);
}
