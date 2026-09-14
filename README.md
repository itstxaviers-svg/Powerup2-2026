# Power Up 2

An offline-capable English vocabulary adventure with separate student and teacher applications.

Public source repository: [itstxaviers-svg/Powerup2-2026](https://github.com/itstxaviers-svg/Powerup2-2026).

## Repository storage

- `Assets/` is the canonical master artwork archive. Its PNG, MP4, and ZIP files are stored with Git LFS.
- `WebAssets/` contains optimized WebP files used by production builds and GitHub Actions.
- Specialist Nova's intro PNGs remain regular Git files in `Assets/05-games/word-strike/character/`; they are never moved or duplicated.
- Never commit `.env` files, cloud keys, teacher passwords, student exports, or live YDB data to this public repository.

After cloning, run `git lfs install` and `git lfs pull` only when the original master artwork is needed. Normal deployment does not download the LFS archive.

## Local development

```bash
npm install
npm run assets:web
npm run dev:student
```

Teacher preview is available after `npm run dev:teacher` at `http://127.0.0.1:4174/teacher.html`. Without `VITE_YANDEX_API_URL`, both apps use the local preview mode.

## Quality checks

```bash
npm test
npm run build:student
npm run build:teacher
python3 -m py_compile cloud/yandex/index.py
```

## Production

- Student and teacher sites: Yandex Object Storage.
- Accounts and progress: YDB Serverless.
- API: Yandex API Gateway and Cloud Function.
- Source code and automated deployment: private GitHub repository.

See [cloud/yandex/README.md](cloud/yandex/README.md) for the complete deployment sequence.
