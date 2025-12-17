const URL = "http://" + import.meta.env.VITE_BACKEND_URL + ":" + import.meta.env.VITE_BACKEND_PORT;
const tenantId = import.meta.env.VITE_TENANT_ID;

export async function joinQueue(name) {
    const res = await fetch(`${URL}/queue/${tenantId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    });
    return res.json();
}

export async function getQueue() {
    const res = await fetch(`${URL}/admin/${tenantId}/queue`);
    return res.json();
}

export async function getPosition(id) {
    const res = await fetch(`${URL}/queue/${tenantId}/${id}/position`);
    return res.json();
}

export async function callNext() {
    const res = await fetch(`${URL}/admin/${tenantId}/next`, { method: "POST" });
    return res.json();
}

export async function leaveQueue(id) {
    const res = await fetch(`${URL}/queue/${tenantId}/${id}/leave`, { method: "DELETE" });
    return res.json();
}

export async function signalFinished(id) {
    const res = await fetch(`${URL}/queue/${tenantId}/${id}/finished`, { method: "POST" });
    return res.json();
}