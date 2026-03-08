# P0 Security Runbook

This runbook closes the first two mandatory P0 actions:

1. Rotate exposed secrets.
2. Purge secret files from git history.

## 1) Secret Rotation (mandatory)

Rotate these values in their providers immediately:

- SMTP app password used by `SENDER_EMAIL`.
- `JWT_SECRET`.
- SQL credentials used by `AZURE_SQL_CONNECTIONSTRING` (if previously shared).

Generate a new JWT secret:

```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

After rotation, set new values only in deployment secret managers:

- Vercel Project Settings > Environment Variables (frontend).
- Backend host secret store (Azure App Service / container platform env vars).

Never commit real `.env` values.

## 2) History Purge (mandatory)

If `backend/.env` was committed in old history, purge it:

```powershell
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch backend/.env" --prune-empty --tag-name-filter cat -- --all
git for-each-ref --format="%(refname)" refs/original/ | ForEach-Object { git update-ref -d $_ }
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

Then push rewritten history:

```powershell
git push origin --force --all
git push origin --force --tags
```

Coordinate this force-push with all collaborators.
