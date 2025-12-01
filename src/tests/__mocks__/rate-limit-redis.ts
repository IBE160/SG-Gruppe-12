class RedisStore {
  constructor(options: any) {}
  async incr(key: string): Promise<[number, number]> {
    return [1, 0];
  }
  async decrement(key: string): Promise<void> {}
  async resetKey(key: string): Promise<void> {}
}

export default RedisStore;