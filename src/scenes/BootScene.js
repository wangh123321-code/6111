import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
    }

    create() {
        console.log('BootScene created, switching to MenuScene...');
        this.scene.start('MenuScene');
    }
}
