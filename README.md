# Reprint 📚

Reprint is a **full-stack web application** that serves as a book encyclopedia. Users can explore books, upload their own with images and summaries, and search for any book in the database.

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
   ```bash
   git clone https://github.com/your-username/reprint.git
   cd reprint
  
2. Install dependencies:
  ```
  npm install
```

3. Setup environment variables in a .env file:
```
DATABASE_URL=your_postgres_url
PORT=5000
```

4.Run the app:
```
# Backend
npm run server

# Frontend
npm run dev
```

API Endpoints 🔗

GET /books – List all books

GET /books/:id – Get details of a book

POST /books – Add a new book

PUT /books/:id – Update book

DELETE /books/:id – Delete book

Contributing 🤝

Fork the repo

Create a branch: git checkout -b feature-name

Make changes & commit: git commit -m "Add feature"

Push branch: git push origin feature-name

Open a Pull Request

License 📄

This project is licensed under the MIT License. See LICENSE
 for details.
