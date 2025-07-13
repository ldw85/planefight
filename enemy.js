// enemy.js
// 敌机类

export class Enemy {
    constructor(canvasWidth, canvasHeight) {
        this.width = 30;
        this.height = 30;
        this.speed = 3;
        this.health = 1;
        this.lastShotTime = 0;
        this.shotInterval = 3000;
        this.x = 0;
        this.y = 0;
        this.active = false; // 标记是否在用
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    // 更新敌机位置
    update() {
        this.y += this.speed;
    }

    // 绘制敌机
    draw(ctx) {
        if (this.active) {
            if (!window.jetPlaneImg) {
                window.jetPlaneImg = new window.Image();
                window.jetPlaneImg.src = 'image/jet-plane.png';
            }
            if (window.jetPlaneImg.complete) {
                // 旋转180度使机头朝下
                ctx.save();
                ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
                ctx.rotate(Math.PI); // 180度
                ctx.drawImage(window.jetPlaneImg, -this.width / 2, -this.height / 2, this.width, this.height);
                ctx.restore();
            } else {
                ctx.fillStyle = 'green';
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        }
    }

    // 受到伤害
    takeDamage(amount) {
        this.health -= amount;
    }

    // 重置敌机状态
    reset() {
        this.width = 30;
        this.height = 30;
        this.speed = 3;
        this.health = 1;
        this.lastShotTime = 0;
        this.shotInterval = 3000;
        this.x = 0;
        this.y = 0;
        this.active = false;
    }

    // 设置大型敌机属性
    setToLargeEnemy() {
        this.width = 60;
        this.height = 60;
        this.speed = 1.5;
        this.health = 3;
        this.shotInterval = 5000;
    }
}
