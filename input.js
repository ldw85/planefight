import { GameState, setGameState, getGameState } from './gamestate.js';
import { resetGame } from './game.js'; //  导入 resetGame 函数
import { soundManager } from './sound.js'; // 导入 soundManager

let inputState = {
    moveLeft: false,
    moveRight: false,
    moveUp: false,
    moveDown: false,
    isShooting: false,
};

export function setupInputListeners() {
    document.addEventListener('keydown', (e) => {
        if (getGameState() === GameState.MENU) {
             if (e.key === ' ') {
                setGameState(GameState.PLAYING); //  空格键开始游戏
                console.log('游戏开始');
                soundManager.playSound('plane'); // Play plane sound
            }
        } else if (getGameState() === GameState.PLAYING) {
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                inputState.moveLeft = true;
            } else if (e.key === 'ArrowRight' || e.key === 'd') {
                inputState.moveRight = true;
            } else if (e.key === 'ArrowUp' || e.key === 'w') {
                inputState.moveUp = true;
            } else if (e.key === 'ArrowDown' || e.key === 's') {
                inputState.moveDown = true;
            } else if (e.key === ' ') {
                inputState.isShooting = true;
            }
        } else if (getGameState() === GameState.GAME_OVER) {
            if (e.key === ' ') {
                resetGame(); //  重置游戏状态
                setGameState(GameState.MENU); //  切换到 MENU 状态
                console.log('重新开始');
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        if (getGameState() === GameState.PLAYING) {
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                inputState.moveLeft = false;
            } else if (e.key === 'ArrowRight' || e.key === 'd') {
                inputState.moveRight = false;
            } else if (e.key === 'ArrowUp' || e.key === 'w') {
                inputState.moveUp = false;
            } else if (e.key === 'ArrowDown' || e.key === 's') {
                inputState.moveDown = false;
            } else if (e.key === ' ') {
                inputState.isShooting = false;
                soundManager.stopSound('bullet'); // Stop bullet sound when spacebar is released
            }
        }
    });
}

export function getInputState() {
    return inputState;
}

//  重置输入状态
export function resetInputState() {
    inputState.moveLeft = false;
    inputState.moveRight = false;
    inputState.moveUp = false;
    inputState.moveDown = false;
    inputState.isShooting = false;
}
