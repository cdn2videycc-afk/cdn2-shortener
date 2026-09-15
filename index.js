export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.replace('/', '');

    if (!path) return new Response('CDN2 Shortener Active!');

    const links = {
      "fb": "https://facebook.com",
      "yt": "https://youtube.com",
      "v1": "https://google.com"
    };

    if (links[path]) return Response.redirect(links[path], 302);
    return new Response('Link Not Found', { status: 404 });
  }
};
