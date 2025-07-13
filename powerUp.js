// powerUp.js
// 能量宝箱类

export class PowerUp {
    constructor(canvasWidth, canvasHeight) {
        this.width = 20;
        this.height = 20;
        this.speedX = 0;
        this.speedY = 0;
        this.x = 0;
        this.y = 0;
        this.active = false; // 标记是否在用
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    // 更新宝箱位置
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
    }

    // 绘制宝箱
    draw(ctx) {
        if (this.active) {
            ctx.fillStyle = 'purple'; // 宝箱颜色
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    // 重置宝箱状态
    reset() {
        this.x = 0;
        this.y = 0;
        this.speedX = 0;
        this.speedY = 0;
        this.active = false;
    }
}
