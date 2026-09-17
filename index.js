export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const customDomain = "https://cdn2.movielink2.online";

    if (request.method === "POST") {
      try {
        const formData = await request.formData();
        const slug = formData.get("slug") || formData.get("customPath");
        const targetUrl = formData.get("url") || formData.get("longUrl");

        if (!slug || !targetUrl) {
          return new Response("Missing slug or URL", { status: 400 });
        }

        if (!env.LINKS) {
          return new Response("Error: LINKS KV binding missing in Cloudflare!", { status: 500 });
        }

        await env.LINKS.put(slug, targetUrl);
        const shortLink = `${customDomain}/${slug}`;

        return new Response(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Link Created</title>
            <style>
              body { font-family: Arial, sans-serif; background: #f4f4f9; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
              .card { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-align: center; max-width: 400px; width: 100%; }
              input { width: 100%; padding: 10px; margin: 15px 0; border: 1px solid #ccc; border-radius: 5px; font-size: 16px; text-align: center; }
              a { color: #0066cc; text-decoration: none; word-break: break-all; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>Short Link Ready!</h2>
              <input type="text" value="${shortLink}" readonly onclick="this.select()">
              <p><a href="${shortLink}" target="_blank">Open Link</a></p>
              <br>
              <a href="/">Create Another</a>
            </div>
          </body>
          </html>
        `, {
          headers: { "Content-Type": "text/html;charset=UTF-8" }
        });
      } catch (err) {
        return new Response("Error: " + err.message, { status: 500 });
      }
    }

    if (path.length > 1) {
      const slug = path.substring(1);
      const targetUrl = await env.LINKS.get(slug);

      if (targetUrl) {
        return Response.redirect(targetUrl, 302);
      }
      return new Response("Link not found", { status: 404 });
    }

    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>URL Shortener Dashboard</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f9; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
          .card { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
          h2 { text-align: center; margin-bottom: 20px; }
          label { display: block; margin-top: 15px; font-weight: bold; }
          input { width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; }
          button { width: 100%; padding: 12px; margin-top: 20px; background: #0066cc; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; }
          button:hover { background: #004999; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>URL Shortener Dashboard</h2>
          <form method="POST">
            <label>Short Slug (e.g. v1):</label>
            <input type="text" name="slug" required placeholder="v1">
            
            <label>Target Long URL:</label>
            <input type="url" name="url" required placeholder="https://example.com">
            
            <button type="submit">Create Short Link</button>
          </form>
        </div>
      </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html;charset=UTF-8" }
    });
  }
};
