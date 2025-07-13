// pool.js
// 通用对象池类

export class ObjectPool {
    constructor(capacity, createObjectFn) {
        this.capacity = capacity;
        this.pool = [];
        this.active = [];
        this.createObjectFn = createObjectFn; // 用于创建新对象的函数

        // 预填充对象池
        for (let i = 0; i < capacity; i++) {
            this.pool.push(this.createObjectFn());
        }
    }

    // 从池中获取一个对象
    getObject() {
        for (let i = 0; i < this.pool.length; i++) {
            if (!this.pool[i].active) {
                const obj = this.pool[i];
                obj.active = true; // 标记为激活状态
                this.active.push(obj);
                return obj;
            }
        }
        // 如果池已满但未达到容量上限，则创建一个新对象
        if (this.pool.length < this.capacity) {
            const obj = this.createObjectFn();
            obj.active = true;
            this.pool.push(obj);
            this.active.push(obj);
            return obj;
        }
        return null; // 池已满且达到容量上限
    }

    // 回收对象
    releaseObject(obj) {
        obj.active = false; // 标记为非激活状态
        const index = this.active.indexOf(obj);
        if (index > -1) {
            this.active.splice(index, 1);
        }
        // 可选：将对象重置到初始状态，以便下次使用
        if (obj.reset) {
            obj.reset();
        }
    }

    // 获取所有活动对象
    getActiveObjects() {
        return this.active;
    }
}
