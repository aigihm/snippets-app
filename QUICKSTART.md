# 🚀 Quick Start - Get Your App Live in 5 Minutes!

No setup needed - your app works in demo mode out of the box!

## Deploy Now (Free)

### Step 1: Create GitHub Account (if you don't have one)
Go to [github.com](https://github.com) and sign up.

### Step 2: Create New Repository

1. Go to [github.com/new](https://github.com/new)
2. Name: `snippets-app`
3. Make it **Public**
4. Don't add README, gitignore, or license
5. Click "Create repository"

### Step 3: Push Your Code

Open terminal in your project folder and run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/snippets-app.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### Step 4: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" (use your GitHub account - it's instant)
3. Click "Add New..." → "Project"
4. Find and import your `snippets-app` repository
5. Click "Deploy" (don't change any settings)
6. Wait ~1 minute ⏱️

### Step 5: Share!

You'll get a URL like: `https://snippets-app.vercel.app`

**That's it!** 🎉

- The app works immediately in demo mode
- Anyone can visit and start listening
- No sign-up required for visitors
- All features work (play, skip, like, save)
- Lock screen controls enabled

## Share With Friends

Copy your URL and send it via:
- Text message
- Email
- Twitter/X
- Instagram bio
- Discord
- Slack
- Anywhere!

They click → instant audio playing! 🎧

## What They'll See

1. Opens your URL
2. Sees beautiful Spotify-style player
3. Audio starts auto-playing
4. 6 sample podcast snippets available
5. All controls work (rewind, skip, like, save)
6. "Share with Friends" button to spread the word

## Make It Your Own

Want to customize?

1. Edit `src/data/sampleSnippets.ts` to change the audio/content
2. Commit and push:
   ```bash
   git add .
   git commit -m "Updated content"
   git push
   ```
3. Vercel auto-deploys the changes in 30 seconds!

## Add More Features Later

When you're ready, follow SETUP.md to:
- Enable user sign-ups
- Add personalized recommendations
- Connect real podcast feeds
- Track user interactions
- Build playlists

But for now, demo mode is perfect for sharing with friends!

## Troubleshooting

**"Git command not found"**
Install Git: [git-scm.com/downloads](https://git-scm.com/downloads)

**"Can't push to GitHub"**
Make sure you:
1. Created the repository on GitHub first
2. Used the correct repository URL
3. Have Git installed

**"Vercel build failed"**
The app should build successfully. If it fails:
```bash
npm run build
```
Fix any errors shown, then push again.

**"Audio won't play"**
Try a different browser or disable ad blockers.

## Need Help?

Open an issue on GitHub or check DEPLOY.md for more details!

---

## Next Steps

- ✅ App is live and working
- ✅ Share with friends
- ✅ Get feedback
- 📝 Customize the content
- 🚀 Add more features (optional)

Happy sharing! 🎉
