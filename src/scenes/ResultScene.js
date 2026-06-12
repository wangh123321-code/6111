import Phaser from 'phaser';
import { RadarChart, analyzePerformance, generateSuggestions } from '../utils/RadarChart.js';
import { getLevelConfig, SPIN_NAMES } from '../config/levels.js';

export class ResultScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ResultScene' });
    }

    init(data) {
        this.levelId = data.levelId || 1;
        this.totalScore = data.totalScore || 0;
        this.passingScore = data.passingScore || 15;
        this.ballResults = data.ballResults || [];
        this.passed = data.passed || false;
        this.levelConfig = getLevelConfig(this.levelId);
    }

    create() {
        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;

        const bgGradient = this.add.graphics();
        bgGradient.fillGradientStyle(0x1a1a2e, 0x0f3460, 0x1a1a2e, 0x0f3460, 1);
        bgGradient.fillRect(0, 0, this.width, this.height);

        this.analysis = analyzePerformance(this.ballResults, this.levelConfig);
        this.suggestions = generateSuggestions(this.analysis);

        this.createHeader();
        this.createScoreDisplay();
        this.createRadarChart();
        this.createSuggestionsPanel();
        this.createButtons();
        this.createBallDetails();

        this.animateElements();
    }

    createHeader() {
        const title = this.add.text(this.width / 2, 50, this.levelConfig.name, {
            fontFamily: 'Microsoft YaHei',
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0);

        const subtitle = this.add.text(this.width / 2, 85, '训练结果分析', {
            fontFamily: 'Microsoft YaHei',
            fontSize: '18px',
            color: '#a0aec0'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: [title, subtitle],
            alpha: 1,
            duration: 500,
            ease: 'Power2.out'
        });
    }

    createScoreDisplay() {
        const panelWidth = 300;
        const panelHeight = 120;
        const x = this.width / 2;
        const y = 160;

        const panel = this.add.graphics();
        panel.fillStyle(0x2d3748, 0.9);
        panel.lineStyle(2, this.passed ? 0x68d391 : 0xe53e3e, 0.8);
        panel.fillRoundedRect(x - panelWidth / 2, y - panelHeight / 2, panelWidth, panelHeight, 15);
        panel.strokeRoundedRect(x - panelWidth / 2, y - panelHeight / 2, panelWidth, panelHeight, 15);

        const scoreLabel = this.add.text(x, y - 25, '总得分', {
            fontFamily: 'Microsoft YaHei',
            fontSize: '16px',
            color: '#a0aec0'
        }).setOrigin(0.5).setAlpha(0);

        const scoreValue = this.add.text(x, y + 5,
            `${this.totalScore} / ${this.analysis.maxScore || 20}`, {
            fontFamily: 'Microsoft YaHei',
            fontSize: '36px',
            color: this.passed ? '#68d391' : '#e53e3e',
            fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0).setScale(0.5);

        const statusText = this.add.text(x, y + 40,
            this.passed ? '🎉 恭喜过关！' : `💪 继续努力，还差 ${this.passingScore - this.totalScore} 分`, {
            fontFamily: 'Microsoft YaHei',
            fontSize: '14px',
            color: this.passed ? '#68d391' : '#ecc94b'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: [scoreLabel, statusText],
            alpha: 1,
            duration: 500,
            delay: 300,
            ease: 'Power2.out'
        });

        this.tweens.add({
            targets: scoreValue,
            alpha: 1,
            scale: 1,
            duration: 600,
            delay: 400,
            ease: 'Back.out'
        });

        const passingInfo = this.add.text(x, y + panelHeight / 2 + 20,
            `过关分数: ${this.passingScore}`, {
            fontFamily: 'Microsoft YaHei',
            fontSize: '13px',
            color: '#718096'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: passingInfo,
            alpha: 1,
            duration: 500,
            delay: 600
        });
    }

    createRadarChart() {
        const chartX = 80;
        const chartY = 220;
        const chartSize = 280;

        const chartTitle = this.add.text(chartX + chartSize / 2, chartY - 10, '能力雷达图', {
            fontFamily: 'Microsoft YaHei',
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: chartTitle,
            alpha: 1,
            duration: 500,
            delay: 500
        });

        const axesData = [
            { name: '旋转准确率', key: 'spinAccuracy' },
            { name: '落点准确率', key: 'placementAccuracy' },
            { name: '稳定性', key: 'consistency' },
            { name: '速度控制', key: 'speedControl' },
            { name: '旋转强度', key: 'intensity' }
        ];

        const values = axesData.map(axis => this.analysis[axis.key] || 0);

        this.radarChart = new RadarChart(this, chartX, chartY, chartSize);
        const container = this.radarChart.create(
            axesData,
            [0, 0, 0, 0, 0],
            {
                grid: 0x4a5568,
                data: 0x68d391,
                dataFill: 0x68d391,
                label: '#e2e8f0'
            }
        );

        container.setAlpha(0);

        this.tweens.add({
            targets: container,
            alpha: 1,
            duration: 600,
            delay: 600,
            ease: 'Power2.out',
            onComplete: () => {
                this.time.delayedCall(300, () => {
                    this.radarChart.animateToValues(values, 1200);
                });
            }
        });
    }

    createSuggestionsPanel() {
        const panelX = 400;
        const panelY = 220;
        const panelWidth = this.width - panelX - 40;
        const panelHeight = 380;

        const panelBg = this.add.graphics();
        panelBg.fillStyle(0x2d3748, 0.9);
        panelBg.lineStyle(1, 0x4a5568, 0.8);
        panelBg.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 15);
        panelBg.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 15);

        const title = this.add.text(panelX + panelWidth / 2, panelY + 25, '改进建议', {
            fontFamily: 'Microsoft YaHei',
            fontSize: '18px',
            color: '#68d391',
            fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: title,
            alpha: 1,
            duration: 500,
            delay: 700
        });

        const suggestionsContainer = this.add.container(panelX + 20, panelY + 60);
        let currentY = 0;

        this.suggestions.forEach((suggestion, index) => {
            const itemBg = this.add.graphics();
            itemBg.fillStyle(0x3d4a5c, 0.6);
            itemBg.fillRoundedRect(0, currentY, panelWidth - 40, 60, 8);

            const icon = suggestion.title === '总体评价' ? '📊' :
                suggestion.title === '重点改进' ? '🎯' :
                suggestion.title === '次要改进' ? '💡' :
                suggestion.title === '强项' ? '👍' :
                suggestion.title === '待加强' ? '🔧' : '📝';

            const iconText = this.add.text(15, currentY + 12, icon, {
                fontSize: '18px'
            });

            const titleText = this.add.text(45, currentY + 10, suggestion.title, {
                fontFamily: 'Microsoft YaHei',
                fontSize: '14px',
                color: '#e2e8f0',
                fontStyle: 'bold'
            });

            const contentText = this.add.text(45, currentY + 30, suggestion.content, {
                fontFamily: 'Microsoft YaHei',
                fontSize: '12px',
                color: '#a0aec0',
                wordWrap: { width: panelWidth - 100 }
            });

            suggestionsContainer.add([itemBg, iconText, titleText, contentText]);

            currentY += 70;
        });

        suggestionsContainer.setAlpha(0);

        this.tweens.add({
            targets: suggestionsContainer,
            alpha: 1,
            duration: 600,
            delay: 900,
            ease: 'Power2.out'
        });
    }

    createButtons() {
        const buttonY = this.height - 60;
        const buttonWidth = 160;
        const buttonHeight = 45;
        const spacing = 30;

        const totalWidth = buttonWidth * 2 + spacing;
        const startX = (this.width - totalWidth) / 2 + buttonWidth / 2;

        const retryButton = this.createButton(
            startX, buttonY, buttonWidth, buttonHeight,
            '重新练习', '#ecc94b', '#d69e2e',
            () => {
                this.scene.start('GameScene', { levelId: this.levelId });
            }
        );

        const nextLevel = this.levelId < 3;
        const nextButtonText = nextLevel ? '下一关' : '返回菜单';
        const nextButtonAction = nextLevel ?
            () => this.scene.start('GameScene', { levelId: this.levelId + 1 }) :
            () => this.scene.start('MenuScene');

        const nextButton = this.createButton(
            startX + buttonWidth + spacing, buttonY, buttonWidth, buttonHeight,
            nextButtonText, '#48bb78', '#38a169',
            nextButtonAction
        );

        const menuButton = this.createButton(
            this.width - 100, buttonY, 120, 35,
            '返回菜单', '#4a5568', '#2d3748',
            () => this.scene.start('MenuScene'),
            12
        );

        [retryButton, nextButton, menuButton].forEach((btn, i) => {
            btn.container.setAlpha(0).setY(buttonY + 50);
            this.tweens.add({
                targets: btn.container,
                alpha: 1,
                y: buttonY,
                duration: 500,
                delay: 1200 + i * 100,
                ease: 'Back.out'
            });
        });
    }

    createButton(x, y, width, height, text, color, hoverColor, onClick, fontSize = 16) {
        const container = this.add.container(x, y);

        const bg = this.add.graphics();
        bg.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 1);
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);

        const textObj = this.add.text(0, 0, text, {
            fontFamily: 'Microsoft YaHei',
            fontSize: `${fontSize}px`,
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        container.add([bg, textObj]);
        container.setSize(width, height);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(Phaser.Display.Color.HexStringToColor(hoverColor).color, 1);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
        });

        container.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 1);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
        });

        container.on('pointerdown', onClick);

        return { container, bg, text: textObj };
    }

    createBallDetails() {
        const panelX = 80;
        const panelY = 520;
        const panelWidth = 280;
        const panelHeight = 130;

        const panelBg = this.add.graphics();
        panelBg.fillStyle(0x2d3748, 0.9);
        panelBg.lineStyle(1, 0x4a5568, 0.8);
        panelBg.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 10);
        panelBg.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 10);

        const title = this.add.text(panelX + panelWidth / 2, panelY + 20, '每球详情', {
            fontFamily: 'Microsoft YaHei',
            fontSize: '14px',
            color: '#e2e8f0',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const statsContainer = this.add.container(panelX + 15, panelY + 45);

        const spinCorrect = this.ballResults.filter(r => r.spinCorrect).length;
        const placeCorrect = this.ballResults.filter(r => r.placementCorrect).length;
        const perfectCount = this.ballResults.filter(r => r.score === 2).length;

        const stats = [
            { label: '旋转正确', value: `${spinCorrect}/${this.ballResults.length}`, color: '#68d391' },
            { label: '落点正确', value: `${placeCorrect}/${this.ballResults.length}`, color: '#63b3ed' },
            { label: '完美发球', value: `${perfectCount}个`, color: '#f6e05e' }
        ];

        stats.forEach((stat, index) => {
            const x = index * 90;

            const valueText = this.add.text(x + 40, 0, stat.value, {
                fontFamily: 'Microsoft YaHei',
                fontSize: '18px',
                color: stat.color,
                fontStyle: 'bold'
            }).setOrigin(0.5);

            const labelText = this.add.text(x + 40, 25, stat.label, {
                fontFamily: 'Microsoft YaHei',
                fontSize: '11px',
                color: '#a0aec0'
            }).setOrigin(0.5);

            statsContainer.add([valueText, labelText]);
        });

        const ballNumbers = this.add.container(panelX + 15, panelY + 95);

        this.ballResults.forEach((result, index) => {
            const x = index * 25;
            const color = result.score === 2 ? 0x68d391 :
                result.score === 1 ? 0xecc94b : 0xe53e3e;

            const circle = this.add.circle(x + 10, 0, 8, color, 0.8);
            circle.setStrokeStyle(1, 0xffffff, 0.5);

            const numText = this.add.text(x + 10, 0, `${index + 1}`, {
                fontFamily: 'Microsoft YaHei',
                fontSize: '10px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            ballNumbers.add([circle, numText]);
        });

        [panelBg, title, statsContainer, ballNumbers].forEach((obj, i) => {
            if (obj.setAlpha) {
                obj.setAlpha(0);
                this.tweens.add({
                    targets: obj,
                    alpha: 1,
                    duration: 500,
                    delay: 1000 + i * 100
                });
            }
        });
    }

    animateElements() {
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }
}
