export const GameState = {
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    GAME_OVER: 'GAME_OVER'
};

export const AchievementLevels = {
    BRONZE: '青铜',
    SILVER: '白银',
    GOLD: '黄金',
    PLATINUM: '铂金',
    DIAMOND: '钻石',
    SUPER_DIAMOND: '无上限超能钻石'
};

const AchievementThresholds = {
    [AchievementLevels.BRONZE]: 0,
    [AchievementLevels.SILVER]: 500,
    [AchievementLevels.GOLD]: 1000,
    [AchievementLevels.PLATINUM]: 2000,
    [AchievementLevels.DIAMOND]: 3000,
    [AchievementLevels.SUPER_DIAMOND]: 5000
};

let currentGameState = GameState.MENU;
let playerScore = 0;
let currentAchievementLevel = AchievementLevels.BRONZE;

export function setGameState(state) {
    currentGameState = state;
    console.log('Game State changed to:', currentGameState); //  方便调试
}

export function getGameState() {
    return currentGameState;
}

export function getPlayerScore() {
    return playerScore;
}

export function getAchievementLevel() {
    return currentAchievementLevel;
}

export function updateScore(score) {
    const previousScore = playerScore;
    playerScore += score;

    let newAchievementLevel = currentAchievementLevel;
    if (playerScore >= AchievementThresholds[AchievementLevels.SUPER_DIAMOND]) {
        newAchievementLevel = AchievementLevels.SUPER_DIAMOND;
    } else if (playerScore >= AchievementThresholds[AchievementLevels.DIAMOND]) {
        newAchievementLevel = AchievementLevels.DIAMOND;
    } else if (playerScore >= AchievementThresholds[AchievementLevels.PLATINUM]) {
        newAchievementLevel = AchievementLevels.PLATINUM;
    } else if (playerScore >= AchievementThresholds[AchievementLevels.GOLD]) {
        newAchievementLevel = AchievementLevels.GOLD;
    } else if (playerScore >= AchievementThresholds[AchievementLevels.SILVER]) {
        newAchievementLevel = AchievementLevels.SILVER;
    } else {
        newAchievementLevel = AchievementLevels.BRONZE;
    }

    if (newAchievementLevel !== currentAchievementLevel) {
        console.log(`Achievement level upgraded to: ${newAchievementLevel}`);
        currentAchievementLevel = newAchievementLevel;
        // Trigger cheering sound and confetti effect
        // These functions will be implemented in sound.js and game.js
        triggerLevelUpEffect();
        // 达到超级钻石级，直接结束游戏
        if (newAchievementLevel === AchievementLevels.SUPER_DIAMOND) {
            setGameState(GameState.GAME_OVER);
        }
    }
}

// Placeholder for the level up effect function
function triggerLevelUpEffect() {
    // 调用 game.js 中的 triggerLevelUpEffectAction 方法（如果已加载）
    if (typeof window !== 'undefined' && typeof window.triggerLevelUpEffectAction === 'function') {
        window.triggerLevelUpEffectAction();
    }
}

export function resetGameState() {
    currentGameState = GameState.MENU;
    playerScore = 0;
    currentAchievementLevel = AchievementLevels.BRONZE;
}
