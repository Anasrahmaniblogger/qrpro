export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { order_id, type, template_id } = req.body;

  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const environment = process.env.CASHFREE_ENVIRONMENT || 'SANDBOX';

  if (!appId || !secretKey) {
    return res.status(500).json({ error: 'Cashfree API keys not configured in Vercel environment variables.' });
  }

  const baseUrl = environment === 'PRODUCTION' 
    ? 'https://api.cashfree.com/pg' 
    : 'https://sandbox.cashfree.com/pg';

  try {
    const response = await fetch(`${baseUrl}/orders/${order_id}`, {
      method: 'GET',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree Verify Error:', data);
      return res.status(response.status).json({ error: 'Error verifying Cashfree order', details: data });
    }

    if (data.order_status === 'PAID') {
      // In a real production app, you would also securely update the database (Supabase) here 
      // instead of relying entirely on the frontend to update its state.
      // For now, we return success so frontend unlocks features.
      res.status(200).json({ status: 'SUCCESS', details: data });
    } else {
      res.status(200).json({ status: 'PENDING_OR_FAILED', order_status: data.order_status });
    }
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
