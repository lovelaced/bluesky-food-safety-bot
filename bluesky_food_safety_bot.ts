// bluesky_food_safety_bot.ts
import * as dotenv from 'dotenv';
import { FoodAlertsAPI } from './foodAlertsAPI';
import { createBlueskyAgent, postToBluesky } from './blueskyAgent';
import { getLastCheckpoint, setLastCheckpoint } from './checkpoint';

dotenv.config();

const DEBUG_MODE = process.env.DEBUG_MODE === 'true';
const LAST_CHECKPOINT_FILE = 'last_checkpoint.txt';

const postFoodAlertsToBluesky = async () => {
  const agent = await createBlueskyAgent(DEBUG_MODE);
  const foodAlertsAPI = new FoodAlertsAPI(DEBUG_MODE);
  let lastPoll = getLastCheckpoint(LAST_CHECKPOINT_FILE, DEBUG_MODE);

  const checkForNewAlerts = async () => {
    const items = await foodAlertsAPI.listSince(lastPoll, DEBUG_MODE ? 5 : 10);
    const reversedItems = items.reverse();

    for (const item of reversedItems) {
      const postText = `${item.title}\n${item.alertURL}`;
      const itemCreated = new Date(item.modified);
      
      if (isNaN(itemCreated.getTime())) {
        console.error(`[-] Invalid date value for item.created: ${item.modified}`);
        continue;
      }

      lastPoll = itemCreated;
      setLastCheckpoint(LAST_CHECKPOINT_FILE, lastPoll);

      if (DEBUG_MODE) {
        console.log('[DEBUG] Food alert item:', item);
        console.log(postText);
      } else {
        await postToBluesky(agent, postText, DEBUG_MODE);

        // Sleep for 30 minutes to space out posts
        console.log('[+] Waiting 30 minutes before posting the next alert');
        await new Promise((resolve) => setTimeout(resolve, 1000 * 60 * 30));
      }
    }
  };

  checkForNewAlerts();
  setInterval(checkForNewAlerts, 1000 * 60 * 60);
};

postFoodAlertsToBluesky();

