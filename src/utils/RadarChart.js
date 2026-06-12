import Phaser from 'phaser';

export class RadarChart {
    constructor(scene, x, y, size) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.size = size;
        this.centerX = x + size / 2;
        this.centerY = y + size / 2;
        this.radius = size / 2 - 30;

        this.container = null;
        this.axes = [];
        this.dataGraphics = null;
        this.gridGraphics = null;
        this.labels = [];
    }

    create(axesData, values, colors = {}) {
        this.destroy();

        this.container = this.scene.add.container(this.x, this.y);

        this.axes = axesData;
        this.values = values;

        const gridColor = colors.grid || 0x4a5568;
        const dataColor = colors.data || 0x48bb78;
        const dataFill = colors.dataFill || 0x48bb78;
        const labelColor = colors.label || '#e2e8f0';

        this.createGrid(gridColor);
        this.createAxesLabels(labelColor);
        this.createDataPolygon(dataColor, dataFill);
        this.createCenterPoint();

        return this.container;
    }

    createGrid(color) {
        this.gridGraphics = this.scene.add.graphics();
        this.gridGraphics.lineStyle(1, color, 0.5);

        for (let level = 1; level <= 5; level++) {
            const levelRadius = (this.radius * level) / 5;
            const points = [];

            for (let i = 0; i < this.axes.length; i++) {
                const angle = (Math.PI * 2 * i) / this.axes.length - Math.PI / 2;
                const x = this.centerX - this.x + Math.cos(angle) * levelRadius;
                const y = this.centerY - this.y + Math.sin(angle) * levelRadius;
                points.push(new Phaser.Geom.Point(x, y));
            }

            for (let i = 0; i < points.length; i++) {
                const next = (i + 1) % points.length;
                this.gridGraphics.lineBetween(points[i].x, points[i].y, points[next].x, points[next].y);
            }
        }

        for (let i = 0; i < this.axes.length; i++) {
            const angle = (Math.PI * 2 * i) / this.axes.length - Math.PI / 2;
            const x = this.centerX - this.x + Math.cos(angle) * this.radius;
            const y = this.centerY - this.y + Math.sin(angle) * this.radius;

            this.gridGraphics.lineBetween(
                this.centerX - this.x,
                this.centerY - this.y,
                x, y
            );
        }

        this.container.add(this.gridGraphics);
    }

    createAxesLabels(color) {
        for (let i = 0; i < this.axes.length; i++) {
            const angle = (Math.PI * 2 * i) / this.axes.length - Math.PI / 2;
            const labelRadius = this.radius + 25;
            const x = this.centerX - this.x + Math.cos(angle) * labelRadius;
            const y = this.centerY - this.y + Math.sin(angle) * labelRadius;

            const label = this.scene.add.text(x, y, this.axes[i].name, {
                fontFamily: 'Microsoft YaHei',
                fontSize: '14px',
                color: color,
                align: 'center'
            }).setOrigin(0.5);

            this.labels.push(label);
            this.container.add(label);

            const value = this.values[i];
            const valueText = this.scene.add.text(x, y + 18, `${Math.round(value * 100)}%`, {
                fontFamily: 'Microsoft YaHei',
                fontSize: '12px',
                color: '#a0aec0'
            }).setOrigin(0.5);

            this.labels.push(valueText);
            this.container.add(valueText);
        }
    }

    createDataPolygon(color, fillColor) {
        this.dataGraphics = this.scene.add.graphics();

        const points = [];
        for (let i = 0; i < this.axes.length; i++) {
            const angle = (Math.PI * 2 * i) / this.axes.length - Math.PI / 2;
            const value = Math.max(0, Math.min(1, this.values[i]));
            const pointRadius = this.radius * value;
            const x = this.centerX - this.x + Math.cos(angle) * pointRadius;
            const y = this.centerY - this.y + Math.sin(angle) * pointRadius;
            points.push({ x, y });
        }

        this.dataGraphics.fillStyle(fillColor, 0.3);
        this.dataGraphics.beginPath();
        this.dataGraphics.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.dataGraphics.lineTo(points[i].x, points[i].y);
        }
        this.dataGraphics.closePath();
        this.dataGraphics.fill();

        this.dataGraphics.lineStyle(2, color, 0.8);
        this.dataGraphics.beginPath();
        this.dataGraphics.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.dataGraphics.lineTo(points[i].x, points[i].y);
        }
        this.dataGraphics.closePath();
        this.dataGraphics.stroke();

        for (const point of points) {
            this.dataGraphics.fillStyle(color, 1);
            this.dataGraphics.fillCircle(point.x, point.y, 5);
            this.dataGraphics.lineStyle(2, 0xffffff, 0.8);
            this.dataGraphics.strokeCircle(point.x, point.y, 5);
        }

        this.container.add(this.dataGraphics);
    }

    createCenterPoint() {
        const center = this.scene.add.circle(
            this.centerX - this.x,
            this.centerY - this.y,
            3,
            0xffffff,
            0.8
        );
        this.container.add(center);
    }

    animateToValues(newValues, duration = 1000) {
        if (!this.dataGraphics) return;

        const startValues = [...this.values];
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = this.easeOutCubic(progress);

            const currentValues = startValues.map((start, i) => {
                return start + (newValues[i] - start) * easeProgress;
            });

            this.values = currentValues;
            this.updateDataPolygon();

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    updateDataPolygon() {
        if (!this.dataGraphics) return;

        this.dataGraphics.clear();

        const points = [];
        for (let i = 0; i < this.axes.length; i++) {
            const angle = (Math.PI * 2 * i) / this.axes.length - Math.PI / 2;
            const value = Math.max(0, Math.min(1, this.values[i]));
            const pointRadius = this.radius * value;
            const x = this.centerX - this.x + Math.cos(angle) * pointRadius;
            const y = this.centerY - this.y + Math.sin(angle) * pointRadius;
            points.push({ x, y });
        }

        this.dataGraphics.fillStyle(0x48bb78, 0.3);
        this.dataGraphics.beginPath();
        this.dataGraphics.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.dataGraphics.lineTo(points[i].x, points[i].y);
        }
        this.dataGraphics.closePath();
        this.dataGraphics.fill();

        this.dataGraphics.lineStyle(2, 0x48bb78, 0.8);
        this.dataGraphics.beginPath();
        this.dataGraphics.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.dataGraphics.lineTo(points[i].x, points[i].y);
        }
        this.dataGraphics.closePath();
        this.dataGraphics.stroke();

        for (const point of points) {
            this.dataGraphics.fillStyle(0x48bb78, 1);
            this.dataGraphics.fillCircle(point.x, point.y, 5);
            this.dataGraphics.lineStyle(2, 0xffffff, 0.8);
            this.dataGraphics.strokeCircle(point.x, point.y, 5);
        }
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    destroy() {
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        this.axes = [];
        this.labels = [];
        this.dataGraphics = null;
        this.gridGraphics = null;
    }
}

export function generateSuggestions(analysis) {
    const suggestions = [];
    const {
        spinAccuracy,
        placementAccuracy,
        consistency,
        speedControl,
        intensity,
        weakSides,
        bestSpins
    } = analysis;

    const getLevel = (value) => {
        if (value >= 0.7) return 'high';
        if (value >= 0.4) return 'medium';
        return 'low';
    };

    const SUGGESTION_TEMPLATES = {
        spinAccuracy: {
            low: '旋转识别率较低（{score}%），建议加强手腕动作的幅度和清晰度。可以尝试在触球瞬间加大手腕的"抖动"幅度，让旋转更明显。',
            medium: '旋转控制有进步（{score}%），继续练习让旋转更稳定。注意保持动作的一致性。',
            high: '旋转控制很好（{score}%）！保持这个手感，尝试更细腻的旋转变化。'
        },
        placementAccuracy: {
            low: '落点控制需要加强（{score}%），注意滑动方向的准确性。发球前先想象目标落点，然后稳定地向那个方向滑动。',
            medium: '落点控制不错（{score}%），继续练习提高精准度。可以尝试缩小目标区域来增加难度。',
            high: '落点控制非常精准（{score}%）！你对球的飞行轨迹把握得很好。'
        },
        consistency: {
            low: '发球稳定性有待提高（{score}%），尝试固定动作模式。每次发球前保持相同的准备姿势和挥拍节奏。',
            medium: '稳定性不错（{score}%），继续保持。可以尝试在疲劳状态下练习，提高抗压能力。',
            high: '发球稳定性很好（{score}%）！你的动作一致性很强。'
        },
        speedControl: {
            low: '球速控制不稳定（{score}%），注意滑动速度的一致性。不要一味追求速度，先保证动作的稳定。',
            medium: '球速控制不错（{score}%），可以尝试根据需要调整球速，增加战术变化。',
            high: '球速控制很好（{score}%），能根据需要调整，威胁性强。'
        },
        intensity: {
            low: '旋转强度偏弱（{score}%），加强手腕的爆发力。在触球瞬间快速"咬"球，增加摩擦时间。',
            medium: '旋转强度适中（{score}%），可以尝试在保持稳定的前提下增加旋转强度。',
            high: '旋转强度很好（{score}%），威胁性强！这样的球在实战中会很有杀伤力。'
        }
    };

    const metrics = [
        { key: 'spinAccuracy', value: spinAccuracy, name: '旋转准确率' },
        { key: 'placementAccuracy', value: placementAccuracy, name: '落点准确率' },
        { key: 'consistency', value: consistency, name: '稳定性' },
        { key: 'speedControl', value: speedControl, name: '速度控制' },
        { key: 'intensity', value: intensity, name: '旋转强度' }
    ];

    const sortedMetrics = [...metrics].sort((a, b) => a.value - b.value);
    const weakest = sortedMetrics[0];
    const secondWeakest = sortedMetrics[1];

    suggestions.push({
        title: '总体评价',
        content: `本关你的综合得分为 ${Math.round(analysis.totalScore)} 分，${
            analysis.totalScore >= 15 ? '恭喜过关！' : '继续努力，还差一点就过关了！'
        }`
    });

    suggestions.push({
        title: '重点改进',
        content: SUGGESTION_TEMPLATES[weakest.key][getLevel(weakest.value)].replace('{score}', Math.round(weakest.value * 100))
    });

    if (secondWeakest.value < 0.5) {
        suggestions.push({
            title: '次要改进',
            content: SUGGESTION_TEMPLATES[secondWeakest.key][getLevel(secondWeakest.value)].replace('{score}', Math.round(secondWeakest.value * 100))
        });
    }

    if (bestSpins && bestSpins.length > 0) {
        suggestions.push({
            title: '强项',
            content: `你最擅长的旋转是：${bestSpins.join('、')}。可以把这些作为你的"杀手锏"发球。`
        });
    }

    if (weakSides && weakSides.length > 0) {
        suggestions.push({
            title: '待加强',
            content: `需要重点练习的旋转是：${weakSides.join('、')}。建议针对性地多练这些旋转。`
        });
    }

    suggestions.push({
        title: '练习建议',
        content: '每天花10-15分钟练习发球，先保证质量再追求数量。每发完一球思考一下：旋转够不够？落点准不准？动作有没有变形？'
    });

    return suggestions;
}

export function analyzePerformance(ballResults, levelConfig) {
    if (!ballResults || ballResults.length === 0) {
        return {
            totalScore: 0,
            spinAccuracy: 0,
            placementAccuracy: 0,
            consistency: 0,
            speedControl: 0,
            intensity: 0,
            weakSides: [],
            bestSpins: []
        };
    }

    const totalScore = ballResults.reduce((sum, r) => sum + r.score, 0);

    const spinCorrect = ballResults.filter(r => r.spinCorrect).length;
    const placementCorrect = ballResults.filter(r => r.placementCorrect).length;

    const spinAccuracy = spinCorrect / ballResults.length;
    const placementAccuracy = placementCorrect / ballResults.length;

    const scores = ballResults.map(r => r.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - avgScore, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    const consistency = Math.max(0, 1 - stdDev / 2);

    const speeds = ballResults.map(r => r.speed).filter(s => s > 0);
    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / Math.max(speeds.length, 1);
    const speedVariance = speeds.reduce((a, b) => a + Math.pow(b - avgSpeed, 2), 0) / Math.max(speeds.length, 1);
    const speedStdDev = Math.sqrt(speedVariance);
    const speedControl = Math.max(0, 1 - speedStdDev);

    const intensities = ballResults.map(r => r.intensity);
    const intensity = intensities.reduce((a, b) => a + b, 0) / intensities.length;

    const spinStats = {};
    ballResults.forEach(r => {
        if (!spinStats[r.targetSpin]) {
            spinStats[r.targetSpin] = { correct: 0, total: 0 };
        }
        spinStats[r.targetSpin].total++;
        if (r.spinCorrect) spinStats[r.targetSpin].correct++;
    });

    const spinAccuracies = Object.entries(spinStats).map(([spin, stats]) => ({
        spin,
        accuracy: stats.total > 0 ? stats.correct / stats.total : 0
    }));

    const weakSides = spinAccuracies
        .filter(s => s.accuracy < 0.5)
        .map(s => s.spin);

    const bestSpins = spinAccuracies
        .filter(s => s.accuracy >= 0.7)
        .map(s => s.spin);

    return {
        totalScore,
        maxScore: ballResults.length * 2,
        spinAccuracy,
        placementAccuracy,
        consistency,
        speedControl,
        intensity,
        weakSides,
        bestSpins,
        ballResults
    };
}
