# Getting Real News Audio Content

The demo uses placeholder music because **using actual podcast audio requires permission**. Here's how to get REAL news audio legally:

## ⚠️ Copyright Warning

You **CANNOT** simply download and use audio from:
- Apple Podcasts
- Spotify
- The New York Times
- NPR (without permission)
- Any copyrighted podcast

This violates copyright law and will get you in legal trouble.

---

## ✅ Legal Options

### Option 1: Public Domain Content (FREE & Legal)

**Voice of America (VOA)**
- All content is public domain (US government)
- Free news in multiple languages
- API: https://www.voanews.com/api
- Download MP3s directly

**NASA Podcasts**
- Public domain
- Free to use and redistribute
- https://www.nasa.gov/podcasts/

**US Government Podcasts**
- WhiteHouse.gov podcasts
- CDC health updates
- All public domain

### Option 2: Creative Commons Podcasts

Search on:
- **Archive.org** - Tons of CC-licensed podcasts
- **Podbean** - Many CC-licensed shows
- **Libsyn** - Some allow redistribution

Look for podcasts with:
- CC BY license (Attribution)
- CC BY-SA (Attribution-ShareAlike)

### Option 3: Partner with Podcast Networks

**Contact these networks for API access:**

**NPR One API**
- Apply at: https://dev.npr.org/
- They may approve for innovative apps
- Free tier available

**PRX (Public Radio Exchange)**
- https://www.prx.org/
- Many shows available for licensing
- Reach out to discuss partnership

**Podcast Networks**
- Wondery
- Gimlet
- Radiotopia
- Contact their business development teams

### Option 4: RSS Feed + Permission

1. Find podcasts you want to feature
2. Email the creators:
   ```
   Subject: Partnership Opportunity - Snippets App

   Hi [Podcast Name],

   I'm building an audio discovery app called Snippets that
   helps people discover great podcasts through short clips.

   Would you be interested in having your show featured?
   We'd drive listeners back to your full episodes.

   Let me know if you'd like to discuss!
   ```

3. Many independent podcasters will say yes!

### Option 5: Record Your Own Content

**Easiest solution for getting started:**
- Record your own daily news summaries
- Read from news sources (add your commentary)
- Hire voice actors on Fiverr ($5-20 per snippet)
- Use Text-to-Speech (ElevenLabs, Murf.ai)

---

## 🛠️ Technical Implementation

### Using RSS Feeds (With Permission)

```typescript
// Example: Fetch from podcast RSS
async function fetchPodcastEpisodes(rssUrl: string) {
  const response = await fetch(rssUrl);
  const xml = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');

  const items = doc.querySelectorAll('item');
  const episodes = [];

  items.forEach(item => {
    const enclosure = item.querySelector('enclosure');
    const audioUrl = enclosure?.getAttribute('url');

    episodes.push({
      title: item.querySelector('title')?.textContent,
      audioUrl: audioUrl,
      description: item.querySelector('description')?.textContent,
    });
  });

  return episodes;
}
```

### Using NPR One API

1. Apply for API key: https://dev.npr.org/
2. Use their recommendations endpoint
3. Stream audio with attribution

### Using VOA Content

```typescript
// Voice of America is public domain!
const VOA_RSS = 'https://www.voanews.com/api/zq-qmemeyim';

async function getVOAContent() {
  // Fetch and parse RSS
  // Download MP3s
  // No permission needed - it's public domain!
}
```

---

## 📝 Recommended Approach for Launch

**Phase 1: Demo (Now)**
- Use placeholder audio
- Label it clearly as "Demo Content"
- Show the UX/UI

**Phase 2: Public Domain (Week 1)**
- Integrate VOA content
- Add NASA podcasts
- Label source clearly

**Phase 3: Partnerships (Month 1)**
- Reach out to 20 independent podcasters
- Offer them free exposure
- Get 5-10 to say yes

**Phase 4: Licensed Content (Month 3)**
- Apply for NPR One API
- Contact podcast networks
- Build revenue sharing model

---

## 🔑 Sample Email to Podcasters

```
Subject: Feature Your Podcast on Snippets

Hi [Name],

I love your podcast [Podcast Name]! I'm building a TikTok-style
app for audio called Snippets that helps people discover podcasts
through short clips.

Would you be interested in being featured? Here's what we offer:

✅ Exposure to new listeners
✅ Direct links back to full episodes
✅ Analytics on listener engagement
✅ Free promotion of your show

We'd create 60-90 second snippets from your episodes and when
people love them, they'll subscribe to your full show.

Would you like to discuss? I can send more details!

Best,
[Your Name]
```

---

## 💡 Alternative: User-Generated Content

Let users record their own news summaries:
- TikTok model - users create content
- You moderate for quality
- No licensing issues
- Builds community

---

## ⚡ Quick Start: Public Domain Content

**Use VOA right now (100% legal):**

1. Go to: https://www.voanews.com/podcasts
2. Find RSS feeds
3. Download MP3s
4. Use in your app
5. Add attribution: "Content from Voice of America"

**That's it!** You have real news content legally.

---

## 📊 Long-term Business Model

**Option A: Ad-Supported**
- Feature podcasts for free
- Run ads on your platform
- Share revenue with podcasters

**Option B: Premium Subscriptions**
- Free tier: Public domain content
- Premium tier ($5/mo): Licensed podcasts

**Option C: Referral Model**
- Drive listeners to full episodes
- Earn affiliate commissions
- Partner with podcast platforms

---

## 🚨 What NOT To Do

❌ Download from Apple Podcasts without permission
❌ Rip audio from YouTube
❌ Use copyrighted content "for demo purposes"
❌ Hope you won't get caught

**Even for demos, use placeholder music or public domain content.**

---

## ✅ Summary

**For your demo right now:**
- Keep the placeholder music OR
- Use Voice of America (public domain)

**For launch:**
- Partner with independent podcasters
- Use public domain sources
- Apply for NPR/PRX APIs

**Long term:**
- Build licensing deals
- Revenue sharing model
- Become a platform podcasters want to be on

Need help implementing any of this? Let me know!
