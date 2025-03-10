import { put, list } from '@vercel/blob';

function isSameEntryDate(savedDate, incomingDate) {
  const [savedDay, savedMonth, savedYear] = savedDate.split('-');
  const [incomingDay, incomingMonth, incomingYear] = incomingDate.split('-');
  return (
    savedDay === incomingDay &&
    savedMonth === incomingMonth &&
    savedYear === incomingYear
  );
}

export async function POST(request, { params }) {
  const { user } = params;
  const body = await request.json();

  if (!['aaaaa11', 'bbbbb22', 'ccccc33', 'ddddd33', 'tirumala1234',  "Chinni4823",
    "Laddu9372",
    "Amruth2645",
    "Pandu7189",
    "Sweety5031",
    "Sindhu8457",
    "Ravinder1294",
    "Thirumala3768" ].includes(user)) {
    return Response.json({ error: 'Invalid user' }, { status: 400 });
  }

  try {
    const { blobs } = await list({ prefix: `users/${user}.json` });
    let history = [];
    
    if (blobs.length > 0) {
      const currentData = await fetch(blobs[0].url).then(r => r.json());
      history = Array.isArray(currentData.history) 
        ? currentData.history.filter(entry => 
            !isSameEntryDate(entry.date, body.date)
          )
        : [];
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
  } catch (error) {
    console.error('Blob error:', error);
    return Response.json({ 
      error: 'Server error: ' + error.message 
    }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  const { user } = params;

  if (!['aaaaa11', 'bbbbb22', 'ccccc33', 'ddddd33', 'tirumala1234',  "Chinni4823",
    "Laddu9372",
    "Amruth2645",
    "Pandu7189",
    "Sweety5031",
    "Sindhu8457",
    "Ravinder1294",
    "Thirumala3768" ].includes(user)) {
    return Response.json({ history: [] });
  }

  try {
    const { blobs } = await list({ prefix: `users/${user}.json` });
    if (blobs.length === 0) return Response.json({ history: [] });
    
    const data = await fetch(blobs[0].url).then(r => r.json());
    return Response.json({
      history: Array.isArray(data.history) ? data.history : []
    });
  } catch (error) {
    console.error('Blob fetch error:', error);
    return Response.json({ history: [] });
  }
}