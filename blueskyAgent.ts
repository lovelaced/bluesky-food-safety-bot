// blueskyAgent.ts
import { BskyAgent, RichText } from '@atproto/api';

export const createBlueskyAgent = async (debugMode: boolean) => {
  const agent = new BskyAgent({ service: 'https://bsky.social/' });

  if (debugMode) {
    console.log('[DEBUG] Starting the Bluesky Food Safety bot in debug mode');
  }

  const loginResult = await agent.login({
    identifier: process.env.BLUESKY_BOT_EMAIL ?? '',
    password: process.env.BLUESKY_BOT_PASSWORD ?? '',
  });

  if (debugMode) {
    console.log('[DEBUG] Bluesky agent logged in:', loginResult);
  }

  return agent;
};

export const postToBluesky = async (
  agent: BskyAgent,
  postText: string,
  debugMode: boolean
) => {
  console.log('[+] Posting to Bluesky');
  console.log(postText);

  const rt = new RichText({ text: postText });
  const postRecord = {
    $type: 'app.bsky.feed.post',
    text: rt.text,
    facets: rt.facets,
    createdAt: new Date().toISOString(),
  };

  if (debugMode) {
    console.log('[DEBUG] Bluesky post record:', postRecord);
  }

  await agent.post(postRecord);

  if (debugMode) {
    console.log('[DEBUG] Bluesky post submitted');
  }
};

