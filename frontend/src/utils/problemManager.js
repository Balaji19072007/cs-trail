// src/utils/problemManager.js

const TIME_TO_REVEAL_MS = 10 * 60 * 1000; // 10 minutes

export class ProblemManager {
  static TOTAL_PROBLEMS = 255;
  
  // Key generators 
  static getProblemKey(problemId, suffix) {
    return `problem_${problemId}_${suffix}`;
  }
  
  static getStartTimeKey(problemId) { // Used for current session's start time
    return this.getProblemKey(problemId, 'session_start_time'); 
  }
  
  static getSolvedKey(problemId) {
    return this.getProblemKey(problemId, 'solved');
  }
  
  static getSubmissionHistoryKey(problemId) {
    return this.getProblemKey(problemId, 'submission_history');
  }
  
  static getCodeKey(problemId) {
    return this.getProblemKey(problemId, 'user_code');
  }
  
  static getTimeSpentKey(problemId) { // Stores cumulative time elapsed
    return this.getProblemKey(problemId, 'time_total_elapsed'); 
  }
  
  // Problem data management
  static initializeProblemData(problemId) {
    // Only initialize if data is missing, to prevent overwriting existing data
    if (localStorage.getItem(this.getSolvedKey(problemId)) === null) {
        localStorage.setItem(this.getSolvedKey(problemId), 'false');
        localStorage.setItem(this.getSubmissionHistoryKey(problemId), JSON.stringify([]));
        localStorage.setItem(this.getCodeKey(problemId), '');
        localStorage.setItem(this.getTimeSpentKey(problemId), '0'); // Initialize elapsed time
        localStorage.setItem(this.getStartTimeKey(problemId), '0'); // Ensure start time is 0
        
        return {
          startTime: 0,
          solved: false,
          submissions: [],
          userCode: '',
          timeElapsed: 0,
          initialized: true
        };
    }
    
    return this.getProblemProgress(problemId);
  }
  
  static getProblemProgress(problemId) {
    const startTime = parseInt(localStorage.getItem(this.getStartTimeKey(problemId)) || 0);
    const solved = localStorage.getItem(this.getSolvedKey(problemId)) === 'true';
    const submissions = JSON.parse(localStorage.getItem(this.getSubmissionHistoryKey(problemId)) || '[]');
    const userCode = localStorage.getItem(this.getCodeKey(problemId)) || '';
    // Use getTimeSpentKey for elapsed time
    const timeElapsed = parseInt(localStorage.getItem(this.getTimeSpentKey(problemId)) || 0); 
    
    // Calculate current session time and total time for remaining time calculation
    const currentSessionTime = startTime > 0 ? (Date.now() - startTime) : 0;
    const totalTime = timeElapsed + currentSessionTime;
    
    return {
      startTime,
      solved,
      submissions,
      userCode,
      timeElapsed, // Cumulative time elapsed
      // Remaining time is based on total time spent (elapsed + current session)
      timeRemaining: Math.max(0, TIME_TO_REVEAL_MS - totalTime),
      // NEW: A simple check if initialization has occurred
      initialized: localStorage.getItem(this.getSolvedKey(problemId)) !== null
    };
  }
  
  // New: Start timer for current session
  static startTimer(problemId) {
      const progress = this.getProblemProgress(problemId);
      // Simplified: removed cooldown check
      if (progress.solved) return; 
      
      // If startTime is 0, start a new session (timer resumes)
      if (progress.startTime === 0 && progress.timeRemaining > 0) {
          localStorage.setItem(this.getStartTimeKey(problemId), Date.now().toString());
      }
  }

  // New: Stop timer and save elapsed time for current session
  static stopTimer(problemId) {
      const progress = this.getProblemProgress(problemId);
      if (progress.startTime === 0) return; // Not currently running
      
      const currentSessionTime = Date.now() - progress.startTime;
      const newTotalTimeElapsed = progress.timeElapsed + currentSessionTime;
      
      // Save new cumulative elapsed time
      localStorage.setItem(this.getTimeSpentKey(problemId), newTotalTimeElapsed.toString());
      
      // Reset session start time to 0 (paused)
      localStorage.setItem(this.getStartTimeKey(problemId), '0');
  }

  // Helper function to pause the timer (calls stopTimer and exists in SolveProblem.jsx)
  static pauseTimer(problemId) {
    this.stopTimer(problemId);
  }

  // Updated: Should reveal solution if solved OR timeElapsed has reached the limit
  static shouldRevealSolution(problemId) {
    const progress = this.getProblemProgress(problemId);
    return progress.solved || progress.timeRemaining <= 0;
  }
  
  static markAsSolved(problemId) {
    // Ensure timer is stopped and final time is calculated correctly upon solving
    this.stopTimer(problemId); 
    
    localStorage.setItem(this.getSolvedKey(problemId), 'true');
    
    // Total time spent is already saved in time_total_elapsed
    const timeSpent = parseInt(localStorage.getItem(this.getTimeSpentKey(problemId)) || 0);
    // We update the original time_spent key for consistency with global stats 
    localStorage.setItem(this.getProblemKey(problemId, 'time_spent'), timeSpent.toString());
    
    this.updateGlobalProgress();
  }
  
  static markSolutionViewed(problemId) {
      // Pause the timer session before marking as viewed
      this.stopTimer(problemId);
      
      // The logic in SolveProblem.jsx relies on timeRemaining <= 0 which is sufficient
      // if the solution is viewed after the timer runs out. 
  }
  
  // User code management (unchanged)
  static saveUserCode(problemId, code) {
    localStorage.setItem(this.getCodeKey(problemId), code);
  }
  
  static getUserCode(problemId) {
    return localStorage.getItem(this.getCodeKey(problemId)) || '';
  }
  
  // Submission management (unchanged)
  static addSubmission(problemId, submission) {
    const history = JSON.parse(localStorage.getItem(this.getSubmissionHistoryKey(problemId)) || '[]');
    const submissionRecord = {
      ...submission,
      timestamp: Date.now(),
      id: history.length + 1,
      problemId: problemId
    };
    
    history.push(submissionRecord);
    
    if (history.length > 10) {
      history.shift();
    }
    
    localStorage.setItem(this.getSubmissionHistoryKey(problemId), JSON.stringify(history));
    
    if (submission.status === 'Accepted') {
      this.markAsSolved(problemId);
    }
    
    return submissionRecord;
  }
  
  static getSubmissionHistory(problemId) {
    return JSON.parse(localStorage.getItem(this.getSubmissionHistoryKey(problemId)) || '[]');
  }
  
  static getLastSubmission(problemId) {
    const history = this.getSubmissionHistory(problemId);
    return history.length > 0 ? history[history.length - 1] : null;
  }
  
  // Timer management
  // Updated: Reset timer clears timeElapsed and startTime to 0.
  static resetTimer(problemId) {
    const progress = this.getProblemProgress(problemId);
    if (!progress.solved) {
        // Clear cumulative elapsed time
        localStorage.setItem(this.getTimeSpentKey(problemId), '0'); 
        // Clear session start time
        localStorage.setItem(this.getStartTimeKey(problemId), '0');
    }
  }
  
  static getTimeRemaining(problemId) {
    const progress = this.getProblemProgress(problemId);
    return progress.timeRemaining;
  }
  
  // Global progress tracking (unchanged)
  static getGlobalProgress() {
    const progress = {
      totalProblems: this.TOTAL_PROBLEMS,
      solvedProblems: 0,
      attemptedProblems: 0,
      totalTimeSpent: 0,
      averageTimePerProblem: 0,
      problemsByDifficulty: {
        Easy: { solved: 0, total: 85 }, 
        Medium: { solved: 0, total: 85 }, 
        Hard: { solved: 0, total: 85 } 
      }
    };
    
    for (let i = 1; i <= this.TOTAL_PROBLEMS; i++) {
      const problemProgress = this.getProblemProgress(i);
      
      if (problemProgress.solved) {
        progress.solvedProblems++;
        const timeSpentForGlobal = parseInt(localStorage.getItem(this.getProblemKey(i, 'time_spent')) || 0);
        progress.totalTimeSpent += timeSpentForGlobal;
        
        // This relies on the problem data which is not available here, 
        // but the ProblemManager function for it is correct.
        const difficulty = this.getProblemDifficulty(i); 
        if (progress.problemsByDifficulty[difficulty]) {
          progress.problemsByDifficulty[difficulty].solved++;
        }
      }
      
      if (problemProgress.submissions.length > 0) {
        progress.attemptedProblems++;
      }
    }
    
    progress.averageTimePerProblem = progress.solvedProblems > 0 
      ? Math.round(progress.totalTimeSpent / progress.solvedProblems / 1000 / 60)
      : 0;
    
    return progress;
  }
  
  static updateGlobalProgress() {
    const progress = this.getGlobalProgress();
    localStorage.setItem('global_progress', JSON.stringify(progress));
    return progress;
  }
  
  static getProblemDifficulty(problemId) {
    if (problemId <= 85) return 'Easy';
    if (problemId <= 170) return 'Medium';
    return 'Hard';
  }
  
  // Bulk operations (updated for new keys)
  static initializeAllProblems() {
    for (let i = 1; i <= this.TOTAL_PROBLEMS; i++) {
      // Use initializeProblemData, which now checks if data is missing
      this.initializeProblemData(i);
    }
  }
  
  static resetAllProgress() {
    for (let i = 1; i <= this.TOTAL_PROBLEMS; i++) {
      localStorage.removeItem(this.getProblemKey(i, 'start_time')); 
      localStorage.removeItem(this.getStartTimeKey(i));
      localStorage.removeItem(this.getSolvedKey(i));
      localStorage.removeItem(this.getSubmissionHistoryKey(i));
      localStorage.removeItem(this.getCodeKey(i));
      localStorage.removeItem(this.getTimeSpentKey(i));
      localStorage.removeItem(this.getProblemKey(i, 'time_spent'));
    }
    localStorage.removeItem('global_progress');
  }
  
  static exportProgress() {
    const exportData = {
      timestamp: Date.now(),
      version: '1.0',
      problems: {}
    };
    
    for (let i = 1; i <= this.TOTAL_PROBLEMS; i++) {
      const progress = this.getProblemProgress(i);
      // Manually add time_spent for consistency if it was solved
      const timeSpent = localStorage.getItem(this.getProblemKey(i, 'time_spent')) || '0';
      
      exportData.problems[i] = {
        ...progress,
        timeSpent: parseInt(timeSpent)
      };
    }
    
    exportData.global = this.getGlobalProgress();
    
    return JSON.stringify(exportData, null, 2);
  }
  
  static importProgress(data) {
    try {
      const importData = JSON.parse(data);
      
      if (importData.problems) {
        for (const [problemId, progress] of Object.entries(importData.problems)) {
          const id = parseInt(problemId);
          if (id >= 1 && id <= this.TOTAL_PROBLEMS) {
            localStorage.setItem(this.getSolvedKey(id), progress.solved.toString());
            localStorage.setItem(this.getTimeSpentKey(id), (progress.timeElapsed || 0).toString()); 
            localStorage.setItem(this.getProblemKey(id, 'time_spent'), (progress.timeSpent || 0).toString()); 
            
            localStorage.setItem(this.getSubmissionHistoryKey(id), JSON.stringify(progress.submissions || []));
            localStorage.setItem(this.getCodeKey(id), progress.userCode || '');
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import progress:', error);
      return false;
    }
  }
  
  // Statistics and analytics (unchanged)
  static getProblemStats(problemId) {
    const progress = this.getProblemProgress(problemId);
    const submissions = progress.submissions;
    
    const stats = {
      totalSubmissions: submissions.length,
      acceptedSubmissions: submissions.filter(s => s.status === 'Accepted').length,
      firstAccepted: submissions.find(s => s.status === 'Accepted'),
      lastSubmission: submissions.length > 0 ? submissions[submissions.length - 1] : null,
      averageAttemptsBeforeSuccess: 0,
      timeToSolve: progress.solved ? parseInt(localStorage.getItem(this.getProblemKey(problemId, 'time_spent')) || 0) : null 
    };
    
    if (stats.firstAccepted) {
      const attemptsBeforeSuccess = submissions.findIndex(s => s.status === 'Accepted') + 1;
      stats.averageAttemptsBeforeSuccess = attemptsBeforeSuccess;
    }
    
    return stats;
  }
  
  static getDailyProgress() {
    const today = new Date().toDateString();
    const dailyStats = {
      date: today,
      problemsSolved: 0,
      timeSpent: 0,
      submissions: 0
    };
    
    for (let i = 1; i <= this.TOTAL_PROBLEMS; i++) {
      const submissions = this.getSubmissionHistory(i);
      const todaySubmissions = submissions.filter(sub => {
        const subDate = new Date(sub.timestamp).toDateString();
        return subDate === today;
      });
      
      if (todaySubmissions.length > 0) {
        dailyStats.submissions += todaySubmissions.length;
        
        const solvedToday = todaySubmissions.some(sub => sub.status === 'Accepted');
        if (solvedToday) {
          dailyStats.problemsSolved++;
        }
      }
    }
    
    return dailyStats;
  }
}

// Remove old conflicting keys on script execution if they exist
for (let i = 1; i <= ProblemManager.TOTAL_PROBLEMS; i++) {
    localStorage.removeItem(ProblemManager.getProblemKey(i, 'start_time')); 
    localStorage.removeItem(ProblemManager.getProblemKey(i, 'solution_view_time')); 
}

// Initialize all problems on first load (uses safe check inside the method)
ProblemManager.initializeAllProblems();