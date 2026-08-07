// api/penpot.js
export default async function handler(req, res) {
    // Vercel থেকে আপনার সেভ করা টোকেনটি এখানে স্বয়ংক্রিয়ভাবে চলে আসবে
    const token = process.env.PENPOT_ACCESS_TOKEN; 

    // Penpot এর কোন ফাইলটি আনতে চান, তার ID (এটি পরে আমরা পরিবর্তন করব)
    const fileId = req.query.fileId || "আপনার_পেনপট_ফাইলের_আইডি"; 

    try {
        const response = await fetch(`https://design.penpot.app/api/rpc/command/get-file`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id: fileId })
        });

        if (!response.ok) {
            throw new Error('Penpot API Error');
        }

        const data = await response.json();
        
        // ডেটা সফলভাবে আপনার ওয়েবসাইটের ফ্রন্টএন্ডে পাঠিয়ে দেওয়া হবে
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from Penpot' });
    }
}
