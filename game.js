import { setupInputListeners, getInputState, resetInputState } from './input.js';
import { GameState, setGameState, getGameState, updateScore, getPlayerScore, getAchievementLevel, AchievementLevels, resetGameState } from './gamestate.js';
import { Player } from './player.js';
import { Bullet } from './bullet.js';
import { Enemy } from './enemy.js';
import { EnemyBullet } from './enemyBullet.js';
import { PowerUp } from './powerUp.js';
import { ObjectPool } from './pool.js';
import { soundManager } from './sound.js';

let canvas;
let healthFill;
let ctx;
let difficultySelect;
export let difficultyLevel = 1;
let player;

// Load sounds
soundManager.loadSound('bullet', 'audio/bullet.wav');
soundManager.loadSound('bullet2', 'audio/bullet.wav');
soundManager.loadSound('plane', 'audio/plane.wav', false); // Change loop to false
soundManager.loadSound('cheer', 'audio/cheer.wav');

// 设置音量
soundManager.setMasterVolume(0.5);
soundManager.setVolume('bullet', 0.3);
soundManager.setVolume('bullet2', 0.3);
soundManager.setVolume('cheer', 0.5);
soundManager.setVolume('plane', 0.3);

function updateHealth(currentHealth, maxHealth) {
    const percentage = Math.max(0, (currentHealth / maxHealth) * 100);
    healthFill.style.width = `${percentage}%`;
    if (percentage <= 30) {
        healthFill.classList.add('low');
    } else {
        healthFill.classList.remove('low');
    }
}

setGameState(GameState.MENU);

// 创建 Player 实例
let lastShotTime = 0; //  上次射击时间
const shotInterval = 100; //  射击间隔（毫秒）

const bullets = []; // 玩家子弹
const enemyBullets = []; // 敌方子弹
const enemies = []; //  存储敌人
const powerUps = []; // 存储能量宝箱
let score = 0; //  得分
let lastCheerScore = 0; // 用于跟踪上次播放欢呼声时的分数
let achievementBadgeElement; // Element to display achievement badge


//  对象池
const bulletPool = new ObjectPool(100, () => new Bullet());
const enemyBulletPool = new ObjectPool(50, () => new EnemyBullet());
let enemyPool; // Declare but don't initialize here
let powerUpPool; // Declare but don't initialize here
let enemySpawnIntervalId = null; // 保存敌机生成定时器ID

//  重置游戏状态
export function resetGame() {
    score = 0;
    // Removed soundManager.stopSound('plane') and soundManager.playSound('plane', 0.3)

    // 回收所有活动中的对象到对象池
    for (let i = bulletPool.active.length - 1; i >= 0; i--) {
        bulletPool.releaseObject(bulletPool.active[i]);
    }
    for (let i = enemyPool.active.length - 1; i >= 0; i--) {
        enemyPool.releaseObject(enemyPool.active[i]);
    }
    for (let i = enemyBulletPool.active.length - 1; i >= 0; i--) {
        enemyBulletPool.releaseObject(enemyBulletPool.active[i]);
    }
    for (let i = powerUpPool.active.length - 1; i >= 0; i--) {
        powerUpPool.releaseObject(powerUpPool.active[i]);
    }

    // 清空游戏中的对象数组 (这些数组应该只包含活动中的对象，但为了安全也清空)
    enemies.length = 0; // 游戏结束时清空敌人
    bullets.length = 0;
    enemyBullets.length = 0;
    powerUps.length = 0;
    player.reset(); // 重置玩家状态
    updateHealth(player.health, player.maxHealth);
    resetInputState(); // 重置输入状态
    // Reset achievement and score in gamestate
    resetGameState();
}

//  生成敌人的函数
function spawnEnemy() {
    let enemyWidth = 30;
    let enemyHeight = 30;
    let enemySpeed = 3; // 普通敌机速度
    let enemyHealth = 1; // 普通敌机生命值
    let enemyShotInterval = 3000; // 普通敌机射击间隔
    // 根据难度增加敌机数量（每种模式比当前多2）
    let spawnCount = 5; // 简单模式5
    if (difficultyLevel === 2) {
        spawnCount = 6; // 中等模式6
    } else if (difficultyLevel === 3) {
        spawnCount = 7; // 困难模式7
    }

    if (difficultyLevel >= 3 && Math.random() < 0.15) { // 提高大型敌机出现几率 (10% -> 15%)
        enemyWidth = 60;  // 大型敌机宽度
        enemyHeight = 60; // 大型敌机高度
        enemySpeed = 1.5;   // 提高大型敌机速度
        enemyHealth = 3;  // 大型敌机生命值
        enemyShotInterval = 5000; // 大型敌机射击间隔更长
    }

    // 游戏结束后不再生成敌机
    if (getGameState() !== GameState.PLAYING) return;

    for (let n = 0; n < spawnCount; n++) {
        const enemy = enemyPool.getObject();
        if (enemy) {
            enemy.width = enemyWidth;
            enemy.height = enemyHeight;
            enemy.speed = enemySpeed;
            enemy.health = enemyHealth;
            enemy.shotInterval = enemyShotInterval; // 设置敌机射击间隔
            enemy.x = Math.random() * (canvas.width - enemyWidth); //  随机 x 坐标，确保敌机不超出画布
            enemy.y = 0; //  从顶部出现
            enemies.push(enemy);
        }
    }
}

// 生成能量宝箱的函数
function spawnPowerUp() {
    const powerUp = powerUpPool.getObject();
    if (powerUp) {
        powerUp.x = Math.random() * (canvas.width - powerUp.width); // 随机 x 坐标
        powerUp.y = Math.random() * (canvas.height - powerUp.height); // 随机 y 坐标
        powerUp.speedX = (Math.random() - 0.5) * 2; // 随机 -1 到 1 的速度
        powerUp.speedY = (Math.random() - 0.5) * 2; // 随机 -1 到 1 的速度
        powerUps.push(powerUp);
    }
}

// 每隔一段时间生成能量宝箱
setInterval(spawnPowerUp, 10000); // 每 10 秒生成一个能量宝箱


//  每隔一段时间生成敌人
function setEnemySpawnInterval() {
    let interval = 1500; // 默认间隔 (难度 1)
    if (difficultyLevel === 2) {
        interval = 1250;
    } else if (difficultyLevel === 3) {
        interval = 1000;
    }
    interval = interval * 0.7;
    if (enemySpawnIntervalId) clearInterval(enemySpawnIntervalId);
    enemySpawnIntervalId = setInterval(spawnEnemy, interval);
}


function update() {
    const gameState = getGameState();
    if (gameState === GameState.PLAYING) {
        const inputState = getInputState(); //  获取输入状态

        // 更新玩家
        player.update(inputState);

        //  子弹发射逻辑
        if (inputState.isShooting) {
            shoot();
        } else {
            soundManager.stopSound('bullet');
        }

        //  更新子弹位置
        for (let i = 0; i < bullets.length; i++) {
            bullets[i].update();
            if (bullets[i].y < 0 || bullets[i].x < 0 || bullets[i].x > canvas.width) { // 检查子弹是否超出屏幕
                bulletPool.releaseObject(bullets[i]); //  回收子弹
                bullets.splice(i, 1);
                i--;
            }
        }

        //  更新敌人位置
        for (let i = 0; i < enemies.length; i++) {
            enemies[i].update();
            if (enemies[i].y > canvas.height) {
                if (difficultyLevel >= 2) {
                    score -= 10; // 难度 2 及以上：敌人触底扣分
                    if (score < 0) {
                        score = 0; // 分数不为负
                        // setGameState(GameState.GAME_OVER); // 取消直接Game Over
                    }
                }
                enemyPool.releaseObject(enemies[i]); //  回收敌机
                enemies.splice(i, 1); //  移除飞出屏幕的敌人
                i--;
            }
        }

        // 敌机射击逻辑
        const currentTime = Date.now();
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            if (currentTime - enemy.lastShotTime > enemy.shotInterval) {
                enemyShoot(enemy);
                enemy.lastShotTime = currentTime; // 更新敌机上次射击时间
            }
        }

        // 更新敌方子弹位置
        for (let i = 0; i < enemyBullets.length; i++) {
            enemyBullets[i].update();
            if (enemyBullets[i].y > canvas.height) {
                enemyBulletPool.releaseObject(enemyBullets[i]); // 回收敌方子弹
                enemyBullets.splice(i, 1);
                i--;
            }
        }

        // 更新能量宝箱位置并处理边界消失
        for (let i = 0; i < powerUps.length; i++) {
            powerUps[i].update();

            // 边界检测，碰到边界时消失
            if (
                powerUps[i].x < 0 ||
                powerUps[i].x > canvas.width - powerUps[i].width ||
                powerUps[i].y < 0 ||
                powerUps[i].y > canvas.height - powerUps[i].height
            ) {
                powerUpPool.releaseObject(powerUps[i]); // 回收宝箱
                powerUps.splice(i, 1);
                i--;
            }
        }


       // 玩家与敌人碰撞检测
        if (difficultyLevel >= 2) {
            for (let i = 0; i < enemies.length; i++) {
                const enemy = enemies[i];
                if (
                    player.x < enemy.x + enemy.width &&
                    player.x + player.width > enemy.x &&
                    player.y < enemy.y + enemy.height &&
                    player.y + player.height > enemy.y
                ) {
                    if (player.takeDamage()) { // 扣除生命值
                        updateHealth(player.health, player.maxHealth);
                        enemyPool.releaseObject(enemy); // 回收敌机
                        enemies.splice(i, 1); // 移除敌人
                        i--; // 修正索引
                        if (player.health <= 0) {
                            setGameState(GameState.GAME_OVER);
                            console.log('Game Over - 玩家与敌人碰撞');
                        }
                    }
                }
            }
        }

        //  子弹碰撞检测
        for (let i = 0; i < bullets.length; i++) {
            for (let j = 0; j < enemies.length; j++) {
                const bullet = bullets[i];
                const enemy = enemies[j];

                //  简单的矩形碰撞检测
                if (
                    bullet.x < enemy.x + enemy.width &&
                    bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height &&
                    bullet.y + bullet.height > enemy.y
                ) {
                    bulletPool.releaseObject(bullet); // 回收子弹
                    bullets.splice(i, 1); // 移除子弹
                    enemy.takeDamage(1); // 敌人生命值减 1
                    if (enemy.health <= 0) { // 检查敌人是否死亡
                        enemyPool.releaseObject(enemy); //  回收敌机
                        enemies.splice(j, 1); // 移除敌人
                        if (enemy.width > 30) { // 大型敌机
                            updateScore(30); // 击中大型敌机得分
                        } else {
                            updateScore(10); // 击中普通敌机得分
                        }
                    }
                    i--; // 修正索引
                    break; // 一个子弹只击中一个敌人
                }
            }
        }

        // 敌方子弹与玩家碰撞检测
        for (let i = 0; i < enemyBullets.length; i++) {
            const enemyBullet = enemyBullets[i];
            if (
                player.x < enemyBullet.x + enemyBullet.width &&
                player.x + player.width > enemyBullet.x &&
                player.y < enemyBullet.y + enemyBullet.height &&
                player.y + enemyBullet.height > player.y
            ) {
                if (player.takeDamage()) { // 扣除生命值
                    updateHealth(player.health, player.maxHealth);
                    enemyBulletPool.releaseObject(enemyBullet); // 回收敌方子弹
                    enemyBullets.splice(i, 1); // 移除敌方子弹
                    i--; // 修正索引
                    if (player.health <= 0) {
                        setGameState(GameState.GAME_OVER);
                        console.log('Game Over - 敌方子弹击中玩家');
                    }
                }
            }
        }

        // 玩家与能量宝箱碰撞检测
        for (let i = 0; i < powerUps.length; i++) {
            const powerUp = powerUps[i];
            if (
                player.x < powerUp.x + powerUp.width &&
                player.x + player.width > powerUp.x &&
                player.y < powerUp.y + powerUp.height &&
                player.y + powerUp.height > player.y
            ) {
                player.heal(); // 恢复生命值
                updateHealth(player.health, player.maxHealth);
                powerUpPool.releaseObject(powerUp); // 回收宝箱
                powerUps.splice(i, 1);
                i--;
            }
        }
    } else if (gameState === GameState.GAME_OVER) {
        enemies.length = 0;
        if (enemySpawnIntervalId) {
            clearInterval(enemySpawnIntervalId);
            enemySpawnIntervalId = null;
        }
        soundManager.stopSound('bullet'); // 游戏结束时停止子弹音效
    }
}

// Function to trigger level up effect (sound and confetti)
function triggerLevelUpEffectAction() {
    // Play cheering sound
    soundManager.pauseAllSounds('cheer'); // Pause other sounds（修正方法名）
    soundManager.playSound('cheer');

    // 显示晋级提示文本
    const achievementLevel = getAchievementLevel();
    const levelUpText = document.createElement('div');
    levelUpText.textContent = `晋级！新成就：${achievementLevel}`;
    levelUpText.style.position = 'fixed';
    levelUpText.style.top = '40%';
    levelUpText.style.left = '50%';
    levelUpText.style.transform = 'translate(-50%, -50%)';
    levelUpText.style.fontSize = '48px';
    levelUpText.style.fontWeight = 'bold';
    levelUpText.style.color = '#ff6600';
    levelUpText.style.background = 'rgba(255,255,255,0.9)';
    levelUpText.style.padding = '30px 60px';
    levelUpText.style.borderRadius = '20px';
    levelUpText.style.zIndex = '2000';
    levelUpText.style.boxShadow = '0 4px 24px rgba(0,0,0,0.2)';
    document.body.appendChild(levelUpText);
    setTimeout(() => {
        levelUpText.remove();
    }, 3000);

    // Create and display confetti
    const confettiContainer = document.createElement('div');
    confettiContainer.classList.add('confetti-container');
    document.body.appendChild(confettiContainer);

    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const numberOfConfetti = 100;

    for (let i = 0; i < numberOfConfetti; i++) {
        const confettiPiece = document.createElement('div');
        confettiPiece.classList.add('confetti-piece');
        confettiPiece.style.left = `${Math.random() * 100}%`;
        confettiPiece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confettiPiece.style.animationDuration = `${Math.random() * 2 + 2}s`; // 2 to 4 seconds
        confettiPiece.style.animationDelay = `${Math.random() * 3}s`; // 0 to 3 seconds
        confettiContainer.appendChild(confettiPiece);
    }

    // Remove confetti after a few seconds
    setTimeout(() => {
        confettiContainer.remove();
        soundManager.resumeAllSounds(); // Resume paused sounds
    }, 5000); // Remove after 5 seconds
}
window.triggerLevelUpEffectAction = triggerLevelUpEffectAction;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gameState = getGameState();

    if (gameState === GameState.MENU) {
        //  绘制菜单
        ctx.fillStyle = 'black';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('飞机大战', canvas.width / 2, canvas.height / 2 - 50);

        ctx.font = '20px Arial';
        ctx.fillText('按空格键开始', canvas.width / 2, canvas.height / 2 + 60);
        ctx.textAlign = 'start'; //  恢复默认对齐方式
        // 显示成就徽章（青铜）
        if (achievementBadgeElement) {
            achievementBadgeElement.textContent = '成就: ' + AchievementLevels.BRONZE;
            achievementBadgeElement.style.backgroundColor = '#cd7f32';
        }
    } else if (gameState === GameState.PLAYING) {
        // 绘制游戏元素
        // 绘制玩家飞机
        player.draw(ctx);

        //  绘制子弹
        ctx.fillStyle = 'blue';
        for (let i = 0; i < bullets.length; i++) {
            bullets[i].draw(ctx);
        }

        //  绘制敌人
        ctx.fillStyle = 'green';
        for (let i = 0; i < enemies.length; i++) {
            enemies[i].draw(ctx);
        }

        // 绘制敌方子弹
        ctx.fillStyle = 'orange'; // 敌方子弹颜色
        for (let i = 0; i < enemyBullets.length; i++) {
            enemyBullets[i].draw(ctx);
        }

        // 绘制能量宝箱
        ctx.fillStyle = 'purple'; // 宝箱颜色
        for (let i = 0; i < powerUps.length; i++) {
            ctx.fillRect(powerUps[i].x, powerUps[i].y, powerUps[i].width, powerUps[i].height);
        }


        //  显示得分
        ctx.fillStyle = 'black';
        //  显示得分
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText('Score: ' + getPlayerScore(), 10, 20); //  在左上角显示得分

        // Update achievement badge display
        if (achievementBadgeElement) {
            achievementBadgeElement.textContent = '成就: ' + getAchievementLevel();
            // Optional: Change badge color based on level
            switch (getAchievementLevel()) {
                case AchievementLevels.BRONZE:
                    achievementBadgeElement.style.backgroundColor = '#cd7f32'; // Bronze color
                    break;
                case AchievementLevels.SILVER:
                    achievementBadgeElement.style.backgroundColor = '#c0c0c0'; // Silver color
                    break;
                case AchievementLevels.GOLD:
                    achievementBadgeElement.style.backgroundColor = '#ffd700'; // Gold color
                    break;
                case AchievementLevels.PLATINUM:
                    achievementBadgeElement.style.backgroundColor = '#e5e4e2'; // Platinum color
                    break;
                case AchievementLevels.DIAMOND:
                    achievementBadgeElement.style.backgroundColor = '#b9f2ff'; // Diamond color
                    break;
                case AchievementLevels.SUPER_DIAMOND:
                    achievementBadgeElement.style.backgroundColor = '#00ffff'; // Cyan/Super Diamond color
                    break;
                default:
                    achievementBadgeElement.style.backgroundColor = '#ffcc00'; // Default
            }
        }

    } else if (gameState === GameState.GAME_OVER) {
        //  绘制 Game Over 画面
        ctx.fillStyle = 'black';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        if (getAchievementLevel() === AchievementLevels.SUPER_DIAMOND) {
            ctx.fillText('🏆 超级钻石大奖杯！', canvas.width / 2, canvas.height / 2 - 80);
            ctx.font = '32px Arial';
            ctx.fillText('恭喜你达成最高成就！', canvas.width / 2, canvas.height / 2 - 30);
            ctx.font = '20px Arial';
            ctx.fillText('你的得分: ' + getPlayerScore(), canvas.width / 2, canvas.height / 2 + 10);
            ctx.fillText('按空格键重新开始', canvas.width / 2, canvas.height / 2 + 50);
            ctx.textAlign = 'start';
            // 撒花和欢呼声只播放一次
            if (window._superDiamondEffectShown !== true) {
                window._superDiamondEffectShown = true;
                if (typeof soundManager !== 'undefined') {
                    soundManager.pauseAllSounds('cheer');
                    soundManager.playSound('cheer');
                }
                // 撒花
                const confettiContainer = document.createElement('div');
                confettiContainer.classList.add('confetti-container');
                document.body.appendChild(confettiContainer);
                const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
                const numberOfConfetti = 150;
                for (let i = 0; i < numberOfConfetti; i++) {
                    const confettiPiece = document.createElement('div');
                    confettiPiece.classList.add('confetti-piece');
                    confettiPiece.style.left = `${Math.random() * 100}%`;
                    confettiPiece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                    confettiPiece.style.animationDuration = `${Math.random() * 2 + 2}s`;
                    confettiPiece.style.animationDelay = `${Math.random() * 3}s`;
                    confettiContainer.appendChild(confettiPiece);
                }
                setTimeout(() => {
                    confettiContainer.remove();
                    if (typeof soundManager !== 'undefined') soundManager.resumeAllSounds();
                }, 6000);
            }
        } else {
            ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 50);
            ctx.font = '20px Arial';
            ctx.fillText('你的得分: ' + score, canvas.width / 2, canvas.height / 2);
            ctx.fillText('按空格键重新开始', canvas.width / 2, canvas.height / 2 + 30);
            ctx.textAlign = 'start';
        }
    }

    // 血条右侧显示数值
    if (healthFill && player) {
        let healthValue = document.getElementById('health-value');
        if (!healthValue) {
            healthValue = document.createElement('span');
            healthValue.id = 'health-value';
            healthValue.style.marginLeft = '8px';
            healthFill.parentNode.parentNode.appendChild(healthValue);
        }
        healthValue.textContent = `${player.health} / ${player.maxHealth}`;
    }
}

// 敌机射击函数
function enemyShoot(enemy) {
    // 简单模式1颗，中等模式减少为1颗，困难模式减少为1颗（原本2和3）
    let bulletCount = 1;
    let angleStep = 0;
    if (difficultyLevel === 3) {
        bulletCount = 1; // 困难模式由2颗减少为1颗
        angleStep = 0;
    } else if (difficultyLevel === 2) {
        bulletCount = 1; // 中等模式由1颗减少为1颗（如需2颗请改2）
        angleStep = 0;
    } else {
        bulletCount = 1; // 简单模式保持1颗
        angleStep = 0;
    }
    const baseAngle = 90; // 向下
    for (let i = 0; i < bulletCount; i++) {
        const bullet = enemyBulletPool.getObject();
        if (bullet) {
            let angle = baseAngle;
            if (bulletCount > 1) {
                angle = baseAngle - angleStep / 2 + i * angleStep;
            }
            const rad = angle * Math.PI / 180;
            bullet.x = enemy.x + enemy.width / 2 - bullet.width / 2;
            bullet.y = enemy.y + enemy.height;
            bullet.speed = 5;
            bullet.speedX = bullet.speed * Math.cos(rad);
            bullet.speedY = bullet.speed * Math.sin(rad);
            enemyBullets.push(bullet);
        }
    }
}


function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function shoot() {
    const inputState = getInputState(); // Get current input state
    if (!inputState.isShooting) { // Only shoot if the shooting input is active
        return;
    }

    const currentTime = Date.now();
    if (currentTime - lastShotTime > shotInterval) {
        // Play bullet sound if not already playing
        if (!soundManager.playingSounds['bullet']) {
            soundManager.playSound('bullet');
        }
        const numberOfBullets = 5; // 发射 5 颗子弹
        const angleRange = 90; // 射击角度范围
        const startAngle = 90 - angleRange / 2; // 起始角度 (向上为 90 度)
        const angleStep = angleRange / (numberOfBullets - 1); // 角度步长
        const bulletSpeed = 10; // 子弹基础速度

        for (let i = 0; i < numberOfBullets; i++) {
            const bullet = bulletPool.getObject();
            if (bullet) {
                const angle = startAngle + i * angleStep;
                const angleRad = (angle * Math.PI) / 180;

                bullet.x = player.x + 10;
                bullet.y = player.y - 10;
                bullet.speedX = bulletSpeed * Math.cos(angleRad);
                bullet.speedY = -bulletSpeed * Math.sin(angleRad); // Y轴向上为负

                // 添加随机延迟
                const randomDelay = Math.random() * (shotInterval / numberOfBullets);
                setTimeout(() => {
                    bullets.push(bullet);
                }, randomDelay);
            } else {
                // 如果子弹池容量不足，停止发射
                break;
            }
        }
        lastShotTime = currentTime; // 更新上次射击时间
    }
}

document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('gameCanvas');
    healthFill = document.getElementById('health-fill');
    achievementBadgeElement = document.getElementById('achievement-badge'); // Get the achievement badge element
    ctx = canvas.getContext('2d');
    difficultySelect = document.getElementById('difficulty');

    // 监听下拉框变化事件
    difficultySelect.addEventListener('change', function() {
        difficultyLevel = parseInt(this.value);
        console.log('难度设置为: ', difficultyLevel);
        this.blur();
    });

    // 创建 Player 实例
    player = new Player(canvas.width, canvas.height);

    // Initialize object pools that depend on canvas dimensions
    enemyPool = new ObjectPool(50, () => new Enemy(canvas.width, canvas.height));
    powerUpPool = new ObjectPool(10, () => new PowerUp(canvas.width, canvas.height));

    setupInputListeners(); //  设置输入监听器
    setEnemySpawnInterval(); //  设置敌人生成间隔
    gameLoop(); // Start the game loop
});

// 监听空格重置超级钻石特效标志
document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        if (getGameState() === GameState.MENU) {
            window._superDiamondEffectShown = false;
        } else if (getGameState() === GameState.GAME_OVER) {
            // 彻底重置所有状态并重新开始
            window._superDiamondEffectShown = false;
            resetGame();
            setEnemySpawnInterval(); // 关键：重开时重启敌机生成定时器
            setGameState(GameState.MENU);
        }
    }
});
