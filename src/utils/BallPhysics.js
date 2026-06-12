export class BallPhysics {
    constructor(config = {}) {
        this.gravity = config.gravity || 9.8;
        this.airResistance = config.airResistance || 0.02;
        this.bounceCoeff = config.bounceCoeff || 0.75;
        this.frictionCoeff = config.frictionCoeff || 0.3;
        this.magnusCoeff = config.magnusCoeff || 0.0005;
        this.tableLength = config.tableLength || 274;
        this.tableWidth = config.tableWidth || 152.5;
        this.netHeight = config.netHeight || 15.25;
        this.ballRadius = config.ballRadius || 2;
        this.scale = config.scale || 2;

        this.position = { x: 0, y: 0, z: 0 };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.spin = { x: 0, y: 0, z: 0 };
        this.isActive = false;
        this.bounceCount = 0;
        this.maxBounces = 3;
        this.onBounce = null;
        this.onLand = null;
        this.landingPosition = null;
        this.hasLanded = false;
    }

    reset(position = { x: 0, y: 20, z: 0 }) {
        this.position = { ...position };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.spin = { x: 0, y: 0, z: 0 };
        this.isActive = false;
        this.bounceCount = 0;
        this.landingPosition = null;
        this.hasLanded = false;
    }

    serve(gesture) {
        const { direction, speed, spin } = gesture;

        const baseSpeed = 300 + speed * 400;
        const angle = direction.angle !== undefined ? direction.angle : Math.atan2(direction.y, direction.x);

        this.velocity.x = Math.sin(angle) * baseSpeed * 0.5;
        this.velocity.y = -Math.abs(Math.cos(angle)) * baseSpeed * 0.8;
        this.velocity.z = 150 + speed * 200;

        this.setSpin(spin);

        this.isActive = true;
        this.bounceCount = 0;
        this.hasLanded = false;
        this.landingPosition = null;
    }

    setSpin(spinData) {
        const { type, intensity } = spinData;
        const baseSpin = intensity * 800;

        this.spin = { x: 0, y: 0, z: 0 };

        switch (type) {
            case 'backspin':
                this.spin.x = -baseSpin;
                break;
            case 'topspin':
                this.spin.x = baseSpin;
                break;
            case 'sidespin_left':
                this.spin.y = -baseSpin;
                break;
            case 'sidespin_right':
                this.spin.y = baseSpin;
                break;
            case 'mixed_left':
                this.spin.x = -baseSpin * 0.7;
                this.spin.y = -baseSpin * 0.7;
                break;
            case 'mixed_right':
                this.spin.x = -baseSpin * 0.7;
                this.spin.y = baseSpin * 0.7;
                break;
            case 'mixed_top_left':
                this.spin.x = baseSpin * 0.7;
                this.spin.y = -baseSpin * 0.7;
                break;
            case 'mixed_top_right':
                this.spin.x = baseSpin * 0.7;
                this.spin.y = baseSpin * 0.7;
                break;
            case 'none':
            default:
                break;
        }
    }

    update(deltaTime) {
        if (!this.isActive) return;

        const dt = deltaTime / 1000;

        this.applyForces(dt);
        this.integrate(dt);
        this.checkCollisions();

        if (this.position.z > this.tableLength + 50 || this.position.y < -50) {
            this.isActive = false;
        }
    }

    applyForces(dt) {
        this.velocity.y += this.gravity * dt * 50;

        const speed = Math.hypot(this.velocity.x, this.velocity.y, this.velocity.z);
        if (speed > 0) {
            const drag = this.airResistance * speed * speed;
            this.velocity.x -= (this.velocity.x / speed) * drag * dt;
            this.velocity.y -= (this.velocity.y / speed) * drag * dt;
            this.velocity.z -= (this.velocity.z / speed) * drag * dt;
        }

        if (Math.abs(this.spin.x) > 1 || Math.abs(this.spin.y) > 1 || Math.abs(this.spin.z) > 1) {
            const magnus = this.calculateMagnusForce();
            this.velocity.x += magnus.x * dt;
            this.velocity.y += magnus.y * dt;
            this.velocity.z += magnus.z * dt;
        }
    }

    calculateMagnusForce() {
        const speed = Math.hypot(this.velocity.x, this.velocity.y, this.velocity.z);
        if (speed === 0) return { x: 0, y: 0, z: 0 };

        const vx = this.velocity.x / speed;
        const vy = this.velocity.y / speed;
        const vz = this.velocity.z / speed;

        const sx = this.spin.x / 1000;
        const sy = this.spin.y / 1000;
        const sz = this.spin.z / 1000;

        const fx = (vy * sz - vz * sy) * this.magnusCoeff * speed * speed;
        const fy = (vz * sx - vx * sz) * this.magnusCoeff * speed * speed;
        const fz = (vx * sy - vy * sx) * this.magnusCoeff * speed * speed;

        return { x: fx, y: fy, z: fz };
    }

    integrate(dt) {
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
        this.position.z += this.velocity.z * dt;

        const spinDecay = 0.995;
        this.spin.x *= spinDecay;
        this.spin.y *= spinDecay;
        this.spin.z *= spinDecay;
    }

    checkCollisions() {
        this.checkTableCollision();
        this.checkNetCollision();
    }

    checkTableCollision() {
        const halfWidth = this.tableWidth / 2;
        const halfLength = this.tableLength / 2;

        if (
            this.position.y <= this.ballRadius &&
            this.position.y > -this.ballRadius &&
            Math.abs(this.position.x) <= halfWidth &&
            this.position.z >= -halfLength &&
            this.position.z <= halfLength
        ) {
            this.handleTableBounce();
        }
    }

    handleTableBounce() {
        this.position.y = this.ballRadius;

        const normalY = 1;

        const incidentSpeed = Math.abs(this.velocity.y);
        this.velocity.y = -this.velocity.y * this.bounceCoeff;

        if (this.onBounce) {
            this.onBounce(this.position, this.bounceCount);
        }

        if (!this.hasLanded && this.position.z > 0) {
            this.hasLanded = true;
            this.landingPosition = { ...this.position };
            if (this.onLand) {
                this.onLand(this.landingPosition, this.spin);
            }
        }

        this.applySpinEffectOnBounce();

        this.velocity.x *= (1 - this.frictionCoeff * 0.5);
        this.velocity.z *= (1 - this.frictionCoeff * 0.5);

        this.bounceCount++;

        if (this.bounceCount >= this.maxBounces) {
            setTimeout(() => {
                this.isActive = false;
            }, 500);
        }
    }

    applySpinEffectOnBounce() {
        const spinFactor = 0.3;

        if (this.spin.x > 50) {
            this.velocity.z += this.spin.x * spinFactor * 0.1;
        } else if (this.spin.x < -50) {
            this.velocity.z += this.spin.x * spinFactor * 0.1;
        }

        if (this.spin.y > 50) {
            this.velocity.x -= this.spin.y * spinFactor * 0.1;
        } else if (this.spin.y < -50) {
            this.velocity.x -= this.spin.y * spinFactor * 0.1;
        }

        this.spin.x *= 0.6;
        this.spin.y *= 0.6;
    }

    checkNetCollision() {
        const netZ = 0;
        const halfWidth = this.tableWidth / 2;

        if (
            Math.abs(this.position.z - netZ) < 5 &&
            this.position.y <= this.netHeight + this.ballRadius &&
            Math.abs(this.position.x) <= halfWidth
        ) {
            if (this.velocity.z > 0) {
                this.velocity.z *= 0.3;
                this.velocity.y = Math.abs(this.velocity.y) * 0.5;
                this.position.z = netZ - 5;
            }
        }
    }

    getScreenPosition(cameraConfig) {
        const { centerX, centerY, vanishingY, scaleFactor } = cameraConfig;

        const z = Math.max(this.position.z, -50);
        const perspective = 300 / (300 + z);

        const screenX = centerX + this.position.x * perspective * this.scale;
        const screenY = vanishingY - this.position.y * perspective * this.scale + z * scaleFactor;

        return {
            x: screenX,
            y: screenY,
            scale: perspective,
            z: z
        };
    }

    getSpinType() {
        const threshold = 100;
        const hasTopspin = this.spin.x > threshold;
        const hasBackspin = this.spin.x < -threshold;
        const hasLeftSpin = this.spin.y < -threshold;
        const hasRightSpin = this.spin.y > threshold;

        if (hasBackspin && hasLeftSpin) return 'mixed_left';
        if (hasBackspin && hasRightSpin) return 'mixed_right';
        if (hasTopspin && hasLeftSpin) return 'mixed_top_left';
        if (hasTopspin && hasRightSpin) return 'mixed_top_right';
        if (hasBackspin) return 'backspin';
        if (hasTopspin) return 'topspin';
        if (hasLeftSpin) return 'sidespin_left';
        if (hasRightSpin) return 'sidespin_right';
        return 'none';
    }

    getSpinIntensity() {
        const totalSpin = Math.hypot(this.spin.x, this.spin.y, this.spin.z);
        return Math.min(totalSpin / 800, 1);
    }

    getTableZone() {
        if (!this.landingPosition) return null;

        const halfWidth = this.tableWidth / 2;
        const halfLength = this.tableLength / 2;
        const pos = this.landingPosition;

        const isOnTable =
            Math.abs(pos.x) <= halfWidth &&
            pos.z >= 0 &&
            pos.z <= halfLength;

        if (!isOnTable) return { zone: 'out', side: null };

        const isLeftSide = pos.x < 0;
        const isBackHalf = pos.z > halfLength / 2;

        let zone = 'middle';
        if (isBackHalf) zone = 'back';
        else if (pos.z < halfLength / 4) zone = 'short';

        return {
            zone,
            side: isLeftSide ? 'left' : 'right',
            position: { x: pos.x, z: pos.z }
        };
    }

    projectTrajectory(steps = 50, dt = 0.016) {
        const tempPos = { ...this.position };
        const tempVel = { ...this.velocity };
        const tempSpin = { ...this.spin };
        const points = [];

        for (let i = 0; i < steps; i++) {
            tempVel.y += this.gravity * dt * 50;

            tempPos.x += tempVel.x * dt;
            tempPos.y += tempVel.y * dt;
            tempPos.z += tempVel.z * dt;

            if (tempPos.y <= this.ballRadius && tempPos.z > 0 && tempPos.z < this.tableLength / 2) {
                tempVel.y = Math.abs(tempVel.y) * this.bounceCoeff;
                tempPos.y = this.ballRadius;
            }

            points.push({ ...tempPos });

            if (tempPos.z > this.tableLength || tempPos.y < -20) break;
        }

        return points;
    }
}
