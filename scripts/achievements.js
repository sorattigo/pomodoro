// Achievement system for Focus Mountain RPG
const ACHIEVEMENTS = [
    {
        id: 'first_step',
        title: 'はじめの一歩',
        description: '初めてのポモドーロを完了',
        condition: (state) => state.pomodoroCount > 0,
        icon: '🎯',
        xp: 10
    },
    {
        id: 'level_5',
        title: '冒険者見習い',
        description: 'レベル5に到達',
        condition: (state) => state.level >= 5,
        icon: '⭐',
        xp: 25
    },
    {
        id: 'level_10',
        title: '熟練の冒険者',
        description: 'レベル10に到達',
        condition: (state) => state.level >= 10,
        icon: '🌟',
        xp: 50
    },
    {
        id: 'combo_master',
        title: '連続集中マスター',
        description: '5回連続で集中力4以上を記録',
        condition: (state) => state.combo >= 5,
        icon: '🔥',
        xp: 30
    },
    {
        id: 'early_bird',
        title: '早起きは三文の徳',
        description: '朝6時前にポモドーロを開始',
        condition: (state) => {
            const now = new Date();
            return now.getHours() < 6 && state.pomodoroCount > 0;
        },
        icon: '🌅',
        xp: 20
    },
    {
        id: 'night_owl',
        title: '夜更かしの達人',
        description: '午後10時以降にポモドーロを完了',
        condition: (state) => {
            const now = new Date();
            return now.getHours() >= 22 && state.pomodoroCount > 0;
        },
        icon: '🦉',
        xp: 20
    },
    {
        id: 'weekend_warrior',
        title: '週末の戦士',
        description: '週末にポモドーロを完了',
        condition: (state) => {
            const day = new Date().getDay();
            return (day === 0 || day === 6) && state.pomodoroCount > 0;
        },
        icon: '🏆',
        xp: 15
    },
    {
        id: 'streak_7',
        title: '一週間の軌跡',
        description: '7日連続でポモドーロを完了',
        condition: (state) => {
            // This would need to check the actual streak from logs
            return false; // Placeholder
        },
        icon: '📅',
        xp: 50
    },
    {
        id: 'boss_slayer',
        title: 'ボスクラッシャー',
        description: 'ボスを初めて倒す',
        condition: (state) => {
            // This would need to track boss battles
            return false; // Placeholder
        },
        icon: '👑',
        xp: 30
    },
    {
        id: 'focused_mind',
        title: '一点集中',
        description: '集中力5でポモドーロを10回完了',
        condition: (state) => {
            return state.focusLogs.filter(log => log.level === 5 && log.isWork).length >= 10;
        },
        icon: '🎯',
        xp: 40
    }
];

class AchievementSystem {
    constructor() {
        this.unlocked = new Set(JSON.parse(localStorage.getItem('unlockedAchievements') || '[]'));
    }

    checkAchievements(state) {
        const newlyUnlocked = [];
        
        for (const achievement of ACHIEVEMENTS) {
            if (!this.unlocked.has(achievement.id) && achievement.condition(state)) {
                this.unlocked.add(achievement.id);
                newlyUnlocked.push(achievement);
            }
        }
        
        if (newlyUnlocked.length > 0) {
            this.save();
        }
        
        return newlyUnlocked;
    }
    
    getUnlocked() {
        return ACHIEVEMENTS.filter(a => this.unlocked.has(a.id));
    }
    
    getLocked() {
        return ACHIEVEMENTS.filter(a => !this.unlocked.has(a.id));
    }
    
    getProgress() {
        return {
            unlocked: this.unlocked.size,
            total: ACHIEVEMENTS.length,
            percentage: Math.round((this.unlocked.size / ACHIEVEMENTS.length) * 100)
        };
    }
    
    save() {
        localStorage.setItem('unlockedAchievements', JSON.stringify(Array.from(this.unlocked)));
    }
}

// Initialize global achievement system
window.achievementSystem = new AchievementSystem();
