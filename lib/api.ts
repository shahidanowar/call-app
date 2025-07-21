const API_URL = 'https://visionai.site';  // Production server domain

export async function login(email: string, password: string) {
    const res = await fetch(`${API_URL}/login`, {   // <-- CORRECT!
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    console.log('API: Login response', data);
    return data;
  }
  
export async function register(name: string, email: string, password: string, avatar?: string) {
    console.log('API: Sending register request', { name, email, password, avatar });
    const body: any = { name, email, password };
    if (avatar) body.avatar = avatar;
    const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    console.log('API: Register response', data);
    return data;
}

export async function getProfile(id: string) {
    const res = await fetch(`${API_URL}/profile/${id}`);
    return await res.json();
}