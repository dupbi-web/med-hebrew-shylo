import { useEffect, useState } from "react";

interface TimerDisplayProps {
    startTime: number | null;
    endTime: number | null;
}

export default function TimerDisplay({ startTime, endTime }: TimerDisplayProps) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (!startTime) {
            setElapsed(0);
            return;
        }

        if (endTime) {
            setElapsed(Math.floor((endTime - startTime) / 1000));
            return;
        }

        const interval = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 100);

        return () => clearInterval(interval);
    }, [startTime, endTime]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">זמן</span>
            <span className="text-xl font-bold tabular-nums">{formatTime(elapsed)}</span>
        </div>
    );
}
