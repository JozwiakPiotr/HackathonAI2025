# Podstawowe
### Prompt
```bash
curl -X POST http://172.20.3.133:11434/api/generate
      -H "Content-Type: application/json"      
      -d '{"prompt":"cześć czy mówisz po polsku", "model":"llama3:latest"}'
```