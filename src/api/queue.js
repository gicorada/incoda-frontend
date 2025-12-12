const URL = "http://localhost:8080";

export async function joinQueue(name) {
    const res = await fetch(`${URL}/queue/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    });
    return res.json();
}

export async function getQueue() {
    const res = await fetch(`${URL}/admin/queue`);
    return res.json();
}

export async function getPosition(id) {
    const res = await fetch(`${URL}/queue/${id}/position`);
    return res.json();
}

export async function callNext() {
    const res = await fetch(`${URL}/admin/next`, { method: "POST" });
    return res.json();
}

export async function leaveQueue(id) {
    const res = await fetch(`${URL}/queue/${id}/leave`, { method: "DELETE" });
    return res.json();
}

export async function signalFinished(id) {
    const res = await fetch(`${URL}/queue/${id}/finished`, { method: "POST" });
    return res.json();
}