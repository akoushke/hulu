import "../Image";
import * as styles from "./styles.css";
import styleSheet from "!css-loader?exportType=css-style-sheet!./styles.css";

/**
 * Custom Web Component representing a Hulu Tile.
 *
 * Features:
 * - Supports attributes for layout, selection state, image, metadata, and more.
 * - Uses Shadow DOM for encapsulation and styling.
 * - Implements smooth scrolling when selected.
 */
class HuluTile extends HTMLElement {
  private shadow: ShadowRoot;

  /**
   * Initializes the component, attaches Shadow DOM, and adopts styles.
   */
  constructor() {
    super();
    this.shadow = this.attachShadow({mode: "open"});
    this.shadowRoot.adoptedStyleSheets = [styleSheet];
  }

  /**
   * Lifecycle method triggered when the component is added to the DOM.
   * - Calls `render` to initialize the component structure.
   *
   * @returns {void}
   */
  connectedCallback(): void {
    this.render();
  }

  /**
   * Specifies the attributes to observe for changes.
   *
   * @returns {string[]} List of attributes observed for changes.
   */
  static get observedAttributes() {
    return ["layout", "is-selected", "image", "date", "genre", "type"];
  }

  /**
   * Lifecycle method triggered when observed attributes change.
   * - Updates selection state dynamically.
   * - Modifies the layout style when `layout` changes.
   *
   * @param {string} name - The name of the changed attribute.
   * @param {string} oldValue - The previous value of the attribute.
   * @param {string} newValue - The new value of the attribute.
   * @returns {void}
   */
  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {
    if (oldValue === newValue) return;

    if (name === "is-selected") {
      this.updateSelection(newValue === "true");
    }
  }

  /**
   * Adjusts scrolling to bring the selected tile into view.
   * - Horizontally centers the tile within its parent container.
   * - Smoothly scrolls the page vertically if necessary.
   *
   * @private
   * @returns {void}
   */
  private adjustScroll(): void {
    const elementRect = this.getBoundingClientRect();
    const parentElement = this.parentElement;
    if (!parentElement) return;

    const targetScrollY =
      window.scrollY + elementRect.top - window.innerHeight / 2;
    const targetScrollX =
      parentElement.scrollLeft +
      elementRect.left -
      parentElement.clientWidth / 2;

    parentElement.scrollTo({left: targetScrollX, behavior: "smooth"});

    this.smoothScrollToY(targetScrollY);
  }

  /**
   * Smoothly scrolls the page vertically to the target Y position.
   *
   *
   * ---------Assist from ChatGPT-------------
   *
   * @private
   * @param {number} targetY - The Y-coordinate to scroll to.
   * @param {number} [duration=400] - The duration of the animation in milliseconds.
   * @returns {void}
   */
  private smoothScrollToY(targetY: number, duration = 400): void {
    const startY = window.scrollY;
    const distanceY = targetY - startY;
    const startTime = performance.now();

    function step(currentTime: number) {
      const elapsed = currentTime - startTime;
      const percentage = Math.min(elapsed / duration, 1);

      // Easing function (easeInOutQuad)
      const ease =
        percentage < 0.5
          ? 2 * percentage * percentage
          : 1 - Math.pow(-2 * percentage + 2, 2) / 2;

      window.scrollTo(0, startY + distanceY * ease);

      if (elapsed < duration) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  /**
   * Updates the selection state of the tile.
   * - Applies the "selected" class to relevant elements.
   * - Calls `adjustScroll()` when selected.
   *
   * @private
   * @param {boolean} isSelected - Whether the tile is selected.
   * @returns {void}
   */
  private updateSelection(isSelected: boolean): void {
    const tileElement = this.shadow.querySelector(".tile");
    const imgElement = this.shadow.querySelector(
      "hulu-image"
    ) as HTMLImageElement;
    const titleElement = this.shadow.getElementById("title") as HTMLElement;
    const subtitleElement = this.shadow.getElementById(
      "subtitle"
    ) as HTMLElement;

    if (!imgElement || !titleElement || !subtitleElement) return;

    if (isSelected) {
      imgElement.setAttribute("is-selected", "true");
      titleElement.classList.add("selected");
      subtitleElement.classList.add("selected");
      tileElement.classList.add("selected");
      this.adjustScroll();
    } else {
      imgElement.setAttribute("is-selected", "false");
      titleElement.classList.remove("selected");
      subtitleElement.classList.remove("selected");
      tileElement.classList.remove("selected");
    }
  }

  /**
   * Renders the component's HTML structure.
   * - Retrieves attributes like title, image, selection state, and metadata.
   * - Applies conditional styles and elements based on attributes.
   * - Enhances accessibility with ARIA attributes and keyboard focus support.
   *
   * @private
   * @returns {void}
   */
  private render(): void {
    const title = this.getAttribute("title") || "Hulu Tile";
    const image = this.getAttribute("image");
    const isSelected = this.getAttribute("is-selected") === "true";
    const year = this.getAttribute("date")
      ? new Date(this.getAttribute("date")).getFullYear()
      : "";
    const genre = this.getAttribute("genre") || "";
    const logo = this.getAttribute("logo");
    const layout = this.getAttribute("layout");

    this.shadow.innerHTML = `
      <div class="${styles.tile} ${layout === "horizontal" ? "" : "vertical"} ${
      isSelected ? styles.selected : ""
    }"
        aria-label="${title}"
        aria-selected="${isSelected}">
        <hulu-image src=${image} is-selected=${isSelected} logo=${logo}></hulu-image>
        <div class="meta">
          <div id="title" 
            class="${styles["title"]} 
            ${isSelected ? styles["selected"] : ""}">
              ${title}
          </div>
          <div id="subtitle" class="subtitle ${
            isSelected ? styles["selected"] : ""
          }">
            ${genre} ${year ? `● ${year}` : ""}
          </div>
        </div>
      </div>
    `;
  }
}

// Define the custom element for usage in HTML
customElements.define("hulu-tile", HuluTile);
