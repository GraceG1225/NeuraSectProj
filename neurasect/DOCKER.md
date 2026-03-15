# Build and run with Docker Compose

## 1. Get Supabase credentials

- In **Supabase**, open your project.
- Click **Project Settings**.
- Under **Data API**, copy the **Project URL**.
- Under **API Keys**, copy the **anon** / **public** (publishable) key — this is the one used in the app.

## 2. Set environment variables

From the `neurasect` folder, create a `.env` file (or copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` and set:

- `NEXT_PUBLIC_SUPABASE_URL` = your Project URL (from Data API).
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` = your anon/public publishable key (from API Keys).

Docker Compose will read these and pass them into the app.

## 3. Build and run

From the `neurasect` folder (same folder as `docker-compose.yml`):

```bash
docker compose up --build
```

The app will be available at **http://localhost:3000**.

To run in the background:

```bash
docker compose up --build -d
```

To stop:

```bash
docker compose down
```
