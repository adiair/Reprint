# Reprint 📚

Reprint is a **full-stack web application** that serves as a book encyclopedia. Users can explore books, upload their own with images and summaries, and search for any book in the database.

---
<img width="1453" height="785" alt="Screenshot 2025-10-25 220130" src="https://github.com/user-attachments/assets/279c5834-770d-42b1-bd95-fb1d9dfe8f09" />

<img width="1132" height="616" alt="image" src="https://github.com/user-attachments/assets/ca7f9664-cf29-490e-95bb-7371d9699f71" />

---

## Features ✨

- 🔍 **Search Books** by title, author, or keywords  
- 📖 **View Summaries** of each book  
- ➕ **Add Books** with image and summary upload  
- 🖥️ **Clean UI** for easy navigation  

---

## Tech Stack 🛠️

- **Frontend:** Next.js  
- **Backend:** Node.js  
- **Database:** PostgreSQL  
- **Styling:** Tailwind CSS / CSS  

---

## Installation ⚡

1. Clone the repo:  
```
git clone https://github.com/your-username/reprint.git
cd reprint
```  
2. Install dependencies:
```
npm install
```

3. Setup environment variables in a .env file:
```
DATABASE_URL=your_postgres_url
PORT=5000
```

4. Run the app:
```
# Backend
npm run server

# Frontend
npm run dev
```

---

API Endpoints 🔗

- GET /books – List all books

- GET /books/:id – Get details of a book

- POST /books – Add a new book

- PUT /books/:id – Update book

- DELETE /books/:id – Delete book

---


License 📄

This project is licensed under the MIT License. See LICENSE
 for details.
