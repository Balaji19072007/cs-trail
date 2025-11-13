// src/pages/project/ProjectPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import CodeEditor from "../../components/problems/CodeEditor.jsx";

const PROJECTS_DATABASE = {
  "calculator-using-functions": {
    id: "calculator-using-functions",
    name: "Calculator using Functions",
    description: "Build a fully functional calculator that performs arithmetic operations using modular functions",
    difficulty: "Beginner",
    duration: "2-3 hours",
    technologies: ["C Functions", "Control Structures", "Basic I/O", "Modular Programming"],
    category: "Mathematics",
    objectives: [
      'Implement arithmetic functions (add, subtract, multiply, divide)',
      'Handle user input and menu navigation',
      'Create a modular program structure',
      'Implement error handling for division by zero'
    ],
    starterCode: `#include <stdio.h>

// Function declarations
float add(float a, float b);
float subtract(float a, float b);
float multiply(float a, float b);
float divide(float a, float b);
void displayMenu();

int main() {
    int choice;
    float num1, num2, result;
    
    printf("🧮 Advanced Calculator\\n");
    
    while(1) {
        displayMenu();
        printf("Enter your choice (1-5): ");
        scanf("%d", &choice);
        
        if(choice == 5) {
            printf("Thank you for using the calculator!\\\\n");
            break;
        }
        
        if(choice < 1 || choice > 5) {
            printf("Invalid choice! Please try again.\\\\n\\\\n");
            continue;
        }
        
        printf("Enter first number: ");
        scanf("%f", &num1);
        printf("Enter second number: ");
        scanf("%f", &num2);
        
        switch(choice) {
            case 1:
                result = add(num1, num2);
                printf("Result: %.2f + %.2f = %.2f\\\\n\\\\n", num1, num2, result);
                break;
            case 2:
                result = subtract(num1, num2);
                printf("Result: %.2f - %.2f = %.2f\\\\n\\\\n", num1, num2, result);
                break;
            case 3:
                result = multiply(num1, num2);
                printf("Result: %.2f * %.2f = %.2f\\\\n\\\\n", num1, num2, result);
                break;
            case 4:
                if(num2 != 0) {
                    result = divide(num1, num2);
                    printf("Result: %.2f / %.2f = %.2f\\\\n\\\\n", num1, num2, result);
                } else {
                    printf("Error: Division by zero is not allowed!\\\\n\\\\n");
                }
                break;
        }
    }
    
    return 0;
}

void displayMenu() {
    printf("\\\\n=== Calculator Menu ===\\\\n");
    printf("1. Addition\\\\n");
    printf("2. Subtraction\\\\n");
    printf("3. Multiplication\\\\n");
    printf("4. Division\\\\n");
    printf("5. Exit\\\\n");
}

// TODO: Implement the arithmetic functions below
float add(float a, float b) {
    // Your implementation here
    return 0;
}

float subtract(float a, float b) {
    // Your implementation here
    return 0;
}

float multiply(float a, float b) {
    // Your implementation here
    return 0;
}

float divide(float a, float b) {
    // Your implementation here
    return 0;
}`,
    expectedOutput: `🧮 Advanced Calculator

=== Calculator Menu ===
1. Addition
2. Subtraction
3. Multiplication
4. Division
5. Exit
Enter your choice (1-5): 1
Enter first number: 10
Enter second number: 5
Result: 10.00 + 5.00 = 15.00

=== Calculator Menu ===
1. Addition
2. Subtraction
3. Multiplication
4. Division
5. Exit
Enter your choice (1-5): 5
Thank you for using the calculator!`,
    hints: [
      'Start by implementing the add() function - simply return a + b',
      'Make sure to handle the division by zero case in the main function',
      'Test each function separately before moving to the next',
      'Use format specifier %.2f to display numbers with 2 decimal places'
    ]
  },
  "student-record-system": {
    id: "student-record-system",
    name: "Student Record Management System",
    description: "Create a comprehensive system to manage student records with file persistence",
    difficulty: "Intermediate",
    duration: "4-5 hours",
    technologies: ["Structures", "File Handling", "Arrays", "Pointers"],
    category: "Database Management",
    objectives: [
      'Implement student structure with relevant fields',
      'Create CRUD operations (Create, Read, Update, Delete)',
      'Add file persistence for data storage',
      'Implement search and display functionality'
    ],
    starterCode: `#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#define MAX_STUDENTS 100
#define FILENAME "students.dat"

typedef struct {
    int id;
    char name[50];
    int age;
    float grade;
    char course[30];
} Student;

Student students[MAX_STUDENTS];
int studentCount = 0;

// Function declarations
void loadStudents();
void saveStudents();
void addStudent();
void displayAllStudents();
void searchStudent();
void updateStudent();
void deleteStudent();
void displayMenu();

int main() {
    int choice;
    
    // Load existing students from file
    loadStudents();
    
    printf("🎓 Student Record Management System\\\\n");
    printf("Loaded %d student records\\\\n\\\\n", studentCount);
    
    while(1) {
        displayMenu();
        printf("Enter your choice: ");
        scanf("%d", &choice);
        
        switch(choice) {
            case 1:
                addStudent();
                break;
            case 2:
                displayAllStudents();
                break;
            case 3:
                searchStudent();
                break;
            case 4:
                updateStudent();
                break;
            case 5:
                deleteStudent();
                break;
            case 6:
                saveStudents();
                printf("Data saved successfully. Goodbye!\\\\n");
                return 0;
            default:
                printf("Invalid choice! Please try again.\\\\n");
        }
    }
    return 0;
}

void displayMenu() {
    printf("\\\\n====== Main Menu ======\\\\n");
    printf("1. Add New Student\\\\n");
    printf("2. Display All Students\\\\n");
    printf("3. Search Student\\\\n");
    printf("4. Update Student Record\\\\n");
    printf("5. Delete Student\\\\n");
    printf("6. Exit and Save\\\\n");
    printf("=========================\\\\n");
}

// TODO: Implement the functions below
void loadStudents() {
    printf("Loading students from file...\\\\n");
    // Implement file reading logic here
}

void saveStudents() {
    printf("Saving students to file...\\\\n");
    // Implement file writing logic here
}

void addStudent() {
    printf("Add Student function - Implement me!\\\\n");
    // Implement student addition logic here
}

void displayAllStudents() {
    printf("Display All Students function - Implement me!\\\\n");
    // Implement display logic here
}

void searchStudent() {
    printf("Search Student function - Implement me!\\\\n");
    // Implement search logic here
}

void updateStudent() {
    printf("Update Student function - Implement me!\\\\n");
    // Implement update logic here
}

void deleteStudent() {
    printf("Delete Student function - Implement me!\\\\n");
    // Implement delete logic here
}`,
    expectedOutput: `🎓 Student Record Management System
Loaded 0 student records

====== Main Menu ======
1. Add New Student
2. Display All Students
3. Search Student
4. Update Student Record
5. Delete Student
6. Exit and Save
=========================
Enter your choice: 1
Add Student function - Implement me!

====== Main Menu ======
1. Add New Student
2. Display All Students
3. Search Student
4. Update Student Record
5. Delete Student
6. Exit and Save
=========================
Enter your choice: 6
Saving students to file...
Data saved successfully. Goodbye!`,
    hints: [
      'Start by implementing the addStudent() function first',
      'Use fwrite() and fread() for file operations',
      'Implement input validation for age and grade',
      'Create a function to generate unique student IDs'
    ]
  },
  "quiz-game": {
    id: "quiz-game",
    name: "Interactive Quiz Game",
    description: "Build an engaging quiz game with multiple categories and scoring system",
    difficulty: "Beginner",
    duration: "3-4 hours",
    technologies: ["Arrays", "Structures", "Functions", "Control Flow"],
    category: "Gaming",
    objectives: [
      'Create question structure with options',
      'Implement scoring system',
      'Add multiple quiz categories',
      'Create result display with performance feedback'
    ],
    starterCode: `#include <stdio.h>
#include <string.h>
#include <ctype.h>

#define MAX_QUESTIONS 10

typedef struct {
    char question[200];
    char options[4][100];
    int correctOption;
    int points;
} Question;

// Sample questions database
Question programmingQuiz[] = {
    {
        "What is the capital of France?",
        {"London", "Berlin", "Paris", "Madrid"},
        2,  // Paris
        10
    },
    {
        "Which language are we learning?",
        {"Python", "Java", "C", "JavaScript"},
        2,  // C
        10
    },
    {
        "What does CPU stand for?",
        {"Central Processing Unit", "Computer Personal Unit", "Central Processor Unit", "Central Process Unit"},
        0,  // Central Processing Unit
        15
    }
};

int programmingQuizSize = 3;

// Function declarations
void displayWelcome();
int takeQuiz(Question questions[], int count);
void displayQuestion(Question q, int questionNum);
int getPlayerChoice();
void showResult(int score, int totalPossible);
void displayCategories();

int main() {
    int choice;
    int score = 0;
    
    displayWelcome();
    
    while(1) {
        displayCategories();
        printf("Enter your choice (1-2): ");
        scanf("%d", &choice);
        
        switch(choice) {
            case 1:
                score = takeQuiz(programmingQuiz, programmingQuizSize);
                showResult(score, 35); // 10 + 10 + 15 = 35
                break;
            case 2:
                printf("More categories coming soon!\\\\n");
                break;
            case 3:
                printf("Thanks for playing! Goodbye!\\\\n");
                return 0;
            default:
                printf("Invalid choice! Please try again.\\\\n");
        }
        
        printf("\\\\nWould you like to play another quiz? (1 for Yes, 0 for No): ");
        scanf("%d", &choice);
        if(choice == 0) {
            printf("Thanks for playing!\\\\n");
            break;
        }
    }
    
    return 0;
}

void displayWelcome() {
    printf("🧠 Welcome to the Quiz Challenge!\\\\n");
    printf("Test your knowledge across various categories!\\\\n\\\\n");
}

void displayCategories() {
    printf("\\\\n=== Quiz Categories ===\\\\n");
    printf("1. Programming Fundamentals\\\\n");
    printf("2. General Knowledge (Coming Soon)\\\\n");
    printf("3. Exit\\\\n");
}

// TODO: Implement the quiz functions below
void displayQuestion(Question q, int questionNum) {
    printf("Display question function - Implement me!\\\\n");
}

int getPlayerChoice() {
    printf("Get player choice function - Implement me!\\\\n");
    return 0;
}

int takeQuiz(Question questions[], int count) {
    printf("Take quiz function - Implement me!\\\\n");
    return 0;
}

void showResult(int score, int totalPossible) {
    printf("Show result function - Implement me!\\\\n");
}`,
    expectedOutput: `🧠 Welcome to the Quiz Challenge!
Test your knowledge across various categories!

=== Quiz Categories ===
1. Programming Fundamentals
2. General Knowledge (Coming Soon)
3. Exit
Enter your choice (1-2): 1
Take quiz function - Implement me!
Show result function - Implement me!

Would you like to play another quiz? (1 for Yes, 0 for No): 0
Thanks for playing!`,
    hints: [
      'Start with displayQuestion() - show question number, question text, and options',
      'Implement input validation in getPlayerChoice()',
      'Calculate total score by summing points for correct answers',
      'Add more questions to make the quiz interesting'
    ]
  }
};

const ProjectPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const project = PROJECTS_DATABASE[projectId];
  const fromRoadmap = searchParams.get('from') === 'roadmap';

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.body.classList.contains('dark-theme'));
    };
    
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);

  if (!project) {
    return (
      <div className="min-h-screen dark-gradient-secondary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Project Not Found</h1>
          <p className="text-gray-400 mb-6">The project you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/roadmaps/c-programming?tab=projects')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    if (fromRoadmap) {
      navigate('/roadmaps/c-programming?tab=projects');
    } else {
      navigate(-1);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500';
      case 'Intermediate': return 'bg-yellow-500';
      case 'Advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const ProgressCard = ({ title, progress, color = 'bg-primary-500' }) => (
    <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{title}</span>
        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{progress}%</span>
      </div>
      <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div 
          className={`h-2 rounded-full ${color} transition-all duration-500`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen dark-gradient-secondary">
      {/* Header */}
      <div className="gradient-bg text-white py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBack}
                className="flex items-center text-primary-200 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to {fromRoadmap ? 'Projects' : 'Previous'}
              </button>
              <div className="w-px h-6 bg-gray-600"></div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(project.difficulty)} text-white`}>
                {project.difficulty}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 text-sm">C Project</span>
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white/10 hover:bg-white/20'} transition-colors`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-6">
            <h1 className="text-3xl lg:text-4xl font-bold mb-3">{project.name}</h1>
            <p className="text-xl text-gray-300 max-w-3xl">{project.description}</p>
            
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="flex items-center text-gray-300">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {project.duration}
              </div>
              <div className="flex items-center text-gray-300">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {project.category}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          {isSidebarOpen && (
            <div className="lg:w-80 flex-shrink-0">
              <div className={`rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} p-6 sticky top-8`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Project Overview
                </h3>
                
                <div className="space-y-4 mb-6">
                  <ProgressCard title="Completion" progress={25} />
                  <ProgressCard title="Code Quality" progress={40} color="bg-blue-500" />
                  <ProgressCard title="Functionality" progress={15} color="bg-green-500" />
                </div>

                <div className="mb-6">
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <span 
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm ${
                          isDark 
                            ? 'bg-primary-900/30 text-primary-300 border border-primary-700' 
                            : 'bg-primary-100 text-primary-700 border border-primary-300'
                        }`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Quick Actions</h4>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setActiveTab('code')}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        activeTab === 'code' 
                          ? 'bg-primary-500 text-white' 
                          : isDark 
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        Start Coding
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab('objectives')}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        activeTab === 'objectives' 
                          ? 'bg-primary-500 text-white' 
                          : isDark 
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        View Objectives
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab('hints')}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        activeTab === 'hints' 
                          ? 'bg-primary-500 text-white' 
                          : isDark 
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Get Hints
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Navigation Tabs */}
            <div className={`rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} mb-6`}>
              <div className="flex overflow-x-auto">
                {[
                  { id: 'overview', name: 'Overview', icon: '📋' },
                  { id: 'objectives', name: 'Objectives', icon: '🎯' },
                  { id: 'code', name: 'Code Editor', icon: '💻' },
                  { id: 'hints', name: 'Hints', icon: '💡' },
                  { id: 'output', name: 'Expected Output', icon: '📊' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <span className="mr-2 text-lg">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Project Description
                      </h3>
                      <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                        {project.description} This project will help you practice core C programming concepts 
                        while building something practical and useful. Follow the objectives to complete the project step by step.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className={`font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          🚀 What You'll Learn
                        </h4>
                        <ul className={`space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {project.objectives.slice(0, 3).map((objective, index) => (
                            <li key={index} className="flex items-start">
                              <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {objective}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className={`font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          ⚙️ Project Setup
                        </h4>
                        <div className={`space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                            Use any C compiler (GCC recommended)
                          </div>
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                            Start with the provided starter code
                          </div>
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                            Test each function as you implement it
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'objectives' && (
                  <div>
                    <h3 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Learning Objectives
                    </h3>
                    <div className="grid gap-4">
                      {project.objectives.map((objective, index) => (
                        <div 
                          key={index}
                          className={`p-4 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}
                        >
                          <div className="flex items-start">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0 ${
                              isDark ? 'bg-primary-500 text-white' : 'bg-primary-100 text-primary-700'
                            }`}>
                              {index + 1}
                            </div>
                            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} pt-1`}>{objective}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'code' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Code Editor
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                        </svg>
                        <span>Auto-save enabled</span>
                      </div>
                    </div>
                    <div className="rounded-lg overflow-hidden border border-gray-700">
                      <CodeEditor 
                        theme={isDark ? 'vs-dark' : 'vs-light'}
                        initialCode={project.starterCode}
                        language="c"
                        projectName={project.name}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'hints' && (
                  <div>
                    <h3 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Helpful Hints
                    </h3>
                    <div className="space-y-4">
                      {project.hints.map((hint, index) => (
                        <div 
                          key={index}
                          className={`p-4 rounded-lg border ${isDark ? 'border-blue-500/30 bg-blue-900/20' : 'border-blue-200 bg-blue-50'}`}
                        >
                          <div className="flex items-start">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0 ${
                              isDark ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700'
                            }`}>
                              💡
                            </div>
                            <p className={`${isDark ? 'text-blue-300' : 'text-blue-700'} pt-0.5`}>{hint}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'output' && (
                  <div>
                    <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Expected Output
                    </h3>
                    <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      When your program is complete, it should produce output similar to this:
                    </p>
                    <div className={`p-4 rounded-lg font-mono text-sm whitespace-pre-wrap ${
                      isDark ? 'bg-gray-900 text-gray-300 border border-gray-700' : 'bg-gray-100 text-gray-800 border'
                    }`}>
                      {project.expectedOutput}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;