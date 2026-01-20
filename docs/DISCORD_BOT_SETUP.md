# Discord Bot Setup Guide

This guide walks you through creating and configuring a Discord bot from scratch.

## Step 1: Create a Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"** in the top right
3. Enter a name for your application (e.g., "My Bot")
4. Accept the Terms of Service and click **"Create"**

## Step 2: Configure the Bot

### Create the Bot User

1. In your application, go to the **"Bot"** section in the left sidebar
2. Click **"Add Bot"** and confirm
3. Your bot is now created!

### Get Your Bot Token

1. In the **"Bot"** section, find the **"Token"** area
2. Click **"Reset Token"** (you may need to confirm with 2FA)
3. Copy the token immediately - **you won't be able to see it again!**
4. Save this token in your `.env` file as `DISCORD_TOKEN`

> ⚠️ **Never share your bot token publicly!** If leaked, anyone can control your bot. If compromised, immediately reset it in the Developer Portal.

### Enable Privileged Intents

Still in the **"Bot"** section, scroll down to **"Privileged Gateway Intents"** and enable:

- ✅ **Presence Intent** - If your bot needs to track user presence/status
- ✅ **Server Members Intent** - If your bot needs to access the member list
- ✅ **Message Content Intent** - **Required** if your bot reads message content

Click **"Save Changes"** at the bottom.

## Step 3: Get Application Credentials

### Application ID & Public Key

1. Go to the **"General Information"** section
2. Copy the **Application ID** - save as `APPLICATION_ID` in your `.env`
3. Copy the **Public Key** - needed if using interactions/webhooks

### Client Secret (Optional)

1. Go to the **"OAuth2"** section
2. Copy the **Client Secret** - save as `CLIENT_SECRET` in your `.env`
3. This is only needed for OAuth2 flows (user login, etc.)

## Step 4: Invite the Bot to Your Server

### Generate an Invite URL

1. Go to **"OAuth2"** → **"URL Generator"**
2. Under **"Scopes"**, select:
   - ✅ `bot`
   - ✅ `applications.commands` (for slash commands)

3. Under **"Bot Permissions"**, select the permissions your bot needs:
   - Common permissions:
     - ✅ Send Messages
     - ✅ Read Message History
     - ✅ Use Slash Commands
     - ✅ Add Reactions
     - ✅ Embed Links
     - ✅ Attach Files
     - ✅ Manage Messages (if bot needs to delete messages)

4. Copy the generated URL at the bottom
5. Open the URL in your browser and select a server to add the bot

### Quick Invite URL Template

Replace `YOUR_CLIENT_ID` with your Application ID:

```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=274878024704&scope=bot%20applications.commands
```

## Step 5: Configure Your Environment

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Fill in the required values:

```env
# Required
DISCORD_TOKEN="your-bot-token-here"
APPLICATION_ID="your-application-id"

# Optional - for development
DEVELOPMENT_GUILD_ID="your-test-server-id"
```

### Getting Your Server ID (Guild ID)

1. In Discord, go to **User Settings** → **Advanced**
2. Enable **"Developer Mode"**
3. Right-click on your server name → **"Copy Server ID"**

## Step 6: Run the Bot

```bash
# Install dependencies
pnpm install

# Generate Prisma client (if using database)
pnpx prisma generate

# Start the bot in development mode
pnpm build
```

## Troubleshooting

### "401: Unauthorized" Error

- Your bot token is invalid or expired
- Reset the token in the Developer Portal and update your `.env`

### "Missing Access" or "Missing Permissions"

- The bot doesn't have the required permissions in that channel/server
- Re-invite with correct permissions or adjust server roles

### "Disallowed Intents" Error

- You're trying to use a privileged intent that isn't enabled
- Go to the Bot section and enable the required intents

### Commands Not Appearing

- Guild commands appear instantly, global commands take up to 1 hour
- Set `DEVELOPMENT_GUILD_ID` for instant command updates during development

## Security Best Practices

1. **Never commit your `.env` file** - Add it to `.gitignore`
2. **Use environment variables** - Don't hardcode tokens in your code
3. **Rotate tokens regularly** - Reset your bot token periodically
4. **Limit permissions** - Only request permissions your bot actually needs
5. **Monitor for abuse** - Keep an eye on your bot's activity

## Resources

- [Discord Developer Portal](https://discord.com/developers/applications)
- [Discord.js Guide](https://discordjs.guide/)
- [Discord API Documentation](https://discord.com/developers/docs)
