# N8N Workflows

## Webhook Endpoint
`POST http://localhost:5678/webhook/expense`

### Payload structure:
```json
{
  "amount": 12.50,
  "category": "Food",
  "description": "Lunch at cafe",
  "date": "2023-10-25",
  "timestamp": "2023-10-25T12:00:00Z"
}
```

## Google Sheets Workflow Requirements
1. Receive webhook POST request on `expense` path.
2. Read JSON body.
3. Use Google Sheets node -> Append Row.
4. Cells Mapping:
   - A: `date`
   - B: `amount`
   - C: `category`
   - D: `description`
   - E: `timestamp`

## Optional Daily Summary Automation
1. Cron trigger every day at 21:00.
2. Google Sheets node -> Read all rows for current date.
3. Code Node -> Calculate summation.
4. Telegram/Slack/Email Node -> Send "Your daily expenses have been recorded. Total spent today: $X."
