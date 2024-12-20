import { insideHitTestRectangle, measureText } from "../utility";
import { SKElement, SKElementProps } from "./element";
import { Style } from "./style";
import { SKEvent, SKMouseEvent } from "../events";

import { requestMouseFocus } from "../dispatch";

export type SKButtonProps = SKElementProps & { 
  text?: string;
  toggle?: boolean;  // New property to enable toggle behavior
  checked?: boolean; // New property for checked state
   };

export class SKButton extends SKElement {
  checked: boolean = false;  // Add a checked state for toggle
  toggle: boolean = false;   // Add a toggle state to enable/disable toggle mode
  
  constructor({ 
    text = "", 
    fill = "lightgrey",
    toggle = false,     // Initialize toggle behavior
    checked = false,    // Initialize checked state
    ...elementProps
  }: SKButtonProps = {}) {
    super(elementProps);
    this.padding = Style.textPadding;
    this.text = text;
    this.fill = fill;
    this.toggle = toggle;    // Set initial toggle mode
    this.checked = checked;  // Set initial checked state
    this.calculateBasis();
    this.doLayout();
  }


  state: "idle" | "hover" | "down" = "idle";

  protected _text = "";
  get text() {
    return this._text;
  }
  set text(t: string) {
    this._text = t;
    // console.log(`SKButton text = ${this.text} ${this.width} ${this.height}`);
    this.setMinimalSize(this.width, this.height);
  }

  protected _radius = 4;
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
  set highlightColour(hc: string){
    this._highlightColour = hc;
  }


  setMinimalSize(width?: number, height?: number) {
    width = width || this.width;
    height = height || this.height;
    // need this if w or h not specified
    const m = measureText(this.text, this._font);

    if (!m) {
      console.warn(`measureText failed in SKButton for ${this.text}`);
      return;
    }

    this.height = height || m.height + this.padding * 2;

    this.width = width || m.width + this.padding * 2;
    // enforce a minimum width here (if no width specified)
    if (!width) this.width = Math.max(this.width, 80);
  }

  handleMouseEvent(me: SKMouseEvent) {
    // console.log(`${this.text} ${me.type}`);

    switch (me.type) {
      case "mousedown":
        this.state = "down";
        requestMouseFocus(this);
        return true;
        break;
      case "mouseup":
        this.state = "hover";

        //check the toggle
        const currentFill = this.fill;

        if (this.toggle) {
          // Toggle behavior: switch the checked state
          this.checked = !this.checked;
          if (currentFill == "#ed6618")
              this.fill = "white";
        }

        // return true if a listener was registered
        return this.sendEvent({
          source: this,
          timeStamp: me.timeStamp,
          type: "action",
        } as SKEvent);
        break;
      case "mouseenter":
        this.state = "hover";
        return true;
        break;
      case "mouseexit":
        this.state = "idle";
        return true;
        break;
    }
    return false;
  }

  draw(gc: CanvasRenderingContext2D) {
    // to save typing "this" so much

    gc.save();

    const w = this.paddingBox.width;
    const h = this.paddingBox.height;

    gc.translate(this.margin, this.margin);


    // thick highlight rect
    if (this.state == "hover" || this.state == "down") {
      gc.beginPath();
      gc.roundRect(this.x, this.y, w, h, this.radius);
      gc.strokeStyle = this._highlightColour;
      gc.lineWidth = 8;
      gc.stroke();
    }

    // normal background
    gc.beginPath();
    gc.roundRect(this.x, this.y, w, h, this.radius);
    gc.fillStyle =
      this.state == "down" ? this._highlightColour : this.fill;
    gc.strokeStyle = this.border;
    // change fill to show down state
    gc.lineWidth = this.state == "down" ? 4 : 2;
    gc.fill();
    gc.stroke();
    gc.clip(); // clip text if it's wider than text area


     // Draw a checkmark if the button is toggled on (checked)
     if (this.toggle && this.checked) {
      gc.beginPath();
      gc.moveTo(this.x + w * 0.2, this.y + h * 0.5);
      gc.lineTo(this.x + w * 0.4, this.y + h * 0.7);
      gc.lineTo(this.x + w * 0.8, this.y + h * 0.3);
      gc.lineWidth = 2;
      gc.strokeStyle = "white";
      this.fill = "#ed6618";
      gc.stroke();
    }

    // button label
    gc.font = this._font;
    gc.fillStyle = this._fontColour;
    gc.textAlign = "center";
    gc.textBaseline = "middle";
    gc.fillText(this.text, this.x + w / 2, this.y + h / 2);

    gc.restore();

    // element draws debug viz if flag is set
    super.draw(gc);
  }

  public toString(): string {
    //return `SKButton '${this.text}'`;
    return `SKButton '${this.text}' ${this.toggle ? (this.checked ? "checked" : "unchecked") : ""}`;
  }
}
