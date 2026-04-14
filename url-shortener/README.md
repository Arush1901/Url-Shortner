# URL Shortener — Full Stack (Spring Boot + React)

## Tech Stack
- **Backend**: Spring Boot 3, Spring Data JPA, H2 (in-memory)
- **Frontend**: React 18, Vite, Axios

---

## Running the Backend

**Requirements**: Java 17+, Maven

```bash
cd backend
mvn spring-boot:run
```

Backend runs at: `http://localhost:8080`  
H2 Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:urldb`)

---

## Running the Frontend

**Requirements**: Node.js 18+

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## API Endpoints

| Method | Endpoint                   | Description              |
|--------|----------------------------|--------------------------|
| POST   | `/api/shorten`             | Shorten a URL            |
| GET    | `/{shortCode}`             | Redirect to original URL |
| GET    | `/api/stats/{shortCode}`   | Get click stats          |

### POST `/api/shorten`
**Request:**
```json
{ "url": "https://example.com/very/long/path" }
```
**Response:**
```json
{ "shortUrl": "http://localhost:8080/abc123" }
```

### GET `/api/stats/{shortCode}`
**Response:**
```json
{
  "originalUrl": "https://example.com/very/long/path",
  "shortCode": "abc123",
  "clickCount": 5,
  "createdAt": "2024-01-15T10:30:00"
}
```

---

## Project Structure

```
url-shortener/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/urlshortener/
│       │   ├── UrlShortenerApplication.java
│       │   ├── controller/UrlController.java
│       │   ├── service/UrlService.java
│       │   ├── repository/UrlRepository.java
│       │   └── model/Url.java
│       └── resources/
│           └── application.properties
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        └── App.css
```
