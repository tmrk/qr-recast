import './App.css';
import { strings } from './strings.js';

function App() {
  return (
    <main className="app-home" aria-labelledby="app-title">
      <section className="app-home__panel">
        <img
          className="app-home__mark"
          src={`${import.meta.env.BASE_URL}favicon.svg`}
          alt=""
          width="88"
          height="88"
        />
        <div className="app-home__copy">
          <p className="app-home__eyebrow">{strings.tagline}</p>
          <h1 id="app-title">{strings.appName}</h1>
          <p>{strings.intro}</p>
        </div>
        <p className="app-home__note">{strings.privacyNote}</p>
      </section>
    </main>
  );
}

export default App;
