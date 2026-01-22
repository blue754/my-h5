// ========== 新增：游戏开始函数 ==========
function startGame() {
    playClickSound();
    showLevelIntro(1);
}

// ========== 全局变量 ==========
let selectedPower = 10;  // 注意：这里可能会有重复声明的问题，如果页面多次加载
let selectedColor = 'blue';
let marblesCount = 3;
let blueMarbles = 2;
let redMarbles = 2;
let yellowMarbles = 2;
let dyedArea = 0;
let dyedAreaBlue = 0;
let dyedAreaRed = 0;
let dyedAreaYellow = 0;
let purpleAreaRatio = 0;
let orangeAreaRatio = 0;
const canvasWidth = 280;
const canvasHeight = 330;
const knotRadius = 20;
const knotBlockRadius = 30;
let isMarbleMoving = false;
const airResistance = 0.985;
const totalCanvasArea = canvasWidth * canvasHeight;

// 各关卡扎结数量
const totalKnotAreaLevel1 = 2 * Math.PI * Math.pow(knotBlockRadius, 2);
const totalKnotAreaLevel2 = 3 * Math.PI * Math.pow(knotBlockRadius, 2);
const totalKnotAreaLevel3 = 6 * Math.PI * Math.pow(knotBlockRadius, 2);

const totalDyeableAreaLevel1 = totalCanvasArea - totalKnotAreaLevel1;
const totalDyeableAreaLevel2 = totalCanvasArea - totalKnotAreaLevel2;
const totalDyeableAreaLevel3 = totalCanvasArea - totalKnotAreaLevel3;

const dyeCircles = [];
const dyeCirclesBlue = [];
const dyeCirclesRed = [];
const dyeCirclesYellow = [];

// 染色半径配置
const dyeRadiusConfig = {
    level1: 85,
    level2: 85,
    level3: 65
};
const explosionDyeRadiusConfig = {
    level1: 130,
    level2: 95,
    level3: 115
};

// 第二关爆炸弹珠配置
let explosionMarbleLevel2 = false; // 是否在第二关使用爆炸弹珠
let firstBlueMarbleEnhanced = false; // 第一个蓝色弹珠是否增强

let currentLevel = 1;

// 爆炸弹珠相关
let explosionMarbleType = null;
let hasUsedExplosionMarble = false;
let hasReplacedExplosionMarble = false;
let tempSelectedColor = '';

// 磁性扎结参数
const magneticForce = 0.3;
const magneticRange = 140;

// 关卡三专用变量
let dynamicKnotsRotation = 0;
let dynamicKnotsTimer = null;
const colorChangeKnotInfluenceRadius = 75;
const smallMarbleRadius = 30;
const colorInfluenceRadius = 95;

// 弹弓相关变量
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragEndX = 0;
let dragEndY = 0;
let rubberBand = null;
let currentSlingshot = null;
let dragMarble = null; // 拖拽弹珠
let currentPowerWrapper = null; // 当前力度进度条包装器
let currentPowerMeterFill = null; // 当前力度进度条填充
let currentPowerMeterText = null; // 当前力度进度条文本
let originalSlingshotMarbleVisible = true; // 记录原始弹珠是否可见

// 音频相关
let backgroundMusic = null; // 背景音乐
let clickSound = null;
let springSound = null; // 弹簧声
let collisionSound = null; // 撞击声
let successSound = null; // 成功提示音
let isMusicPlaying = true; // 背景音乐是否播放
let isSpringSoundPlaying = false; // 弹簧声是否正在播放

// 关卡三小弹珠计数器
let smallMarblesCount = 0;
let activeSmallMarbles = 0;

// 关卡介绍内容
const levelIntros = {
    1: {
        title: "关卡一",
        conditions: [
            "通关条件：3颗弹珠发射完毕后，布料蓝色区域覆盖率≥60%"
        ],
        mechanisms: [
            "基本玩法：拖动弹弓发射蓝色弹珠，弹珠会留下蓝色染色区域",
            "目标：尽量让蓝色染色覆盖更多的布料区域"
        ],
        tips: "提示：瞄准扎结之间的空隙发射，可以获得更好的覆盖效果。"
    },
    2: {
        title: "关卡二",
        conditions: [
            "通关条件：用4颗弹珠发射完毕后",
            "蓝色覆盖率≥40%，红色覆盖率≥30%",
            "至少1处紫色混合区域（红蓝接触面积≥15%）"
        ],
        mechanisms: [
            "新机制：磁性障碍物 - 吸引红色弹珠，排斥蓝色弹珠",
            "新道具：爆炸弹珠（可选）- 撞击后爆炸，对周围区域染色（圆形扩散），适合大面积染色",
            "弹珠类型：蓝色弹珠×2，红色弹珠×2"
        ],
        tips: "提示：利用磁性障碍物的特性，合理规划红蓝弹珠的发射路径。紫色混合区域需要红蓝染色区域重叠。"
    },
    3: {
        title: "关卡三",
        conditions: [
            "通关条件：用7颗弹珠完成：",
            "蓝色覆盖率≥30%，红色覆盖率≥30%，黄色覆盖率≥20%",
            "至少2处混合色区域（紫色+橙色，各自接触面积≥15%）"
        ],
        mechanisms: [
            "新机制：动态障碍物 - 每5秒旋转90度",
            "新机制：变色障碍物 - 被撞击后改变颜色，影响周围染色区域色彩倾向",
            "新机制：黄色弹珠撞击后分裂为2个小弹珠（向左上/右下飞行）",
            "小弹珠特性：染色半径减半，速度+50%",
            "弹珠类型：蓝色弹珠×3，红色弹珠×3，黄色弹珠×2"
        ],
        tips: "提示：注意动态障碍物的旋转规律。黄色弹珠分裂后可以覆盖更多区域。变色障碍物可以改变周围染色颜色。"
    }
};

// ========== 初始化函数 ==========
function init() {
    console.log("游戏初始化");
    
    // 初始化音频
    initAudio();
    
    // 监听页面点击以解锁音频
    document.addEventListener('click', unlockAudio);
    
    // 初始化游戏主界面（确保所有关卡都隐藏）
    document.querySelectorAll('.level-container').forEach(level => {
        level.style.display = 'none';
    });
    document.getElementById('winModal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('explosionChoiceModal').style.display = 'none';
    document.getElementById('levelIntro').style.display = 'none';
    
    // 确保主界面显示
    document.querySelector('.game-container').style.display = 'block';
}

// 初始化音频
function initAudio() {
    try {
        // 背景音乐
        backgroundMusic = new Audio('../移动应用实训/sounds/background-music.mp3');
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.2;
        // 点击音效
        clickSound = new Audio('../移动应用实训/sounds/click.wav');
        clickSound.volume = 0.5;
        
        // 弹簧声
        springSound = new Audio('../移动应用实训/sounds/弹簧声.mp3');
        springSound.volume = 0.6;
        springSound.loop = true; // 设置循环播放
        
        // 撞击声
        collisionSound = new Audio('../移动应用实训/sounds/撞击声.mp3');
        collisionSound.volume = 0.7;
        
        // 成功提示音
        successSound = new Audio('../移动应用实训/sounds/游戏成功提示音.mp3');
        successSound.volume = 0.7;
        
        console.log("音频初始化成功");
        // 尝试播放背景音乐（需要用户交互）
        document.addEventListener('click', function firstClick() {
            if (backgroundMusic && isMusicPlaying) {
                backgroundMusic.play().catch(e => {
                    console.log("背景音乐自动播放被阻止，用户需要点击后播放");
                });
            }
            document.removeEventListener('click', firstClick);
        });
        
    } catch (e) {
        console.log("音频加载失败，使用备用音效", e);
        // 使用备用音效
        backgroundMusic = {
            play: function() {
                console.log("背景音乐播放");
            },
            pause: function() {},
            currentTime: 0,
            volume: 0
        };
    
        clickSound = {
            play: function() {
                console.log("点击音效");
            },
            pause: function() {},
            currentTime: 0
        };
        
        springSound = {
            play: function() {
                console.log("弹簧声");
            },
            pause: function() {},
            currentTime: 0
        };
        
        collisionSound = {
            play: function() {
                console.log("撞击声");
            },
            pause: function() {},
            currentTime: 0
        };
        
        successSound = {
            play: function() {
                console.log("成功提示音");
            }
        };
    }
}

// 解锁音频播放
function unlockAudio() {
    console.log("音频已解锁");
    document.removeEventListener('click', unlockAudio);
}

// 播放点击音效
function playClickSound() {
    if (clickSound) {
        try {
            // 重置音效以允许多次快速播放
            if (clickSound.pause) {
                clickSound.pause();
                clickSound.currentTime = 0;
            }
            clickSound.play().catch(e => {
                console.log("点击音效播放失败:", e);
            });
        } catch (e) {
            console.log("点击音效播放异常:", e);
        }
    }
}

// 播放背景音乐
function playBackgroundMusic() {
    if (backgroundMusic && isMusicPlaying) {
        try {
            backgroundMusic.play().catch(e => {
                console.log("背景音乐播放失败:", e);
            });
        } catch (e) {
            console.log("背景音乐播放异常:", e);
        }
    }
}
// 停止背景音乐
function stopBackgroundMusic() {
    if (backgroundMusic) {
        try {
            backgroundMusic.pause();
        } catch (e) {
            console.log("背景音乐停止异常:", e);
        }
    }
}
// 播放弹簧声
function playSpringSound() {
    if (springSound && !isSpringSoundPlaying) {
        try {
            springSound.currentTime = 0;
            springSound.play().then(() => {
                isSpringSoundPlaying = true;
                console.log("弹簧声开始播放");
            }).catch(e => {
                console.log("弹簧声播放失败:", e);
            });
        } catch (e) {
            console.log("弹簧声播放异常:", e);
        }
    }
}

// 停止弹簧声
function stopSpringSound() {
    if (springSound && isSpringSoundPlaying) {
        try {
            springSound.pause();
            springSound.currentTime = 0;
            isSpringSoundPlaying = false;
            console.log("弹簧声停止播放");
        } catch (e) {
            console.log("弹簧声停止异常:", e);
        }
    }
}

// 播放撞击声
function playCollisionSound() {
    if (collisionSound) {
        try {
            // 停止之前的撞击声
            if (collisionSound.pause) {
                collisionSound.pause();
                collisionSound.currentTime = 0;
            }
            // 设置音量确保能听到，不会被背景音乐覆盖
            collisionSound.volume = 0.7;
            collisionSound.play().catch(e => {
                console.log("撞击声播放失败:", e);
            });
        } catch (e) {
            console.log("撞击声播放异常:", e);
        }
    }
}

// 播放成功提示音
function playSuccessSound() {
    if (successSound) {
        try {
            // 确保成功提示音不会被其他音频盖住
            successSound.currentTime = 0;
            successSound.volume = 0.8; // 设置较高音量确保能听到
            successSound.play().catch(e => {
                console.log("成功提示音播放失败:", e);
            });
        } catch (e) {
            console.log("成功提示音播放异常:", e);
        }
    }
}

// 切换音乐播放状态
function toggleMusic() {
    playClickSound();
    
    isMusicPlaying = !isMusicPlaying;
    
    if (isMusicPlaying) {
        // 播放音乐
        document.querySelectorAll('.music-control').forEach(btn => {
            btn.textContent = '♪';
        });
        if (backgroundMusic) {
            backgroundMusic.play().catch(e => {
                console.log("背景音乐播放失败:", e);
            });
        }
    } else {
        // 暂停音乐
        document.querySelectorAll('.music-control').forEach(btn => {
            btn.textContent = '🔇';
        });
        if (backgroundMusic) {
            backgroundMusic.pause();
        }
    }
}

// ========== 面积计算函数 ==========
function calculateCircleIntersectionArea(x1, y1, r1, x2, y2, r2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const d = Math.sqrt(dx * dx + dy * dy);
    
    if (d >= r1 + r2) return 0;
    if (d <= Math.abs(r1 - r2)) return Math.PI * Math.pow(Math.min(r1, r2), 2);
    
    const r1Sq = r1 * r1;
    const r2Sq = r2 * r2;
    const dSq = d * d;
    
    const alpha = Math.acos((r1Sq + dSq - r2Sq) / (2 * r1 * d));
    const beta = Math.acos((r2Sq + dSq - r1Sq) / (2 * r2 * d));
    
    let area = r1Sq * alpha + r2Sq * beta - 0.5 * Math.sqrt((-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2));
    return area;
}

function calculateMergedCircleArea(circles) {
    if (circles.length === 0) return 0;
    if (circles.length === 1) return Math.PI * Math.pow(circles[0].radius, 2);
    
    let totalArea = Math.PI * Math.pow(circles[0].radius, 2);
    
    for (let i = 1; i < circles.length; i++) {
        const currentCircle = circles[i];
        let overlapArea = 0;
        
        for (let j = 0; j < i; j++) {
            const existingCircle = circles[j];
            overlapArea += calculateCircleIntersectionArea(
                currentCircle.x, currentCircle.y, currentCircle.radius,
                existingCircle.x, existingCircle.y, existingCircle.radius
            );
        }
        
        const currentArea = Math.PI * Math.pow(currentCircle.radius, 2);
        totalArea += Math.max(0, currentArea - overlapArea);
    }
    
    return totalArea;
}

function calculateEffectiveDyedArea(circles, level) {
    // 获取扎结位置
    let knotPositions;
    if (level === 1) {
        knotPositions = [
            {x: 56, y: 66, radius: knotBlockRadius},
            {x: 196, y: 198, radius: knotBlockRadius}
        ];
    } else if (level === 2) {
        knotPositions = [
            {x: 56, y: 66, radius: knotBlockRadius},
            {x: 196, y: 198, radius: knotBlockRadius},
            {x: 140, y: 132, radius: knotBlockRadius}
        ];
    } else if (level === 3) {
        knotPositions = [
            // 固定扎结
            {x: 56, y: 49, radius: knotBlockRadius},
            {x: 210, y: 231, radius: knotBlockRadius},
            // 动态扎结
            {x: 182, y: 99, radius: knotBlockRadius},
            {x: 84, y: 181, radius: knotBlockRadius},
            // 变色扎结
            {x: 126, y: 132, radius: knotBlockRadius},
            {x: 224, y: 132, radius: knotBlockRadius}
        ];
    }
    
    let mergedArea = calculateMergedCircleArea(circles);
    
    let knotOverlapArea = 0;
    for (const knot of knotPositions) {
        for (const circle of circles) {
            knotOverlapArea += calculateCircleIntersectionArea(
                circle.x, circle.y, circle.radius,
                knot.x, knot.y, knot.radius
            );
        }
    }
    
    let effectiveArea = Math.max(0, mergedArea - knotOverlapArea);
    
    const maxDyeableArea = level === 1 ? totalDyeableAreaLevel1 : 
                          level === 2 ? totalDyeableAreaLevel2 : 
                          totalDyeableAreaLevel3;
    effectiveArea = Math.min(effectiveArea, maxDyeableArea);
    
    return effectiveArea;
}

// ========== 游戏核心函数 ==========
function showLevelIntro(level) {
    playClickSound();
    
    currentLevel = level;
    const intro = levelIntros[level];
    const introElement = document.getElementById('levelIntro');
    const titleElement = document.getElementById('introTitle');
    const contentElement = document.getElementById('introContent');
    
    titleElement.textContent = intro.title;
    
    let html = `
        <div class="condition-item">
            <h3>通关条件：</h3>
            <ul>`;
    
    intro.conditions.forEach(condition => {
        html += `<li>${condition}</li>`;
    });
    
    html += `</ul></div><div class="mechanism-item"><h3>游戏机制：</h3><ul>`;
    
    intro.mechanisms.forEach(mechanism => {
        html += `<li>${mechanism}</li>`;
    });
    
    html += `</ul></div><p>${intro.tips}</p>`;
    
    contentElement.innerHTML = html;
    introElement.style.display = 'block';
    
    // 隐藏主界面
    document.querySelector('.game-container').style.display = 'none';
}

function startLevel() {
    // 隐藏介绍页面
    document.getElementById('levelIntro').style.display = 'none';
    
    // 初始化游戏
    initGame(currentLevel);
    document.getElementById(`level${currentLevel}`).style.display = 'block';
    
    // 如果是第二关，显示爆炸弹珠选择弹窗
    if (currentLevel === 2) {
        setTimeout(() => {
            showExplosionChoiceModal();
        }, 500);
    }
}

function initGame(level) {
    console.log(`初始化关卡 ${level}`);
    isMarbleMoving = false;
    isDragging = false;
    
    // 停止弹簧声
    stopSpringSound();
    
    // 清理全局拖动事件
    document.onmouseup = null;
    document.onmousemove = null;
    document.ontouchend = null;
    document.ontouchmove = null;
    
    // 重置第二关爆炸弹珠状态
    if (level === 2) {
        explosionMarbleLevel2 = false;
        firstBlueMarbleEnhanced = false;
    }
    
    // 重置小弹珠计数器（关卡三）
    if (level === 3) {
        smallMarblesCount = 0;
        activeSmallMarbles = 0;
    }
    
    const levelContainer = document.getElementById(`level${level}`);
    const canvas = document.getElementById(`canvas${level}`);
    const slingshot = document.getElementById(`slingshot${level}`);
    const marbleSelection = document.getElementById(`marble-selection${level}`);
    
    // 停止动态扎结定时器
    if (dynamicKnotsTimer) {
        clearInterval(dynamicKnotsTimer);
        dynamicKnotsTimer = null;
    }
    
    // 清空染色区域
    const existingDyeAreas = canvas.querySelectorAll('.dye-area, .knot-influence-area, .rubber-band, .drag-marble');
    existingDyeAreas.forEach(area => area.remove());
    
    // 清空爆炸效果
    const existingExplosions = canvas.querySelectorAll('.explosion');
    existingExplosions.forEach(exp => exp.remove());
    
    // 隐藏力度进度条
    const powerWrapper = document.getElementById(`power-wrapper${level}`);
    if (powerWrapper) {
        powerWrapper.style.display = 'none';
    }
    
    // 重置变色扎结
    if (level === 3) {
        const colorChangeKnots = canvas.querySelectorAll('.knot-color-change');
        colorChangeKnots.forEach(knot => {
            knot.className = 'knot knot-color-change blue-state';
            knot.dataset.color = 'blue';
            createColorInfluenceArea(canvas, knot);
        });
        
        startDynamicKnotsRotation(canvas);
    }
    
    // 初始化弹珠选择区域
    if (level === 1) {
        // 关卡一初始化
        dyeCircles.length = 0;
        marblesCount = 3;
        dyedArea = 0;
        
        document.getElementById(`marbles-left${level}`).textContent = `剩余弹珠: ${marblesCount}`;
        document.getElementById(`progress${level}`).style.width = '0%';
        document.getElementById(`progress${level}`).textContent = '0%';
        
        // 初始化弹珠选择
        marbleSelection.innerHTML = '';
        for (let i = 0; i < marblesCount; i++) {
            const marble = document.createElement('div');
            marble.className = 'selectable-marble selectable-marble-blue';
            marble.dataset.color = 'blue';
            marble.addEventListener('click', function() {
                if (isMarbleMoving) return;
                playClickSound(); // 添加弹珠选择音效
                selectMarble(this, level);
            });
            
            if (i === 0) {
                marble.classList.add('active');
                updateSlingshotMarble(level, 'blue');
            }
            
            marbleSelection.appendChild(marble);
        }
    } else if (level === 2) {
        // 关卡二初始化
        dyeCirclesBlue.length = 0;
        dyeCirclesRed.length = 0;
        blueMarbles = 2;
        redMarbles = 2;
        dyedAreaBlue = 0;
        dyedAreaRed = 0;
        purpleAreaRatio = 0;
        
        // 重置进度条显示
        const progressBlue = document.getElementById('progress2-blue');
        const progressRed = document.getElementById('progress2-red');
        const progressPurple = document.getElementById('progress2-purple');
        
        progressBlue.style.width = '0%';
        progressBlue.textContent = '0%';
        progressRed.style.width = '0%';
        progressRed.textContent = '0%';
        progressPurple.style.width = '0%';
        progressPurple.textContent = '混合区域: 0%';
        
        // 初始化弹珠选择
        marbleSelection.innerHTML = '';
        const marbles = [
            {color: 'blue'}, {color: 'blue'},
            {color: 'red'}, {color: 'red'}
        ];
        
        marbles.forEach((marbleData, index) => {
            const marble = document.createElement('div');
            marble.className = `selectable-marble selectable-marble-${marbleData.color}`;
            marble.dataset.color = marbleData.color;
            marble.addEventListener('click', function() {
                if (isMarbleMoving) return;
                playClickSound(); // 添加弹珠选择音效
                selectMarble(this, level);
            });
            
            if (index === 0) {
                marble.classList.add('active');
                updateSlingshotMarble(level, marbleData.color);
                selectedColor = marbleData.color;
            }
            
            marbleSelection.appendChild(marble);
        });
        
    } else if (level === 3) {
        // 关卡三初始化
        dyeCirclesBlue.length = 0;
        dyeCirclesRed.length = 0;
        dyeCirclesYellow.length = 0;
        blueMarbles = 3;
        redMarbles = 3;
        yellowMarbles = 2;
        dyedAreaBlue = 0;
        dyedAreaRed = 0;
        dyedAreaYellow = 0;
        purpleAreaRatio = 0;
        orangeAreaRatio = 0;
        
        // 重置进度条
        const progressBlue = document.getElementById('progress3-blue');
        const progressRed = document.getElementById('progress3-red');
        const progressYellow = document.getElementById('progress3-yellow');
        const progressPurple = document.getElementById('progress3-purple');
        const progressOrange = document.getElementById('progress3-orange');
        
        progressBlue.style.width = '0%';
        progressBlue.textContent = '0%';
        progressRed.style.width = '0%';
        progressRed.textContent = '0%';
        progressYellow.style.width = '0%';
        progressYellow.textContent = '0%';
        progressPurple.style.width = '0%';
        progressPurple.textContent = '紫: 0%';
        progressOrange.style.width = '0%';
        progressOrange.textContent = '橙: 0%';
        
        // 初始化弹珠选择
        marbleSelection.innerHTML = '';
        const marbles = [
            {color: 'blue'}, {color: 'blue'}, {color: 'blue'},
            {color: 'red'}, {color: 'red'}, {color: 'red'},
            {color: 'yellow'}, {color: 'yellow'}
        ];
        
        marbles.forEach((marbleData, index) => {
            const marble = document.createElement('div');
            marble.className = `selectable-marble selectable-marble-${marbleData.color}`;
            marble.dataset.color = marbleData.color;
            marble.addEventListener('click', function() {
                if (isMarbleMoving) return;
                playClickSound(); // 添加弹珠选择音效
                selectMarble(this, level);
            });
            
            if (index === 0) {
                marble.classList.add('active');
                updateSlingshotMarble(level, marbleData.color);
                selectedColor = marbleData.color;
            }
            
            marbleSelection.appendChild(marble);
        });
    }
    
    // 设置弹弓拖动事件
    setupSlingshotDrag(slingshot, canvas, level);
    
    // 隐藏弹窗
    document.getElementById('winModal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('explosionChoiceModal').style.display = 'none';
}

// 显示爆炸弹珠选择弹窗
function showExplosionChoiceModal() {
    console.log("显示爆炸弹珠选择弹窗");
    const explosionChoiceModal = document.getElementById('explosionChoiceModal');
    const overlay = document.getElementById('overlay');
    
    if (explosionChoiceModal && overlay) {
        explosionChoiceModal.style.display = 'block';
        overlay.style.display = 'block';
    }
}

// 使用爆炸弹珠
function useExplosionMarble() {
    playClickSound(); // 添加按钮点击音效
    explosionMarbleLevel2 = true;
    firstBlueMarbleEnhanced = true;
    
    // 关闭弹窗
    document.getElementById('explosionChoiceModal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    
    // 不再显示页面提示
}

// 跳过爆炸弹珠
function skipExplosionMarble() {
    playClickSound(); // 添加按钮点击音效
    explosionMarbleLevel2 = false;
    firstBlueMarbleEnhanced = false;
    
    // 关闭弹窗
    document.getElementById('explosionChoiceModal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    
    // 不再显示页面提示
}

// 启动动态扎结旋转（关卡三）
function startDynamicKnotsRotation(canvas) {
    dynamicKnotsTimer = setInterval(() => {
        const dynamicKnots = canvas.querySelectorAll('.knot-dynamic');
        dynamicKnotsRotation += 90;
        
        dynamicKnots.forEach(knot => {
            const angle = (dynamicKnotsRotation * Math.PI) / 180;
            const radius = 22;
            
            if (knot.dataset.id === 'knot2') {
                const centerX = 182;
                const centerY = 99;
                const newX = centerX + radius * Math.cos(angle);
                const newY = centerY + radius * Math.sin(angle);
                
                knot.style.left = `${newX}px`;
                knot.style.top = `${newY}px`;
            } else if (knot.dataset.id === 'knot3') {
                const centerX = 84;
                const centerY = 181;
                const newX = centerX + radius * Math.cos(angle + Math.PI/2);
                const newY = centerY + radius * Math.sin(angle + Math.PI/2);
                
                knot.style.left = `${newX}px`;
                knot.style.top = `${newY}px`;
            }
        });
    }, 5000);
}

// 创建变色扎结影响区域
function createColorInfluenceArea(canvas, knot) {
    const rect = knot.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const centerX = rect.left - canvasRect.left + rect.width / 2;
    const centerY = rect.top - canvasRect.top + rect.height / 2;
    const color = knot.dataset.color;
    
    const oldInfluence = canvas.querySelector(`.knot-influence-area[data-knot-id="${knot.dataset.id}"]`);
    if (oldInfluence) {
        oldInfluence.remove();
    }
    
    const influenceArea = document.createElement('div');
    influenceArea.className = `knot-influence-area ${color}-influence`;
    influenceArea.setAttribute('data-knot-id', knot.dataset.id);
    influenceArea.style.left = (centerX - colorInfluenceRadius) + 'px';
    influenceArea.style.top = (centerY - colorInfluenceRadius) + 'px';
    influenceArea.style.width = (colorInfluenceRadius * 2) + 'px';
    influenceArea.style.height = (colorInfluenceRadius * 2) + 'px';
    
    canvas.appendChild(influenceArea);
}

// 设置弹弓拖动事件
function setupSlingshotDrag(slingshot, canvas, level) {
    currentSlingshot = slingshot;
    
    // 获取力度进度条元素
    currentPowerWrapper = document.getElementById(`power-wrapper${level}`);
    currentPowerMeterFill = document.getElementById(`power-meter-fill${level}`);
    currentPowerMeterText = document.getElementById(`power-meter-text${level}`);
    
    // 鼠标事件
    slingshot.onmousedown = startDrag;
    // 触摸事件
    slingshot.ontouchstart = function(e) {
        if (e.touches.length === 1) {
            e.preventDefault();
            const touch = e.touches[0];
            startDrag({
                clientX: touch.clientX,
                clientY: touch.clientY,
                preventDefault: () => {}
            });
        }
    };
    
    function startDrag(e) {
        if (isMarbleMoving) return;
        
        // 检查是否有弹珠
        const selectedMarble = document.querySelector(`#marble-selection${level} .selectable-marble.active`);
        if (!selectedMarble) return;
        
        isDragging = true;
        originalSlingshotMarbleVisible = true;
        
        // 开始播放弹簧声
        playSpringSound();
        
        const rect = canvas.getBoundingClientRect();
        const slingshotRect = slingshot.getBoundingClientRect();
        
        dragStartX = slingshotRect.left - rect.left + slingshotRect.width / 2;
        dragStartY = slingshotRect.top - rect.top + slingshotRect.height / 2;
        
        dragEndX = e.clientX - rect.left;
        dragEndY = e.clientY - rect.top;
        
        // 隐藏弹弓上的原始弹珠
        const currentMarble = document.getElementById(`current-marble${level}`);
        if (currentMarble) {
            currentMarble.style.opacity = '0';
        }
        
        // 创建橡皮筋
        createRubberBand(canvas, dragStartX, dragStartY, dragEndX, dragEndY);
        
        // 创建拖拽弹珠
        createDragMarble(canvas, dragEndX, dragEndY, selectedColor);
        
        // 显示力度进度条
        if (currentPowerWrapper) {
            currentPowerWrapper.style.display = 'flex';
        }
        
        e.preventDefault();
    }

    // 鼠标移动事件
    document.onmousemove = handleDragMove;
    // 触摸移动事件
    document.ontouchmove = function(e) {
        if (e.touches.length === 1 && isDragging) {
            e.preventDefault();
            const touch = e.touches[0];
            handleDragMove({
                clientX: touch.clientX,
                clientY: touch.clientY,
                preventDefault: () => {}
            });
        }
    };
    
    function handleDragMove(e) {
        if (!isDragging) return;
        
        const rect = canvas.getBoundingClientRect();
        dragEndX = e.clientX - rect.left;
        dragEndY = e.clientY - rect.top;
        
        // 限制最大拉伸距离
        const maxPullDistance = 70;
        const dx = dragEndX - dragStartX;
        const dy = dragEndY - dragStartY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > maxPullDistance) {
            const angle = Math.atan2(dy, dx);
            dragEndX = dragStartX + Math.cos(angle) * maxPullDistance;
            dragEndY = dragStartY + Math.sin(angle) * maxPullDistance;
        }
        
        // 更新橡皮筋
        if (rubberBand) {
            updateRubberBand(rubberBand, dragStartX, dragStartY, dragEndX, dragEndY);
        }
        
        // 更新拖拽弹珠位置
        if (dragMarble) {
            dragMarble.style.left = (dragEndX - 11) + 'px';
            dragMarble.style.top = (dragEndY - 11) + 'px';
        }
        
        // 更新力度进度条
        updatePowerMeter(distance, maxPullDistance);
        
        e.preventDefault();
    }

    // 鼠标释放事件
    document.onmouseup = handleDragEnd;
    // 触摸结束事件
    document.ontouchend = function(e) {
        if (isDragging) {
            e.preventDefault();
            if (e.changedTouches.length === 1) {
                const touch = e.changedTouches[0];
                handleDragEnd({
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
            } else {
                handleDragEnd({});
            }
        }
    };
    
    function handleDragEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        
        // 停止弹簧声
        stopSpringSound();
        
        // 移除橡皮筋
        if (rubberBand) {
            rubberBand.remove();
            rubberBand = null;
        }
        
        // 移除拖拽弹珠
        if (dragMarble) {
            dragMarble.remove();
            dragMarble = null;
        }
        
        // 隐藏力度进度条
        if (currentPowerWrapper) {
            currentPowerWrapper.style.display = 'none';
        }
        
        // 如果拖动距离太小，则不发射，恢复原始弹珠显示
        const dragDx = dragStartX - dragEndX;
        const dragDy = dragStartY - dragEndY;
        const dragDistance = Math.sqrt(dragDx * dragDx + dragDy * dragDy);
        
        if (dragDistance < 8) {
            // 恢复弹弓上的原始弹珠显示
            const currentMarble = document.getElementById(`current-marble${currentLevel}`);
            if (currentMarble) {
                currentMarble.style.opacity = '1';
            }
            return;
        }
        
        // 发射弹珠（弹弓上的弹珠保持隐藏状态）
        launchMarbleFromSlingshot(canvas, slingshot, level);
    }
}

// 创建橡皮筋
function createRubberBand(canvas, startX, startY, endX, endY) {
    rubberBand = document.createElement('div');
    rubberBand.className = 'rubber-band';
    canvas.appendChild(rubberBand);
    updateRubberBand(rubberBand, startX, startY, endX, endY);
}

// 更新橡皮筋
function updateRubberBand(rubberBand, startX, startY, endX, endY) {
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    rubberBand.style.width = length + 'px';
    rubberBand.style.left = startX + 'px';
    rubberBand.style.top = startY + 'px';
    rubberBand.style.transform = `rotate(${angle}deg)`;
    rubberBand.style.transformOrigin = '0 0';
    
    // 根据力度改变橡皮筋颜色
    const maxDistance = 70;
    const powerRatio = Math.min(1, length / maxDistance);
    
    const red = 255;
    const green = Math.floor(255 * (1 - powerRatio * 0.7));
    const blue = Math.floor(255 * (1 - powerRatio));
    
    rubberBand.style.backgroundColor = `rgba(${red}, ${green}, ${blue}, 0.8)`;
    rubberBand.style.boxShadow = `0 0 ${powerRatio * 8}px rgba(${red}, ${green}, ${blue}, 0.5)`;
}

// 创建拖拽弹珠
function createDragMarble(canvas, x, y, color) {
    dragMarble = document.createElement('div');
    dragMarble.className = `drag-marble drag-marble-${color}`;
    dragMarble.style.left = (x - 11) + 'px';
    dragMarble.style.top = (y - 11) + 'px';
    canvas.appendChild(dragMarble);
}

// 更新力度进度条
function updatePowerMeter(distance, maxDistance) {
    if (!currentPowerMeterFill || !currentPowerMeterText) return;
    
    const powerRatio = Math.min(1, distance / maxDistance);
    const powerPercentage = Math.round(powerRatio * 100);
    
    currentPowerMeterFill.style.width = `${powerPercentage}%`;
    currentPowerMeterText.textContent = `力度: ${powerPercentage}%`;
}

// 选择弹珠
function selectMarble(marbleElement, level) {
    if (isMarbleMoving) return;
    
    // 移除所有激活状态
    const allMarbles = document.querySelectorAll(`#marble-selection${level} .selectable-marble`);
    allMarbles.forEach(m => m.classList.remove('active'));
    
    // 设置当前弹珠为激活状态
    marbleElement.classList.add('active');
    selectedColor = marbleElement.dataset.color;
    
    // 更新弹弓上的弹珠
    updateSlingshotMarble(level, selectedColor);
}

// 更新弹弓上的弹珠
function updateSlingshotMarble(level, color) {
    const slingshotMarble = document.getElementById(`current-marble${level}`);
    slingshotMarble.className = `slingshot-marble slingshot-marble-${color}`;
    slingshotMarble.style.opacity = '1'; // 确保弹弓上的弹珠可见
}

// 从弹弓发射弹珠
function launchMarbleFromSlingshot(canvas, slingshot, level) {
    if (isMarbleMoving) return;
    
    // 获取当前选中的弹珠
    const selectedMarble = document.querySelector(`#marble-selection${level} .selectable-marble.active`);
    if (!selectedMarble) return;
    
    const marbleColor = selectedColor;
    let isExplosionMarble = false;
    let isYellowMarble = false;
    
    // 检查是否为第二关的第一个蓝色爆炸弹珠
    if (level === 2 && explosionMarbleLevel2 && marbleColor === 'blue' && firstBlueMarbleEnhanced) {
        isExplosionMarble = true;
        firstBlueMarbleEnhanced = false; // 只生效一次
    }
    
    // 移除已选中的弹珠
    selectedMarble.remove();
    
    // 更新弹珠数量
    if (level === 1) {
        marblesCount--;
        document.getElementById(`marbles-left${level}`).textContent = `剩余弹珠: ${marblesCount}`;
        
        // 选择下一个弹珠
        const nextMarble = document.querySelector(`#marble-selection${level} .selectable-marble:first-child`);
        if (nextMarble) {
            nextMarble.classList.add('active');
            selectedColor = nextMarble.dataset.color;
            // 弹珠发射后再更新弹弓上的弹珠
        }
    } else if (level === 2) {
        if (marbleColor === 'blue') {
            blueMarbles--;
        } else {
            redMarbles--;
        }
        
        // 选择下一个弹珠
        const nextMarble = document.querySelector(`#marble-selection${level} .selectable-marble:first-child`);
        if (nextMarble) {
            nextMarble.classList.add('active');
            selectedColor = nextMarble.dataset.color;
            // 弹珠发射后再更新弹弓上的弹珠
        }
    } else if (level === 3) {
        isYellowMarble = (marbleColor === 'yellow');
        
        if (marbleColor === 'blue') {
            blueMarbles--;
        } else if (marbleColor === 'red') {
            redMarbles--;
        } else {
            yellowMarbles--;
        }
        
        // 选择下一个弹珠
        const nextMarble = document.querySelector(`#marble-selection${level} .selectable-marble:first-child`);
        if (nextMarble) {
            nextMarble.classList.add('active');
            selectedColor = nextMarble.dataset.color;
            // 弹珠发射后再更新弹弓上的弹珠
        }
    }
    
    isMarbleMoving = true;
    
    // 获取弹弓位置
    const slingshotRect = slingshot.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const startX = slingshotRect.left - canvasRect.left + slingshotRect.width / 2;
    const startY = slingshotRect.top - canvasRect.top + slingshotRect.height / 2;
    
    // 计算发射方向（与拖动方向相反）
    const dx = dragStartX - dragEndX;
    const dy = dragStartY - dragEndY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 计算发射力度（基于拖动距离）
    const maxDragDistance = 70;
    const powerScale = Math.min(1, distance / maxDragDistance);
    const basePower = 12; // 基础力度
    
    // 计算发射方向
    const directionX = dx / distance;
    const directionY = dy / distance;
    
    // 红色弹珠速度快10%
    let speedMultiplier = 1;
    if (marbleColor === 'red') {
        speedMultiplier = 1.1;
    } else if (marbleColor === 'yellow') {
        speedMultiplier = 0.9;
    }
    
    // 创建弹珠元素
    const marble = document.createElement('div');
    if (isExplosionMarble) {
        marble.className = `flying-marble flying-marble-${marbleColor} flying-marble-explosion`;
    } else {
        marble.className = `flying-marble flying-marble-${marbleColor}`;
    }
    marble.style.left = (startX - 13) + 'px';
    marble.style.top = (startY - 13) + 'px';
    canvas.appendChild(marble);
    
    // 弹珠移动参数
    let posX = startX;
    let posY = startY;
    let velX = directionX * basePower * powerScale * speedMultiplier;
    let velY = directionY * basePower * powerScale * speedMultiplier;
    
    // 记录是否已经分裂（针对黄色弹珠）
    let hasSplit = false;
    
    // 弹珠移动动画
    const moveInterval = setInterval(() => {
        // 空气阻力
        velX *= airResistance;
        velY *= airResistance;
        
        // 磁性扎结效果（仅关卡二）
        if (level === 2) {
            const magneticKnots = canvas.querySelectorAll('.knot[data-magnetic="true"]');
            magneticKnots.forEach(knot => {
                const knotRect = knot.getBoundingClientRect();
                const canvasRect = canvas.getBoundingClientRect();
                const knotCenterX = knotRect.left - canvasRect.left + knotRect.width / 2;
                const knotCenterY = knotRect.top - canvasRect.top + knotRect.height / 2;
                
                const dx = knotCenterX - posX;
                const dy = knotCenterY - posY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < magneticRange && distance > 0) {
                    const dirX = dx / distance;
                    const dirY = dy / distance;
                    const force = magneticForce * (1 - distance / magneticRange);
                    
                    if (marbleColor === 'red') {
                        velX += dirX * force;
                        velY += dirY * force;
                    } else if (marbleColor === 'blue') {
                        velX -= dirX * force;
                        velY -= dirY * force;
                    }
                }
            });
        }
        
        // 更新位置
        posX += velX;
        posY += velY;
        marble.style.left = (posX - 13) + 'px';
        marble.style.top = (posY - 13) + 'px';
        
        // 边界反弹
        let collidedWithBoundary = false;
        if (posX - 13 <= 0 || posX + 13 >= canvasWidth) {
            velX = -velX * 0.6;
            posX = posX - 13 <= 0 ? 13 : canvasWidth - 13;
            collidedWithBoundary = true;
        }
        if (posY - 13 <= 0 || posY + 13 >= canvasHeight) {
            velY = -velY * 0.6;
            posY = posY - 13 <= 0 ? 13 : canvasHeight - 13;
            collidedWithBoundary = true;
        }
        
        // 播放边界碰撞音效
        if (collidedWithBoundary) {
            playCollisionSound();
        }
        
        // 扎结碰撞检测
        const knots = canvas.querySelectorAll('.knot');
        let collidedWithKnot = false;
        let collidedKnot = null;
        
        knots.forEach(knot => {
            const knotRect = knot.getBoundingClientRect();
            const canvasRect = canvas.getBoundingClientRect();
            const knotCenterX = knotRect.left - canvasRect.left + knotRect.width / 2;
            const knotCenterY = knotRect.top - canvasRect.top + knotRect.height / 2;
            const distanceX = posX - knotCenterX;
            const distanceY = posY - knotCenterY;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            
            const collisionRadius = 13 + knotBlockRadius;
            if (distance < collisionRadius) {
                collidedWithKnot = true;
                collidedKnot = knot;
                
                const normalX = distanceX / distance;
                const normalY = distanceY / distance;
                const dotProduct = velX * normalX + velY * normalY;
                
                velX = (velX - 2 * dotProduct * normalX) * 0.5;
                velY = (velY - 2 * dotProduct * normalY) * 0.5;
                posX += velX * 2;
                posY += velY * 2;
                
                // 播放扎结碰撞音效
                playCollisionSound();
                
                // 处理变色扎结碰撞（关卡三）
                if (level === 3 && knot.dataset.colorChange === 'true') {
                    handleColorChangeKnotCollision(canvas, knot, marbleColor);
                }
                
                // 黄色弹珠撞击扎结后分裂
                if (level === 3 && marbleColor === 'yellow' && !hasSplit) {
                    hasSplit = true;
                    clearInterval(moveInterval);
                    marble.remove();
                    
                    // 增加小弹珠计数器
                    smallMarblesCount += 2;
                    activeSmallMarbles += 2;
                    
                    createSplitMarbles(canvas, posX, posY, velX, velY, level);
                    isMarbleMoving = false;
                    
                    // 发射完成后，更新弹弓上的弹珠并显示
                    updateSlingshotMarbleAfterLaunch(level);
                    
                    // 检查主弹珠是否发射完毕
                    const allMarblesUsed = checkAllMarblesUsed(level);
                    
                    // 如果所有主弹珠用完，稍后检查过关条件（等待小弹珠完成）
                    if (allMarblesUsed) {
                        setTimeout(() => {
                            checkIfAllSmallMarblesFinished(level);
                        }, 500);
                    }
                    return;
                }
            }
        });
        
        // 速度过小停止
        const speedMagnitude = Math.sqrt(velX * velX + velY * velY);
        if (speedMagnitude < 0.2) {
            clearInterval(moveInterval);
            // 创建染色区域
            if (level === 1) {
                createDyeArea(canvas, posX, posY, 'blue', false);
            } else if (level === 2) {
                createDyeArea(canvas, posX, posY, marbleColor, isExplosionMarble);
                calculatePurpleAreaLevel2();
            } else if (level === 3) {
                createDyeArea(canvas, posX, posY, marbleColor, false);
                calculateMixedAreasLevel3();
            }
            marble.remove();
            isMarbleMoving = false;
            
            // 发射完成后，更新弹弓上的弹珠并显示
            updateSlingshotMarbleAfterLaunch(level);
            
            const allMarblesUsed = checkAllMarblesUsed(level);
            
            if (allMarblesUsed) {
                setTimeout(() => checkWinCondition(level), 1000);
            }
            return;
        }
    }, 16);
}

// 检查所有小弹珠是否完成
function checkIfAllSmallMarblesFinished(level) {
    // 等待一小段时间确保小弹珠状态更新
    setTimeout(() => {
        if (activeSmallMarbles === 0 && checkAllMarblesUsed(level)) {
            setTimeout(() => checkWinCondition(level), 1000);
        }
    }, 100);
}

// 发射完成后更新弹弓上的弹珠
function updateSlingshotMarbleAfterLaunch(level) {
    // 恢复弹弓上的弹珠显示
    const currentMarble = document.getElementById(`current-marble${level}`);
    if (currentMarble) {
        // 更新为下一个弹珠的颜色
        const nextMarble = document.querySelector(`#marble-selection${level} .selectable-marble.active`);
        if (nextMarble) {
            const nextColor = nextMarble.dataset.color;
            currentMarble.className = `slingshot-marble slingshot-marble-${nextColor}`;
        }
        currentMarble.style.opacity = '1';
    }
}

// 处理变色扎结碰撞
function handleColorChangeKnotCollision(canvas, knot, marbleColor) {
    if (!knot.dataset.colorChange) return;
    
    const newColor = marbleColor;
    
    knot.className = `knot knot-color-change ${newColor}-state`;
    knot.dataset.color = newColor;
    
    createColorInfluenceArea(canvas, knot);
    
    convertSurroundingColors(canvas, knot, newColor);
}

// 转换周围染色区域颜色
function convertSurroundingColors(canvas, knot, targetColor) {
    const rect = knot.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const centerX = rect.left - canvasRect.left + rect.width / 2;
    const centerY = rect.top - canvasRect.top + rect.height / 2;
    
    const dyeAreas = canvas.querySelectorAll('.dye-area');
    dyeAreas.forEach(area => {
        const areaRect = area.getBoundingClientRect();
        const areaCenterX = areaRect.left - canvasRect.left + areaRect.width / 2;
        const areaCenterY = areaRect.top - canvasRect.top + areaRect.height / 2;
        
        const dx = areaCenterX - centerX;
        const dy = areaCenterY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < colorInfluenceRadius) {
            let currentColor = '';
            if (area.classList.contains('dye-area-blue')) currentColor = 'blue';
            else if (area.classList.contains('dye-area-red')) currentColor = 'red';
            else if (area.classList.contains('dye-area-yellow')) currentColor = 'yellow';
            else if (area.classList.contains('dye-area-purple')) currentColor = 'purple';
            else if (area.classList.contains('dye-area-orange')) currentColor = 'orange';
            
            if (currentColor && currentColor !== targetColor) {
                if (targetColor === 'blue') {
                    area.className = 'dye-area dye-area-blue';
                    updateDyeCircleColor(areaCenterX, areaCenterY, 'blue');
                } else if (targetColor === 'red') {
                    area.className = 'dye-area dye-area-red';
                    updateDyeCircleColor(areaCenterX, areaCenterY, 'red');
                } else if (targetColor === 'yellow') {
                    area.className = 'dye-area dye-area-yellow';
                    updateDyeCircleColor(areaCenterX, areaCenterY, 'yellow');
                }
            }
        }
    });
    
    if (currentLevel === 3) {
        calculateDyedAreaBlue();
        calculateDyedAreaRed();
        calculateDyedAreaYellow();
        calculateMixedAreasLevel3();
    }
}

// 更新染色圆数组中的颜色
function updateDyeCircleColor(x, y, newColor) {
    const allCircles = [...dyeCirclesBlue, ...dyeCirclesRed, ...dyeCirclesYellow];
    for (let i = 0; i < allCircles.length; i++) {
        const circle = allCircles[i];
        const dx = circle.x - x;
        const dy = circle.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
            if (dyeCirclesBlue.includes(circle)) {
                const index = dyeCirclesBlue.indexOf(circle);
                dyeCirclesBlue.splice(index, 1);
            } else if (dyeCirclesRed.includes(circle)) {
                const index = dyeCirclesRed.indexOf(circle);
                dyeCirclesRed.splice(index, 1);
            } else if (dyeCirclesYellow.includes(circle)) {
                const index = dyeCirclesYellow.indexOf(circle);
                dyeCirclesYellow.splice(index, 1);
            }
            
            circle.color = newColor;
            if (newColor === 'blue') {
                dyeCirclesBlue.push(circle);
            } else if (newColor === 'red') {
                dyeCirclesRed.push(circle);
            } else if (newColor === 'yellow') {
                dyeCirclesYellow.push(circle);
            }
            break;
        }
    }
}

// 创建分裂的小弹珠（黄色弹珠）
function createSplitMarbles(canvas, x, y, baseVelX, baseVelY, level) {
    createSmallMarble(canvas, x, y, 
        baseVelX * 0.7 - 1.5, baseVelY * 0.7 - 1.5, 
        'yellow', level, true);
    
    createSmallMarble(canvas, x, y, 
        baseVelX * 0.7 + 1.5, baseVelY * 0.7 + 1.5, 
        'yellow', level, false);
}

// 创建小弹珠
function createSmallMarble(canvas, startX, startY, velX, velY, color, level, isFirst) {
    const marble = document.createElement('div');
    marble.className = `flying-marble flying-marble-${color} small-marble`;
    marble.style.left = (startX - 9) + 'px';
    marble.style.top = (startY - 9) + 'px';
    canvas.appendChild(marble);
    
    let posX = startX;
    let posY = startY;
    let currentVelX = velX * 1.5;
    let currentVelY = velY * 1.5;
    
    const moveInterval = setInterval(() => {
        currentVelX *= airResistance;
        currentVelY *= airResistance;
        
        posX += currentVelX;
        posY += currentVelY;
        marble.style.left = (posX - 9) + 'px';
        marble.style.top = (posY - 9) + 'px';
        
        // 边界反弹
        let collidedWithBoundary = false;
        if (posX - 9 <= 0 || posX + 9 >= canvasWidth) {
            currentVelX = -currentVelX * 0.6;
            posX = posX - 9 <= 0 ? 9 : canvasWidth - 9;
            collidedWithBoundary = true;
        }
        if (posY - 9 <= 0 || posY + 9 >= canvasHeight) {
            currentVelY = -currentVelY * 0.6;
            posY = posY - 9 <= 0 ? 9 : canvasHeight - 9;
            collidedWithBoundary = true;
        }
        
        // 播放边界碰撞音效
        if (collidedWithBoundary) {
            playCollisionSound();
        }
        
        // 扎结碰撞检测
        const knots = canvas.querySelectorAll('.knot');
        let collidedWithKnot = false;
        
        knots.forEach(knot => {
            const knotRect = knot.getBoundingClientRect();
            const canvasRect = canvas.getBoundingClientRect();
            const knotCenterX = knotRect.left - canvasRect.left + knotRect.width / 2;
            const knotCenterY = knotRect.top - canvasRect.top + knotRect.height / 2;
            const distanceX = posX - knotCenterX;
            const distanceY = posY - knotCenterY;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            
            const collisionRadius = 9 + knotBlockRadius;
            if (distance < collisionRadius) {
                collidedWithKnot = true;
                
                const normalX = distanceX / distance;
                const normalY = distanceY / distance;
                const dotProduct = currentVelX * normalX + currentVelY * normalY;
                
                currentVelX = (currentVelX - 2 * dotProduct * normalX) * 0.5;
                currentVelY = (currentVelY - 2 * dotProduct * normalY) * 0.5;
                posX += currentVelX * 2;
                posY += currentVelY * 2;
                
                // 播放扎结碰撞音效
                playCollisionSound();
            }
        });
        
        const speedMagnitude = Math.sqrt(currentVelX * currentVelX + currentVelY * currentVelY);
        if (speedMagnitude < 0.2) {
            clearInterval(moveInterval);
            createSmallDyeArea(canvas, posX, posY, color, isFirst);
            marble.remove();
            
            // 小弹珠完成，减少活跃小弹珠计数
            activeSmallMarbles--;
            
            // 小弹珠发射完成后也更新弹弓上的弹珠
            updateSlingshotMarbleAfterLaunch(level);
            
            // 检查是否所有弹珠都完成了
            const allMarblesUsed = checkAllMarblesUsed(level);
            if (allMarblesUsed && activeSmallMarbles === 0) {
                setTimeout(() => checkWinCondition(level), 1000);
            }
            return;
        }
    }, 16);
}

// 创建小染色区域
function createSmallDyeArea(canvas, x, y, color, isFirst) {
    const dyeArea = document.createElement('div');
    dyeArea.className = `dye-area dye-area-${color}`;
    
    dyeArea.style.left = (x - smallMarbleRadius) + 'px';
    dyeArea.style.top = (y - smallMarbleRadius) + 'px';
    dyeArea.style.width = (smallMarbleRadius * 2) + 'px';
    dyeArea.style.height = (smallMarbleRadius * 2) + 'px';
    
    canvas.appendChild(dyeArea);
    
    const circle = { x, y, radius: smallMarbleRadius, color: color };
    if (color === 'blue') {
        dyeCirclesBlue.push(circle);
        calculateDyedAreaBlue();
    } else if (color === 'red') {
        dyeCirclesRed.push(circle);
        calculateDyedAreaRed();
    } else if (color === 'yellow') {
        dyeCirclesYellow.push(circle);
        calculateDyedAreaYellow();
    }
    
    if (currentLevel === 3) {
        calculateMixedAreasLevel3();
    }
}

// 检查所有弹珠是否用完
function checkAllMarblesUsed(level) {
    const marbleSelection = document.getElementById(`marble-selection${level}`);
    return marbleSelection.children.length === 0;
}

// 创建染色区域
function createDyeArea(canvas, x, y, color, isExplosion) {
    const level = parseInt(canvas.id.replace('canvas', ''));
    let dyeRadius;
    
    // 如果是第二关的第一个蓝色爆炸弹珠，使用爆炸染色半径
    if (level === 2 && color === 'blue' && isExplosion && firstBlueMarbleEnhanced === false) {
        dyeRadius = explosionDyeRadiusConfig[`level${level}`];
    } else {
        dyeRadius = dyeRadiusConfig[`level${level}`];
    }
    
    const dyeArea = document.createElement('div');
    dyeArea.className = `dye-area dye-area-${color}`;
    
    if (isExplosion) {
        dyeArea.className = `dye-area dye-area-explosion-${color}`;
    }
    
    dyeArea.style.left = (x - dyeRadius) + 'px';
    dyeArea.style.top = (y - dyeRadius) + 'px';
    dyeArea.style.width = (dyeRadius * 2) + 'px';
    dyeArea.style.height = (dyeRadius * 2) + 'px';
    
    canvas.appendChild(dyeArea);
    
    if (isExplosion) {
        const explosion = document.createElement('div');
        explosion.className = `explosion explosion-explosion-${color}`;
        explosion.style.left = (x - 12) + 'px';
        explosion.style.top = (y - 12) + 'px';
        explosion.style.width = '24px';
        explosion.style.height = '24px';
        canvas.appendChild(explosion);
        
        setTimeout(() => {
            explosion.remove();
        }, 800);
    }
    
    const circle = { x, y, radius: dyeRadius, color: color };
    if (level === 1) {
        dyeCircles.push(circle);
        calculateDyedArea();
    } else if (level === 2) {
        if (color === 'blue') {
            dyeCirclesBlue.push(circle);
            calculateDyedAreaBlue();
        } else {
            dyeCirclesRed.push(circle);
            calculateDyedAreaRed();
        }
    } else if (level === 3) {
        if (color === 'blue') {
            dyeCirclesBlue.push(circle);
            calculateDyedAreaBlue();
        } else if (color === 'red') {
            dyeCirclesRed.push(circle);
            calculateDyedAreaRed();
        } else if (color === 'yellow') {
            dyeCirclesYellow.push(circle);
            calculateDyedAreaYellow();
        }
    }
}

// 计算关卡一染色面积
function calculateDyedArea() {
    const effectiveArea = calculateEffectiveDyedArea(dyeCircles, 1);
    dyedArea = Math.min(100, (effectiveArea / totalDyeableAreaLevel1) * 100);
    
    const progressBar = document.getElementById('progress1');
    progressBar.style.width = dyedArea + '%';
    progressBar.textContent = Math.round(dyedArea) + '%';
}

// 计算关卡二蓝色染色面积
function calculateDyedAreaBlue() {
    const effectiveArea = calculateEffectiveDyedArea(dyeCirclesBlue, 2);
    dyedAreaBlue = Math.min(100, (effectiveArea / totalDyeableAreaLevel2) * 100);
    
    const progressBar = document.getElementById('progress2-blue');
    progressBar.style.width = dyedAreaBlue + '%';
    progressBar.textContent = Math.round(dyedAreaBlue) + '%';
    
    // 更新关卡二混合区域计算
    if (currentLevel === 2) {
        calculatePurpleAreaLevel2();
    }
}

// 计算关卡二红色染色面积
function calculateDyedAreaRed() {
    const effectiveArea = calculateEffectiveDyedArea(dyeCirclesRed, 2);
    dyedAreaRed = Math.min(100, (effectiveArea / totalDyeableAreaLevel2) * 100);
    
    const progressBar = document.getElementById('progress2-red');
    progressBar.style.width = dyedAreaRed + '%';
    progressBar.textContent = Math.round(dyedAreaRed) + '%';
    
    // 更新关卡二混合区域计算
    if (currentLevel === 2) {
        calculatePurpleAreaLevel2();
    }
}

// 计算关卡二紫色混合区域（蓝+红）
function calculatePurpleAreaLevel2() {
    let overlapArea = 0;
    for (const blueCircle of dyeCirclesBlue) {
        for (const redCircle of dyeCirclesRed) {
            overlapArea += calculateCircleIntersectionArea(
                blueCircle.x, blueCircle.y, blueCircle.radius,
                redCircle.x, redCircle.y, redCircle.radius
            );
        }
    }
    
    const knotPositions = [
        {x: 56, y: 66, radius: knotBlockRadius},
        {x: 196, y: 198, radius: knotBlockRadius},
        {x: 140, y: 132, radius: knotBlockRadius}
    ];
    let knotOverlap = 0;
    for (const knot of knotPositions) {
        for (const blueCircle of dyeCirclesBlue) {
            for (const redCircle of dyeCirclesRed) {
                const knotBlueOverlap = calculateCircleIntersectionArea(
                    knot.x, knot.y, knot.radius,
                    blueCircle.x, blueCircle.y, blueCircle.radius
                );
                const knotRedOverlap = calculateCircleIntersectionArea(
                    knot.x, knot.y, knot.radius,
                    redCircle.x, redCircle.y, redCircle.radius
                );
                knotOverlap += Math.min(knotBlueOverlap, knotRedOverlap);
            }
        }
    }
    
    const effectivePurpleArea = Math.max(0, overlapArea - knotOverlap);
    purpleAreaRatio = Math.min(100, (effectivePurpleArea / totalDyeableAreaLevel2) * 100);
    
    const progressBar = document.getElementById('progress2-purple');
    progressBar.style.width = purpleAreaRatio + '%';
    progressBar.textContent = `混合区域: ${Math.round(purpleAreaRatio)}%`;
}

// 计算关卡三蓝色染色面积
function calculateDyedAreaBlue() {
    const effectiveArea = calculateEffectiveDyedArea(dyeCirclesBlue, 3);
    dyedAreaBlue = Math.min(100, (effectiveArea / totalDyeableAreaLevel3) * 100);
    
    const progressBar = document.getElementById('progress3-blue');
    progressBar.style.width = dyedAreaBlue + '%';
    progressBar.textContent = Math.round(dyedAreaBlue) + '%';
}

// 计算关卡三红色染色面积
function calculateDyedAreaRed() {
    const effectiveArea = calculateEffectiveDyedArea(dyeCirclesRed, 3);
    dyedAreaRed = Math.min(100, (effectiveArea / totalDyeableAreaLevel3) * 100);
    
    const progressBar = document.getElementById('progress3-red');
    progressBar.style.width = dyedAreaRed + '%';
    progressBar.textContent = Math.round(dyedAreaRed) + '%';
}

// 计算关卡三黄色染色面积
function calculateDyedAreaYellow() {
    const effectiveArea = calculateEffectiveDyedArea(dyeCirclesYellow, 3);
    dyedAreaYellow = Math.min(100, (effectiveArea / totalDyeableAreaLevel3) * 100);
    
    const progressBar = document.getElementById('progress3-yellow');
    progressBar.style.width = dyedAreaYellow + '%';
    progressBar.textContent = Math.round(dyedAreaYellow) + '%';
}

// 计算关卡三混合区域（紫色=蓝+红，橙色=红+黄）
function calculateMixedAreasLevel3() {
    // 紫色混合区域（蓝+红）
    let purpleOverlap = 0;
    for (const blueCircle of dyeCirclesBlue) {
        for (const redCircle of dyeCirclesRed) {
            purpleOverlap += calculateCircleIntersectionArea(
                blueCircle.x, blueCircle.y, blueCircle.radius,
                redCircle.x, redCircle.y, redCircle.radius
            );
        }
    }
    
    // 橙色混合区域（红+黄）
    let orangeOverlap = 0;
    for (const redCircle of dyeCirclesRed) {
        for (const yellowCircle of dyeCirclesYellow) {
            orangeOverlap += calculateCircleIntersectionArea(
                redCircle.x, redCircle.y, redCircle.radius,
                yellowCircle.x, yellowCircle.y, yellowCircle.radius
            );
        }
    }
    
    // 计算有效混合面积
    const effectivePurpleArea = Math.max(0, purpleOverlap);
    const effectiveOrangeArea = Math.max(0, orangeOverlap);
    
    // 计算覆盖率
    purpleAreaRatio = Math.min(100, (effectivePurpleArea / totalDyeableAreaLevel3) * 100);
    orangeAreaRatio = Math.min(100, (effectiveOrangeArea / totalDyeableAreaLevel3) * 100);
    
    // 更新进度条
    const purpleProgress = document.getElementById('progress3-purple');
    const orangeProgress = document.getElementById('progress3-orange');
    
    purpleProgress.style.width = purpleAreaRatio + '%';
    purpleProgress.textContent = `紫: ${Math.round(purpleAreaRatio)}%`;
    
    orangeProgress.style.width = orangeAreaRatio + '%';
    orangeProgress.textContent = `橙: ${Math.round(orangeAreaRatio)}%`;
}

// 检查过关条件
function checkWinCondition(level) {
    console.log(`检查关卡 ${level} 过关条件`);
    let isWin = false;
    let failureMessage = '';
    let rewardMessage = '';
    
    if (level === 1) {
        isWin = dyedArea >= 60;
        if (isWin) {
            rewardMessage = "🎉 恭喜通过第一关！获得爆炸弹珠！ 🎉\n在第二关中，你可以选择使用爆炸弹珠增强第一个蓝色弹珠的染色范围。";
        } else {
            failureMessage = `关卡一失败！染色覆盖率不足60%（当前：${Math.round(dyedArea)}%）`;
        }
    } else if (level === 2) {
        // 关卡二通关条件：蓝色覆盖率≥40%，红色覆盖率≥30%，紫色混合区域≥15%
        const blueTarget = 40;
        const redTarget = 30;
        const purpleTarget = 15;
        
        isWin = dyedAreaBlue >= blueTarget && dyedAreaRed >= redTarget && purpleAreaRatio >= purpleTarget;
        
        if (!isWin) {
            failureMessage = "关卡二失败！\n";
            if (dyedAreaBlue < blueTarget) {
                failureMessage += `蓝色覆盖率${Math.round(dyedAreaBlue)}%未达到${blueTarget}%\n`;
            }
            if (dyedAreaRed < redTarget) {
                failureMessage += `红色覆盖率${Math.round(dyedAreaRed)}%未达到${redTarget}%\n`;
            }
            if (purpleAreaRatio < purpleTarget) {
                failureMessage += `紫色混合区域${Math.round(purpleAreaRatio)}%未达到${purpleTarget}%`;
            }
        }
    } else if (level === 3) {
        // 关卡三通关条件：
        const blueTarget = 30;
        const redTarget = 30;
        const yellowTarget = 20;
        const purpleTarget = 15;
        const orangeTarget = 15;
        
        isWin = dyedAreaBlue >= blueTarget && 
                dyedAreaRed >= redTarget && 
                dyedAreaYellow >= yellowTarget && 
                purpleAreaRatio >= purpleTarget && 
                orangeAreaRatio >= orangeTarget;
        
        if (!isWin) {
            failureMessage = "关卡三失败！\n";
            if (dyedAreaBlue < blueTarget) {
                failureMessage += `蓝色覆盖率${Math.round(dyedAreaBlue)}%未达到${blueTarget}%\n`;
            }
            if (dyedAreaRed < redTarget) {
                failureMessage += `红色覆盖率${Math.round(dyedAreaRed)}%未达到${redTarget}%\n`;
            }
            if (dyedAreaYellow < yellowTarget) {
                failureMessage += `黄色覆盖率${Math.round(dyedAreaYellow)}%未达到${yellowTarget}%\n`;
            }
            if (purpleAreaRatio < purpleTarget) {
                failureMessage += `紫色混合区域${Math.round(purpleAreaRatio)}%未达到${purpleTarget}%\n`;
            }
            if (orangeAreaRatio < orangeTarget) {
                failureMessage += `橙色混合区域${Math.round(orangeAreaRatio)}%未达到${orangeTarget}%`;
            }
        }
    }
    
    const winModal = document.getElementById('winModal');
    const overlay = document.getElementById('overlay');
    const resultText = document.getElementById('resultText');
    const rewardText = document.getElementById('rewardText');
    const nextLevelBtn = document.getElementById('nextLevelBtn');
    
    if (isWin) {
        if (level === 1) {
            resultText.textContent = '恭喜！你通过了关卡一！';
            rewardText.innerHTML = `<p>${rewardMessage}</p>`;
            rewardText.style.display = 'block';
            nextLevelBtn.style.display = 'inline-block';
        } else if (level === 2) {
            resultText.textContent = '恭喜！你通过了关卡二！';
            rewardText.style.display = 'none';
            nextLevelBtn.style.display = 'inline-block';
        } else if (level === 3) {
            resultText.textContent = '恭喜！你通过了所有关卡！游戏通关！';
            rewardText.style.display = 'none';
            nextLevelBtn.style.display = 'none';
            
            // 第三关成功时播放成功提示音
            playSuccessSound();
        }
    } else {
        resultText.textContent = failureMessage;
        rewardText.style.display = 'none';
        nextLevelBtn.style.display = 'none';
    }
    
    winModal.style.display = 'block';
    overlay.style.display = 'block';
}

// 进入下一关
function goToNextLevel() {
    playClickSound(); // 添加按钮点击音效
    document.getElementById(`level${currentLevel}`).style.display = 'none';
    document.getElementById('winModal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    
    currentLevel++;
    if (currentLevel <= 3) {
        showLevelIntro(currentLevel);
    } else {
        alert('恭喜！你完成了所有关卡！');
        returnToMain();
    }
}

// 重置当前关卡
function resetCurrentLevel() {
    playClickSound(); // 添加按钮点击音效
    document.getElementById(`level${currentLevel}`).style.display = 'none';
    document.getElementById('winModal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    initGame(currentLevel);
    document.getElementById(`level${currentLevel}`).style.display = 'block';
}

// 返回主页
function returnToMain() {
    playClickSound(); // 添加按钮点击音效
    
    // 停止弹簧声
    stopSpringSound();
    
    // 停止动态扎结定时器
    if (dynamicKnotsTimer) {
        clearInterval(dynamicKnotsTimer);
        dynamicKnotsTimer = null;
    }
    
    // 隐藏所有关卡和弹窗
    document.querySelectorAll('.level-container').forEach(level => {
        level.style.display = 'none';
    });
    document.getElementById('winModal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('explosionChoiceModal').style.display = 'none';
    document.getElementById('levelIntro').style.display = 'none';
    
    // 显示主界面
    document.querySelector('.game-container').style.display = 'block';
    
    // 重置当前关卡
    currentLevel = 1;
}

// 页面加载完成后初始化
window.onload = init;