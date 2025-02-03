import Vertical from "../../assets/vertical.svg";
import Horizontal from "../../assets/horizontal.svg";

import * as styles from "./styles.css";
import styleSheet from "!css-loader?exportType=css-style-sheet!./styles.css";

/**
 * Custom Web Component for toggling between vertical and horizontal layout.
 *
 * Features:
 * - Provides a UI toggle switch to change layout orientation.
 * - Uses Shadow DOM for encapsulation and styling.
 * - Calls an external `toggleHandler` when the layout is switched.
 */
class HuluLayoutToggle extends HTMLElement {
  private shadow: ShadowRoot;
  private toggle: HTMLElement;
  private state: {
    isHorizontal: boolean;
  };
  /** Public handler function to notify parent component of layout change */
  public toggleHandler: () => void;

  /**
   * Initializes the component, attaches Shadow DOM, and adopts styles.
   */
  constructor() {
    super();
    this.shadow = this.attachShadow({mode: "open"});
    this.shadow.adoptedStyleSheets = [styleSheet];
    this.state = {
      isHorizontal: false,
    };
  }

  /**
   * Lifecycle method triggered when the component is added to the DOM.
   * - Calls `render` to initialize the UI.
   * - Assigns the toggle button reference.
   * - Adds event listeners for user interactions.
   *
   * @returns {void}
   */
  connectedCallback(): void {
    this.render();
    this.toggle = this.shadow.getElementById("toggle");

    this.addEventListeners();
  }

  /**
   * Lifecycle method triggered when the component is removed from the DOM.
   * - Cleans up event listeners to prevent memory leaks.
   *
   * @returns {void}
   */
  disconnectedCallback(): void {
    if (this.toggle) {
      this.toggle.removeEventListener("click", this.toggleHandler);
    }
  }

  /**
   * Adds event listeners for user interactions.
   * - Listens for `click` events on the toggle button.
   *
   * @private
   * @returns {void}
   */
  private addEventListeners(): void {
    this.toggle.addEventListener("click", () => {
      this.toggleLayout();
      this.toggleHandler();
    });
  }

  /**
   * Toggles the layout state between horizontal and vertical.
   * - Updates the `state.isHorizontal` value.
   * - Modifies the `slider` UI to reflect the new state.
   *
   * @private
   * @returns {void}
   */
  private toggleLayout(): void {
    this.state.isHorizontal = !this.state.isHorizontal;
    this.toggle
      .querySelector(".slider")
      .classList.toggle("on", this.state.isHorizontal);
  }

  /**
   * Renders the toggle component inside the shadow DOM.
   * - Implements accessibility best practices for interactive elements.
   * - Ensures elements have appropriate ARIA roles and labels.
   * - Uses semantic HTML to enhance keyboard navigation and screen reader support.
   */
  private render(): void {
    this.shadow.innerHTML = `
    <div class="${styles["toggle"]}" id="toggle" role="button" aria-pressed="false" aria-label="Toggle layout">
      <div class="${styles["icons"]}">
        <!-- Icons are purely decorative; marked with aria-hidden -->
        <div class="${styles["icon"]}" aria-hidden="true">${Vertical}</div>
        <div class="${styles["icon"]}" aria-hidden="true">${Horizontal}</div>
      </div>
      <div class="${styles["slider"]}">
        <div class="${styles["circle"]}"></div>
      </div>
    </div>
  `;
  }
}

// Define the custom element for usage in HTML
customElements.define("hulu-layout-toggle", HuluLayoutToggle);
