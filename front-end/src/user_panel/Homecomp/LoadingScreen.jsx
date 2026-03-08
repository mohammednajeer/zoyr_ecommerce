import { useEffect, useState } from 'react';
import './LoadingScreen.css';

function LoadingScreen({ onDone }) {
  const [phase, setPhase] = useState('in');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('out'), 2600);
    const t2 = setTimeout(() => onDone?.(), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className={`ls-wrap ls-${phase}`}>
      <div className="ls-emblem">

        {/* Left wings — 4 lines, each shorter */}
        <div className="ls-wings ls-wings-l">
          <div className="ls-wing-line" style={{ '--w': '100%', '--d': '0.90s' }} />
          <div className="ls-wing-line" style={{ '--w': '80%',  '--d': '1.02s' }} />
          <div className="ls-wing-line" style={{ '--w': '60%',  '--d': '1.14s' }} />
          <div className="ls-wing-line" style={{ '--w': '38%',  '--d': '1.26s' }} />
        </div>

        <div className="ls-word">ZOYR</div>

        {/* Right wings — 4 lines, each shorter */}
        <div className="ls-wings ls-wings-r">
          <div className="ls-wing-line" style={{ '--w': '100%', '--d': '0.90s' }} />
          <div className="ls-wing-line" style={{ '--w': '80%',  '--d': '1.02s' }} />
          <div className="ls-wing-line" style={{ '--w': '60%',  '--d': '1.14s' }} />
          <div className="ls-wing-line" style={{ '--w': '38%',  '--d': '1.26s' }} />
        </div>

      </div>
    </div>
  );
}

export default LoadingScreen;