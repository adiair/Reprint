-- Create books table for library management system
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  -- isbn VARCHAR(20) UNIQUE,
  genre VARCHAR(100),
  publication_year INTEGER,
  -- publisher VARCHAR(255),
  -- pages INTEGER,
  description TEXT,
  -- quantity INTEGER DEFAULT 1,
  -- available_quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_genre ON books(genre);

-- Insert sample data
INSERT INTO books (title, author, genre, publication_year, description) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', 'Fiction', 1925, 'A classic American novel set in the Jazz Age'),
('To Kill a Mockingbird', 'Harper Lee', 'Fiction', 1960, 'A gripping tale of racial injustice and childhood innocence'),
('1984', 'George Orwell', 'Dystopian Fiction', 1949, 'A dystopian social science fiction novel'),
('Pride and Prejudice', 'Jane Austen', 'Romance', 1813, 'A romantic novel of manners'),
('The Catcher in the Rye', 'J.D. Salinger', 'Fiction', 1951, 'A controversial novel about teenage rebellion');
