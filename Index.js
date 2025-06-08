const express = require('express');

const app = express();
app.use(express.json());

// In-memory storage for demo
let users = [
  {
    id: 1,
    username: "demo",
    age: 30,
    currentLifeExpectancy: "78.5",
    totalLifeExtension: 0,
    height: 170,
    weight: 70,
    activityLevel: "moderate",
    gender: "other"
  }
];

let foodEntries = [];
let exerciseEntries = [];
let sleepEntries = [];
let eatingWindows = [];

// Helper functions
function calculateNutritionScore(foodName) {
  const healthyFoods = {
    'apple': 85, 'banana': 80, 'broccoli': 95, 'salmon': 90, 'quinoa': 85,
    'spinach': 95, 'blueberries': 90, 'avocado': 85, 'sweet potato': 80,
    'greek yogurt': 85, 'almonds': 85, 'chicken breast': 80, 'oatmeal': 82,
    'kale': 95, 'berries': 88, 'nuts': 85, 'fish': 88, 'beans': 80
  };
  
  const unhealthyFoods = {
    'pizza': 35, 'burger': 30, 'fries': 25, 'soda': 15, 'candy': 20,
    'chips': 25, 'ice cream': 35, 'donuts': 20, 'cookies': 30, 'cake': 25,
    'fast food': 28, 'processed meat': 32, 'sugary drinks': 18
  };
  
  const food = foodName.toLowerCase();
  
  if (healthyFoods[food]) return healthyFoods[food];
  if (unhealthyFoods[food]) return unhealthyFoods[food];
  
  // Check for partial matches
  for (const [key, value] of Object.entries(healthyFoods)) {
    if (food.includes(key) || key.includes(food)) return value;
  }
  for (const [key, value] of Object.entries(unhealthyFoods)) {
    if (food.includes(key) || key.includes(food)) return value;
  }
  
  return 60; // Default moderate score
}

function calculateFoodImpact(foodName, nutritionScore) {
  let hours = 0;
  let explanation = "";
  
  if (nutritionScore >= 85) {
    hours = Math.random() * 1.5 + 1.5; // 1.5-3 hours
    explanation = `${foodName} is highly nutritious and supports longevity through powerful antioxidants and essential nutrients.`;
  } else if (nutritionScore >= 70) {
    hours = Math.random() * 1 + 0.5; // 0.5-1.5 hours
    explanation = `${foodName} provides good nutritional value with beneficial compounds for health.`;
  } else if (nutritionScore >= 50) {
    hours = Math.random() * 0.3; // 0-0.3 hours  
    explanation = `${foodName} provides moderate nutritional value with some beneficial compounds.`;
  } else {
    hours = -(Math.random() * 1.5 + 0.5); // -0.5 to -2 hours
    explanation = `${foodName} is highly processed and may contribute to inflammation and metabolic stress.`;
  }
  
  return { hours: Math.round(hours * 100) / 100, explanation };
}

function calculateExerciseImpact(exerciseType, duration, intensity) {
  const baseMultiplier = {
    'running': 0.08,
    'cycling': 0.06,
    'swimming': 0.09,
    'walking': 0.04,
    'weightlifting': 0.07,
    'yoga': 0.05,
    'hiit': 0.10,
    'cardio': 0.07,
    'strength': 0.07
  };
  
  const intensityMultiplier = {
    'low': 0.7,
    'moderate': 1.0,
    'high': 1.3
  };
  
  const base = baseMultiplier[exerciseType.toLowerCase()] || 0.06;
  const intensityFactor = intensityMultiplier[intensity.toLowerCase()] || 1.0;
  
  const hours = duration * base * intensityFactor;
  
  return {
    hours: Math.round(hours * 100) / 100,
    explanation: `${exerciseType} for ${duration} minutes at ${intensity} intensity improves cardiovascular health and cellular repair mechanisms.`
  };
}

function calculateSleepImpact(duration, quality) {
  let hours = 0;
  let explanation = "";
  
  if (duration >= 7 && duration <= 9 && quality >= 8) {
    hours = Math.random() * 1 + 1.5; // 1.5-2.5 hours
    explanation = "Optimal sleep duration and quality supports cellular repair and hormone regulation.";
  } else if (duration >= 6 && duration <= 10 && quality >= 6) {
    hours = Math.random() * 0.8 + 0.2; // 0.2-1 hours
    explanation = "Good sleep supports recovery, though there's room for improvement.";
  } else {
    hours = -(Math.random() * 1.2 + 0.3); // -0.3 to -1.5 hours
    explanation = "Poor sleep quality or duration increases stress hormones and inflammation.";
  }
  
  return { hours: Math.round(hours * 100) / 100, explanation };
}

// API Routes
app.get('/api/user', (req, res) => {
  res.json(users[0]);
});

app.post('/api/user/life-expectancy', (req, res) => {
  const { newLifeExpectancy, extensionHours } = req.body;
  
  users[0].currentLifeExpectancy = newLifeExpectancy.toString();
  users[0].totalLifeExtension = (users[0].totalLifeExtension || 0) + extensionHours;
  
  res.json(users[0]);
});

app.get('/api/food-entries', (req, res) => {
  const userEntries = foodEntries.filter(entry => entry.userId === 1);
  res.json(userEntries.slice(-10));
});

app.get('/api/food-entries/today', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const todayEntries = foodEntries.filter(entry => 
    entry.userId === 1 && entry.timestamp.startsWith(today)
  );
  res.json(todayEntries);
});

app.post('/api/food-entries', (req, res) => {
  const { foodName, quantity, nutritionScore } = req.body;
  
  const impact = calculateFoodImpact(foodName, nutritionScore);
  
  const entry = {
    id: foodEntries.length + 1,
    userId: 1,
    foodName,
    quantity: quantity || "1 serving",
    nutritionScore,
    lifeImpactHours: impact.hours,
    explanation: impact.explanation,
    timestamp: new Date().toISOString()
  };
  
  foodEntries.push(entry);
  
  // Update user life expectancy
  const currentExpectancy = parseFloat(users[0].currentLifeExpectancy);
  const newExpectancy = currentExpectancy + (impact.hours / 8760); // Convert hours to years
  users[0].currentLifeExpectancy = newExpectancy.toString();
  users[0].totalLifeExtension = (users[0].totalLifeExtension || 0) + impact.hours;
  
  res.json(entry);
});

app.get('/api/exercise-entries', (req, res) => {
  const userEntries = exerciseEntries.filter(entry => entry.userId === 1);
  res.json(userEntries.slice(-10));
});

app.post('/api/exercise-entries', (req, res) => {
  const { exerciseType, duration, intensity, caloriesBurned } = req.body;
  
  const impact = calculateExerciseImpact(exerciseType, duration, intensity);
  
  const entry = {
    id: exerciseEntries.length + 1,
    userId: 1,
    exerciseType,
    duration,
    intensity,
    caloriesBurned: caloriesBurned || Math.round(duration * 5),
    lifeImpactHours: impact.hours,
    explanation: impact.explanation,
    timestamp: new Date().toISOString()
  };
  
  exerciseEntries.push(entry);
  
  // Update user life expectancy
  const currentExpectancy = parseFloat(users[0].currentLifeExpectancy);
  const newExpectancy = currentExpectancy + (impact.hours / 8760);
  users[0].currentLifeExpectancy = newExpectancy.toString();
  users[0].totalLifeExtension = (users[0].totalLifeExtension || 0) + impact.hours;
  
  res.json(entry);
});

app.get('/api/sleep-entries', (req, res) => {
  const userEntries = sleepEntries.filter(entry => entry.userId === 1);
  res.json(userEntries.slice(-10));
});

app.post('/api/sleep-entries', (req, res) => {
  const { duration, quality, sleepTime, wakeTime } = req.body;
  
  const impact = calculateSleepImpact(duration, quality);
  
  const entry = {
    id: sleepEntries.length + 1,
    userId: 1,
    duration,
    quality,
    sleepTime,
    wakeTime,
    lifeImpactHours: impact.hours,
    explanation: impact.explanation,
    timestamp: new Date().toISOString()
  };
  
  sleepEntries.push(entry);
  
  // Update user life expectancy
  const currentExpectancy = parseFloat(users[0].currentLifeExpectancy);
  const newExpectancy = currentExpectancy + (impact.hours / 8760);
  users[0].currentLifeExpectancy = newExpectancy.toString();
  users[0].totalLifeExtension = (users[0].totalLifeExtension || 0) + impact.hours;
  
  res.json(entry);
});

app.post('/api/nutrition-score', (req, res) => {
  const { foodName } = req.body;
  const score = calculateNutritionScore(foodName);
  res.json({ score });
});

// Root route - serve the complete health tracker app
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Health & Longevity Tracker</title>
        <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
            .countdown-digit { font-family: 'Courier New', monospace; font-weight: bold; text-shadow: 0 0 10px currentColor; }
            .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .card { background: white; border-radius: 12px; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15); }
            .pulse-glow { animation: pulse-glow 2s ease-in-out infinite alternate; }
            @keyframes pulse-glow { from { opacity: 0.8; } to { opacity: 1; } }
            .impact-positive { color: #10b981; font-weight: bold; }
            .impact-negative { color: #ef4444; font-weight: bold; }
            .btn { transition: all 0.2s ease; }
            .btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        </style>
    </head>
    <body class="bg-gradient-to-br from-gray-50 to-gray-100">
        <div id="root"></div>
        
        <script>
            const { useState, useEffect } = React;
            
            function CountdownClock() {
                const [timeLeft, setTimeLeft] = useState({
                    years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0
                });
                const [user, setUser] = useState({ currentLifeExpectancy: "78.5", age: 30 });
                const [isLoading, setIsLoading] = useState(true);
                
                useEffect(() => {
                    const fetchUser = async () => {
                        try {
                            const response = await fetch('/api/user');
                            const data = await response.json();
                            setUser(data);
                        } catch (error) {
                            console.log('Using default user data');
                        } finally {
                            setIsLoading(false);
                        }
                    };
                    fetchUser();
                }, []);
                
                useEffect(() => {
                    if (isLoading) return;
                    
                    const calculateTimeLeft = () => {
                        const currentAge = user.age || 30;
                        const lifeExpectancy = parseFloat(user.currentLifeExpectancy) || 78.5;
                        const yearsLeft = lifeExpectancy - currentAge;
                        
                        if (yearsLeft <= 0) return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
                        
                        const totalSeconds = yearsLeft * 365.25 * 24 * 60 * 60;
                        const now = Date.now() / 1000;
                        const targetTime = now + totalSeconds;
                        
                        const secondsLeft = Math.max(0, targetTime - now);
                        
                        return {
                            years: Math.floor(secondsLeft / (365.25 * 24 * 60 * 60)),
                            months: Math.floor((secondsLeft % (365.25 * 24 * 60 * 60)) / (30.44 * 24 * 60 * 60)),
                            days: Math.floor((secondsLeft % (30.44 * 24 * 60 * 60)) / (24 * 60 * 60)),
                            hours: Math.floor((secondsLeft % (24 * 60 * 60)) / (60 * 60)),
                            minutes: Math.floor((secondsLeft % (60 * 60)) / 60),
                            seconds: Math.floor(secondsLeft % 60)
                        };
                    };
                    
                    const timer = setInterval(() => {
                        setTimeLeft(calculateTimeLeft());
                    }, 1000);
                    
                    return () => clearInterval(timer);
                }, [user, isLoading]);
                
                if (isLoading) {
                    return React.createElement('div', {
                        className: 'card p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white animate-pulse'
                    }, 'Loading countdown...');
                }
                
                return React.createElement('div', {
                    className: 'card p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white'
                }, [
                    React.createElement('h3', {
                        className: 'text-xl font-bold mb-6 flex items-center justify-center',
                        key: 'title'
                    }, [
                        React.createElement('span', { key: 'icon', className: 'mr-2 text-2xl' }, '⏰'),
                        'Life Countdown Clock'
                    ]),
                    React.createElement('div', {
                        className: 'grid grid-cols-3 gap-4 text-center mb-6',
                        key: 'countdown'
                    }, [
                        React.createElement('div', { key: 'years', className: 'bg-blue-600/20 rounded-lg p-3' }, [
                            React.createElement('div', {
                                className: 'countdown-digit text-3xl md:text-4xl text-blue-400 pulse-glow',
                                key: 'years-value'
                            }, timeLeft.years),
                            React.createElement('div', {
                                className: 'text-sm text-gray-300 mt-1',
                                key: 'years-label'
                            }, 'Years')
                        ]),
                        React.createElement('div', { key: 'months', className: 'bg-green-600/20 rounded-lg p-3' }, [
                            React.createElement('div', {
                                className: 'countdown-digit text-3xl md:text-4xl text-green-400 pulse-glow',
                                key: 'months-value'
                            }, timeLeft.months),
                            React.createElement('div', {
                                className: 'text-sm text-gray-300 mt-1',
                                key: 'months-label'
                            }, 'Months')
                        ]),
                        React.createElement('div', { key: 'days', className: 'bg-yellow-600/20 rounded-lg p-3' }, [
                            React.createElement('div', {
                                className: 'countdown-digit text-3xl md:text-4xl text-yellow-400 pulse-glow',
                                key: 'days-value'
                            }, timeLeft.days),
                            React.createElement('div', {
                                className: 'text-sm text-gray-300 mt-1',
                                key: 'days-label'
                            }, 'Days')
                        ]),
                        React.createElement('div', { key: 'hours', className: 'bg-orange-600/20 rounded-lg p-3' }, [
                            React.createElement('div', {
                                className: 'countdown-digit text-2xl md:text-3xl text-orange-400 pulse-glow',
                                key: 'hours-value'
                            }, timeLeft.hours),
                            React.createElement('div', {
                                className: 'text-sm text-gray-300 mt-1',
                                key: 'hours-label'
                            }, 'Hours')
                        ]),
                        React.createElement('div', { key: 'minutes', className: 'bg-red-600/20 rounded-lg p-3' }, [
                            React.createElement('div', {
                                className: 'countdown-digit text-2xl md:text-3xl text-red-400 pulse-glow',
                                key: 'minutes-value'
                            }, timeLeft.minutes),
                            React.createElement('div', {
                                className: 'text-sm text-gray-300 mt-1',
                                key: 'minutes-label'
                            }, 'Minutes')
                        ]),
                        React.createElement('div', { key: 'seconds', className: 'bg-purple-600/20 rounded-lg p-3' }, [
                            React.createElement('div', {
                                className: 'countdown-digit text-2xl md:text-3xl text-purple-400 pulse-glow',
                                key: 'seconds-value'
                            }, timeLeft.seconds),
                            React.createElement('div', {
                                className: 'text-sm text-gray-300 mt-1',
                                key: 'seconds-label'
                            }, 'Seconds')
                        ])
                    ]),
                    React.createElement('div', {
                        className: 'text-center',
                        key: 'expectancy'
                    }, [
                        React.createElement('div', {
                            className: 'text-lg text-gray-300 mb-2',
                            key: 'current'
                        }, \`Current Life Expectancy: \${user.currentLifeExpectancy} years\`),
                        React.createElement('div', {
                            className: 'text-sm text-gray-400',
                            key: 'extension'
                        }, \`Total Extension: +\${(user.totalLifeExtension || 0).toFixed(1)} hours\`)
                    ])
                ]);
            }
            
            function HealthTracker() {
                const [foodName, setFoodName] = useState('');
                const [exerciseType, setExerciseType] = useState('');
                const [exerciseDuration, setExerciseDuration] = useState('');
                const [sleepDuration, setSleepDuration] = useState('');
                const [sleepQuality, setSleepQuality] = useState('');
                const [recentEntries, setRecentEntries] = useState([]);
                const [isSubmitting, setIsSubmitting] = useState(false);
                const [user, setUser] = useState({ currentLifeExpectancy: "78.5", age: 30 });
                
                useEffect(() => {
                    const fetchUser = async () => {
                        try {
                            const response = await fetch('/api/user');
                            const data = await response.json();
                            setUser(data);
                        } catch (error) {
                            console.log('Using default user data');
                        }
                    };
                    fetchUser();
                }, []);
                
                const refreshUser = async () => {
                    try {
                        const response = await fetch('/api/user');
                        const data = await response.json();
                        setUser(data);
                    } catch (error) {
                        console.log('Failed to refresh user data');
                    }
                };
                
                const addFood = async () => {
                    if (!foodName || isSubmitting) return;
                    setIsSubmitting(true);
                    
                    try {
                        const scoreRes = await fetch('/api/nutrition-score', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ foodName })
                        });
                        const { score } = await scoreRes.json();
                        
                        const res = await fetch('/api/food-entries', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ foodName, nutritionScore: score })
                        });
                        const entry = await res.json();
                        
                        setRecentEntries(prev => [entry, ...prev.slice(0, 4)]);
                        setFoodName('');
                        await refreshUser();
                    } catch (error) {
                        console.error('Error adding food:', error);
                    } finally {
                        setIsSubmitting(false);
                    }
                };
                
                const addExercise = async () => {
                    if (!exerciseType || !exerciseDuration || isSubmitting) return;
                    setIsSubmitting(true);
                    
                    try {
                        const res = await fetch('/api/exercise-entries', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                                exerciseType, 
                                duration: parseInt(exerciseDuration),
                                intensity: 'moderate'
                            })
                        });
                        const entry = await res.json();
                        
                        setRecentEntries(prev => [entry, ...prev.slice(0, 4)]);
                        setExerciseType('');
                        setExerciseDuration('');
                        await refreshUser();
                    } catch (error) {
                        console.error('Error adding exercise:', error);
                    } finally {
                        setIsSubmitting(false);
                    }
                };
                
                const addSleep = async () => {
                    if (!sleepDuration || !sleepQuality || isSubmitting) return;
                    setIsSubmitting(true);
                    
                    try {
                        const res = await fetch('/api/sleep-entries', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                                duration: parseFloat(sleepDuration),
                                quality: parseInt(sleepQuality)
                            })
                        });
                        const entry = await res.json();
                        
                        setRecentEntries(prev => [entry, ...prev.slice(0, 4)]);
                        setSleepDuration('');
                        setSleepQuality('');
                        await refreshUser();
                    } catch (error) {
                        console.error('Error adding sleep:', error);
                    } finally {
                        setIsSubmitting(false);
                    }
                };
                
                return React.createElement('div', {
                    className: 'min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4'
                }, [
                    React.createElement('div', {
                        className: 'max-w-7xl mx-auto',
                        key: 'container'
                    }, [
                        React.createElement('div', {
                            className: 'gradient-bg text-white p-8 rounded-xl mb-8 shadow-2xl',
                            key: 'header'
                        }, [
                            React.createElement('h1', {
                                className: 'text-4xl font-bold mb-3',
                                key: 'title'
                            }, '🏃‍♂️ Health & Longevity Tracker'),
                            React.createElement('p', {
                                className: 'text-xl opacity-90',
                                key: 'subtitle'
                            }, 'Track your daily habits and watch your life expectancy grow in real-time'),
                            React.createElement('p', {
                                className: 'text-sm opacity-75 mt-2',
                                key: 'description'
                            }, 'Every healthy choice adds time to your life. Every unhealthy choice subtracts it.')
                        ]),
                        
                        React.createElement('div', {
                            className: 'grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8',
                            key: 'main-content'
                        }, [
                            React.createElement(CountdownClock, { key: 'countdown' }),
                            
                            React.createElement('div', {
                                className: 'card p-6',
                                key: 'quick-actions'
                            }, [
                                React.createElement('h3', {
                                    className: 'text-xl font-bold mb-6 flex items-center',
                                    key: 'actions-title'
                                }, [
                                    React.createElement('span', { key: 'icon', className: 'mr-2' }, '📝'),
                                    'Track Your Health'
                                ]),
                                
                                React.createElement('div', {
                                    className: 'space-y-6',
                                    key: 'actions'
                                }, [
                                    React.createElement('div', { key: 'food-section' }, [
                                        React.createElement('h4', {
                                            className: 'font-semibold mb-3 text-gray-700',
                                            key: 'food-title'
                                        }, '🍎 Log Food'),
                                        React.createElement('div', {
                                            className: 'flex gap-3',
                                            key: 'food-form'
                                        }, [
                                            React.createElement('input', {
                                                type: 'text',
                                                placeholder: 'Enter food (e.g., apple, salmon, pizza)',
                                                className: 'flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                                                value: foodName,
                                                onChange: (e) => setFoodName(e.target.value),
                                                onKeyPress: (e) => e.key === 'Enter' && addFood(),
                                                key: 'food-input'
                                            }),
                                            React.createElement('button', {
                                                onClick: addFood,
                                                disabled: isSubmitting,
                                                className: \`btn px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 \${isSubmitting ? 'cursor-not-allowed' : ''}\`,
                                                key: 'food-button'
                                            }, isSubmitting ? 'Adding...' : 'Add')
                                        ])
                                    ]),
                                    
                                    React.createElement('div', { key: 'exercise-section' }, [
                                        React.createElement('h4', {
                                            className: 'font-semibold mb-3 text-gray-700',
                                            key: 'exercise-title'
                                        }, '💪 Log Exercise'),
                                        React.createElement('div', {
                                            className: 'flex gap-3',
                                            key: 'exercise-form'
                                        }, [
                                            React.createElement('input', {
                                                type: 'text',
                                                placeholder: 'Exercise type',
                                                className: 'flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                                                value: exerciseType,
                                                onChange: (e) => setExerciseType(e.target.value),
                                                key: 'exercise-type'
                                            }),
                                            React.createElement('input', {
                                                type: 'number',
                                                placeholder: 'Minutes',
                                                className: 'w-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                                                value: exerciseDuration,
                                                onChange: (e) => setExerciseDuration(e.target.value),
                                                key: 'exercise-duration'
                                            }),
                                            React.createElement('button', {
                                                onClick: addExercise,
                                                disabled: isSubmitting,
                                                className: \`btn px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 \${isSubmitting ? 'cursor-not-allowed' : ''}\`,
                                                key: 'exercise-button'
                                            }, isSubmitting ? 'Adding...' : 'Add')
                                        ])
                                    ]),
                                    
                                    React.createElement('div', { key: 'sleep-section' }, [
                                        React.createElement('h4', {
                                            className: 'font-semibold mb-3 text-gray-700',
                                            key: 'sleep-title'
                                        }, '😴 Log Sleep'),
                                        React.createElement('div', {
                                            className: 'flex gap-3',
                                            key: 'sleep-form'
                                        }, [
                                            React.createElement('input', {
                                                type: 'number',
                                                placeholder: 'Hours',
                                                step: '0.5',
                                                className: 'w-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                                                value: sleepDuration,
                                                onChange: (e) => setSleepDuration(e.target.value),
                                                key: 'sleep-duration'
                                            }),
                                            React.createElement('input', {
                                                type: 'number',
                                                placeholder: 'Quality (1-10)',
                                                min: '1',
                                                max: '10',
                                                className: 'flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                                                value: sleepQuality,
                                                onChange: (e) => setSleepQuality(e.target.value),
                                                key: 'sleep-quality'
                                            }),
                                            React.createElement('button', {
                                                onClick: addSleep,
                                                disabled: isSubmitting,
                                                className: \`btn px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 \${isSubmitting ? 'cursor-not-allowed' : ''}\`,
                                                key: 'sleep-button'
                                            }, isSubmitting ? 'Adding...' : 'Add')
                                        ])
                                    ])
                                ])
                            ])
                        ]),
                        
                        recentEntries.length > 0 && React.createElement('div', {
                            className: 'card p-6',
                            key: 'recent-entries'
                        }, [
                            React.createElement('h3', {
                                className: 'text-xl font-bold mb-6 flex items-center',
                                key: 'recent-title'
                            }, [
                                React.createElement('span', { key: 'icon', className: 'mr-2' }, '📊'),
                                'Recent Activity & Life Impact'
                            ]),
                            React.createElement('div', {
                                className: 'grid gap-4',
                                key: 'recent-list'
                            }, recentEntries.map((entry, index) => 
                                React.createElement('div', {
                                    key: index,
                                    className: 'flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-l-4 ' + (entry.lifeImpactHours > 0 ? 'border-green-500' : 'border-red-500')
                                }, [
                                    React.createElement('div', { key: 'entry-info', className: 'flex-1' }, [
                                        React.createElement('div', {
                                            className: 'font-semibold text-gray-800',
                                            key: 'entry-name'
                                        }, entry.foodName || entry.exerciseType || 'Sleep'),
                                        React.createElement('div', {
                                            className: 'text-sm text-gray-600 mt-1',
                                            key: 'entry-desc'
                                        }, entry.explanation)
                                    ]),
                                    React.createElement('div', {
                                        className: \`text-right \${entry.lifeImpactHours > 0 ? 'impact-positive' : 'impact-negative'}\`,
                                        key: 'entry-impact'
                                    }, [
                                        React.createElement('div', {
                                            className: 'text-lg font-bold',
                                            key: 'impact-hours'
                                        }, \`\${entry.lifeImpactHours > 0 ? '+' : ''}\${entry.lifeImpactHours}h\`),
                                        React.createElement('div', {
                                            className: 'text-xs opacity-75',
                                            key: 'impact-label'
                                        }, entry.lifeImpactHours > 0 ? 'Life Added' : 'Life Lost')
                                    ])
                                ])
                            ))
                        ]),
                        
                        React.createElement('div', {
                            className: 'card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200',
                            key: 'info-section'
                        }, [
                            React.createElement('h3', {
                                className: 'text-lg font-bold mb-3 text-blue-900',
                                key: 'info-title'
                            }, '💡 How It Works'),
                            React.createElement('p', {
                                className: 'text-blue-800 leading-relaxed',
                                key: 'info-text'
                            }, 'This tracker uses realistic health research to calculate how your daily choices impact your life expectancy. Nutrient-dense foods like salmon and broccoli can add 1-3 hours to your life, while processed foods may subtract time. Exercise and quality sleep provide measurable longevity benefits. Watch your countdown clock update in real-time as you make healthier choices!')
                        ])
                    ])
                ]);
            }
            
            ReactDOM.render(React.createElement(HealthTracker), document.getElementById('root'));
        </script>
    </body>
    </html>
  `);
});

// Export for Vercel
module.exports = app;