import React, { useEffect, useRef, useState } from "react";

interface GiscusProps {
  mapping?: "pathname" | "url" | "title" | "og:title" | "specific";
  term?: string;

  lang?: string;
}

const GiscusComments: React.FC<GiscusProps> = ({
  mapping = "pathname",
  term,

  lang = "en",
}) => {
  const giscusContainerRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<{
    repoId: string;
    categoryId: string;
  } | null>(null);

  useEffect(() => {
    const fetchRepoData = async () => {
      const [owner, name] = import.meta.env.VITE_GISCUS_REPO.split("/");
      const token = import.meta.env.VITE_GITHUB_TOKEN;

      const query = `
        query {
          repository(owner: "${owner}", name: "${name}") {
            id
            discussionCategories(first: 50) {
              nodes {
                id
                name
              }
            }
          }
        }
      `;

      const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const json = await res.json();
      const repoId = json.data.repository.id;
      const categoryNode = json.data.repository.discussionCategories.nodes.find(
        (c: any) => c.name === "General"
      );

      setConfig({ repoId, categoryId: categoryNode?.id });
    };

    fetchRepoData();
  }, []);

  useEffect(() => {
    if (!config || !giscusContainerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";

    script.setAttribute("data-repo", import.meta.env.VITE_GISCUS_REPO);
    script.setAttribute("data-repo-id", config.repoId);
    script.setAttribute("data-category", "General");
    script.setAttribute("data-category-id", config.categoryId);
    script.setAttribute("data-mapping", mapping);
    if (term) script.setAttribute("data-term", term);
    script.setAttribute("data-theme", "light");
    script.setAttribute("data-lang", lang);
    script.setAttribute("data-origin", "https://rgon299.vercel.app");

    giscusContainerRef.current.innerHTML = "";
    giscusContainerRef.current.appendChild(script);
  }, [config, mapping, term, lang]);

  if (!config) return <p>Loading comments...</p>;

  return <div ref={giscusContainerRef} />;
};

export default GiscusComments;
