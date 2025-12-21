# Installation Instructions - Option 1

## Step-by-Step Installation

### 1. Install Homebrew
Open Terminal and run:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
**Note:** This will ask for your macOS password. Enter it when prompted.

### 2. Add Homebrew to PATH (if needed)
After Homebrew installs, it will show you commands to run. Typically:
```bash
# For Apple Silicon Macs (M1/M2/M3):
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"

# For Intel Macs:
echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/usr/local/bin/brew shellenv)"
```

### 3. Install Node.js
```bash
brew install node
```

### 4. Verify Installation
```bash
node --version
npm --version
```
You should see version numbers (e.g., v20.x.x and 10.x.x)

### 5. Install Project Dependencies
```bash
cd /Users/harrisonsikes/Desktop/SueChefv1
npm install
```

### 6. Configure Environment Variables
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
Then edit `.env` with your Firebase and OpenAI credentials.

### 7. Start the App
```bash
npm start
```

---

## Troubleshooting

**If Homebrew installation fails:**
- Make sure you have administrator access
- Check your internet connection
- Try running the install command again

**If Node.js version is old:**
```bash
brew upgrade node
```

**If npm install fails:**
- Make sure you're in the project directory
- Check that Node.js is properly installed
- Try: `npm cache clean --force` then `npm install` again


