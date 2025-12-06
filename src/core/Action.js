/**
 * Action - Bit間の相互作用を表す
 */
export class Action {
  constructor(id, kind, actor, targets = [], params = {}) {
    this.id = id;
    this.kind = kind; // ActionKindのID
    this.actor = actor; // Bit ID
    this.targets = targets; // Bit ID[]
    this.params = params; // 任意のパラメータ
    this.timestamp = Date.now();
  }
}

/**
 * ActionKind - Actionの種類と処理方法を定義
 */
export class ActionKind {
  constructor(id, name, validate, resolve) {
    this.id = id;
    this.name = name;
    this.validate = validate || (() => true); // (world, action) => boolean
    this.resolve = resolve || (() => {}); // (world, action) => void
  }
}
