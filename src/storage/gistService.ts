import { GITHUB_TOKEN, GIST_ID } from "./config";

export const saveToGist = async (xmlContent: string): Promise<void> => {
  if (!GITHUB_TOKEN) {
    throw new Error("GitHub token not configured");
  }

  const gistData = {
    description: "Blog Posts Backup",
    public: false,
    files: {
      "posts.xml": { content: xmlContent },
    },
  };

  const url = GIST_ID
    ? `https://api.github.com/gists/${GIST_ID}`
    : "https://api.github.com/gists";

  const response = await fetch(url, {
    method: GIST_ID ? "PATCH" : "POST",
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github.v3+json",
    },
    body: JSON.stringify(gistData),
  });

  if (!response.ok) {
    throw new Error(`Gist save failed: ${response.statusText}`);
  }
};

export const loadFromGist = async (): Promise<string> => {
  if (!GITHUB_TOKEN || !GIST_ID) {
    throw new Error("GitHub token or Gist ID not configured");
  }

  const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    headers: { Authorization: `token ${GITHUB_TOKEN}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to load Gist: ${response.statusText}`);
  }

  const data = await response.json();
  return data.files["posts.xml"].content;
};
