import { renderHeader } from "./header.js";
import { renderFooter } from "./footer.js";

export function initLayout() {
  const headerTarget = document.getElementById("header");
  const footerTarget = document.getElementById("footer");

  renderHeader(headerTarget);
  renderFooter(footerTarget);
}
