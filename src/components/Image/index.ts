import * as styles from "./styles.css";
import styleSheet from "!css-loader?exportType=css-style-sheet!./styles.css";

/**
 * Custom Web Component representing a Hulu Image element.
 *
 * Features:
 * - Supports `src` and `is-selected` attributes for dynamic updates.
 * - Uses Shadow DOM for encapsulation.
 * - Adopts external stylesheets for consistent styling.
 * - Handles image loading and selection state changes.
 */
class HuluImage extends HTMLElement {
  private shadow: ShadowRoot;
  private image: HTMLImageElement;

  /**
   * Initializes the component, attaches Shadow DOM, and adopts styles.
   */
  constructor() {
    super();
    this.shadow = this.attachShadow({mode: "open"});
    this.shadowRoot.adoptedStyleSheets = [styleSheet];
  }

  /**
   * Specifies the attributes to observe for changes.
   *
   * @returns {string[]} List of attributes observed for changes.
   */
  static get observedAttributes() {
    return ["src", "is-selected"];
  }

  /**
   * Lifecycle method triggered when the component is added to the DOM.
   * - Calls `render` to initialize the component structure.
   * - Assigns the image element reference.
   * - Loads the image if a `src` attribute is provided.
   *
   * @returns {void}
   */
  connectedCallback(): void {
    this.render();
    this.image = this.shadow.querySelector(".img-wrapper");
    this.loadImage();
  }

  /**
   * Lifecycle method triggered when the component is removed from the DOM.
   * - Cleans up event listeners and references to avoid memory leaks.
   *
   * @returns {void}
   */
  disconnectedCallback(): void {
    if (this.image) {
      this.image.onload = null; // Remove the event listener reference.
    }
  }

  /**
   * Lifecycle method triggered when observed attributes change.
   * - Updates the `selected` class when `is-selected` changes.
   * - Re-renders and reloads the image if `src` changes.
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
    if (!this.image) return;

    if (name === "is-selected") {
      this.image.classList.toggle("selected", newValue === "true");
    } else {
      this.render();
      this.loadImage();
    }
  }

  /**
   * Loads the background image and ensures a smooth transition.
   * - Sets image opacity to `1` after it fully loads.
   *
   * @private
   * @returns {void}
   */
  private loadImage(): void {
    const image = this.shadow.querySelector(
      "#background-img"
    ) as HTMLImageElement;
    if (!image) return;

    image.onload = () => {
      image.style.opacity = "1";
    };
  }

  /**
   * Renders the component's HTML structure.
   * - Retrieves `src`, `is-selected`, and `logo` attributes.
   * - Applies conditional styles and elements based on attributes.
   * - Enhances accessibility with appropriate ARIA attributes and `alt` text.
   *
   * @private
   * @returns {void}
   */
  private render(): void {
    const isSelected = this.getAttribute("is-selected") === "true" || false;
    const src = this.getAttribute("src") || "";
    const logo =
      this.getAttribute("logo") && this.getAttribute("logo") !== "undefined"
        ? this.getAttribute("logo")
        : undefined;

    this.shadow.innerHTML = `
      <div 
        class="${styles["img-wrapper"]} 
        ${isSelected ? styles["selected"] : ""}"
        role="img"
        aria-label="${isSelected ? "Selected image" : "Image"}"
        aria-selected="${isSelected}"
      >
      ${
        src
          ? `<img 
                class="${styles["img"]}" 
                id="background-img" 
                src="${src}" 
                alt="Background image"
             />`
          : ""
      }
      ${
        logo
          ? `<img 
                class="${styles["logo"]}" 
                id="logo" 
                src="${logo}" 
                alt="Logo"
             />`
          : ""
      }
    </div>`;
  }
}

// Define the custom element for usage in HTML
customElements.define("hulu-image", HuluImage);
