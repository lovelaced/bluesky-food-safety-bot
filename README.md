# Bluesky Food Safety Notices Bot

A Bluesky bot that posts food safety notices from the UK Food Standards Agency to your Bluesky feed. This bot checks for new alerts every hour and posts them with a 30-minute delay between each post. It also includes a debug mode that prints the most recent five food alerts to the console without posting them to Bluesky.

## Prerequisites

- Node.js (version >= 14)
- A Bluesky account for the bot

## Installation

1. Clone the repository:

```
git clone https://github.com/your-username/bluesky-food-safety-bot.git
cd bluesky-food-safety-bot
```

2. Install dependencies:

`npm install`

3. Create a `.env` file with the following variables:

```
BLUESKY_BOT_EMAIL=your_bluesky_bot_email@example.com
BLUESKY_BOT_PASSWORD=your_bluesky_bot_password
DEBUG_MODE=false
```

Replace `your_bluesky_bot_email@example.com` and `your_bluesky_bot_password` with the email and password of your Bluesky bot account. Set `DEBUG_MODE` to `true` if you want to enable the debug mode.

## Usage

To run the bot, execute the following command:

`npm start`

This will start the bot, and it will begin checking for new food safety notices every hour and posting them to your Bluesky feed.

## Debug Mode

To enable the debug mode, set the `DEBUG_MODE` environment variable to `true` in your `.env` file. In debug mode, the bot will print the most recent five food alerts to the console instead of posting them to Bluesky.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

