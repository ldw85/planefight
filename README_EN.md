# Plane Fight Game

This is a simple plane shooting game built with HTML, CSS, and JavaScript, served via a Node.js/Express server.

Online Demo: [planefight-ch7rt5wi3-ldw85s-projects.vercel.app](https://planefight-ch7rt5wi3-ldw85s-projects.vercel.app/)

Game picture: 
![game picture](./image/gamesuc.png)
![game picture](./image/vehicle.png)

## Features

- Control a plane that can move freely within the screen boundaries.
- Shoot **spread bullets** (4-5 at a time) with random firing intervals.
- Enemies spawn from the top and move downward, with speed and quantity increasing by difficulty.
- Two types of enemies: normal and large, with large enemies appearing more often at higher difficulties.
- Enemy planes can shoot bullets to threaten the player.
- Random power-up boxes appear; collecting them grants shield (shown as a halo), which can stack.
- When shield is active, collisions with enemies or enemy bullets only consume shield; with no shield, collisions end the game.
- Bullet-enemy collision detection; destroying enemies earns points.
- In medium/hard mode, enemies reaching the bottom deduct points; score below zero ends the game.
- Three game states: menu, playing, game over.
- Difficulty selection (easy, medium, hard) affects enemy spawn rate, speed, HP, etc.
- Object pools for bullets, enemies, enemy bullets, and power-ups for performance.

## Installation & Run

### 1. Clone the repository

```bash
git clone https://github.com/ldw85/planefight.git
cd planefight
```

### 2. Install dependencies

Make sure you have [Node.js](https://nodejs.org/) installed.

```bash
npm install
```

### 3. Start the server

```bash
npm start
```

By default, the server runs at [http://localhost:3000](http://localhost:3000).

### 4. Play the game

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
planefight/
├── image/                # Game image assets
│   ├── vehicle.png       # Player plane image
│   └── jet-plane.png     # Enemy plane image
├── public/               # Static assets (if any)
├── game.js               # Main game logic
├── player.js             # Player class
├── enemy.js              # Enemy class
├── input.js              # Input handling
├── gamestate.js          # Game state management
├── style.css             # Stylesheet
├── index.html            # Main HTML page
├── server.js             # Express server
├── package.json          # Project dependencies & scripts
└── README.md             # Project documentation
```

## Code Structure

1. **index.html**  
   - Defines the canvas and difficulty selector, loads all JS files.
2. **server.js**  
   - Serves static files via Express.
3. **game.js**  
   - Main game loop, object pools, enemy/power-up spawning, collision detection, state switching, etc.
4. **player.js / enemy.js**  
   - Player and enemy properties, rendering, and behaviors.
5. **input.js**  
   - Keyboard event listeners and input state management.
6. **gamestate.js**  
   - Game state definitions and management.

## Controls

- **Arrow keys / WASD**: Move the plane
- **Space**: Shoot
- **1/2/3**: Select difficulty
- **Collect power-ups**: Gain shield

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

Feel free to submit Issues or PRs if you have suggestions or questions!

1.  Online experience address: https://planefight-ch7rt5wi3-ldw85s-projects.vercel.app
2.  Interesting background: This is a game designed by a 6-year-old child and developed in dialogue with AI, with support from the father in the process. This is an example of a child learning AI programming. We will develop more games in the future.