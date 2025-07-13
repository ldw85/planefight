// player.js
// 玩家类

export class Player {
    constructor(canvasWidth, canvasHeight) {
        this.width = 30;
        this.height = 30;
        this.x = 50; // 初始 x 坐标
        this.y = canvasHeight - 50; // 初始 y 坐标
        this.speed = 8;
        this.maxHealth = 20;
        this.health = this.maxHealth;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    // 更新玩家位置
    update(inputState) {
        if (inputState.moveLeft) {
            this.x -= this.speed;
        }
        if (inputState.moveRight) {
            this.x += this.speed;
        }
        if (inputState.moveUp) {
            this.y -= this.speed;
        }
        if (inputState.moveDown) {
            this.y += this.speed;
        }

        // 边界检测
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x > this.canvasWidth - this.width) {
            this.x = this.canvasWidth - this.width;
        }
        if (this.y < 0) {
            this.y = 0;
        }
        if (this.y > this.canvasHeight - this.height) {
            this.y = this.canvasHeight - this.height;
        }
    }

    // 绘制玩家飞机
    draw(ctx) {
        if (!Player.planeImg) {
            Player.planeImg = new window.Image();
            Player.planeImg.src = 'image/vehicle.png';
        }
        if (Player.planeImg.complete) {
            ctx.drawImage(Player.planeImg, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        // 绘制生命值光晕
        if (this.health > 0) {
            ctx.strokeStyle = 'green'; // 光晕颜色
            ctx.lineWidth = 3; // 光晕宽度
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width, 0, Math.PI * 2); // 在玩家飞机周围绘制圆
            ctx.stroke();
        }
    }

    // 恢复生命值
    heal() {
        if (this.health < this.maxHealth) {
            this.health++;
            console.log(`恢复1点生命值！当前生命值: ${this.health}`);
        }
    }

    // 受到伤害
    takeDamage() {
        if (this.health > 0) {
            this.health--;
            console.log(`失去1点生命值！当前生命值: ${this.health}`);
            return true;
        }
        return false;
    }

    // 重置玩家状态
    reset() {
        this.x = 50;
        this.y = this.canvasHeight - 50;
        this.health = this.maxHealth;
    }
}