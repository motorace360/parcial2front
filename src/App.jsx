import { useState } from 'react';
import axios from 'axios';

function App() {
  const [topic, setTopic] = useState('');
  const [data, setData] = useState(null);

  const handleSubmit = async () => {
    const res = await axios.post('https://parcial2back-omega.vercel.app/api/questions/generate', { topic });
    setData(res.data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Juego de conocimiento</h1>
      <select onChange={e => setTopic(e.target.value)}>
        <option value="">Selecciona un tema</option>
        <option value="ciencias">ciencias</option>
        <option value="cultura">culturas</option>
        <option value="religion">religion</option>
        <option value="informatica">informatica</option>
        <option value="ingles">ingles</option>
      </select>
      <button onClick={handleSubmit}>Generar Preguntas</button>

      {data && (
        <div>
          <h2>Preguntas generadas</h2>
          {data.questions.map((q, i) => (
            <div key={i}>
              <p><strong>{q.question}</strong></p>
              <ul>
                {q.options.map((op, j) => (
                  <li key={j}>{op}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
