// app/api/users/[user]/route.js
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

// Random default values for age and height
const defaultUserData = {
  aaaaa11: { age: 28, height: 170 },
  bbbbb22: { age: 34, height: 165 },
  ccccc33: { age: 25, height: 180 },
  ddddd33: { age: 30, height: 175 },
  tirumala1234: { age: 42, height: 152 },
  Chinni4823: { age: 29, height: 158 },
  Laddu9372: { age: 23, height: 175 },
  Amruth2645: { age: 26, height: 178 },
  Pandu7189: { age: 33, height: 167 },
  Sweety5031: { age: 34, height: 150 },
  Sindhu8457: { age: 38, height: 152 },
  Ravinder1294: { age: 49, height: 155 },
  Swaroopa1234: { age: 53, height: 150 },
  Thirumala3768: { age: 42, height: 152 },
};

export async function POST(request, { params }) {
  const { user } = params;
  const body = await request.json();

  const validUsers = Object.keys(defaultUserData);
  if (!validUsers.includes(user)) {
    return Response.json({ error: 'Invalid user' }, { status: 400 });
  }

  try {
    const { blobs } = await list({ prefix: `users/${user}.json` });
    let existingData = { history: [] };
    
    if (blobs.length > 0) {
      existingData = await fetch(blobs[0].url, { cache: 'no-store' }).then(r => r.json());
      existingData.history = Array.isArray(existingData.history) 
        ? existingData.history.filter(entry => !isSameEntryDate(entry.date, body.date))
        : [];
    }

    const updatedData = {
      age: defaultUserData[user].age,
      height: defaultUserData[user].height,
      history: [...existingData.history, body],
    };

    await put(`users/${user}.json`, JSON.stringify(updatedData), {
      contentType: 'application/json',
      access: 'public',
      addRandomSuffix: false,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Blob error:', error);
    return Response.json({ error: 'Server error: ' + error.message }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  const { user } = params;

  const validUsers = Object.keys(defaultUserData);
  if (!validUsers.includes(user)) {
    return Response.json({ age: 0, height: 0, history: [] });
  }

  try {
    const { blobs } = await list({ prefix: `users/${user}.json` });
    if (blobs.length === 0) {
      return Response.json({ 
        age: defaultUserData[user].age, 
        height: defaultUserData[user].height, 
        history: [] 
      });
    }
    
    const data = await fetch(blobs[0].url, { cache: 'no-store' }).then(r => r.json());
    return Response.json({
      age: data.age || defaultUserData[user].age,
      height: data.height || defaultUserData[user].height,
      history: Array.isArray(data.history) ? data.history : [],
    });
  } catch (error) {
    console.error('Blob fetch error:', error);
    return Response.json({ 
      age: defaultUserData[user].age, 
      height: defaultUserData[user].height, 
      history: [] 
    });
  }
}