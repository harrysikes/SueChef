# How to Push to GitHub

Your repository is ready to push! Here's how to do it:

## Step 1: Create a GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: "SueChef Push" (or any name you like)
4. Select expiration (90 days, or no expiration)
5. **Check the `repo` scope** (this gives full repository access)
6. Click **"Generate token"**
7. **Copy the token immediately** (you won't see it again!)

## Step 2: Push to GitHub

Open Terminal and run:

```bash
cd /Users/harrisonsikes/Desktop/SueChefv1
git push -u origin main
```

When prompted:
- **Username:** `harrysikes`
- **Password:** Paste your Personal Access Token (NOT your GitHub password)

Your credentials will be saved in macOS Keychain, so you won't need to enter them again!

## Alternative: Quick Push Script

Or run this in your terminal:

```bash
cd /Users/harrisonsikes/Desktop/SueChefv1 && git push -u origin main
```

## Troubleshooting

**If you get "authentication failed":**
- Make sure you're using the Personal Access Token, not your GitHub password
- Check that the token has the `repo` scope selected

**If you get "repository not found":**
- Make sure the repository exists at: https://github.com/harrysikes/SueChef
- Check that you have push access to the repository

## After Pushing

Once pushed, your code will be at:
https://github.com/harrysikes/SueChef

Your `.env` file is already in `.gitignore`, so your secrets won't be committed!

