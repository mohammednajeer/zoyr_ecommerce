import { useEffect, useState } from 'react';
import './LoadingScreen.css';

function LoadingScreen({ onDone }) {
  const [phase, setPhase] = useState('in');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('out'), 2000);
    const t2 = setTimeout(() => onDone?.(), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className={`ls-wrap ls-${phase}`}>
      <div className="ls-word">ZOYR</div>
      <div className="ls-line" />
    </div>
  );
}

export default LoadingScreen;