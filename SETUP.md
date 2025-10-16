# Setup Guide: Authentication & Cloud Database

## Step 1: Set Up Clerk Authentication (Free)

1. **Create a Clerk account**
   - Go to https://clerk.com
   - Sign up for free (10,000 monthly active users included)

2. **Create a new application**
   - Click "Add application"
   - Name it "Estier"
   - Choose your social login providers (Google, GitHub, etc.)
   - Click "Create application"

3. **Get your API keys**
   - After creating the app, you'll see your API keys
   - Copy the `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Copy the `CLERK_SECRET_KEY`

4. **Update your .env file**
   ```bash
   # Replace these values in .env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   CLERK_SECRET_KEY=sk_test_your_key_here
   ```

5. **Customize appearance (Optional)**
   - In Clerk Dashboard → Customization
   - Set theme colors to match your purple theme:
     - Primary color: `#9333ea` (purple-600)
     - Background: `#0f0620`

## Step 2: Set Up Neon PostgreSQL (Free Cloud Database)

### Why Neon?
- ✅ **Best free tier:** 3GB storage, unlimited databases
- ✅ **Serverless:** Auto-scales, pay only for what you use
- ✅ **Perfect for Vercel:** Same infrastructure, instant connection
- ✅ **PostgreSQL:** Production-ready database

### Setup Instructions

1. **Create a Neon account**
   - Go to https://neon.tech
   - Sign up with GitHub (fastest)
   - Free tier: No credit card required!

2. **Create a new project**
   - Click "Create Project"
   - Name: "estier-db"
   - Region: Choose closest to your users
   - PostgreSQL version: 16 (latest)
   - Click "Create Project"

3. **Get your connection string**
   - After project creation, you'll see the connection string
   - Copy the connection string (looks like this):
     ```
     postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```

4. **Update your .env file**
   ```bash
   # Replace DATABASE_URL in .env
   DATABASE_URL="postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

5. **Update Prisma schema**
   Open `prisma/schema.prisma` and change the database provider:
   ```prisma
   datasource db {
     provider = "postgresql"  // Changed from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

6. **Migrate your database**
   ```bash
   # Generate Prisma client with new schema
   npx prisma generate
   
   # Push schema to Neon
   npx prisma db push
   
   # Seed with sample data
   npm run prisma:seed
   ```

## Step 3: Test Your Setup

1. **Start development server**
   ```bash
   npm run dev
   ```

2. **Test authentication**
   - Visit http://localhost:3000
   - Click "Sign In" button in header
   - Sign up with email or social login
   - Verify you see your user avatar in header

3. **Test voting**
   - Try to upvote/downvote a track
   - Should work only when signed in
   - Check that votes persist after refresh

4. **View your database (Optional)**
   ```bash
   npx prisma studio
   ```
   Or use Neon's web console to view data

## Alternative Free Database Options

### Option 2: Supabase (PostgreSQL + Auth)
- **Free tier:** 500MB database, 50MB storage
- **Bonus:** Includes authentication (alternative to Clerk)
- **Setup:** https://supabase.com → Create project → Copy connection string
- **Connection string format:**
  ```
  postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
  ```

### Option 3: PlanetScale (MySQL)
- **Free tier:** 5GB storage, 1B row reads/month
- **Setup:** https://planetscale.com → Create database
- **Connection string:** Use from PlanetScale dashboard
- **Note:** Change Prisma provider to `mysql`

### Option 4: Railway
- **Free tier:** $5 credit/month
- **Setup:** https://railway.app → New project → Add PostgreSQL
- **Connection string:** Auto-provided in variables

## Production Deployment (Vercel)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add authentication and cloud database"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Import your GitHub repository
   - Add environment variables:
     - `DATABASE_URL`
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
     - `CLERK_SECRET_KEY`
   - Deploy!

3. **Update Clerk redirect URLs**
   - In Clerk Dashboard → Paths
   - Add your Vercel domain to allowed origins

## Troubleshooting

### "User must be signed in to vote"
- Make sure Clerk keys are set correctly in `.env`
- Restart dev server after adding keys
- Clear browser cache and sign in again

### Database connection errors
- Verify connection string is correct
- Check that `?sslmode=require` is at the end (for Neon)
- Ensure no extra spaces or line breaks in `.env`

### Prisma errors
- Run `npx prisma generate` after schema changes
- Delete `node_modules/.prisma` and regenerate if issues persist

### Voting not working
- Check browser console for errors
- Verify you're signed in
- Check that today is not Sunday (voting locked)

## Next Steps

- [ ] Customize Clerk theme to match purple aesthetic
- [ ] Add user profile page
- [ ] Implement weekly track admin panel
- [ ] Add email notifications for weekly results
- [ ] Set up analytics (Vercel Analytics, PostHog)
- [ ] Add rate limiting to prevent spam

## Support

- **Clerk Docs:** https://clerk.com/docs
- **Neon Docs:** https://neon.tech/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Next.js Docs:** https://nextjs.org/docs
