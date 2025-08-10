import { blogStorage } from "../storage/blogStorage";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Webhook-Secret",
};

export async function handleApiRequest(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: CORS_HEADERS,
    });
  }

  const url = new URL(request.url);

  // WebSub subscription endpoint
  if (url.pathname === "/api/subscribe" && request.method === "POST") {
    try {
      const { webhookUrl, secret } = await request.json();
      const sourceUrl = request.headers.get("origin") || "";

      const success = await blogStorage.handleSubscribe(
        sourceUrl,
        webhookUrl,
        secret
      );
      return new Response(JSON.stringify({ success }), {
        status: success ? 200 : 400,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false }), {
        status: 400,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      });
    }
  }

  // WebSub webhook endpoint
  if (url.pathname === "/api/webhook" && request.method === "POST") {
    try {
      const sourceUrl = request.headers.get("origin") || "";
      const secret = request.headers.get("x-webhook-secret") || "";
      const payload = await request.json();

      const success = await blogStorage.handleWebhook(
        sourceUrl,
        payload,
        secret
      );
      return new Response(JSON.stringify({ success }), {
        status: success ? 200 : 401,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Published posts API
  if (url.pathname === "/api/posts") {
    try {
      const posts = await blogStorage.getPublishedPosts();
      return new Response(JSON.stringify(posts), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to fetch posts" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response("Not found", { status: 404 });
}
