export const askAstroPulse = async (message: string) => {
  const res = await fetch("http://127.0.0.1:8000/agent?brief=false&trace=true", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) throw new Error(`Backend error: ${res.statusText}`);
  return await res.json();
};
