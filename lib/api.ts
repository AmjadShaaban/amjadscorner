export const createThread = async (data: {
  title: string;
  content: string;
  subcategoryId: number;
}) => {
  const response = await fetch("/api/forums/threads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create thread");
  }

  return response.json();
};
