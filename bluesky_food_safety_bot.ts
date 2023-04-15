// bluesky_food_safety_bot.ts
import * as dotenv from 'dotenv';
import { BskyAgent, RichText } from '@atproto/api';
import axios from 'axios';
import fs from 'fs';

dotenv.config();

const FOOD_ALERTS_API_BASE_URL = 'https://data.food.gov.uk/food-alerts';
const DEBUG_MODE = process.env.DEBUG_MODE === 'true';
const LAST_CHECKPOINT_FILE = 'last_checkpoint.txt';

// FoodAlertsAPI class to interact with the UK Food Standards Agency API
class FoodAlertsAPI {
  private client = axios.create({
    baseURL: FOOD_ALERTS_API_BASE_URL,
    headers: { 'User-Agent': 'FoodAlertsBot/0.1' },
  });

  // Fetches food alerts since the specified date, limited by the limit parameter
  async listSince(date: Date, limit = 10): Promise<any[]> {
    if (DEBUG_MODE) {
      console.log('[DEBUG] Fetching food alerts from the API');
    }
    const dateISO = date.toISOString();
    const response = await this.client.get(`/id?since=${dateISO}&_limit=${limit}`);
    if (DEBUG_MODE) {
      console.log('[DEBUG] Food alerts API response:', response.data);
    }
    return response.data.items;
  }
}

const postFoodAlertsToBluesky = async () => {
  if (DEBUG_MODE) {
    console.log('[DEBUG] Starting the Bluesky Food Safety bot in debug mode');
  }
  const agent = new BskyAgent({ service: 'https://bsky.social/' });
  const loginResult = await agent.login({
    identifier: process.env.BLUESKY_BOT_EMAIL ?? '',
    password: process.env.BLUESKY_BOT_PASSWORD ?? '',
  });

  if (DEBUG_MODE) {
    console.log('[DEBUG] Bluesky agent logged in:', loginResult);
  }

  const foodAlertsAPI = new FoodAlertsAPI();

  const getLastCheckpoint = (): Date => {
    if (fs.existsSync(LAST_CHECKPOINT_FILE)) {
      const timestamp = fs.readFileSync(LAST_CHECKPOINT_FILE, 'utf8').trim();
      return new Date(timestamp);
    } else {
      return DEBUG_MODE ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : new Date();
    }
  };

  const setLastCheckpoint = (date: Date) => {
    fs.writeFileSync(LAST_CHECKPOINT_FILE, date.toISOString());
  };

  let lastPoll = getLastCheckpoint();

const checkForNewAlerts = async () => {
  if (DEBUG_MODE) {
    console.log('[DEBUG] Debug mode enabled');
  }
  console.log(`[+] Fetching new items since ${lastPoll}`);
  const items = await foodAlertsAPI.listSince(lastPoll, DEBUG_MODE ? 5 : 10);

  console.log(`[+] Fetched ${items.length} new items`);
  const reversedItems = items.reverse();

  for (const item of reversedItems) {
    const title = item.title;
    const url = item.alertURL;
    const postText = `${title}\n${url}`;

    // Check if item.modified is a valid date
    const itemCreated = new Date(item.modified);
    if (isNaN(itemCreated.getTime())) {
      console.error(`[-] Invalid date value for item.created: ${item.modified}`);
      continue;
    }

    // Update lastPoll and checkpoint before posting the current alert
    lastPoll = itemCreated;
    setLastCheckpoint(lastPoll);

    if (DEBUG_MODE) {
      console.log('[DEBUG] Debug mode enabled, not posting to Bluesky');
      console.log('[DEBUG] Food alert item:', item);
      console.log(postText);
    } else {
      console.log('[+] Posting to Bluesky');
      console.log(postText);

      const rt = new RichText({ text: postText });
      const postRecord = {
        $type: 'app.bsky.feed.post',
        text: rt.text,
        facets: rt.facets,
        createdAt: new Date().toISOString(),
      };

      if (DEBUG_MODE) {
        console.log('[DEBUG] Bluesky post record:', postRecord);
      }

      await agent.post(postRecord);

      if (DEBUG_MODE) {
        console.log('[DEBUG] Bluesky post submitted');
      }
    }

    // Sleep for 30 minutes to space out posts
    console.log('[+] Waiting 30 minutes before posting the next alert');
    await new Promise((resolve) => setTimeout(resolve, 1000 * 60 * 30));
  }
};

// Call checkForNewAlerts immediately and then every hour
checkForNewAlerts();
setInterval(checkForNewAlerts, 1000 * 60 * 60);
};

postFoodAlertsToBluesky();
