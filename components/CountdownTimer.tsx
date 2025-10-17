'use client';

import { useEffect, useState } from 'react';
import { getTimeUntilSunday, isVotingLocked } from '@/lib/utils';

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilSunday());
  const [locked, setLocked] = useState(isVotingLocked());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilSunday());
      setLocked(isVotingLocked());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-purple-400">🕒</span>
      {locked ? (
        <span className="text-yellow-400 font-medium">Voting locked</span>
      ) : (
        <span className="text-white font-medium">
          Voting ends in: {timeLeft.days}d {timeLeft.hours}h:{String(timeLeft.minutes).padStart(2, '0')}m
        </span>
      )}
    </div>
  );
}
