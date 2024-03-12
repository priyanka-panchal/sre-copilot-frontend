import { response_url} from "../environment/env";

export const sendMessage = async (message, userId) => {
  try {
    const response = await fetch(response_url+'/api/conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_text: message, user_id: userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch');
    }

    const data = await response.json();
    console.log(data);
    return data.openai_response;
   
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
};