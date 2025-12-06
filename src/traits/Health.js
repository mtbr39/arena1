/**
 * Health Trait - 体力
 */
export class Health {
  constructor(max = 100) {
    this.max = max;
    this.current = max;
  }

  damage(amount) {
    this.current = Math.max(0, this.current - amount);
    return this.current <= 0;
  }

  heal(amount) {
    this.current = Math.min(this.max, this.current + amount);
  }

  isDead() {
    return this.current <= 0;
  }
}
