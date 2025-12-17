import {useEffect, useState} from "react";
import { callNext, getQueue } from "../api/queue.js";

export default function Admin() {
    return "Unimplemented";
}

/*
export default function Admin() {
    const [current, setCurrent] = useState(null);
    const [queue, setQueue] = useState([]);

    useEffect(() => {
        const fetchQueue = async () => {
            const data = await getQueue();
            if(data.error) {
                console.error("Errore durante il recupero della coda:", data.error);
                return;
            }
            setQueue(data);
        };

        fetchQueue();

        const interval = setInterval(fetchQueue, 5000); // Aggiorna la coda ogni 5 secondi

        return () => clearInterval(interval);
    }, []);


    const handleNext = async () => {
        const next = await callNext();
        setCurrent(next);
    };

    return (
        <div>
            <h1>Area Admin</h1>
            <ol>
                {Array.isArray(queue) && queue.map((user, index) => (
                    <li key={index}>{user.name}</li>
                ))}
            </ol>
            <hr />
            <button onClick={handleNext}>Chiama prossimo</button>
            {current && <div>Chiamato: {current.name}</div>}
        </div>
    );
}
*/