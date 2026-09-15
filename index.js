export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Agar form submit ho (Link short karne ke liye)
    if (request.method === "POST") {
      const formData = await request.formData();
      const longUrl = formData.get("url");
      const customPath = formData.get("path") || Math.random().toString(36).substring(2, 8);
      
      if (longUrl) {
        await env.LINKS.put(customPath, longUrl);
        return new Response(`
          <body style="font-family:sans-serif; text-align:center; padding-top:50px; background:#f4f4f9;">
            <h2>Aapka Short Link Tayar Hai!</h2>
            <p><a href="${url.origin}/${customPath}" target="_blank" style="font-size:20px; color:#0070f3;">${url.origin}/${customPath}</a></p>
            <br><a href="/" style="color:#666;">Ek aur link short karein</a>
          </body>
        `, { headers: { "Content-Type": "text/html" } });
      }
    }

    // Short link redirect karne ke liye
    const path = url.pathname.replace('/', '');
    if (path) {
      const targetUrl = await env.LINKS.get(path);
      if (targetUrl) return Response.redirect(targetUrl, 302);
      return new Response('Link Not Found', { status: 404 });
    }

    // Main Website Dashboard (Input Box)
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>URL Shortener</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f9; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
          .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); width: 90%; max-width: 400px; text-align: center; }
          input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; }
          button { width: 100%; padding: 12px; background: #0070f3; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>URL Shortener</h2>
          <form method="POST">
            <input type="url" name="url" placeholder="Apna Lamba Link Yahan Paste Karein" required>
            <input type="text" name="path" placeholder="Custom Name (Option, e.g. cdn)">
            <button type="submit">Short Link Banayein</button>
          </form>
        </div>
      </body>
      </html>
    `, { headers: { "Content-Type": "text/html" } });
  }
};
