export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { amount, customer_id, customer_email, customer_phone, customer_name, type, template_id } = req.body;

  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const environment = process.env.CASHFREE_ENVIRONMENT || 'SANDBOX'; // SANDBOX or PRODUCTION

  if (!appId || !secretKey) {
    return res.status(500).json({ error: 'Cashfree API keys not configured in Vercel environment variables.' });
  }

  const baseUrl = environment === 'PRODUCTION' 
    ? 'https://api.cashfree.com/pg' 
    : 'https://sandbox.cashfree.com/pg';

  try {
    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    const cashfreePayload = {
      order_amount: amount || 1,
      order_currency: 'INR',
      order_id: orderId,
      customer_details: {
        customer_id: customer_id || 'CUST_UNKNOWN',
        customer_email: customer_email || 'test@example.com',
        customer_phone: customer_phone || '9999999999',
        customer_name: customer_name || 'User'
      },
      order_meta: {
        return_url: `${req.headers.origin || 'http://localhost:3000'}/user.html?order_id={order_id}`
      },
      order_tags: {
        type: type || 'template',
        template_id: template_id || ''
      }
    };

    const response = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01'
      },
      body: JSON.stringify(cashfreePayload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree API Error:', data);
      return res.status(response.status).json({ error: data.message || 'Error creating Cashfree order', details: data });
    }

    res.status(200).json({ 
      payment_session_id: data.payment_session_id, 
      order_id: data.order_id 
    });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
