# Rollback Procedure & Strategy

## Automated Container Rollback
If a newly deployed release tag (e.g. `v1.0.2`) exhibits critical issues:

1. Stop running containers:
```bash
docker compose down
```

2. Checkout previous stable version tag:
```bash
git checkout tags/v1.0.1
```

3. Rebuild and launch previous container version:
```bash
docker compose up --build -d
```
