/**
 * TagSet Trait - タグの集合
 */
export class TagSet {
  constructor(tags = []) {
    this.tags = tags;
  }

  add(tag) {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  remove(tag) {
    this.tags = this.tags.filter(t => t !== tag);
  }

  has(tag) {
    return this.tags.includes(tag);
  }
}
