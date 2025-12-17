import { useState, useEffect } from "react";
import {joinQueue, getPosition, leaveQueue, signalFinished} from "../api/queue.js";
import { useStore } from "../stores/useStore.js";

export default function User() {
    const WS_URL = "ws://" + import.meta.env.VITE_BACKEND_URL + ":" + import.meta.env.VITE_BACKEND_PORT;
    const tenantId = import.meta.env.VITE_TENANT_ID;

    const store = useStore();
    const [position, setPosition] = useState(null);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState(store.name || "");
    const [id, setId] = useState(store.id || null);

    const [calledAt, setCalledAt] = useState(null);
    const [calledSeconds, setCalledSeconds] = useState(0);

    useEffect(() => {
        store.setName(name);
    }, [name]);
    useEffect(() => {
        store.setId(id);
    }, [id]);



    const handleJoin = async () => {
        const data = await joinQueue(name);
        if(data.error) {
            console.error("Errore durante l'ingresso in coda:", data.error);
        }

        setId(data.id);
        localStorage.setItem("userId", data.id);
        setPosition(data.position);
    };

    const handleLeave = () => {
        const data = leaveQueue(id);
        if(data.error) {
            console.error("Errore durante l'uscita dalla coda:", data.error);
        }

        handleResetState();
    }

    const handleFinished = () => {
        const data = signalFinished(id);
        if(data.error) {
            console.error("Errore durante la conclusione del turno:", data.error);
        }
        handleResetState();
    }

    const handleCalled = () => {
        setCalledAt(Date.now())
        setPosition(0);
    }

    const handleResetState = () => {
        setPosition(null);
        setCalledAt(null);
        setCalledSeconds(null);
    }

    const handleResetIdentity = () => {
        handleLeave()

        setId(null);
        setName("");
        store.resetIdentity();
    }

    // polling posizione (con gestione errori)
    const pollPosition = async () => {
        try {
            const data = await getPosition(id);
            console.log(data);
            if (data && typeof data.position !== "undefined") {
                if(data.position === -1) setPosition(null)
                else setPosition(data.position);
            }
            setLoading(false);
        } catch (e) {
            console.error("Errore getPosition (poll):", e);
            setLoading(false);
        }
    };

    // Sostituisci il useEffect esistente che apre il WebSocket con questo snippet
    useEffect(() => {
        if (!id || (position != null && position === 0)) return;
        if (!WS_URL) {
            console.warn("WebSocket URL mancante (VITE_BACKEND_URL/VITE_BACKEND_PORT).");
            return;
        }

        let ws;
        try {
            ws = new WebSocket(`${WS_URL}/ws/queue`);
        } catch (err) {
            console.error("Errore durante la creazione del WebSocket:", err);
            return;
        }

        ws.onopen = () => {
            console.log("WebSocket aperto:", ws.url);
        };

        ws.onmessage = (ev) => {
            try {
                const msg = JSON.parse(ev.data);

                // Controllo se il messaggio è rilevante per questo tenant
                if (msg.tenant === tenantId) {
                    if(msg.type === "called") {
                        if (msg.id === id) {
                            // Sono stato chiamato
                            handleCalled();
                        } else {
                            // Qualcun altro è stato chiamato, quindi facciamo polling per aggiornare la nostra posizione
                            pollPosition()
                        }
                    } else if(msg.type === "left") {
                        // Significa che necessariamente siamo avanzati nella coda, quindi rifacciamo polling
                        pollPosition();
                    }
                }
            } catch (e) {
                console.error("Errore parsing message WS:", e);
            }
        };

        ws.onerror = (ev) => {
            console.error("WebSocket error:", ev);
        };

        ws.onclose = (ev) => {
            console.warn("WebSocket chiuso:", ev.code, ev.reason);
        };



        const interval = setInterval(pollPosition, 30000);
        // esegui subito
        pollPosition();

        return () => {
            clearInterval(interval);
            try {
                if (ws && ws.readyState === WebSocket.OPEN) ws.close();
                else if (ws && ws.readyState === WebSocket.CONNECTING) ws.close();
            } catch (e) {
                console.warn("Errore chiusura WS:", e);
            }
        };
        // rimosso `position` per evitare ricreazioni continue
    }, [id, tenantId, WS_URL]);


    useEffect(() => {
        if (calledAt == null) return;

        const update = () => {
            setCalledSeconds(Math.floor((Date.now() - calledAt) / 1000));
        };
        update();
        const timer = setInterval(update, 1000);

        return () => clearInterval(timer);
    }, [calledAt]);

    return (
        <>
            <div className="page">
                <div className="card">
                    {id ? (
                        <>
                            <p className="welcome">Benvenutə, {name}!</p>

                            { position !== null ? (
                                position === 0 ? (
                                    <>
                                        <div className="position-box" style={{ background: '#ff9800' }}>
                                            {Math.floor(calledSeconds/60) + ":" + (calledSeconds % 60).toString().padStart(2, '0')}
                                        </div>
                                        <button className="btn leave" onClick={handleFinished}>
                                            Concludi il turno
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="position-box">{loading ? <div className="loading"></div> : position}</div>
                                        { position === 1 ? <p>Sei lə prossimə</p> : null }
                                        <button className="btn leave" onClick={handleLeave}>
                                            Esci dalla coda
                                        </button>
                                    </>
                                )
                            ) : (
                                <>
                                    <p>Sei fuori dalla coda.</p>
                                    <button className="btn join" onClick={handleJoin}>
                                        Rientra in coda come {name}
                                    </button>
                                    <button className="btn leave" onClick={handleResetIdentity} style={{ marginTop: '10px' }}>
                                        Cambia nome
                                    </button>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <p className="welcome">Unisciti alla coda!</p>
                            <input
                                className="input"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Nome"
                            />

                            <button className="btn join" onClick={handleJoin} disabled={!name.trim()}>
                                {name.trim() ? `Entra in coda come ${name}` : "Inserisci un nome"}
                            </button>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                .page {
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #ececec, #fafafa);
                    font-family: "Inter", "Arial", sans-serif;
                    padding: 20px;
                }
            
                .card {
                    background: white;
                    padding: 30px 35px;
                    border-radius: 14px;
                    box-shadow: 0 6px 18px rgba(0,0,0,0.08);
                    text-align: center;
                    width: 100%;
                    max-width: 360px;
                }
            
                .welcome {
                    font-size: 1.3rem;
                    font-weight: 600;
                    margin-bottom: 20px;
                }
            
                .position-box {
                    width: 140px;
                    height: 140px;
                    background: #4caf50;
                    color: white;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 4rem;
                    font-weight: 700;
                    margin: 0 auto 25px auto;
                    box-shadow: 0 6px 14px rgba(0,0,0,0.15);
                    transition: transform 0.15s ease;
                }
                .position-box:hover {
                    transform: scale(1.05);
                }
            
                .input {
                    padding: 10px 14px;
                    border-radius: 10px;
                    border: 1px solid #ccc;
                    margin-bottom: 15px;
                    font-size: 1rem;
                }
            
                .btn {
                    width: 100%;
                    padding: 12px 0;
                    border: none;
                    border-radius: 10px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: 0.2s ease;
                }
                .btn.join {
                    background-color: #4caf50;
                    color: white;
                }
                .btn.leave {
                    background-color: #e53935;
                    color: white;
                }
                .btn:hover {
                    opacity: 0.9;
                }
                .btn:disabled {
                    background-color: #aaa;
                    cursor: not-allowed;
                }
            
                /* --- LOADING DOTS --- */
                .loading {
                    display: inline-block;
                    margin-top: 20px;
                    font-size: 1.2rem;
                    color: #666;
                    height: 20px;
                }
                .loading:after {
                    content: '...';
                    animation: dots 1.2s steps(4, end) infinite;
                }
                @keyframes dots {
                    0% { content: ''; }
                    25% { content: '.'; }
                    50% { content: '..'; }
                    75% { content: '...'; }
                    100% { content: ''; }
                }
            `}</style>

        </>
    )
}

