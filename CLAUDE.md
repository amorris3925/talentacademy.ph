@AGENTS.md

# Deployment & Infrastructure

## Coolify (Production PaaS)
- **Dashboard**: http://178.156.208.39:8000/
- **API Token**: `9|IizQZcH4db9F042kfLP2DLDLb3PvKWDrbCTpsxKTe1d3c1c5`
- **Deploy key UUID**: `d4gwggkcgwg4ss44kc88k0w8` — use this to create new apps from private GitHub repos via the Coolify API (the GitHub App source_id=3 is not accessible via API)

### Apps
| App | UUID | Repo | Dockerfile |
|-----|------|------|------------|
| talent-academy | `vk8s8kkocskcwow0go8ssocg` | amorris3925/talentacademy.ph | `/Dockerfile` |
| henry-bot | `s4soksc8kgscgs0ggg4so08k` | amorris3925/henry-bot | `/Dockerfile.fast` (switch to `/Dockerfile` for full rebuilds) |
| academy-cron | `s4ks8gs4gogk4cgso4s0so8s` | amorris3925/henry-bot | `/Dockerfile.academy-cron` |

### Creating new Coolify apps programmatically
Use the `private-deploy-key` endpoint (NOT `public` or `private-github-app`):
```bash
curl -X POST "http://178.156.208.39:8000/api/v1/applications/private-deploy-key" \
  -H "Authorization: Bearer 9|IizQZcH4db9F042kfLP2DLDLb3PvKWDrbCTpsxKTe1d3c1c5" \
  -H "Content-Type: application/json" \
  -d '{
    "project_uuid": "mwkggk00k8wgooss8w84c0c0",
    "environment_name": "production",
    "server_uuid": "l4cwsgk404g8so04ws40gskg",
    "name": "app-name",
    "git_repository": "git@github.com:amorris3925/REPO.git",
    "git_branch": "main",
    "build_pack": "dockerfile",
    "dockerfile_location": "/Dockerfile",
    "ports_exposes": "8080",
    "private_key_uuid": "d4gwggkcgwg4ss44kc88k0w8"
  }'
```

### Deploying
```bash
# Restart (redeploy)
curl -X POST ".../api/v1/applications/{UUID}/restart" -H "Authorization: Bearer ..."
# Add env var
curl -X POST ".../api/v1/applications/{UUID}/envs" -H "..." -d '{"key":"K","value":"V","is_preview":false}'
```

### Henry Bot Dockerfile switching
Henry Bot uses `Dockerfile.fast` (pre-built base image, ~90s deploy) by default. If the base image is stale or missing, temporarily switch to `/Dockerfile` (full build, ~7min):
```bash
curl -X PATCH ".../api/v1/applications/s4soksc8kgscgs0ggg4so08k" -d '{"dockerfile_location":"/Dockerfile"}'
# Deploy, then switch back:
curl -X PATCH ".../api/v1/applications/s4soksc8kgscgs0ggg4so08k" -d '{"dockerfile_location":"/Dockerfile.fast"}'
```

## LLM Configuration
- **Academy chat/scoring**: Uses MiniMax (NOT Claude/OpenClaw). Configured via `ACADEMY_LLM_*` env vars.
- **Image generation**: Uses Gemini directly (`GEMINI_IMAGE_API_KEY`). Called from `_execute_tool("generate_image", ...)` in `academy_chat.py`.
- **Image analysis/vision**: Uses Gemini 2.0 Flash via `_analyze_images_with_gemini()`. OpenClaw cannot process images.
- **Henry main chat**: Still uses Claude via OpenClaw (`LLM_BASE_URL`). Academy is isolated.

## Database
- **Supabase project**: `szdpzjlhbkytonuhlwif` (ai-platform-data)
- **CLI linked**: `supabase db push` works from this repo
- **DB password**: in env var `SUPABASE_DB_PASSWORD`
- **PostgREST cache**: After schema changes, run `NOTIFY pgrst, 'reload schema';` via psql
