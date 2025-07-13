class SoundManager {
    constructor() {
        this.sounds = {};
        this.playingSounds = {}; // 跟踪正在播放的声音
        this.masterVolume = 1.0;
    }

    /**
     * Loads a sound file.
     * @param {string} name - The name to refer to this sound by (e.g., 'bullet', 'plane').
     * @param {string} path - The path to the sound file (e.g., 'audio/bullet.wav').
     * @param {boolean} loop - Whether the sound should loop.
     */
    loadSound(name, src, loop = false) {
        const audio = new Audio(src);
        audio.loop = loop;
        audio.volume = 0.5; // 默认音量
        this.sounds[name] = audio;
        this.playingSounds[name] = false;

        // 当音频自然播放完成时
        audio.addEventListener('ended', () => {
            this.playingSounds[name] = false;
        });
    }

    /**
     * Plays a loaded sound.
     * @param {string} name - The name of the sound to play.
     * @param {number} volume - Optional volume (0.0 to 1.0).
     */
    playSound(name) {
        if (this.sounds[name]) {
            const sound = this.sounds[name];
            if (sound.paused) { // 只有在暂停状态时才重新播放
                sound.currentTime = 0;
                sound.play();
                this.playingSounds[name] = true;
            }
        }
    }

    /**
     * Stops a playing sound.
     * @param {string} name - The name of the sound to stop.
     */
    stopSound(name) {
        if (this.sounds[name]) {
            const sound = this.sounds[name];
            sound.pause();
            sound.currentTime = 0;
            this.playingSounds[name] = false;
        }
    }

    /**
     * Pauses all currently playing sounds except for a specified one.
     * @param {string} excludeName - The name of the sound to exclude from pausing.
     */
    pauseAllSounds(exceptSound) {
        for (const [name, sound] of Object.entries(this.sounds)) {
            if (name !== exceptSound && !sound.paused) {
                sound.pause();
                // 不改变playingSounds状态，因为这是临时暂停
            }
        }
    }

    /**
     * Resumes all previously paused sounds.
     */
    resumeAllSounds() {
        for (const [name, sound] of Object.entries(this.sounds)) {
            // 只恢复那些被标记为正在播放的声音
            if (this.playingSounds[name]) {
                sound.play();
            }
        }
    }

    setVolume(name, volume) {
        if (this.sounds[name]) {
            this.sounds[name].volume = volume * this.masterVolume;
        }
    }

    setMasterVolume(volume) {
        this.masterVolume = volume;
        // 更新所有声音的音量
        for (const sound of Object.values(this.sounds)) {
            sound.volume = sound.volume * this.masterVolume;
        }
    }
}
export const soundManager = new SoundManager();