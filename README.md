# webhook-server

## ⚙️ Usage

### 1. Copy and Edit File env

```bash
cp .env.example .env
vi .env
```
### 2. Run Webhook Server
```bash
docker-compose up -d
```

## ⚙️ Test

### 1. Test Alert

```bash
curl -X POST http://localhost:4000/webhook/grafana -H "Content-Type: application/json" -d @sample-alert.json
```

### 2. Test Resolve
```bash
curl -X POST http://localhost:4000/webhook/grafana -H "Content-Type: application/json" -d @sample-resolve.json
```


