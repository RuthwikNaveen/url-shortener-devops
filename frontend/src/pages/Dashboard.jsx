import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { urlService } from '../services/urlService';

export const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [originalUrl, setOriginalUrl] = useState('');

  // Fetch user's URLs on component mount
  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      setLoading(true);
      const response = await urlService.getUserUrls();
      if (response.success) {
        setUrls(response.data);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load URLs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShortUrl = async (e) => {
    e.preventDefault();

    if (!originalUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setCreating(true);

    try {
      const response = await urlService.createShortUrl(originalUrl);
      if (response.success) {
        toast.success('Short URL created!');
        setUrls([response.data, ...urls]);
        setOriginalUrl('');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create short URL');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this URL?')) {
      return;
    }

    try {
      const response = await urlService.deleteUrl(id);
      if (response.success) {
        toast.success('URL deleted!');
        setUrls(urls.filter((url) => url.id !== id));
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete URL');
    }
  };

  const handleCopyShortUrl = (shortUrl) => {
    navigator.clipboard.writeText(shortUrl);
    toast.success('Short URL copied to clipboard!');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Create URL Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Short URL</h2>
          
          <form onSubmit={handleCreateShortUrl} className="flex gap-4">
            <input
              type="url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="Enter your long URL here..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
            <button
              type="submit"
              disabled={creating}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              {creating ? 'Creating...' : 'Shorten'}
            </button>
          </form>
        </div>

        {/* URLs List */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Short URLs</h2>
          
          {urls.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No URLs created yet. Create one above!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Original URL</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Short Code</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Clicks</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {urls.map((url) => (
                    <tr key={url.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600 truncate">
                        {url.originalUrl}
                      </td>
                      <td className="py-3 px-4">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {url.shortCode}
                        </code>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{url.clicks}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(url.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCopyShortUrl(url.shortUrl)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition"
                          >
                            Copy
                          </button>
                          <button
                            onClick={() => handleDelete(url.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
