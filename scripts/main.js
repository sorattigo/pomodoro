// Main application state and logic
window.app = function() {
    return {
        // Game state
        level: 1,
        xp: 0,
        nextLevelXp: 100,
        combo: 0,
        pomodoroCount: 0,
        focusLevel: 0,
        focusLogs: [],
        
        // Timer state
        isWorking: true,
        isRunning: false,
        timeLeft: 25 * 60, // 25 minutes in seconds
        timerInterval: null,
        
        // Settings
        workDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
        showSettings: false,
        
        // Daily quest
        dailyQuest: null,
        
        // Initialize the app
        init() {
            this.loadFromLocalStorage();
            this.setupDailyQuest();
            this.updateNextLevelXp();
        },
        
        // Timer functions
        startTimer() {
            if (this.isRunning) {
                this.pauseTimer();
                return;
            }
            
            this.isRunning = true;
            this.timerInterval = setInterval(() => this.tick(), 1000);
        },
        
        pauseTimer() {
            this.isRunning = false;
            clearInterval(this.timerInterval);
        },
        
        resetTimer() {
            console.log('resetTimer called, isWorking:', this.isWorking);
            this.pauseTimer();
            this.timeLeft = (this.isWorking ? this.workDuration : this.breakDuration) * 60;
            this.focusLevel = 0;
            console.log('Timer reset to:', this.timeLeft, 'seconds');
        },
        
        // Format time in MM:SS format
        formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        },
        
        tick() {
            console.log('tick! timeLeft:', this.timeLeft);
            
            if (this.timeLeft <= 0) {
                console.log('Session complete!');
                this.completeSession();
                return;
            }
            
            this.timeLeft--;
            console.log('New timeLeft:', this.timeLeft);
            
            // Force UI update
            this.$refresh();
            
            // Auto-save every minute
            if (this.timeLeft % 60 === 0) {
                this.saveToLocalStorage();
            }
        },
        
        completeSession() {
            this.pauseTimer();
            
            // Add XP and handle level up
            this.addXp(10);
            
            // Update focus log
            if (this.focusLevel > 0) {
                this.focusLogs.push({
                    date: new Date().toISOString(),
                    level: this.focusLevel,
                    isWork: this.isWorking
                });
                
                // Update combo
                if (this.focusLevel >= 4) {
                    this.combo++;
                } else {
                    this.combo = 0;
                }
            }
            
            // Toggle work/break state
            this.isWorking = !this.isWorking;
            this.pomodoroCount = this.isWorking ? (this.pomodoroCount + 1) % 4 : this.pomodoroCount;
            
            // Check for boss battle (every 4 pomodoros)
            if (this.pomodoroCount === 0 && !this.isWorking) {
                this.startBossBattle();
            }
            
            // Reset timer for next session
            this.resetTimer();
            this.saveToLocalStorage();
            
            // Show notification
            const title = this.isWorking ? '休憩終了！' : 'お疲れ様でした！';
            const body = this.isWorking 
                ? '次のポモドーロを開始しましょう！' 
                : '休憩タイムです。リラックスしてください。';
                
            this.showNotification(title, body);
        },
        
        // Game functions
        addXp(amount) {
            // Apply combo bonus
            if (this.combo >= 5) amount *= 2;
            else if (this.combo >= 3) amount *= 1.5;
            
            this.xp += Math.floor(amount);
            
            // Check for level up
            while (this.xp >= this.nextLevelXp) {
                this.levelUp();
            }
            
            this.saveToLocalStorage();
        },
        
        levelUp() {
            this.level++;
            this.xp -= this.nextLevelXp;
            this.updateNextLevelXp();
            
            // Play level up sound
            const audio = new Audio('assets/sounds/level-up.mp3');
            audio.play().catch(e => console.log('Audio play failed:', e));
            
            // Show level up notification
            this.showNotification(`レベルアップ！`, `レベル ${this.level} に上がりました！`);
        },
        
        updateNextLevelXp() {
            this.nextLevelXp = Math.pow(this.level, 2) * 100;
        },
        
        startBossBattle() {
            // Show boss battle UI
            alert('ボスバトル開始！ 5秒間でできるだけクリック！');
            
            // Simple clicker game
            let clicks = 0;
            const targetClicks = 20; // Adjust difficulty
            const timeLimit = 5000; // 5 seconds
            
            const clickHandler = () => {
                clicks++;
                document.getElementById('boss-hp').textContent = Math.max(0, targetClicks - clicks);
                
                if (clicks >= targetClicks) {
                    // Victory!
                    clearTimeout(timeout);
                    document.removeEventListener('click', clickHandler);
                    this.showNotification('勝利！', 'ボスを倒しました！XP2倍獲得！');
                    this.addXp(20); // Double XP for winning
                }
            };
            
            document.addEventListener('click', clickHandler);
            
            const timeout = setTimeout(() => {
                document.removeEventListener('click', clickHandler);
                if (clicks < targetClicks) {
                    this.showNotification('残念！', '次は頑張りましょう！');
                }
            }, timeLimit);
        },
        
        setFocusLevel(level) {
            this.focusLevel = level;
        },
        
        setupDailyQuest() {
            const today = new Date().toDateString();
            const savedQuest = JSON.parse(localStorage.getItem('dailyQuest'));
            
            if (savedQuest && savedQuest.date === today) {
                this.dailyQuest = savedQuest;
                return;
            }
            
            // Generate new daily quest
            const quests = [
                { 
                    id: 'combo3',
                    title: '集中力3連続達成',
                    condition: () => this.combo >= 3,
                    reward: 50,
                    progress: () => Math.min(3, this.combo)
                },
                { 
                    id: 'pomodoro3',
                    title: 'ポモドーロ3回完了',
                    condition: () => this.pomodoroCount >= 3,
                    reward: 50,
                    progress: () => Math.min(3, this.pomodoroCount)
                },
                { 
                    id: 'focus4',
                    title: '集中力4以上で3回作業',
                    condition: () => this.focusLogs.filter(log => log.level >= 4 && log.isWork).length >= 3,
                    reward: 75,
                    progress: () => Math.min(3, this.focusLogs.filter(log => log.level >= 4 && log.isWork).length)
                }
            ];
            
            this.dailyQuest = {
                ...quests[Math.floor(Math.random() * quests.length)],
                date: today,
                completed: false
            };
            
            this.saveDailyQuest();
        },
        
        checkDailyQuest() {
            if (this.dailyQuest && !this.dailyQuest.completed && this.dailyQuest.condition()) {
                this.dailyQuest.completed = true;
                this.addXp(this.dailyQuest.reward);
                this.showNotification('クエスト達成！', `${this.dailyQuest.reward}XP 獲得！`);
                this.saveDailyQuest();
            }
        },
        
        // Helper functions
        formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        },
        
        showNotification(title, body) {
            if (!('Notification' in window)) return;
            
            if (Notification.permission === 'granted') {
                new Notification(title, { body });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification(title, { body });
                    }
                });
            }
            
            // Fallback to alert if notifications are blocked
            if (Notification.permission === 'denied') {
                alert(`${title}\n${body}`);
            }
        },
        
        // Local storage
        saveToLocalStorage() {
            const saveData = {
                level: this.level,
                xp: this.xp,
                combo: this.combo,
                pomodoroCount: this.pomodoroCount,
                focusLogs: this.focusLogs,
                settings: {
                    workDuration: this.workDuration,
                    breakDuration: this.breakDuration,
                    longBreakDuration: this.longBreakDuration
                },
                lastUpdated: new Date().toISOString()
            };
            
            localStorage.setItem('focusMountainSave', JSON.stringify(saveData));
        },
        
        loadFromLocalStorage() {
            const saveData = JSON.parse(localStorage.getItem('focusMountainSave'));
            if (!saveData) return;
            
            this.level = saveData.level || 1;
            this.xp = saveData.xp || 0;
            this.combo = saveData.combo || 0;
            this.pomodoroCount = saveData.pomodoroCount || 0;
            this.focusLogs = saveData.focusLogs || [];
            
            if (saveData.settings) {
                this.workDuration = saveData.settings.workDuration || 25;
                this.breakDuration = saveData.settings.breakDuration || 5;
                this.longBreakDuration = saveData.settings.longBreakDuration || 15;
            }
            
            this.updateNextLevelXp();
            this.resetTimer();
        },
        
        saveDailyQuest() {
            if (this.dailyQuest) {
                localStorage.setItem('dailyQuest', JSON.stringify(this.dailyQuest));
            }
        },
        
        // Settings
        saveSettings() {
            this.workDuration = Math.max(1, Math.min(60, this.workDuration));
            this.breakDuration = Math.max(1, Math.min(30, this.breakDuration));
            this.longBreakDuration = Math.max(1, Math.min(60, this.longBreakDuration));
            
            this.resetTimer();
            this.showSettings = false;
            this.saveToLocalStorage();
        },
        
        openSettings() {
            this.showSettings = true;
        }
    };
}

// Request notification permission on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded in main.js');
    if ('Notification' in window) {
        Notification.requestPermission();
    }
});

// Export for Alpine.js
if (window.Alpine) {
    console.log('Alpine is available, registering app component');
    Alpine.data('app', () => window.app());
}
