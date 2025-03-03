import { put, list } from '@vercel/blob';

export async function POST(request, { params }) {
  const { user } = params;
  const body = await request.json();

  const { blobs } = await list({ prefix: `users/${user}.json` });
  let history = [];
  
  if (blobs.length > 0) {
    const currentData = await fetch(blobs[0].url).then(r => r.json());
    history = currentData.history.filter(entry => 
      !isSameDay(new Date(entry.date), new Date(body.date))
    );
  }

  const updatedData = {
    history: [...history, body]
  };

  await put(`users/${user}.json`, JSON.stringify(updatedData), {
    contentType: 'application/json',
    access: 'public',
    addRandomSuffix: false
  });

  return Response.json({ success: true });
}

export async function GET(request, { params }) {
    if (!user || !['a1', 'a2', 'a3', 'a4'].includes(user)) {
        return Response.json({ error: 'Invalid user' }, { status: 400 });
      }
  const { user } = params;
  const { blobs } = await list({ prefix: `users/${user}.json` });

  if (blobs.length === 0) return Response.json({ history: [] });
  
  const data = await fetch(blobs[0].url).then(r => r.json());
  return Response.json(data);
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}