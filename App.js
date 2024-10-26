import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Alert, FlatList } from 'react-native';

// Home Screen Component
const HomeScreen = ({ onStart }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Arithmetica's Quest!</Text>
    <TouchableOpacity style={styles.button} onPress={onStart}>
      <Text style={styles.buttonText}>Start</Text>
    </TouchableOpacity>
  </View>
);

// Game Screen Component
const GameScreen = ({ equation, timeLeft, answer, onAnswerChange, onSubmit, powerUps, usePowerUp }) => (
  <View style={styles.container}>
    <Text style={styles.equation}>{equation}</Text>
    <Text>Time Left: {timeLeft}s</Text>
    <Text>Power-Ups: {powerUps}</Text>
    <TextInput
      style={styles.input}
      keyboardType="numeric"
      value={answer}
      onChangeText={onAnswerChange}
    />
    <TouchableOpacity style={styles.button} onPress={onSubmit}>
      <Text style={styles.buttonText}>Submit</Text>
    </TouchableOpacity>
    {powerUps > 0 && (
      <TouchableOpacity style={styles.button} onPress={usePowerUp}>
        <Text style={styles.buttonText}>Use Power-Up</Text>
      </TouchableOpacity>
    )}
  </View>
);

// Result Screen Component
const ResultScreen = ({ score, onReset, onShowLeaderboard }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Game Over!</Text>
    <Text>Your Score: {score}</Text>
    <TouchableOpacity style={styles.button} onPress={onReset}>
      <Text style={styles.buttonText}>Continue Training</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.button} onPress={onShowLeaderboard}>
      <Text style={styles.buttonText}>View Leaderboard</Text>
    </TouchableOpacity>
  </View>
);

// Leaderboard Component
const Leaderboard = ({ scores }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Leaderboard</Text>
    <FlatList
      data={scores}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Text style={styles.leaderboardItem}>Angel: {item.score}</Text>
      )}
    />
  </View>
);

const App = () => {
  const [screen, setScreen] = useState('home');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [equation, setEquation] = useState('');
  const [answer, setAnswer] = useState('');
  const [isGameActive, setIsGameActive] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [powerUps, setPowerUps] = useState(0);
  const [doubleScoreActive, setDoubleScoreActive] = useState(false);

  useEffect(() => {
    let timer;
    if (isGameActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      handleGameOver();
    }
    return () => clearInterval(timer);
  }, [isGameActive, timeLeft]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsGameActive(true);
    generateEquation();
    setScreen('game');
  };

  const generateEquation = () => {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    const operation = ['+', '-', '*', '/'][Math.floor(Math.random() * 4)];

    if (operation === '/' && num2 === 0) {
      num2 = 1; // Avoid division by zero
    }

    setEquation(`${num1} ${operation} ${num2}`);
  };

  const handleSubmit = () => {
    const correctAnswer = eval(equation);
    const currentScore = doubleScoreActive ? 20 : 10; // Double score if the power-up is active

    if (parseFloat(answer) === correctAnswer) {
      setScore((prev) => prev + currentScore);
      setTimeLeft((prev) => Math.min(prev + 5, 60)); // Extend time
      generateEquation();
      setAnswer('');
      checkForPowerUp(); // Check for power-up after each correct answer
    } else {
      Alert.alert('Incorrect!', 'Try again.');
    }
  };

  const checkForPowerUp = () => {
    if (score % 30 === 0) { // Every 30 points, grant a power-up
      setPowerUps((prev) => prev + 1);
      Alert.alert('Power-Up Earned!', 'You earned a magical power-up!');
    }
  };

  const handleGameOver = () => {
    setIsGameActive(false);
    setScreen('result');
    addToLeaderboard(score);
    resetPowerUps();
  };

  const resetPowerUps = () => {
    setPowerUps(0);
    setDoubleScoreActive(false);
  };

  const addToLeaderboard = (score) => {
    const newEntry = { id: Date.now().toString(), name: 'Player', score };
    setLeaderboard((prev) => [...prev, newEntry]);
  };

  const resetGame = () => {
    setScreen('home');
    setScore(0);
    setTimeLeft(30);
    setAnswer('');
    resetPowerUps();
  };

  const usePowerUp = () => {
    if (powerUps > 0) {
      setDoubleScoreActive(true);
      setPowerUps((prev) => prev - 1);
      Alert.alert('Power-Up Activated!', 'Your score will be doubled for the next correct answer!');
    }
  };

  return (
    <View style={styles.container}>
      {screen === 'home' && <HomeScreen onStart={startGame} />}
      {screen === 'game' && (
        <GameScreen
          equation={equation}
          timeLeft={timeLeft}
          answer={answer}
          onAnswerChange={(text) => setAnswer(text)}
          onSubmit={handleSubmit}
          powerUps={powerUps}
          usePowerUp={usePowerUp} // Pass usePowerUp
        />
      )}
      {screen === 'result' && (
        <ResultScreen score={score} onReset={resetGame} onShowLeaderboard={() => setScreen('leaderboard')} />
      )}
      {screen === 'leaderboard' && <Leaderboard scores={leaderboard} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  equation: {
    fontSize: 36,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  leaderboardItem: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4CAF50', // Custom button color
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default App;
