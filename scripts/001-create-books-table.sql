-- Create books table for library management system
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(20) UNIQUE,
  genre VARCHAR(100),
  publication_year INTEGER,
  publisher VARCHAR(255),
  pages INTEGER,
  description TEXT,
  -- quantity INTEGER DEFAULT 1,
  -- available_quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_books_genre ON books(genre);

-- Insert sample data
INSERT INTO books (title, author, isbn, genre, publication_year, publisher, pages, description, quantity, available_quantity) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', '978-0-7432-7356-5', 'Fiction', 1925, 'Scribner', 180, 'A classic American novel set in the Jazz Age', 3, 3),
('To Kill a Mockingbird', 'Harper Lee', '978-0-06-112008-4', 'Fiction', 1960, 'J.B. Lippincott & Co.', 281, 'A gripping tale of racial injustice and childhood innocence', 2, 2),
('1984', 'George Orwell', '978-0-452-28423-4', 'Dystopian Fiction', 1949, 'Secker & Warburg', 328, 'A dystopian social science fiction novel', 4, 4),
('Pride and Prejudice', 'Jane Austen', '978-0-14-143951-8', 'Romance', 1813, 'T. Egerton', 432, 'A romantic novel of manners', 2, 2),
('The Catcher in the Rye', 'J.D. Salinger', '978-0-316-76948-0', 'Fiction', 1951, 'Little, Brown and Company', 277, 'A controversial novel about teenage rebellion', 3, 3);
