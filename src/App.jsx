import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [gameState, setGameState] = useState('initial'); // initial, playing, finished
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const topics = [
    'religion',
    'geografia',
    'cultura',
    'arte',
    'historia'
  ];

  const handleTopicSelect = async (topic) => {
    try {
      setError(null);
      setLoading(true);
      const res = await axios.post('https://parcial2back-omega.vercel.app/api/questions/generate', 
        { topic },
        { 
          timeout: 20000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (res.data.success) {
        setQuestions(res.data.questions);
        setGameState('playing');
      } else {
        throw new Error('No se pudieron obtener las preguntas');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.error || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post('https://parcial2back-omega.vercel.app/api/questions/verify', {
        questions,
        userAnswers
      });
      setResults(res.data);
      setGameState('finished');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => setError(null)}>Intentar de nuevo</button>
      </div>
    );
  }

  if (gameState === 'initial') {
    return (
      <div className="game-container">
        <h1>Juego de Trivia</h1>
        <p>Selecciona un tema para comenzar:</p>
        <div className="topics-grid">
          {topics.map(topic => (
            <button 
              key={topic}
              className="topic-button"
              onClick={() => handleTopicSelect(topic)}
            >
              {topic.charAt(0).toUpperCase() + topic.slice(1)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    return (
      <div className="game-container">
        <h2>Responde las siguientes preguntas:</h2>
        {questions.map((q, i) => (
          <div key={i} className="question-card">
            <p className="question">{q.question}</p>
            <div className="options">
              {q.options.map((option, j) => (
                <button
                  key={j}
                  className={`option-button ${userAnswers[i] === option ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(i, option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(userAnswers).length === questions.length && (
          <button className="submit-button" onClick={handleSubmit}>
            Verificar respuestas
          </button>
        )}
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="game-container">
        <h2>Resultados del Juego</h2>
        <div className="results">
          <div className="score-summary">
            <h3>Puntuación Final</h3>
            <div className="score">
              <p className="correct-score">✓ Correctas: {results.correct}</p>
              <p className="incorrect-score">✗ Incorrectas: {results.incorrect}</p>
            </div>
            <p className="percentage">
              {Math.round((results.correct / questions.length) * 100)}% de aciertos
            </p>
          </div>
          
          <div className="answers-review">
            <h3>Revisión de Respuestas</h3>
            {results.details.map((detail, i) => (
              <div key={i} className={`answer-detail ${detail.isCorrect ? 'correct' : 'incorrect'}`}>
                <h4>Pregunta {i + 1}:</h4>
                <p className="question-text">{questions[i].question}</p>
                <div className="answer-comparison">
                  <p>
                    <strong>Tu respuesta: </strong>
                    <span className={detail.isCorrect ? 'correct-text' : 'incorrect-text'}>
                      {userAnswers[i]}
                    </span>
                  </p>
                  {!detail.isCorrect && (
                    <p>
                      <strong>Respuesta correcta: </strong>
                      <span className="correct-text">{questions[i].correctAnswer}</span>
                    </p>
                  )}
                  {!detail.isCorrect && detail.normalizedCorrect === detail.normalizedUser && (
                    <p className="format-note">
                      <em>(La respuesta es correcta pero el formato era diferente)</em>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <button 
          className="play-again-button"
          onClick={() => {
            setGameState('initial');
            setQuestions([]);
            setUserAnswers({});
            setResults(null);
          }}
        >
          Jugar de nuevo
        </button>
      </div>
    );
  }
}

export default App;
