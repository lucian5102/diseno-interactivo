#!/usr/bin/env bash
# Crea un repositorio público y publica la carpeta en GitHub Pages.
set -euo pipefail
cd -- "$(dirname -- "$0")"
repo="${1:-diseno-interactivo}"
if ! [[ "$repo" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ ]]; then
  echo 'Usá un nombre de repositorio sin espacios.' >&2; exit 1
fi
command -v git >/dev/null || { echo 'Falta Git.' >&2; exit 1; }
command -v gh >/dev/null || { echo 'Instalá GitHub CLI: https://cli.github.com/'; exit 1; }
gh auth status >/dev/null 2>&1 || { echo 'Primero ejecutá: gh auth login'; exit 1; }
owner="$(gh api user --jq .login)"
if [ -d .git ]; then
  echo 'Esta carpeta ya tiene Git. Para actualizar una publicación existente, usá las instrucciones de LEEME.md.' >&2; exit 1
fi
# Confirmar que el nombre esté libre antes de iniciar el repositorio local.
if gh repo view "$owner/$repo" >/dev/null 2>&1; then
  echo "Ya existe $owner/$repo. Elegí otro nombre: bash publicar.sh otro-nombre" >&2; exit 1
fi
git init -b main
git add -- index.html styles.css app.js content.js media.js assets .nojekyll .gitignore LEEME.md publicar.sh
git commit -m "Publicar recorrido de bocetos y texto final"
gh repo create "$owner/$repo" --public --source=. --remote=origin --push
gh api --method POST "repos/$owner/$repo/pages" --input - <<'JSON'
{"build_type":"legacy","source":{"branch":"main","path":"/"}}
JSON
site_url="$(gh api "repos/$owner/$repo/pages" --jq .html_url)"
printf '\nTu página: %s\nLa primera publicación puede tardar unos minutos.\n' "$site_url"
