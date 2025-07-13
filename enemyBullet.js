// enemyBullet.js
// 敌方子弹类

export class EnemyBullet {
    constructor() {
        this.width = 5;
        this.height = 10;
        this.speed = 5;
        this.x = 0;
        this.y = 0;
        this.active = false; // 标记是否在用
    }

    // 更新子弹位置
    update() {
        this.y += this.speed;
    }

    // 绘制子弹
    draw(ctx) {
        if (this.active) {
            ctx.fillStyle = 'orange'; // 敌方子弹颜色
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    // 重置子弹状态
    reset() {
        this.x = 0;
        this.y = 0;
        this.active = false;
    }
}
