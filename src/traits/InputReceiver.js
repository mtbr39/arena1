/**
 * InputReceiver Trait - 入力を受け取る
 */
export class InputReceiver {
  constructor(acceptMouse = true, acceptKeyboard = false, focusable = false) {
    this.acceptMouse = acceptMouse;
    this.acceptKeyboard = acceptKeyboard;
    this.focusable = focusable;
  }
}
