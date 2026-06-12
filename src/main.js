import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { ResultScene } from './scenes/ResultScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 700,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 800,
            height: 600
        },
        max: {
            width: 1600,
            height: 900
        }
    },
    scene: [BootScene, MenuScene, GameScene, ResultScene],
    input: {
        activePointers: 2
    },
    render: {
        pixelArt: false,
        antialias: true,
        roundPixels: false
    }
};

const game = new Phaser.Game(config);

window.__phaserGame__ = game;

window.addEventListener('resize', () => {
    game.scale.refresh();
});
