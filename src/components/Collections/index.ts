import type {Collection, View} from "../../utils/types";
import {getViews, getCollections} from "../../api/Hulu";

import "../Tile";
import "../Modal";
import "../LayoutToggle";

import initialScreen from "../../assets/hulu.jpeg";

import * as styles from "./styles.css";
import styleSheet from "!css-loader?exportType=css-style-sheet!./styles.css";

/**
 * Custom Web Component representing a collection of Hulu items.
 *
 * Features:
 * - Fetches collections and their views dynamically.
 * - Supports keyboard navigation and layout toggling.
 * - Uses Shadow DOM for encapsulation and styling.
 */
class HuluCollections extends HTMLElement {
  private shadow: ShadowRoot;
  private collectionsElement: NodeListOf<Element>;
  private loadingElement: HTMLImageElement;
  private state: {
    selectedRowIndex: number;
    selectedColumnIndex: number;
    selectedTile: View | null;
    collections: Array<Collection>;
    isHorizontal: boolean;
  };

  constructor() {
    super();
    this.shadow = this.attachShadow({mode: "open"});
    this.shadowRoot.adoptedStyleSheets = [styleSheet];
    this.state = {
      selectedRowIndex: 0,
      selectedColumnIndex: 0,
      selectedTile: null,
      collections: [],
      isHorizontal: true,
    };
  }

  /**
   * Called when the element is connected to the document.
   */
  async connectedCallback(): Promise<void> {
    this.renderLoading();
    this.loadingElement = this.shadow.querySelector(".loading");

    await this.fetchData();
    this.render();
    this.addEventListeners();

    this.state.selectedTile = this.state.collections[0].views[0];
    this.collectionsElement = this.shadow.querySelectorAll(
      ".collection-container"
    );
  }

  /**
   * Called when the element is disconnected from the document.
   *
   * - Removes event listeners to prevent memory leaks.
   */
  disconnectedCallback(): void {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  /**
   * Fetches the collections and their views from the API.
   * @returns {Promise<void>}
   */
  async fetchData(): Promise<void> {
    try {
      const collections: Array<Collection> = await getCollections();
      for (const collection of collections) {
        const views = await getViews(collection.href);
        this.state.collections.push({...collection, views});
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      this.loadingElement.remove();
    }
  }

  /**
   * Adds event listeners for keyboard navigation and layout toggle.
   */
  private addEventListeners(): void {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    const toggle = this.shadow.querySelector("hulu-layout-toggle") as any;

    toggle.toggleHandler = () => {
      this.state.isHorizontal = !this.state.isHorizontal;
      this.renderCollections();
      this.collectionsElement = this.shadow.querySelectorAll(
        ".collection-container"
      );
    };
  }

  /**
   * Handles keyboard navigation for the collections.
   * @param {KeyboardEvent} event - The keyboard event.
   */
  private handleKeyDown(event: KeyboardEvent): void {
    const modal = this.shadow.querySelector("hulu-modal") as HTMLElement;
    if (modal.getAttribute("is-open") === "true" && event.key != "Escape")
      return;

    switch (event.key) {
      case "ArrowUp":
        this.updateSelectedRow(Math.max(0, this.state.selectedRowIndex - 1));
        break;
      case "ArrowDown":
        this.updateSelectedRow(
          Math.min(
            this.state.selectedRowIndex + 1,
            this.getCollectionLength() - 1
          )
        );
        break;
      case "ArrowLeft":
        this.updateSelectedColumn(
          Math.max(0, this.state.selectedColumnIndex - 1)
        );
        break;
      case "ArrowRight":
        const tilesLength = this.getTilesLength(this.state.selectedRowIndex);
        this.updateSelectedColumn(
          Math.min(this.state.selectedColumnIndex + 1, tilesLength - 1)
        );
        break;
      case "Enter":
        this.renderModal(modal);
        this.shadow.getElementById("collections").style.opacity = "0.5";
        break;
      case "Escape":
        modal.setAttribute("is-open", "false");
        this.shadow.getElementById("collections").style.opacity = "1";
        break;
    }
  }

  /**
   * Renders a loading spinner while fetching data.
   */
  renderLoading(): void {
    this.shadow.innerHTML = `
      <img src="${initialScreen}" class="${styles.loading}" alt="Loading..." />
    `;
  }
  /**
   * renders the entity details modal with the selected tile data
   * @param modal
   */
  private renderModal(modal: HTMLElement): void {
    const {selectedTile} = this.state;

    modal.setAttribute("logo", selectedTile.branding?.logo);
    modal.setAttribute("horizontal-image", selectedTile.horizontalImage);
    modal.setAttribute("title", selectedTile.title);
    modal.setAttribute("description", selectedTile.description);
    modal.setAttribute("rating", selectedTile.rating);
    modal.setAttribute("date", selectedTile.date.toString());
    modal.setAttribute("genre", selectedTile.genre.join(" ● "));
    modal.setAttribute("type", selectedTile.type);
    modal.setAttribute("action-text", selectedTile.actionText);
    modal.setAttribute("is-open", "true");
  }

  /**
   * Renders an interpolated HTML string for a `hulu-tile` component.
   *
   * @param tile - The tile object containing data such as title, action text, images, date, genre, and branding.
   * @param isTileSelected - A boolean indicating whether the tile is currently selected.
   * @returns An HTML string representing the `hulu-tile` component with the provided tile data.
   */
  private renderTile(tile: View, isTileSelected: boolean): string {
    return `<hulu-tile 
        title="${tile.title}"
        action-text="${tile.actionText}"
        layout="${this.state.isHorizontal ? "horizontal" : "vertical"}"
        image="${
          this.state.isHorizontal ? tile.horizontalImage : tile.verticalImage
        }"
        is-selected="${isTileSelected.toString()}"
        date="${tile.date.toString()}"
        genre="${tile.genre.slice(0, 2).join(" ● ")}"
        logo="${tile.branding?.logo}">
      </hulu-tile>`;
  }

  /**
   * Renders the collections section by generating an HTML string for all collections
   * and their respective tiles, then updating the DOM.
   *
   * - Iterates over `collections` to create a container for each collection.
   * - Renders a title and a tile container, adjusting layout based on `isHorizontal`.
   * - Uses `renderTile` to generate HTML for each tile, marking the selected tile.
   * - Updates the `collections` container in the shadow DOM with the generated HTML.
   *
   * @returns void
   */
  private renderCollections(): void {
    const {selectedColumnIndex, selectedRowIndex, collections} = this.state;
    const collectionsElement = this.shadow.getElementById("collections");
    if (!collectionsElement) return;

    const collectionsHTML = collections
      .map(
        ({title, views}, rowIndex) => `
          <div 
            class="${styles["collection-container"]}" 
            role="region" 
            aria-labelledby="collection-title-${rowIndex}"
          >
            <h2 
              id="collection-title-${rowIndex}" 
              class="${styles["title"]}">${title}
            </h2>
            <div 
              class="${styles["collection"]}
               ${this.state.isHorizontal ? "" : styles["vertical"]}" 
              id="collection--${rowIndex}"
              role="list"
            >
              ${views
                .map((tile, columnIndex) => {
                  const isTileSelected =
                    columnIndex === selectedColumnIndex &&
                    rowIndex === selectedRowIndex;
                  return this.renderTile(tile, isTileSelected);
                })
                .join("")}
            </div>
          </div>
        `
      )
      .join("");

    collectionsElement.innerHTML = collectionsHTML;
  }

  /**
   * Gets the total number of collections.
   *
   * @returns The number of collections.
   */
  private getCollectionLength(): number {
    return this.collectionsElement.length;
  }

  /**
   * Retrieves the collection element corresponding to the given row index.
   *
   * @param rowIndex - The index of the collection.
   * @returns The collection element.
   */
  private getCollectionElement(rowIndex: number): Element {
    return this.collectionsElement[rowIndex].querySelector(
      `#collection--${rowIndex}`
    );
  }

  /**
   * Gets the number of tiles within a specified collection row.
   *
   * @param rowIndex - The index of the collection row.
   * @returns The number of tiles in the row.
   */
  private getTilesLength(rowIndex: number): number {
    const collectionElement = this.getCollectionElement(rowIndex);
    return collectionElement.children.length;
  }

  /**
   * Updates the selected row in the collection.
   *
   * - Deselects the previously selected tile.
   * - Selects the tile in the new row at the same column index.
   * - Updates the state to reflect the new selected row index.
   *
   * @param newIndex - The index of the new row to be selected.
   */
  private updateSelectedRow(newIndex: number): void {
    if (newIndex === this.state.selectedRowIndex) return;

    this.updateSelectedTile(
      this.state.selectedColumnIndex,
      this.state.selectedRowIndex,
      false
    );
    this.updateSelectedTile(this.state.selectedColumnIndex, newIndex, true);

    this.state.selectedRowIndex = newIndex;
  }

  /**
   * Updates the selected column in the collection.
   *
   * - Deselects the previously selected tile.
   * - Selects the tile in the new column at the same row index.
   * - Updates the state to reflect the new selected column index.
   *
   * @param newIndex - The index of the new column to be selected.
   */
  private updateSelectedColumn(newIndex: number): void {
    if (newIndex === this.state.selectedColumnIndex) return;

    this.updateSelectedTile(
      this.state.selectedColumnIndex,
      this.state.selectedRowIndex,
      false
    );
    this.updateSelectedTile(newIndex, this.state.selectedRowIndex, true);

    this.state.selectedColumnIndex = newIndex;
  }

  /**
   * Updates the selected state of a specific tile in the collection.
   *
   * - Retrieves the tile at the specified row and column index.
   * - Updates its `is-selected` attribute based on the `isSelected` parameter.
   * - Updates the state with the currently selected tile.
   *
   * @param columnIndex - The index of the tile's column.
   * @param rowIndex - The index of the tile's row.
   * @param isSelected - Whether the tile should be marked as selected.
   */
  private updateSelectedTile(
    columnIndex: number,
    rowIndex: number,
    isSelected: boolean
  ): void {
    const collectionElement = this.getCollectionElement(rowIndex);
    const selectedTile = collectionElement.children[columnIndex] as HTMLElement;

    if (selectedTile) {
      selectedTile.setAttribute("is-selected", isSelected.toString());
      this.state.selectedTile =
        this.state.collections[rowIndex].views[columnIndex];
    }
  }

  /**
   * Renders the component's shadow DOM structure.
   *
   * - Clears and updates the shadow DOM with the main layout.
   * - Uses a template to improve performance and prevent reflows.
   * - Defers rendering collections to optimize UI updates.
   *
   * @private
   * @returns {void} renders the shadow DOM structure
   */
  private render(): void {
    this.shadow.innerHTML = `
      <div 
        id="collections" 
        class="${styles.collections}" 
        role="main" 
        aria-label="Hulu Collections">
      </div>
      <div class="${styles["layout-toggle-container"]}">
        <hulu-layout-toggle aria-label="Toggle Layout"></hulu-layout-toggle>
      </div>
      <hulu-modal></hulu-modal>
    `;

    this.renderCollections();
  }
}

customElements.define("hulu-collections", HuluCollections);
