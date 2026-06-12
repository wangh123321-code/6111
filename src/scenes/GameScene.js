import Phaser from 'phaser';
import { GestureRecognizer } from '../utils/GestureRecognizer.js';
import { BallPhysics } from '../utils/BallPhysics.js';
import {
    getLevelConfig,
    generateBallTarget,
    isSpinMatch,
    isZoneMatch,
    SPIN_NAMES,
    SPIN_ICONS,
    ZONE_NAMES
} from '../config/levels.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.levelId = data.levelId || 1;
        this.levelConfig = getLevelConfig(this.levelId);
    }

    create() {
        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;

        this.gestureRecognizer = new GestureRecognizer();
        this.ballPhysics = new BallPhysics({ scale: 1.5 });

        this.ballResults = [];
        this.currentBall = 0;
        this.totalScore = 0;
        this.currentTarget = null;
        this.lastGesture = null;
        this.ballLanded = false;

        this.createBackground();
        this.createTable();
        this.createUI();
        this.createBall();
        this.setupInput();
        this.resetBall();

        this.nextBall();
    }

    createBackground() {
        const bgGradient = this.add.graphics();
        bgGradient.fillGradientStyle(0x1a1a2e, 0x0f3460, 0x1a1a2e, 0x0f3460, 1);
        bgGradient.fillRect(0, 0, this.width, this.height);
    }

    createTable() {
        this.tableGraphics = this.add.graphics();
        this.targetGraphics = this.add.graphics();
        this.trajectoryGraphics = this.add.graphics();
        this.landingGraphics = this.add.graphics();
        this.gestureGraphics = this.add.graphics();

        this.cameraConfig = {
            centerX: this.width / 2,
            centerY: this.height / 2 + 50,
            vanishingY: this.height * 0.25,
            scaleFactor: 1.2,
            height: this.height
        };

        this.drawTable();
    }

    drawTable() {
        this.tableGraphics.clear();

        const { centerX, vanishingY, scaleFactor } = this.cameraConfig;
        const tableWidth = this.ballPhysics.tableWidth * 1.5;
        const tableLength = this.ballPhysics.tableLength * 1.2;

        const nearLeftX = centerX - tableWidth / 2;
        const nearRightX = centerX + tableWidth / 2;
        const nearY = this.height - 80;

        const farScale = 0.5;
        const farLeftX = centerX - (tableWidth / 2) * farScale;
        const farRightX = centerX + (tableWidth / 2) * farScale;
        const farY = vanishingY + 20;

        this.tableGraphics.fillStyle(0x1a472a, 0.9);
        this.tableGraphics.beginPath();
        this.tableGraphics.moveTo(nearLeftX, nearY);
        this.tableGraphics.lineTo(farLeftX, farY);
        this.tableGraphics.lineTo(farRightX, farY);
        this.tableGraphics.lineTo(nearRightX, nearY);
        this.tableGraphics.closePath();
        this.tableGraphics.fill();

        this.tableGraphics.lineStyle(3, 0xffffff, 1);
        this.tableGraphics.strokePath();

        this.tableGraphics.lineStyle(1, 0xffffff, 0.8);
        const centerFarX = centerX;
        const centerNearX = centerX;
        this.tableGraphics.lineBetween(centerFarX, farY, centerNearX, nearY);

        const halfLength = tableLength / 2;
        const backLineY = nearY - halfLength * scaleFactor * 0.7;
        const backLineLeftX = centerX - (tableWidth / 2) * 0.85;
        const backLineRightX = centerX + (tableWidth / 2) * 0.85;
        this.drawDashedLine(backLineLeftX, backLineY, backLineRightX, backLineY, 10, 10, 0xffffff, 0.5, 2);

        const netY = nearY - (tableLength / 2) * scaleFactor * 0.5;
        const netLeftX = centerX - (tableWidth / 2) * 0.7;
        const netRightX = centerX + (tableWidth / 2) * 0.7;

        this.tableGraphics.lineStyle(3, 0xffffff, 0.9);
        this.tableGraphics.lineBetween(netLeftX, netY - 5, netRightX, netY - 5);

        this.tableGraphics.lineStyle(1, 0xcccccc, 0.6);
        for (let i = 0; i <= 20; i++) {
            const t = i / 20;
            const x = netLeftX + (netRightX - netLeftX) * t;
            this.tableGraphics.lineBetween(x, netY - 5, x, netY + 5);
        }
    }

    createUI() {
        this.uiContainer = this.add.container(0, 0);

        const topBar = this.add.graphics();
        topBar.fillStyle(0x000000, 0.5);
        topBar.fillRect(0, 0, this.width, 60);
        this.uiContainer.add(topBar);

        this.levelText = this.add.text(20, 15, this.levelConfig.name, {
            fontFamily: 'Microsoft YaHei',
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        this.uiContainer.add(this.levelText);

        this.ballCountText = this.add.text(this.width / 2, 15, `球: 0/${this.levelConfig.ballsPerLevel}`, {
            fontFamily: 'Microsoft YaHei',
            fontSize: '16px',
            color: '#e2e8f0'
        }).setOrigin(0.5, 0);
        this.uiContainer.add(this.ballCountText);

        this.scoreText = this.add.text(this.width - 20, 15, '得分: 0', {
            fontFamily: 'Microsoft YaHei',
            fontSize: '18px',
            color: '#68d391',
            fontStyle: 'bold'
        }).setOrigin(1, 0);
        this.uiContainer.add(this.scoreText);

        this.targetPanel = this.add.container(this.width - 20, 80);
        this.createTargetPanel();

        this.infoText = this.add.text(this.width / 2, 80, '', {
            fontFamily: 'Microsoft YaHei',
            fontSize: '14px',
            color: '#a0aec0',
            align: 'center'
        }).setOrigin(0.5, 0);
        this.uiContainer.add(this.infoText);

        this.resultText = this.add.text(this.width / 2, this.height / 2, '', {
            fontFamily: 'Microsoft YaHei',
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.resultText.setAlpha(0);
        this.uiContainer.add(this.resultText);

        const backButton = this.add.text(20, this.height - 40, '← 返回菜单', {
            fontFamily: 'Microsoft YaHei',
            fontSize: '14px',
            color: '#a0aec0'
        }).setInteractive({ useHandCursor: true });

        backButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });

        backButton.on('pointerover', () => {
            backButton.setColor('#ffffff');
        });

        backButton.on('pointerout', () => {
            backButton.setColor('#a0aec0');
        });
    }

    createTargetPanel() {
        const panelWidth = 200;
        const panelHeight = 150;

        const bg = this.add.graphics();
        bg.fillStyle(0x2d3748, 0.9);
        bg.lineStyle(1, 0x4a5568, 1);
        bg.fillRoundedRect(-panelWidth, 0, panelWidth, panelHeight, 8);
        bg.strokeRoundedRect(-panelWidth, 0, panelWidth, panelHeight, 8);
        this.targetPanel.add(bg);

        const title = this.add.text(-panelWidth / 2, 15, '目标要求', {
            fontFamily: 'Microsoft YaHei',
            fontSize: '16px',
            color: '#68d391',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.targetPanel.add(title);

        this.targetSpinIcon = this.add.text(-panelWidth / 2 - 40, 55, '', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.targetPanel.add(this.targetSpinIcon);

        this.targetSpinText = this.add.text(-panelWidth / 2 + 30, 45, '', {
            fontFamily: 'Microsoft YaHei',
            fontSize: '14px',
            color: '#ffffff'
        });
        this.targetPanel.add(this.targetSpinText);

        this.targetZoneText = this.add.text(-panelWidth / 2 + 30, 70, '', {
            fontFamily: 'Microsoft YaHei',
            fontSize: '14px',
            color: '#ffffff'
        });
        this.targetPanel.add(this.targetZoneText);

        const tipTitle = this.add.text(-panelWidth / 2, 100, '提示', {
            fontFamily: 'Microsoft YaHei',
            fontSize: '12px',
            color: '#a0aec0'
        }).setOrigin(0.5);
        this.targetPanel.add(tipTitle);

        this.tipText = this.add.text(-panelWidth / 2, 120, '', {
            fontFamily: 'Microsoft YaHei',
            fontSize: '11px',
            color: '#718096',
            align: 'center',
            wordWrap: { width: panelWidth - 20 }
        }).setOrigin(0.5, 0);
        this.targetPanel.add(this.tipText);
    }

    updateTargetPanel() {
        if (!this.currentTarget) return;

        this.targetSpinIcon.setText(SPIN_ICONS[this.currentTarget.spin] || '●');
        this.targetSpinText.setText(`旋转: ${SPIN_NAMES[this.currentTarget.spin] || '无'}`);

        let zoneText = '落点: ';
        if (this.currentTarget.zones && this.currentTarget.zones.length > 0) {
            zoneText += this.currentTarget.zones.map(z => ZONE_NAMES[z]).join('或');
        }
        if (this.currentTarget.side) {
            zoneText += ` · ${ZONE_NAMES[this.currentTarget.side]}`;
        }
        this.targetZoneText.setText(zoneText);

        const tips = this.levelConfig.tips;
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        this.tipText.setText(randomTip);
    }

    createBall() {
        this.ballSprite = this.add.circle(0, 0, 15, 0xffffff, 1);
        this.ballSprite.setStrokeStyle(2, 0xcccccc, 1);
        this.ballSprite.setDepth(10);

        this.ballShadow = this.add.ellipse(0, 0, 20, 8, 0x000000, 0.3);
        this.ballShadow.setDepth(5);

        this.spinIndicator = this.add.graphics();
        this.spinIndicator.setDepth(11);
    }

    setupInput() {
        this.input.on('pointerdown', (pointer) => {
            if (this.ballPhysics.isActive) return;

            const ballScreenPos = this.getBallScreenPosition();
            const distToBall = Math.hypot(pointer.x - ballScreenPos.x, pointer.y - ballScreenPos.y);

            if (distToBall < 60) {
                this.gestureRecognizer.startTracking(pointer.x, pointer.y, Date.now());
                this.isDragging = true;
                this.infoText.setText('滑动发球...');
            }
        });

        this.input.on('pointermove', (pointer) => {
            if (!this.isDragging) return;

            this.gestureRecognizer.addPoint(pointer.x, pointer.y, Date.now());
            this.drawGestureTrajectory();
        });

        this.input.on('pointerup', (pointer) => {
            if (!this.isDragging) return;

            this.isDragging = false;
            const gesture = this.gestureRecognizer.endTracking();
            this.lastGesture = gesture;

            this.gestureGraphics.clear();

            if (gesture.valid && gesture.points.length >= 5) {
                this.executeServe(gesture);
            } else {
                this.infoText.setText('手势太短，请从球的位置开始滑动');
                this.resetBall();
            }
        });

        this.input.on('pointerout', (pointer) => {
            if (this.isDragging) {
                this.isDragging = false;
                const gesture = this.gestureRecognizer.endTracking();
                this.gestureGraphics.clear();

                if (gesture.valid && gesture.points.length >= 5) {
                    this.executeServe(gesture);
                } else {
                    this.resetBall();
                }
            }
        });
    }

    drawGestureTrajectory() {
        this.gestureGraphics.clear();
        const points = this.gestureRecognizer.getTrajectoryPoints();

        if (points.length < 2) return;

        this.gestureGraphics.lineStyle(3, 0x68d391, 0.6);
        this.gestureGraphics.beginPath();
        this.gestureGraphics.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            const alpha = 0.3 + (i / points.length) * 0.7;
            this.gestureGraphics.lineStyle(3, 0x68d391, alpha);
            this.gestureGraphics.lineTo(points[i].x, points[i].y);
        }

        this.gestureGraphics.strokePath();

        for (let i = 0; i < points.length; i += 3) {
            const size = 3 + (i / points.length) * 4;
            const alpha = 0.4 + (i / points.length) * 0.6;
            this.gestureGraphics.fillStyle(0x68d391, alpha);
            this.gestureGraphics.fillCircle(points[i].x, points[i].y, size);
        }
    }

    executeServe(gesture) {
        this.ballPhysics.onLand = (position, spin) => {
            this.onBallLanded(position, spin);
        };

        this.ballPhysics.serve(gesture);
        this.currentBall++;
        this.updateBallCount();

        this.infoText.setText('');
    }

    onBallLanded(position, spin) {
        if (this.ballLanded) return;
        this.ballLanded = true;

        const actualZone = this.ballPhysics.getTableZone();
        const actualSpin = this.ballPhysics.getSpinType();
        const actualIntensity = this.ballPhysics.getSpinIntensity();

        let spinCorrect = false;
        let placementCorrect = false;

        if (this.currentTarget) {
            spinCorrect = isSpinMatch(actualSpin, this.currentTarget.spin) &&
                actualIntensity >= this.levelConfig.minSpinIntensity;

            placementCorrect = isZoneMatch(
                actualZone,
                this.currentTarget.zones,
                actualZone ? actualZone.side : null,
                this.currentTarget.side
            );
        }

        let score = 0;
        if (spinCorrect && placementCorrect) {
            score = this.levelConfig.scoring.bothCorrect;
        } else if (spinCorrect || placementCorrect) {
            score = this.levelConfig.scoring.oneCorrect;
        }

        this.totalScore += score;
        this.updateScore();

        this.showLandingMarker(actualZone);
        this.showSpinIndicator(actualSpin, actualIntensity);

        const result = {
            ballIndex: this.currentBall,
            score,
            spinCorrect,
            placementCorrect,
            targetSpin: this.currentTarget ? this.currentTarget.spin : 'none',
            actualSpin,
            intensity: actualIntensity,
            speed: this.lastGesture ? this.lastGesture.speed : 0,
            zone: actualZone
        };

        this.ballResults.push(result);
        this.showResultFeedback(score, spinCorrect, placementCorrect);

        this.time.delayedCall(1500, () => {
            if (this.currentBall >= this.levelConfig.ballsPerLevel) {
                this.endLevel();
            } else {
                this.nextBall();
            }
        });
    }

    showLandingMarker(zone) {
        this.landingGraphics.clear();

        if (!zone || !zone.position) return;

        const screenPos = this.worldToScreen(zone.position.x, 0, zone.position.z);

        const color = zone.zone === 'out' ? 0xe53e3e : 0x68d391;

        this.landingGraphics.fillStyle(color, 0.8);
        this.landingGraphics.fillCircle(screenPos.x, screenPos.y, 12);

        this.landingGraphics.lineStyle(2, 0xffffff, 1);
        this.landingGraphics.strokeCircle(screenPos.x, screenPos.y, 12);

        const zoneText = zone.zone === 'out' ? '出界' :
            ZONE_NAMES[zone.zone] + (zone.side ? ' ' + ZONE_NAMES[zone.side] : '');

        const label = this.add.text(screenPos.x, screenPos.y + 25, zoneText, {
            fontFamily: 'Microsoft YaHei',
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: zone.zone === 'out' ? '#e53e3e' : '#48bb78',
            padding: { left: 8, right: 8, top: 2, bottom: 2 }
        }).setOrigin(0.5).setDepth(20);

        this.tweens.add({
            targets: [label],
            alpha: { from: 1, to: 0 },
            y: screenPos.y + 40,
            duration: 1000,
            delay: 800,
            onComplete: () => label.destroy()
        });
    }

    showSpinIndicator(spinType, intensity) {
        this.spinIndicator.clear();

        const ballScreenPos = this.getBallScreenPosition();

        const x = ballScreenPos.x;
        const y = ballScreenPos.y - 40;

        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.7);
        bg.fillCircle(x, y, 22);

        const icon = this.add.text(x, y, SPIN_ICONS[spinType] || '●', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#68d391',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const intensityBar = this.add.graphics();
        intensityBar.fillStyle(0x4a5568, 1);
        intensityBar.fillRect(x - 20, y + 25, 40, 6);
        intensityBar.fillStyle(0x68d391, 1);
        intensityBar.fillRect(x - 20, y + 25, 40 * intensity, 6);

        const name = this.add.text(x, y + 42, SPIN_NAMES[spinType] || '无旋转', {
            fontFamily: 'Microsoft YaHei',
            fontSize: '11px',
            color: '#e2e8f0'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: [bg, icon, intensityBar, name],
            alpha: { from: 1, to: 0 },
            duration: 1000,
            delay: 1500,
            onComplete: () => {
                bg.destroy();
                icon.destroy();
                intensityBar.destroy();
                name.destroy();
            }
        });
    }

    showResultFeedback(score, spinCorrect, placementCorrect) {
        let color = '#e53e3e';
        let text = '未达标';

        if (score === 2) {
            color = '#68d391';
            text = '完美！+2分';
        } else if (score === 1) {
            color = '#ecc94b';
            if (spinCorrect) {
                text = '旋转正确 +1分';
            } else {
                text = '落点正确 +1分';
            }
        }

        this.resultText.setText(text);
        this.resultText.setColor(color);
        this.resultText.setAlpha(1);
        this.resultText.setScale(0.5);

        this.tweens.add({
            targets: this.resultText,
            scale: 1,
            duration: 300,
            ease: 'Back.out'
        });

        this.tweens.add({
            targets: this.resultText,
            alpha: 0,
            duration: 500,
            delay: 800
        });
    }

    getBallScreenPosition() {
        return this.ballPhysics.getScreenPosition(this.cameraConfig);
    }

    worldToScreen(x, y, z) {
        const { centerX } = this.cameraConfig;
        const nearY = this.height - 80;
        const farY = this.cameraConfig.vanishingY + 20;
        const zNear = -100;
        const zFar = this.ballPhysics.tableLength / 2 + 20;
        const t = Phaser.Math.Clamp((z - zNear) / (zFar - zNear), 0, 1);
        const perspective = 1 - t * 0.6;

        return {
            x: centerX + x * perspective * this.ballPhysics.scale * 1.5,
            y: nearY + (farY - nearY) * t - y * perspective * 2,
            scale: perspective
        };
    }

    drawTargetZone() {
        this.targetGraphics.clear();
        if (!this.currentTarget) return;

        const { centerX, vanishingY, scaleFactor } = this.cameraConfig;
        const halfWidth = this.ballPhysics.tableWidth / 2;
        const halfLength = this.ballPhysics.tableLength / 2;

        let zMin = 0;
        let zMax = halfLength;
        let xMin = -halfWidth;
        let xMax = halfWidth;

        if (this.currentTarget.zones) {
            if (this.currentTarget.zones.includes('back')) {
                zMin = halfLength / 2;
            } else if (this.currentTarget.zones.includes('short')) {
                zMax = halfLength / 4;
            } else if (this.currentTarget.zones.includes('middle')) {
                zMin = halfLength / 4;
                zMax = halfLength / 2;
            }
        }

        if (this.currentTarget.side) {
            if (this.currentTarget.side === 'left') {
                xMax = 0;
            } else if (this.currentTarget.side === 'right') {
                xMin = 0;
            }
        }

        const toScreen = (x, z) => {
            return this.worldToScreen(x, 0, z);
        };

        const tl = toScreen(xMin, zMin);
        const tr = toScreen(xMax, zMin);
        const bl = toScreen(xMin, zMax);
        const br = toScreen(xMax, zMax);

        this.targetGraphics.lineStyle(3, 0x68d391, 0.8);
        this.targetGraphics.fillStyle(0x68d391, 0.15);

        this.targetGraphics.beginPath();
        this.targetGraphics.moveTo(tl.x, tl.y);
        this.targetGraphics.lineTo(tr.x, tr.y);
        this.targetGraphics.lineTo(br.x, br.y);
        this.targetGraphics.lineTo(bl.x, bl.y);
        this.targetGraphics.closePath();
        this.targetGraphics.fill();
        this.targetGraphics.stroke();

        const centerZ = (zMin + zMax) / 2;
        const centerXZone = (xMin + xMax) / 2;
        const centerScreen = toScreen(centerXZone, centerZ);

        const arrow = this.add.text(centerScreen.x, centerScreen.y, '🎯', {
            fontSize: '24px'
        }).setOrigin(0.5).setAlpha(0.6);

        this.targetGraphics.targetArrow = arrow;
    }

    resetBall() {
        this.ballPhysics.reset({ x: 0, y: 20, z: -100 });
        this.ballLanded = false;
        this._missHandled = false;
        this.landingGraphics.clear();
        this.spinIndicator.clear();

        if (this.targetGraphics && this.targetGraphics.targetArrow) {
            this.targetGraphics.targetArrow.destroy();
        }

        this.updateBallPosition();
    }

    nextBall() {
        this.currentTarget = generateBallTarget(this.levelConfig, this.currentBall);
        this.updateTargetPanel();
        this.drawTargetZone();
        this.resetBall();
        this.infoText.setText('从球的位置滑动发球');
    }

    updateBallCount() {
        this.ballCountText.setText(`球: ${this.currentBall}/${this.levelConfig.ballsPerLevel}`);
    }

    updateScore() {
        this.scoreText.setText(`得分: ${this.totalScore}`);
    }

    updateBallPosition() {
        const screenPos = this.getBallScreenPosition();
        this.ballSprite.setPosition(screenPos.x, screenPos.y);

        const scale = screenPos.scale * 0.8;
        this.ballSprite.setScale(scale);

        const shadowY = screenPos.y + (this.ballPhysics.position.y + 2) * scale * 0.5;
        this.ballShadow.setPosition(screenPos.x, shadowY);
        this.ballShadow.setScale(scale, scale * 0.4);
        this.ballShadow.setAlpha(0.3 * scale);

        if (this.ballPhysics.isActive && this.ballPhysics.spin.x !== 0) {
            const rotationSpeed = this.ballPhysics.spin.x * 0.001;
            this.ballSprite.rotation += rotationSpeed;
        }
    }

    endLevel() {
        const passed = this.totalScore >= this.levelConfig.passingScore;

        this.scene.start('ResultScene', {
            levelId: this.levelId,
            totalScore: this.totalScore,
            passingScore: this.levelConfig.passingScore,
            ballResults: this.ballResults,
            passed
        });
    }

    update(time, delta) {
        if (this.ballPhysics.isActive) {
            this.ballPhysics.update(delta);
            this.updateBallPosition();
            this.drawTrajectory();
        }

        if (!this.ballPhysics.isActive && !this.ballLanded && this.currentBall > 0 && !this._missHandled) {
            this._missHandled = true;
            this.time.delayedCall(500, () => {
                if (!this.ballLanded) {
                    this.onBallLanded(null, { x: 0, y: 0, z: 0 });
                }
            });
        }
    }

    drawTrajectory() {
        if (!this.ballPhysics.isActive) return;

        this.trajectoryGraphics.clear();

        const trajectory = this.ballPhysics.projectTrajectory(30, 0.02);

        if (trajectory.length < 2) return;

        this.trajectoryGraphics.lineStyle(2, 0x68d391, 0.3);
        this.trajectoryGraphics.beginPath();

        const firstScreen = this.worldToScreen(trajectory[0].x, trajectory[0].y, trajectory[0].z);
        this.trajectoryGraphics.moveTo(firstScreen.x, firstScreen.y);

        for (let i = 1; i < trajectory.length; i++) {
            const screen = this.worldToScreen(trajectory[i].x, trajectory[i].y, trajectory[i].z);
            const alpha = 0.4 - (i / trajectory.length) * 0.3;
            this.trajectoryGraphics.lineStyle(2, 0x68d391, alpha);
            this.trajectoryGraphics.lineTo(screen.x, screen.y);
        }

        this.trajectoryGraphics.strokePath();
    }

    drawDashedLine(x1, y1, x2, y2, dashLength, gapLength, color, alpha, width) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.hypot(dx, dy);
        const dashTotal = dashLength + gapLength;
        const dashCount = Math.floor(length / dashTotal);

        for (let i = 0; i < dashCount; i++) {
            const startT = (i * dashTotal) / length;
            const endT = (i * dashTotal + dashLength) / length;

            const startX = x1 + dx * startT;
            const startY = y1 + dy * startT;
            const endX = x1 + dx * Math.min(endT, 1);
            const endY = y1 + dy * Math.min(endT, 1);

            this.tableGraphics.lineStyle(width, color, alpha);
            this.tableGraphics.lineBetween(startX, startY, endX, endY);
        }
    }
}
