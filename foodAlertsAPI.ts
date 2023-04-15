// foodAlertsAPI.ts
import axios from 'axios';

const FOOD_ALERTS_API_BASE_URL = 'https://data.food.gov.uk/food-alerts';

export class FoodAlertsAPI {
  private client = axios.create({
    baseURL: FOOD_ALERTS_API_BASE_URL,
    headers: { 'User-Agent': 'FoodAlertsBot/0.1' },
  });

  constructor(private debugMode: boolean) {}

  async listSince(date: Date, limit = 10): Promise<any[]> {
    if (this.debugMode) {
      console.log('[DEBUG] Fetching food alerts from the API');
    }
    const dateISO = date.toISOString();
    const response = await this.client.get(`/id?since=${dateISO}&_limit=${limit}`);
    if (this.debugMode) {
      console.log('[DEBUG] Food alerts API response:', response.data);
    }
    return response.data.items;
  }
}

