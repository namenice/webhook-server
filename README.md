# webhook-server

## ⚙️ Usage

### 1. Copy and Edit File env Backend

```bash
cp backend/.env.example backend/.env
vi backend/.env
```
### 2. Copy and Edit File env Frontend

```bash
cp frontend/.env.example frontend/.env
vi frontend/.env
```
### 3. Run Webhook Server
```bash
docker-compose up -d --build
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


