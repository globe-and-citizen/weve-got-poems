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

export const useCTransactionStore = defineStore('cTransaction', {
  actions: {
    async saveTransaction(payload: {
      poem_id: number;
      tx_hash: string;
    }): Promise<{ success: boolean; data?: any; error?: string }> {
      try {
        const response = await fetch(endpoint + '/ctransactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + appStore.getToken,
          },
          body: JSON.stringify(payload),
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
  },
});
