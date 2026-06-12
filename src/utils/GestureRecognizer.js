export class GestureRecognizer {
    constructor() {
        this.points = [];
        this.isTracking = false;
        this.minPointDistance = 5;
        this.maxHistory = 50;
    }

    startTracking(x, y, timestamp) {
        this.points = [{ x, y, timestamp }];
        this.isTracking = true;
    }

    addPoint(x, y, timestamp) {
        if (!this.isTracking) return;

        const lastPoint = this.points[this.points.length - 1];
        const distance = Math.hypot(x - lastPoint.x, y - lastPoint.y);

        if (distance >= this.minPointDistance) {
            this.points.push({ x, y, timestamp });
            if (this.points.length > this.maxHistory) {
                this.points.shift();
            }
        }
    }

    endTracking() {
        this.isTracking = false;
        return this.analyzeGesture();
    }

    analyzeGesture() {
        if (this.points.length < 3) {
            return {
                valid: false,
                direction: { x: 0, y: -1 },
                speed: 0,
                spin: { type: 'none', intensity: 0 },
                points: [...this.points]
            };
        }

        const direction = this.calculateDirection();
        const speed = this.calculateSpeed();
        const spin = this.analyzeSpin();

        return {
            valid: true,
            direction,
            speed,
            spin,
            points: [...this.points]
        };
    }

    calculateDirection() {
        if (this.points.length < 2) return { x: 0, y: -1 };

        const start = this.points[0];
        const end = this.points[this.points.length - 1];
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.hypot(dx, dy);

        if (length === 0) return { x: 0, y: -1 };

        return {
            x: dx / length,
            y: dy / length,
            angle: Math.atan2(dy, dx)
        };
    }

    calculateSpeed() {
        if (this.points.length < 2) return 0;

        const firstPoint = this.points[0];
        const lastPoint = this.points[this.points.length - 1];
        const totalDistance = this.calculatePathLength();
        const totalTime = (lastPoint.timestamp - firstPoint.timestamp) / 1000;

        if (totalTime === 0) return 0;

        const speed = totalDistance / totalTime;
        return Math.min(speed / 1500, 1);
    }

    calculatePathLength() {
        let length = 0;
        for (let i = 1; i < this.points.length; i++) {
            const dx = this.points[i].x - this.points[i - 1].x;
            const dy = this.points[i].y - this.points[i - 1].y;
            length += Math.hypot(dx, dy);
        }
        return length;
    }

    analyzeSpin() {
        if (this.points.length < 5) {
            return { type: 'none', intensity: 0 };
        }

        const curvatures = [];
        const segmentLength = Math.floor(this.points.length / 3);

        for (let i = 1; i < this.points.length - 1; i++) {
            const curvature = this.calculateCurvature(
                this.points[i - 1],
                this.points[i],
                this.points[i + 1]
            );
            curvatures.push({
                index: i,
                curvature,
                timestamp: this.points[i].timestamp
            });
        }

        const secondSegment = curvatures.slice(segmentLength, segmentLength * 2);
        const thirdSegment = curvatures.slice(segmentLength * 2);

        const avgCurvature2 = this.average(secondSegment.map(c => c.curvature));
        const avgCurvature3 = this.average(thirdSegment.map(c => c.curvature));
        const maxCurvature = Math.max(...curvatures.map(c => Math.abs(c.curvature)));

        const spinChange = Math.abs(avgCurvature3 - avgCurvature2);

        let spinType = 'none';
        let intensity = 0;
        const threshold = 0.003;

        if (maxCurvature > threshold || spinChange > threshold * 0.5) {
            const lateCurvature = avgCurvature3;

            if (lateCurvature > threshold * 0.2) {
                spinType = 'sidespin_left';
                intensity = Math.min(Math.abs(lateCurvature) / 0.015, 1);
            } else if (lateCurvature < -threshold * 0.2) {
                spinType = 'sidespin_right';
                intensity = Math.min(Math.abs(lateCurvature) / 0.015, 1);
            }

            const verticalComponent = this.detectVerticalSpin();
            if (verticalComponent > 0.15) {
                if (spinType !== 'none') {
                    spinType = spinType === 'sidespin_left' ? 'mixed_left' : 'mixed_right';
                } else {
                    spinType = 'backspin';
                }
                intensity = Math.max(intensity, verticalComponent);
            } else if (verticalComponent < -0.15) {
                if (spinType !== 'none') {
                    spinType = spinType === 'sidespin_left' ? 'mixed_top_left' : 'mixed_top_right';
                } else {
                    spinType = 'topspin';
                }
                intensity = Math.max(intensity, Math.abs(verticalComponent));
            }
        }

        return {
            type: spinType,
            intensity: Math.min(Math.max(intensity, 0.3), 1),
            curvatureData: curvatures
        };
    }

    calculateCurvature(p1, p2, p3) {
        const dx1 = p2.x - p1.x;
        const dy1 = p2.y - p1.y;
        const dx2 = p3.x - p2.x;
        const dy2 = p3.y - p2.y;

        const crossProduct = dx1 * dy2 - dy1 * dx2;
        const d1 = Math.hypot(dx1, dy1);
        const d2 = Math.hypot(dx2, dy2);
        const dotProduct = dx1 * dx2 + dy1 * dy2;

        if (d1 === 0 || d2 === 0) return 0;

        const cosAngle = Math.max(-1, Math.min(1, dotProduct / (d1 * d2)));
        const sinAngle = crossProduct / (d1 * d2);

        const angleChange = Math.atan2(sinAngle, cosAngle);
        const avgDistance = (d1 + d2) / 2;

        return avgDistance > 0 ? angleChange / avgDistance : 0;
    }

    detectVerticalSpin() {
        if (this.points.length < 4) return 0;

        const firstHalf = this.points.slice(0, Math.floor(this.points.length / 2));
        const secondHalf = this.points.slice(Math.floor(this.points.length / 2));

        const firstYChange = firstHalf[firstHalf.length - 1].y - firstHalf[0].y;
        const secondYChange = secondHalf[secondHalf.length - 1].y - secondHalf[0].y;

        const normalized = (secondYChange - firstYChange) / 50;
        return Math.max(-1, Math.min(1, normalized));
    }

    average(arr) {
        if (arr.length === 0) return 0;
        return arr.reduce((sum, val) => sum + val, 0) / arr.length;
    }

    getTrajectoryPoints() {
        return [...this.points];
    }

    reset() {
        this.points = [];
        this.isTracking = false;
    }
}
