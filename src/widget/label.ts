import { measureText } from "../utility";

import { SKElement, SKElementProps } from "./element";
import { Style } from "./style";

type LabelAlign = "centre" | "left" | "right";

type SKLabelProps = SKElementProps & {
  text?: string;
  align?: LabelAlign;
};

export class SKLabel extends SKElement {
  constructor({
    text = "?",
    align = "centre",
    ...elementProps
  }: SKLabelProps = {}) {
    super(elementProps);

    this.padding = Style.textPadding;
    this.text = text;
    this.align = align;

    // defaults
    this.fill = "";
    this.border = "";
  }

  align: LabelAlign;

  protected _text = "";
  get text() {
    return this._text;
  }
  set text(t: string) {
    this._text = t;
    this.setMinimalSize(this.width, this.height);
  }

  protected _radius = 0;
  set radius(r: number) {
    this._radius = r;
  }
  get radius() {
    return this._radius;
  }

  protected _font = Style.font;
  set font(s: string) {
    this._font = s;
    this.setMinimalSize(this.width, this.height);
  }
  get font() {
    return this._font;
  }

  protected _fontColour = Style.fontColour;
  set fontColour(c: string) {
    this._fontColour = c;
  }
  get fontColour() {
    return this._fontColour;
  }

  setMinimalSize(width?: number, height?: number) {
    // need this if w or h not specified
    const m = measureText(this.text || " ", this._font);

    if (!m) {
      console.warn(`measureText failed in SKLabel for ${this.text}`);
      return;
    }

     this.height = height || m.height + this.padding * 2;

     this.width = width || m.width + this.padding * 2;
  
  }


  draw(gc: CanvasRenderingContext2D) {
    gc.save();

    const w = this.paddingBox.width;
    const h = this.paddingBox.height;

    gc.translate(this.margin, this.margin);

    if (this.fill) {
      gc.beginPath();
      gc.roundRect(this.x, this.y, w, h, this._radius);
      gc.fillStyle = this.fill;
      gc.fill();
    }

    if (this.border) {
      gc.strokeStyle = this.border;
      gc.lineWidth = 1;
      gc.stroke();
    }

    // render text
    /*gc.font = this._font;
    gc.fillStyle = this._fontColour;
    gc.textBaseline = "middle";

    switch (this.align) {
      case "left":
        gc.textAlign = "left";
        gc.fillText(this.text, this.x + this.padding, this.y + h / 2);

        break;
      case "centre":
        gc.textAlign = "center";
        gc.fillText(this.text, this.x + w / 2, this.y + h / 2);

        break;
      case "right":
        gc.textAlign = "right";
        gc.fillText(this.text, this.x + w - this.padding, this.y + h / 2);

        break;
    }*/

    // render text with wrapping
    gc.font = this._font;
    gc.fillStyle = this._fontColour;
    gc.textBaseline = "top";

    const lines = this.wrapText(gc, this.text, (this.width || 0) - 2 * this.padding);
    const lineHeight = measureText("M", this._font)?.height || 0; // Estimate line height using a reference character
    let yOffset = this.y + this.padding;

    lines.forEach((line) => {
      switch (this.align) {
        case "left":
          gc.textAlign = "left";
          gc.fillText(line, this.x + this.padding, yOffset);
          break;
        case "centre":
          gc.textAlign = "center";
          gc.fillText(line, this.x + w / 2, yOffset);
          break;
        case "right":
          gc.textAlign = "right";
          gc.fillText(line, this.x + w - this.padding, yOffset);
          break;
      }
      yOffset += lineHeight;
    });

    gc.restore();

    // element draws debug viz if flag is set
    super.draw(gc);
  }

  wrapText(gc: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textMetrics = measureText(testLine, this._font);

      if (!textMetrics) {
        console.warn(`measureText failed for: ${testLine}`);
        return; // Skip processing this word if measureText fails
      }

      if (textMetrics.width > maxWidth) {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word; // Start a new line with the current word
      } else {
        currentLine = testLine; // Add word to the current line
      }
    });

    if (currentLine) {
      lines.push(currentLine); // Push the last line
    }

    return lines;
  }
  public toString(): string {
    return `SKLabel '${this.text}'`;
  }
}
