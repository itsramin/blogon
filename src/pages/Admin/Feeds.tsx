import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Input, Spin, Alert } from 'antd';
import { BlogPost } from '../../types';
import { importFromXML } from '../../storage/xmlParser';


const Feeds: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialUrl = queryParams.get('url') || '';
  
  const [rssUrl, setRssUrl] = useState(initialUrl);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRSS = async () => {
    if (!rssUrl) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(rssUrl);
      if (!response.ok) throw new Error('Failed to fetch RSS');
      
      const xmlString = await response.text();
      const { posts } = await importFromXML(xmlString);
      setPosts(posts);
    } catch (err) {
      console.error('RSS fetch error:', err);
      setError('Invalid RSS URL or format. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialUrl) fetchRSS();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6 flex gap-2">
        <Input
          value={rssUrl}
          onChange={(e) => setRssUrl(e.target.value)}
          placeholder="Enter RSS URL (e.g., https://other-blog.com/rss.xml)"
          size="large"
        />
        <Button 
          type="primary" 
          onClick={fetchRSS}
          size="large"
          loading={loading}
        >
          Load Posts
        </Button>
      </div>

      {error && (
        <Alert message={error} type="error" showIcon className="mb-4" />
      )}

      {loading ? (
        <div className="text-center py-10">
          <Spin size="large" />
          <p className="mt-4">Loading posts from RSS feed...</p>
        </div>
      ) : posts.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Posts from RSS Feed</h2>
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="border-b pb-4">
                <h3 className="text-xl font-semibold">{post.title}</h3>
                <p className="text-gray-600">
                  by {post.author.firstName} {post.author.lastName} •{' '}
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
                <p className="mt-2 line-clamp-2">{post.content}</p>
                <div className="mt-2">
                  {post.categories.map(cat => (
                    <span key={cat} className="bg-gray-100 px-2 py-1 mr-2 text-sm rounded">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : rssUrl && (
        <p className="text-center py-6 text-gray-500">
          No posts found. Enter a valid RSS URL and click "Load Posts".
        </p>
      )}
    </div>
  );
};

export default Feeds;