export const SPIN_TYPES = {
    NONE: 'none',
    BACKSPIN: 'backspin',
    TOPSPIN: 'topspin',
    SIDESPIN_LEFT: 'sidespin_left',
    SIDESPIN_RIGHT: 'sidespin_right',
    MIXED_LEFT: 'mixed_left',
    MIXED_RIGHT: 'mixed_right',
    MIXED_TOP_LEFT: 'mixed_top_left',
    MIXED_TOP_RIGHT: 'mixed_top_right'
};

export const SPIN_NAMES = {
    [SPIN_TYPES.NONE]: '无旋转',
    [SPIN_TYPES.BACKSPIN]: '下旋',
    [SPIN_TYPES.TOPSPIN]: '上旋',
    [SPIN_TYPES.SIDESPIN_LEFT]: '左侧旋',
    [SPIN_TYPES.SIDESPIN_RIGHT]: '右侧旋',
    [SPIN_TYPES.MIXED_LEFT]: '左下旋',
    [SPIN_TYPES.MIXED_RIGHT]: '右下旋',
    [SPIN_TYPES.MIXED_TOP_LEFT]: '左上旋',
    [SPIN_TYPES.MIXED_TOP_RIGHT]: '右上旋'
};

export const SPIN_ICONS = {
    [SPIN_TYPES.NONE]: '●',
    [SPIN_TYPES.BACKSPIN]: '↓',
    [SPIN_TYPES.TOPSPIN]: '↑',
    [SPIN_TYPES.SIDESPIN_LEFT]: '←',
    [SPIN_TYPES.SIDESPIN_RIGHT]: '→',
    [SPIN_TYPES.MIXED_LEFT]: '↙',
    [SPIN_TYPES.MIXED_RIGHT]: '↘',
    [SPIN_TYPES.MIXED_TOP_LEFT]: '↖',
    [SPIN_TYPES.MIXED_TOP_RIGHT]: '↗'
};

export const TABLE_ZONES = {
    BACK: 'back',
    MIDDLE: 'middle',
    SHORT: 'short',
    LEFT: 'left',
    RIGHT: 'right',
    OUT: 'out'
};

export const ZONE_NAMES = {
    [TABLE_ZONES.BACK]: '后区',
    [TABLE_ZONES.MIDDLE]: '中区',
    [TABLE_ZONES.SHORT]: '近网',
    [TABLE_ZONES.LEFT]: '左半区',
    [TABLE_ZONES.RIGHT]: '右半区',
    [TABLE_ZONES.OUT]: '出界'
};

export const LEVELS = [
    {
        id: 1,
        name: '第一关：纯下旋',
        description: '练习纯下旋发球，要求落点在对方台面后半区',
        instructions: '从球的位置向上滑动，并在触球瞬间手腕向后下方勾动，制造下旋',
        ballsPerLevel: 10,
        passingScore: 15,
        targetZones: [TABLE_ZONES.BACK],
        targetSides: null,
        allowedSpins: [SPIN_TYPES.BACKSPIN],
        minSpinIntensity: 0.3,
        scoring: {
            bothCorrect: 2,
            oneCorrect: 1,
            noneCorrect: 0
        },
        tips: [
            '击球时拍面稍向后仰',
            '接触球的中下部',
            '手腕要有明显的"切球"动作',
            '滑动轨迹后半段向下弯曲'
        ]
    },
    {
        id: 2,
        name: '第二关：侧旋发球',
        description: '练习侧旋发球，要求落点在对方台面左/右半区',
        instructions: '从球的位置向斜上方滑动，手腕在触球瞬间向左或向右"勾"动',
        ballsPerLevel: 10,
        passingScore: 15,
        targetZones: [TABLE_ZONES.BACK, TABLE_ZONES.MIDDLE],
        targetSides: ['left', 'right'],
        randomizeSide: true,
        allowedSpins: [SPIN_TYPES.SIDESPIN_LEFT, SPIN_TYPES.SIDESPIN_RIGHT],
        minSpinIntensity: 0.3,
        scoring: {
            bothCorrect: 2,
            oneCorrect: 1,
            noneCorrect: 0
        },
        tips: [
            '发左侧旋时，击球瞬间手腕向左勾',
            '发右侧旋时，击球瞬间手腕向右勾',
            '接触球的侧面',
            '滑动轨迹要有明显的横向弯曲'
        ]
    },
    {
        id: 3,
        name: '第三关：组合旋转',
        description: '练习组合旋转发球，随机指定旋转类型和目标区域',
        instructions: '根据提示的旋转类型和目标区域，综合运用手腕动作发出相应的球',
        ballsPerLevel: 10,
        passingScore: 15,
        targetZones: [TABLE_ZONES.BACK, TABLE_ZONES.MIDDLE, TABLE_ZONES.SHORT],
        targetSides: ['left', 'right'],
        randomizeAll: true,
        allowedSpins: [
            SPIN_TYPES.BACKSPIN,
            SPIN_TYPES.TOPSPIN,
            SPIN_TYPES.SIDESPIN_LEFT,
            SPIN_TYPES.SIDESPIN_RIGHT,
            SPIN_TYPES.MIXED_LEFT,
            SPIN_TYPES.MIXED_RIGHT,
            SPIN_TYPES.MIXED_TOP_LEFT,
            SPIN_TYPES.MIXED_TOP_RIGHT
        ],
        minSpinIntensity: 0.25,
        scoring: {
            bothCorrect: 2,
            oneCorrect: 1,
            noneCorrect: 0
        },
        tips: [
            '仔细观察每球的目标要求',
            '组合旋转需要同时控制多个维度',
            '下旋+侧旋：向后下方切球同时带侧勾',
            '上旋+侧旋：向前上方摩擦球同时带侧勾'
        ]
    }
];

export const SUGGESTIONS = {
    spinAccuracy: {
        low: '旋转识别率较低，建议加强手腕动作的幅度和清晰度',
        medium: '旋转控制有进步，继续练习让旋转更稳定',
        high: '旋转控制很好！保持这个手感'
    },
    placementAccuracy: {
        low: '落点控制需要加强，注意滑动方向的准确性',
        medium: '落点控制不错，继续练习提高精准度',
        high: '落点控制非常精准！'
    },
    consistency: {
        low: '发球稳定性有待提高，尝试固定动作模式',
        medium: '稳定性不错，继续保持',
        high: '发球稳定性很好！'
    },
    speedControl: {
        low: '球速控制不稳定，注意滑动速度的一致性',
        medium: '球速控制不错',
        high: '球速控制很好，能根据需要调整'
    },
    intensity: {
        low: '旋转强度偏弱，加强手腕的爆发力',
        medium: '旋转强度适中',
        high: '旋转强度很好，威胁性强'
    }
};

export function getLevelConfig(levelId) {
    return LEVELS.find(level => level.id === levelId) || LEVELS[0];
}

export function isSpinMatch(actualSpin, targetSpin, tolerance = 0.5) {
    if (actualSpin === targetSpin) return true;

    const spinGroups = {
        backspin: [SPIN_TYPES.BACKSPIN, SPIN_TYPES.MIXED_LEFT, SPIN_TYPES.MIXED_RIGHT],
        topspin: [SPIN_TYPES.TOPSPIN, SPIN_TYPES.MIXED_TOP_LEFT, SPIN_TYPES.MIXED_TOP_RIGHT],
        sidespin_left: [SPIN_TYPES.SIDESPIN_LEFT, SPIN_TYPES.MIXED_LEFT, SPIN_TYPES.MIXED_TOP_LEFT],
        sidespin_right: [SPIN_TYPES.SIDESPIN_RIGHT, SPIN_TYPES.MIXED_RIGHT, SPIN_TYPES.MIXED_TOP_RIGHT],
        mixed_left: [SPIN_TYPES.MIXED_LEFT, SPIN_TYPES.BACKSPIN, SPIN_TYPES.SIDESPIN_LEFT],
        mixed_right: [SPIN_TYPES.MIXED_RIGHT, SPIN_TYPES.BACKSPIN, SPIN_TYPES.SIDESPIN_RIGHT],
        mixed_top_left: [SPIN_TYPES.MIXED_TOP_LEFT, SPIN_TYPES.TOPSPIN, SPIN_TYPES.SIDESPIN_LEFT],
        mixed_top_right: [SPIN_TYPES.MIXED_TOP_RIGHT, SPIN_TYPES.TOPSPIN, SPIN_TYPES.SIDESPIN_RIGHT]
    };

    const group = spinGroups[targetSpin];
    return group ? group.includes(actualSpin) : false;
}

export function isZoneMatch(actualZone, targetZones, actualSide = null, targetSide = null) {
    if (!actualZone || actualZone.zone === 'out') return false;

    const zoneMatch = targetZones.includes(actualZone.zone);

    if (targetSide && actualSide) {
        return zoneMatch && actualSide === targetSide;
    }

    return zoneMatch;
}

export function generateBallTarget(levelConfig, ballIndex) {
    const target = {
        zones: levelConfig.targetZones,
        side: null,
        spin: levelConfig.allowedSpins[0]
    };

    if (levelConfig.randomizeSide && levelConfig.targetSides) {
        target.side = levelConfig.targetSides[Math.floor(Math.random() * levelConfig.targetSides.length)];
        target.spin = target.side === 'left' ? SPIN_TYPES.SIDESPIN_LEFT : SPIN_TYPES.SIDESPIN_RIGHT;
    }

    if (levelConfig.randomizeAll) {
        target.side = levelConfig.targetSides[Math.floor(Math.random() * levelConfig.targetSides.length)];
        target.spin = levelConfig.allowedSpins[Math.floor(Math.random() * levelConfig.allowedSpins.length)];
        target.zones = [levelConfig.targetZones[Math.floor(Math.random() * levelConfig.targetZones.length)]];
    }

    return target;
}
