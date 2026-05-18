// ═══════════════════════════════════════════════════════════
// ZenaRank Claude API Proxy — Cloudflare Worker
// Deploy at: workers.cloudflare.com
// Set environment variable: ANTHROPIC_API_KEY = your key
// ═══════════════════════════════════════════════════════════

export default {
  async fetch(request, env) {

    // Allow CORS from zenarank.com
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://zenarank.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405, headers: corsHeaders
      });
    }

    try {
      const body = await request.json();

      // Forward to Anthropic
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: body.model || 'claude-sonnet-4-20250514',
          max_tokens: body.max_tokens || 1000,
          system: body.system || '',
          messages: body.messages || []
        })
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: corsHeaders
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500, headers: corsHeaders
      });
    }
  }
};
