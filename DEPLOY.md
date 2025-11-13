# Deploy Snippets to Vercel (Free!)

Get your Snippets app live in under 5 minutes - **no credit card required**.

## Quick Deploy (Easiest Way)

### Option 1: Deploy via GitHub (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/snippets-app.git
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Sign Up" (use your GitHub account)
   - Click "Add New..." → "Project"
   - Import your `snippets-app` repository
   - Click "Deploy"
   - That's it! ✨

3. **Your app is live!**
   - Vercel will give you a URL like: `snippets-app.vercel.app`
   - Share this URL with anyone!
   - It works in demo mode by default (no setup needed)

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Set up and deploy? **Y**
   - Which scope? (Your account)
   - Link to existing project? **N**
   - Project name? **snippets-app**
   - Directory? **./`** (press Enter)
   - Want to override settings? **N**

5. **Done!** Your app is live at the URL shown.

## Demo Mode (No Setup Required)

The app automatically runs in **DEMO MODE** when deployed without environment variables:
- ✅ Works instantly - no sign up required
- ✅ Sample audio content included
- ✅ All features work (player, controls, like, save)
- ✅ Lock screen controls enabled
- ✅ Share button to send to friends

Your friends can visit the URL and start listening immediately!

## Custom Domain (Optional)

Want a custom URL like `snippets.yourdomain.com`?

1. Go to your Vercel project dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow Vercel's DNS instructions
5. Done! (usually takes 5-10 minutes)

## Enable Full Features (Optional)

If you want personalized recommendations and user accounts:

1. **Set up Supabase** (see SETUP.md)

2. **Add environment variables in Vercel**:
   - Go to your project in Vercel
   - Click "Settings" → "Environment Variables"
   - Add these variables:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_key
     VITE_LISTEN_NOTES_API_KEY=your_key
     VITE_ANTHROPIC_API_KEY=your_key
     ```

3. **Redeploy**:
   ```bash
   vercel --prod
   ```

4. Now users can sign up and get personalized feeds!

## Sharing Your App

### Share Link

Just send your Vercel URL to friends:
```
https://your-app.vercel.app
```

They can click and start listening immediately!

### Social Media

Tweet it, post it, share it:
```
🎧 Check out Snippets - TikTok for audio!
Personalized podcast clips delivered non-stop.

Try it now: https://your-app.vercel.app
```

### QR Code

1. Go to [qr-code-generator.com](https://www.qr-code-generator.com/)
2. Enter your Vercel URL
3. Download the QR code
4. Share the image!

## Monitoring & Analytics

Vercel gives you free analytics:
- Go to your project dashboard
- Click "Analytics" tab
- See visits, performance, and more

## Automatic Deployments

Once connected to GitHub:
- Every `git push` automatically deploys
- Preview deployments for branches
- Instant rollbacks if needed

## Free Tier Limits

Vercel's free tier includes:
- ✅ Unlimited projects
- ✅ 100GB bandwidth/month (plenty for audio streaming)
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Analytics

Perfect for sharing with friends!

## Troubleshooting

### Build Failed

Check the build logs in Vercel dashboard. Common fixes:
```bash
# Locally test the build
npm run build

# If it fails, fix errors then push again
git add .
git commit -m "Fix build errors"
git push
```

### Audio Won't Play

The sample audio files are from soundhelix.com and should work. If they don't:
1. Check browser console for errors
2. Try a different browser
3. Check if you have ad blockers interfering

### Slow Loading

Vercel edge network is usually fast. If slow:
- Check your internet connection
- Try a different region (Vercel settings)
- Enable edge caching (automatic for static assets)

## Update Your App

Made changes? Deploy updated version:

```bash
git add .
git commit -m "Updated features"
git push
```

Vercel automatically deploys the changes in ~30 seconds!

## Delete/Remove

Want to remove your deployment?

1. Go to Vercel dashboard
2. Click your project
3. Settings → General → Delete Project
4. Confirm

## Support

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Vercel Support: [vercel.com/support](https://vercel.com/support)
- GitHub Issues: Open an issue in your repo

---

## 🚀 Ready to Deploy?

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push

# Then go to vercel.com and click "Import"
```

That's it! Your app will be live and you can share it with the world! 🎉
