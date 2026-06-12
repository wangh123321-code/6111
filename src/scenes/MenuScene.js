import Phaser from 'phaser';
import { LEVELS, SPIN_NAMES, SPIN_ICONS } from '../config/levels.js';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const bgGradient = this.add.graphics();
        bgGradient.fillGradientStyle(0x1a1a2e, 0x16213e, 0x1a1a2e, 0x16213e, 1);
        bgGradient.fillRect(0, 0, width, height);

        const title = this.add.text(width / 2, 80, '乒乓球发球练习', {
            fontFamily: 'Microsoft YaHei',
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const subtitle = this.add.text(width / 2, 130, '在家也能练发球，省钱又高效', {
            fontFamily: 'Microsoft YaHei',
            fontSize: '18px',
            color: '#a0aec0'
        }).setOrigin(0.5);

        this.createLevelCards(width, height);

        const instructionTitle = this.add.text(width / 2, height - 140, '操作说明', {
            fontFamily: 'Microsoft YaHei',
            fontSize: '18px',
            color: '#e2e8f0',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const instruction = this.add.text(width / 2, height - 100,
            '从球的位置滑动发球 · 滑动方向决定落点 · 滑动速度决定球速 · 手腕抖动制造旋转', {
            fontFamily: 'Microsoft YaHei',
            fontSize: '14px',
            color: '#a0aec0',
            align: 'center',
            wordWrap: { width: width - 100 }
        }).setOrigin(0.5);
    }

    createLevelCards(width, height) {
        const cardWidth = 300;
        const cardHeight = 280;
        const spacing = 40;
        const startX = (width - (cardWidth * 3 + spacing * 2)) / 2 + cardWidth / 2;
        const startY = height / 2 - 20;

        LEVELS.forEach((level, index) => {
            const x = startX + index * (cardWidth + spacing);
            const y = startY;

            const cardBg = this.add.graphics();
            cardBg.fillStyle(0x2d3748, 0.9);
            cardBg.lineStyle(2, 0x4a5568, 1);
            cardBg.fillRoundedRect(x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight, 15);
            cardBg.strokeRoundedRect(x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight, 15);

            const levelNumber = this.add.text(x, y - cardHeight / 2 + 40, `第 ${level.id} 关`, {
                fontFamily: 'Microsoft YaHei',
                fontSize: '16px',
                color: '#68d391'
            }).setOrigin(0.5);

            const levelName = this.add.text(x, y - cardHeight / 2 + 70, level.name.split('：')[1], {
                fontFamily: 'Microsoft YaHei',
                fontSize: '24px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            const description = this.add.text(x, y - cardHeight / 2 + 105, level.description, {
                fontFamily: 'Microsoft YaHei',
                fontSize: '12px',
                color: '#a0aec0',
                align: 'center',
                wordWrap: { width: cardWidth - 30 }
            }).setOrigin(0.5, 0);

            const spinIcons = this.createSpinIcons(x, y + 10, level.allowedSpins.slice(0, 5));

            const ballsText = this.add.text(x, y + cardHeight / 2 - 50,
                `${level.ballsPerLevel} 球 · ${level.passingScore} 分过关`, {
                fontFamily: 'Microsoft YaHei',
                fontSize: '13px',
                color: '#a0aec0'
            }).setOrigin(0.5);

            const buttonBg = this.add.graphics();
            buttonBg.fillStyle(0x48bb78, 1);
            buttonBg.fillRoundedRect(x - 80, y + cardHeight / 2 - 35, 160, 40, 8);

            const buttonText = this.add.text(x, y + cardHeight / 2 - 15, '开始练习', {
                fontFamily: 'Microsoft YaHei',
                fontSize: '16px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            const hitZone = this.add.zone(x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight)
                .setOrigin(0)
                .setInteractive({ useHandCursor: true });

            hitZone.on('pointerover', () => {
                buttonBg.clear();
                buttonBg.fillStyle(0x38a169, 1);
                buttonBg.fillRoundedRect(x - 80, y + cardHeight / 2 - 35, 160, 40, 8);
                cardBg.clear();
                cardBg.fillStyle(0x3d4a5c, 0.95);
                cardBg.lineStyle(2, 0x68d391, 1);
                cardBg.fillRoundedRect(x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight, 15);
                cardBg.strokeRoundedRect(x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight, 15);
            });

            hitZone.on('pointerout', () => {
                buttonBg.clear();
                buttonBg.fillStyle(0x48bb78, 1);
                buttonBg.fillRoundedRect(x - 80, y + cardHeight / 2 - 35, 160, 40, 8);
                cardBg.clear();
                cardBg.fillStyle(0x2d3748, 0.9);
                cardBg.lineStyle(2, 0x4a5568, 1);
                cardBg.fillRoundedRect(x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight, 15);
                cardBg.strokeRoundedRect(x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight, 15);
            });

            hitZone.on('pointerdown', () => {
                this.scene.start('GameScene', { levelId: level.id });
            });
        });
    }

    createSpinIcons(centerX, centerY, spins) {
        const container = this.add.container(centerX, centerY);
        const spacing = 35;
        const startX = -(spins.length - 1) * spacing / 2;

        spins.forEach((spin, index) => {
            const x = startX + index * spacing;

            const bg = this.add.circle(x, 0, 18, 0x4a5568, 0.8);
            container.add(bg);

            const icon = this.add.text(x, 0, SPIN_ICONS[spin] || '●', {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            container.add(icon);

            const name = this.add.text(x, 28, SPIN_NAMES[spin] || '无', {
                fontFamily: 'Microsoft YaHei',
                fontSize: '10px',
                color: '#a0aec0'
            }).setOrigin(0.5);
            container.add(name);
        });

        return container;
    }
}
