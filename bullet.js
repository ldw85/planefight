// bullet.js
// 玩家子弹类

export class Bullet {
    constructor() {
        this.width = 5;
        this.height = 10;
        this.speed = 10;
        this.x = 0;
        this.y = 0;
        this.speedX = 0;
        this.speedY = 0;
        this.active = false; // 标记是否在用
    }

    // 更新子弹位置
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
    }

    // 绘制子弹
    draw(ctx) {
        if (this.active) {
            ctx.fillStyle = 'blue';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    // 重置子弹状态
    reset() {
        this.x = 0;
        this.y = 0;
        this.speedX = 0;
        this.speedY = 0;
        this.active = false;
    }
}
