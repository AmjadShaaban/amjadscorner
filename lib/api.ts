export async function createPost(data: { title: string; content: string; subcategoryId: number }) {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      throw new Error('Failed to create post');
    }
  
    return response.json();
  }