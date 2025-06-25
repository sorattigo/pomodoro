class PomodoroTimer {
    constructor() {
        this.isRunning = false;
        this.currentMode = 'work';
        this.workTime = 25 * 60;
        this.breakTime = 5 * 60;
        this.currentTime = this.workTime;
        this.timerInterval = null;

        this.initializeElements();
        this.initializeEventListeners();
    }

    initializeElements() {
        this.timerElement = document.getElementById('timer');
        this.startButton = document.getElementById('start');
        this.stopButton = document.getElementById('stop');
        this.resetButton = document.getElementById('reset');
        this.workTimeInput = document.getElementById('work-time');
        this.breakTimeInput = document.getElementById('break-time');
    }

    initializeEventListeners() {
        this.startButton.addEventListener('click', () => this.startTimer());
        this.stopButton.addEventListener('click', () => this.stopTimer());
        this.resetButton.addEventListener('click', () => this.resetTimer());
        this.workTimeInput.addEventListener('change', () => {
            this.workTime = parseInt(this.workTimeInput.value) * 60;
            this.resetTimer();
        });
        this.breakTimeInput.addEventListener('change', () => {
            this.breakTime = parseInt(this.breakTimeInput.value) * 60;
            this.resetTimer();
        });
    }

    startTimer() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startButton.disabled = true;
        this.stopButton.disabled = false;
        this.resetButton.disabled = true;

        this.timerInterval = setInterval(() => {
            this.currentTime--;
            this.updateDisplay();

            if (this.currentTime <= 0) {
                this.switchMode();
            }
        }, 1000);
    }

    stopTimer() {
        this.isRunning = false;
        this.startButton.disabled = false;
        this.stopButton.disabled = true;
        this.resetButton.disabled = false;
        clearInterval(this.timerInterval);
    }

    resetTimer() {
        this.stopTimer();
        this.currentTime = this.currentMode === 'work' ? this.workTime : this.breakTime;
        this.updateDisplay();
    }

    switchMode() {
        this.stopTimer();
        this.currentMode = this.currentMode === 'work' ? 'break' : 'work';
        this.currentTime = this.currentMode === 'work' ? this.workTime : this.breakTime;
        this.updateDisplay();
        this.startTimer();
    }

    updateDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        this.timerElement.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// ページ読み込み時にタイマーを初期化
window.addEventListener('load', () => {
    new PomodoroTimer();
});
