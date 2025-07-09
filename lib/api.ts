export async function login(email: string, password: string) {
    const res = await fetch('http://10.236.159.54:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return await res.json();
  }
  
export async function register(name: string, email: string, password: string, avatar?: string) {
    const body: any = { name, email, password };
    if (avatar) body.avatar = avatar;
    const res = await fetch('http://10.236.159.54:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return await res.json();
}

export async function getProfile(id: string) {
    const res = await fetch(`http://10.236.159.54:3000/(tabs)/profile/${id}`);
    return await res.json();
}