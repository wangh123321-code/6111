import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(
            this.cameras.main.width / 2 - 160,
            this.cameras.main.height / 2 - 30,
            320,
            50
        );

        const loadingText = this.make.text({
            x: this.cameras.main.width / 2,
            y: this.cameras.main.height / 2 - 50,
            text: '加载中...',
            style: {
                fontFamily: 'Microsoft YaHei',
                fontSize: '20px',
                fill: '#ffffff'
            }
        }).setOrigin(0.5);

        const percentText = this.make.text({
            x: this.cameras.main.width / 2,
            y: this.cameras.main.height / 2 - 5,
            text: '0%',
            style: {
                fontFamily: 'Microsoft YaHei',
                fontSize: '18px',
                fill: '#ffffff'
            }
        }).setOrigin(0.5);

        this.load.on('progress', (value) => {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0x48bb78, 1);
            progressBar.fillRect(
                this.cameras.main.width / 2 - 150,
                this.cameras.main.height / 2 - 20,
                300 * value,
                30
            );
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });

        this.load.image('ball', this.createBallTexture());
        this.load.image('table', this.createTableTexture());
        this.load.image('net', this.createNetTexture());
    }

    createBallTexture() {
        const canvas = this.textures.createCanvas('ballTexture', 40, 40);
        const ctx = canvas.getContext();

        const gradient = ctx.createRadialGradient(15, 15, 0, 20, 20, 20);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, '#f0f0f0');
        gradient.addColorStop(0.7, '#e0e0e0');
        gradient.addColorStop(1, '#cccccc');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(20, 20, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#aaaaaa';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(20, 20, 18, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ff6666';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('★', 20, 24);

        canvas.refresh();
        return 'ballTexture';
    }

    createTableTexture() {
        const canvas = this.textures.createCanvas('tableTexture', 800, 600);
        const ctx = canvas.getContext();

        ctx.fillStyle = '#1a472a';
        ctx.fillRect(0, 0, 800, 600);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(20, 20, 760, 560);

        ctx.beginPath();
        ctx.moveTo(400, 20);
        ctx.lineTo(400, 580);
        ctx.stroke();

        ctx.lineWidth = 1;
        ctx.strokeRect(40, 40, 720, 520);

        canvas.refresh();
        return 'tableTexture';
    }

    createNetTexture() {
        const canvas = this.textures.createCanvas('netTexture', 400, 30);
        const ctx = canvas.getContext();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        for (let i = 0; i < 400; i += 8) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 30);
            ctx.stroke();
        }

        for (let j = 0; j < 30; j += 6) {
            ctx.beginPath();
            ctx.moveTo(0, j);
            ctx.lineTo(400, j);
            ctx.stroke();
        }

        canvas.refresh();
        return 'netTexture';
    }

    create() {
        this.scene.start('MenuScene');
    }
}
