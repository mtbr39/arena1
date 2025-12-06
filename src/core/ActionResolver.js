/**
 * ActionResolver - Actionを解決する
 */
export class ActionResolver {
  constructor(world) {
    this.world = world;
  }

  /**
   * Actionを実行
   */
  resolve(world, action) {
    const actionKind = world.actionKinds.get(action.kind);
    if (!actionKind) {
      console.warn(`Unknown action kind: ${action.kind}`);
      return;
    }

    // バリデーション
    if (!actionKind.validate(world, action)) {
      return;
    }

    // Actorのハンドラを実行(Bit固有の処理)
    const actorBit = world.getBit(action.actor);
    if (actorBit) {
      const handler = actorBit.getActionHandler(action.kind);
      if (handler) {
        handler(world, action);
      }
    }

    // Targetのハンドラを実行(クリックされたBitなど)
    for (const targetId of action.targets) {
      const targetBit = world.getBit(targetId);
      if (targetBit) {
        const handler = targetBit.getActionHandler(action.kind);
        if (handler) {
          handler(world, action);
        }
      }
    }

    // ActionKindの共通処理を実行
    actionKind.resolve(world, action);
  }
}
