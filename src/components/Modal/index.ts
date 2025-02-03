import Play from "../../assets/play.svg";
import Like from "../../assets/like.svg";
import Add from "../../assets/add.svg";
import "../Image";
import * as styles from "./styles.css";
import styleSheet from "!css-loader?exportType=css-style-sheet!./styles.css";

/**
 * Custom Web Component representing a Hulu Modal.
 *
 * Features:
 * - Displays detailed information about a movie or show.
 * - Supports attributes for title, description, rating, genre, release date, and images.
 * - Uses Shadow DOM for encapsulation and styling.
 * - Dynamically updates content when attributes change.
 */
class HuluModal extends HTMLElement {
  private shadow: ShadowRoot;
  private modal: HTMLElement;
  private state: {
    show: boolean;
  };

  constructor() {
    super();
    this.shadow = this.attachShadow({mode: "open"});
    this.shadowRoot.adoptedStyleSheets = [styleSheet];
  }

  /**
   * Called when the element is connected to the document.
   */
  connectedCallback(): void {
    this.render();
    this.modal = this.shadow.querySelector(".modal");
  }

  /**
   * Observed attributes for the custom element.
   * @returns {string[]} List of attribute names to observe.
   */
  static get observedAttributes() {
    return [
      "is-open",
      "title",
      "description",
      "rating",
      "genre",
      "date",
      "horizontal-image",
      "action-text",
    ];
  }

  /**
   * Callback function that is called when an observed attribute changes.
   * @param {string} name - The name of the attribute that changed.
   * @param {string} oldValue - The old value of the attribute.
   * @param {string} newValue - The new value of the attribute.
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === "is-open") {
      this.modal.classList.toggle("show", newValue === "true");
    } else {
      this.updateModal();
    }
  }

  /**
   * Updates the modal content based on the current attributes.
   */
  updateModal(): void {
    const image = this.modal.querySelector("hulu-image") as HTMLElement;
    const {modal} = this;
    image.setAttribute("logo", this.getAttribute("logo"));
    image.setAttribute("src", this.getAttribute("horizontal-image"));

    modal.querySelector("h1").textContent = this.getAttribute("title");
    modal.querySelector("#action-text").textContent =
      this.getAttribute("action-text");
    modal.querySelector(".rating").textContent = this.getAttribute("rating");
    modal.querySelector("#genre").textContent = this.getAttribute("genre");
    modal.querySelector("#date").textContent = new Date(
      this.getAttribute("date")
    )
      .getFullYear()
      .toString();
    modal.querySelector("section").textContent =
      this.getAttribute("description");
  }

  /**
   * Renders the modal content inside the shadow DOM.
   * - Implements accessibility best practices for modal dialogs.
   * - Ensures elements have appropriate ARIA roles and labels.
   * - Uses semantic HTML to enhance keyboard navigation and screen reader support.
   */
  render(): void {
    this.shadow.innerHTML = `
    <div class="${styles["modal"]}" role="dialog" aria-labelledby="modal-title" aria-modal="true">
      <div class="${styles["modal-content"]}">
        <hulu-image></hulu-image>
       
        <button class="${styles["play-button"]}" id="play-button" aria-label="Play">
          <div class="${styles["play-icon"]}">${Play}</div>
          <div id="action-text"></div>
        </button>

        <div class="${styles["view-content"]}">
          <div class="${styles["headline"]}">
            <div class="${styles["title"]}">
              <h1 id="modal-title"></h1> 
            </div>
            <div class="${styles["icons"]}">
              <div class="${styles["icon"]}" role="button" tabindex="0" aria-label="Like">${Like}</div>
              <div class="${styles["icon"]}" role="button" tabindex="0" aria-label="Add to Watch list">${Add}</div>
            </div>
          </div>

          <div class="${styles["meta-data"]}">
            <div class="${styles["rating"]}" id="rating"></div>
            <span id="genre"></span>
            <span id="date"></span>
          </div>

          <section class="${styles["description"]}" id="description" tabindex="0">
          </section>
        </div>
      </div>
    </div>
  `;
  }
}

/**
 * Define the custom element.
 */
customElements.define("hulu-modal", HuluModal);
