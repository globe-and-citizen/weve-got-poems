// src/stores/poemStore.ts
import { defineStore } from 'pinia';
import { useAppStore } from './app';

const endpoint = import.meta.env.VITE_BACKEND_ENDPOINT;
const appStore = useAppStore();
interface Poem {
  id: number;
  title: string;
  content: string;
  created_at: string;
  dislikes: Array<number>;
  likes: Array<number>;
  is_paid: boolean;
  author: {
    id: number;
    name: string;
    eth_address?: string;
  };
}

export const usePoemStore = defineStore('poem', {
  actions: {
    async submitPoem(
      title: string,
      content: string,
    ): Promise<{ success: boolean; poem?: any; error?: string }> {
      try {
        const response = await fetch(`${endpoint}/poems`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${appStore.getToken}`,
          },
          body: JSON.stringify({ title, content }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Optionally navigate after success
        return { success: true, poem: data };
      } catch (error) {
        console.error('Error creating new poem:', error);
        return { success: false };
      }
    },

    async updatetePoem(
      id: number,
      title: string,
      content: string,
    ): Promise<{ success: boolean; data?: any; error?: string }> {
      try {
        const response = await fetch(endpoint + `/poems/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + appStore.getToken,
          },
          body: JSON.stringify({
            title: title,
            content: content,
          }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Optionally navigate after success
        return { success: true, data: data };
      } catch (error) {
        console.error('Error creating new poem:', error);
        return { success: false };
      }
    },

    async loadPoems(): Promise<{
      success: boolean;
      data?: Poem[];
      error?: string;
    }> {
      try {
        const response = await fetch(endpoint + '/poems/', { method: 'GET' });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return { success: true, data: data };
      } catch (error) {
        console.error('Error creating new poem:', error);
        return { success: false };
      }
    },

    async loadPaidPoemsByAuthor(
      is_paid: boolean,
      user_id: number,
    ): Promise<{
      success: boolean;
      data?: Poem[];
      error?: string;
    }> {
      try {
        const response = await fetch(
          endpoint + `/poems/?user_id=${user_id}&is_paid=${is_paid}`,
          { method: 'GET' },
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return { success: true, data: data };
      } catch (error) {
        console.error('Error fetching  transactions :', error);
        return { success: false };
      }
    },

    async onDisLike(id: number): Promise<{
      success: boolean;
      data?: any;
      error?: string;
    }> {
      try {
        const response = await fetch(endpoint + '/poems/' + id + '/dislike', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + appStore.getToken,
          },
          body: JSON.stringify({
            poem_id: id,
          }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return { success: true, data: data };
      } catch (error) {
        console.error('Error creating new poem:', error);
        return { success: false };
      }
    },

    async onLike(id: number): Promise<{
      success: boolean;
      data?: any;
      error?: string;
    }> {
      try {
        const response = await fetch(endpoint + '/poems/' + id + '/like', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + appStore.getToken,
          },
          body: JSON.stringify({
            poem_id: id,
          }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return { success: true, data: data };
      } catch (error) {
        console.error('Error creating new poem:', error);
        return { success: false };
      }
    },
  },
});
