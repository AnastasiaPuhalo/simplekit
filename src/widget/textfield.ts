import { SKKeyboardEvent, SKMouseEvent } from "../events";
import { measureText } from "../utility";
import { requestKeyboardFocus } from "../dispatch";
import { SKElement, SKElementProps } from "./element";
import { Style } from "./style";

export type SKTextfieldProps = SKElementProps & {
  text?: string;
  disabled?: boolean; // adding property to disable the textfield
  border?: string;
};

export class SKTextfield extends SKElement {
  disabled: boolean = false;
  border: string;



  constructor({ text = "", fill = "white", border = "black", disabled = false, ...elementProps }: SKTextfieldProps = {}) {
    super(elementProps);
    this.padding = Style.textPadding;
    this.text = text;
    this.fill = fill;
    this.border = border;
    this.disabled = disabled; // Set the disabled property
  }

  state: "idle" | "hover" = "idle";
  focus = false;

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

  protected _highlightColour = Style.highlightColour;
  set highlightColour(hc: string) {
    this._highlightColour = hc;
  }

  setMinimalSize(width?: number, height?: number) {
    // need this if w or h not specified
    const m = measureText(this.text || " ", this.font);

    if (!m) {
      console.warn(
        `measureText failed in SKTextfield for ${this.text}`
      );
      return;
    }

    this.height = height || m.height + this.padding * 2;
    this.width = width || m.width + this.padding * 2;
    // need to store this for cursor position
    this.textWidth = m.width;
  }

  textWidth = 0;

  protected applyEdit(text: string, key: string): string {
    if (key == "Backspace") {
      return text.slice(0, -1);
    } else if (key.length == 1) {
      return text + key;
    } else return text;
  }


  handleKeyboardEvent(ke: SKKeyboardEvent) {
    // Prevent keyboard interactions if disabled
    if (this.disabled) return false;

    switch (ke.type) {
      case "focusout":
        this.focus = false;
        this.border = this.border;
        return true;
        break;
      case "focusin":
        this.focus = true;
        return true;
        break;
      case "keydown":
        if (this.focus && ke.key) {
          this.text = this.applyEdit(this.text, ke.key);
        }
        return this.sendEvent({
          source: this,
          timeStamp: ke.timeStamp,
          type: "textchanged",
        });
        break;
    }

    return false;
  }

  handleMouseEvent(me: SKMouseEvent) {

    //ADDED: Prevent mouse interactions if disabled
    if (this.disabled) {
      // Check for a double-click event
      if (me.type === "dblclick") {
        this.disabled = false; 
        requestKeyboardFocus(this); 
        return true;
      }
      return false; 
    }

    switch (me.type) {
      case "mouseenter":
        this.state = "hover";
        return true;
        break;
      case "mouseexit":
        this.state = "idle";
        return true;
        break;
      case "click":
        requestKeyboardFocus(this);
        return true;
        break;
      case "mousedown":
        return false;
        break;
      case "mouseup":
        return false;
        break;
    }
    return false;
  }

  draw(gc: CanvasRenderingContext2D) {
    const w = this.paddingBox.width;
    const h = this.paddingBox.height;

    gc.save();

    gc.translate(this.x, this.y);
    gc.translate(this.margin, this.margin);

    // thick highlight rect
    if (this.state == "hover" && !this.disabled) {
      gc.beginPath();
      gc.roundRect(0, 0, w, h, this._radius);
      gc.strokeStyle = this._highlightColour;
      gc.lineWidth = 8;
      gc.stroke();
    }

    // border
    gc.beginPath();
    gc.roundRect(0, 0, w, h, this._radius);
    gc.fillStyle = this.fill;
    gc.fill();
    gc.lineWidth = 1;
    gc.strokeStyle = this.focus && !this.disabled ? "mediumblue" : this.border;
    gc.stroke();
    // clip text if it's wider than text area
    // TODO: could scroll text if it's wider than text area
    gc.clip();

    // text
    gc.font = this._font;
    gc.fillStyle = this._fontColour;
    gc.textBaseline = "middle";
    gc.textAlign = "left";
    gc.fillText(this.text, this.padding, h / 2);

    // simple cursor, Cursor only if focused and not disabled
    if (this.focus && !this.disabled) {
      const cursorX = this.padding + this.textWidth + 1;
      const cursorHeight = h - Style.textPadding;
      gc.beginPath();
      gc.moveTo(cursorX, Style.textPadding / 2);
      gc.lineTo(cursorX, cursorHeight);
      gc.lineWidth = 1;
      gc.strokeStyle = this._font;
      gc.stroke();
    }

    gc.restore();

    // element draws debug viz if flag is set
    super.draw(gc);
  }

  public toString(): string {
    return `SKTextfield '${this.text}'`;
  }
}
