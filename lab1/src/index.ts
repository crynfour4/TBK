class DateUtils {
    static isLeapYear(year: number): boolean {
        if (year === 366) {
            return true;
        } else {
            return false;
        }
    }

    static getDaysBetween(date1: string, date2: string) {

    }

    static formatDate(date: string) {

    }

    static addDays(date: string, days: number) {

    }
}

class Validator {
    static isValidISBN(isbn: string) {
        const regex = /^\d{13}$/;
        return regex.test(isbn);
    }

    static isValidEmail(email: string) {
        const regex = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim;
        return regex.test(email);
    }

    static isValidYear(year: number): boolean {
        if (year > 1000 && year < Date.now()) {
            return true;
        } else {
            return false;
        }
    }

    static isValidPageCount(pages: number): boolean {
        if (pages > 0) {
            return true;
        } else {
            return false;
        }
    }
}

class Book {
    public title: string = '';
    public author: string = '';
    public isbn: string = '';
    public publicationYear: number = 0;
    public totalCopies: number = 0;
    public borrowedCopies: number = 0;
    public genre: string = '';

    constructor(title: string, author: string, isbn: string, publicationYear: number, totalCopies: number, genre: string) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.publicationYear = publicationYear;
        this.totalCopies = totalCopies;
        this.borrowedCopies = 0;
        this.genre = genre;
    }

    get availableCopies(): number {
        return this.totalCopies - this.borrowedCopies;
    }

    get isAvailable(): boolean {
        if (this.availableCopies) {
            return true;
        } else {
            return false;
        }
    }

    get info(): string {
        return `${this.title} by ${this.author} published in ${this.publicationYear} has total copies of ${this.totalCopies} among which ${this.borrowedCopies} borrowed ones.`
    }

    get age(): number {
        return Date.now() - this.publicationYear;
    }

    set copies({total, borrowed}: {total: number, borrowed: number}) {
        this.totalCopies = total;
        this.borrowedCopies = borrowed;
    }

    set details({title, author, genre}: {title: string, author: string, genre: string}) {
        this.title = title;
        this.author = author;
        this.genre = genre;
    }

    borrow(): void {
        if (this.availableCopies)
            this.borrowedCopies++;
    }

    return(): void {
        this.borrowedCopies--;
    }

    getFormattedInfo(): string {
        return `
            Title: ${this.title}
            Author: ${this.author}
            ISBN: ${this.isbn}
            Publication year: ${this.publicationYear}
            Total copies: ${this.totalCopies}
            Borrowed copies: ${this.borrowedCopies}
            Genre: ${this.genre}
        `;
    }

    static isValidBook(bookData: {isbn: string, publicationYear: number}) {
        Validator.isValidISBN(bookData.isbn);
        Validator.isValidYear(bookData.publicationYear);
    }

    static compareByYear(book1: {year: number}, book2: {year: number}) {
        if (book1.year > book2.year) {
            return 1;
        } else if (book1.year < book2.year) {
            return -1;
        } else {
            return 0;
        }
    }
}

class User {
    name: string = '';
    email: string = '';
    registrationDate: Date;
    borrowedBooks: {isbn: string, title: string}[] = [];
    borrowHistory: {isbn: string, borrowDate: Date, returnDate?: Date}[] = [];


    constructor(name: string, email: string, registrationDate: Date, borrowedBooks: {
        isbn: string;
        title: string
    }[], borrowHistory: { isbn: string; borrowDate: Date }[]) {
        this.name = name;
        this.email = email;
        this.registrationDate = registrationDate;
        this.borrowedBooks = borrowedBooks;
        this.borrowHistory = borrowHistory;
    }

    get canBorrow(): boolean {
        if (this.borrowedBooks.length < 5) {
            return true;
        } else {
            return false;
        }
    }

    get borrowCount(): number {
        return this.borrowedBooks.length;
    }

    get profile() {
        return {
            name: this.name,
            email: this.email,
            registrationDate: this.registrationDate,
            borrowedBooks: this.borrowedBooks,
            borrowHistory: this.borrowHistory
        }
    }

    set info({name, email}: {name: string, email: string}) {
        this.name = name;
        this.email = email;
    }

    addBorrowedBook(isbn: string, bookTitle: string) {
        if (this.canBorrow) {
            this.borrowedBooks.push({
                isbn: isbn,
                title: bookTitle
            });

            this.borrowHistory.push({
                isbn: isbn,
                borrowDate: new Date()
            });
        }
    }

    removeBorrowedBook(isbn: string) {
        const bookToRemove = this.borrowedBooks.findIndex(book => book.isbn === isbn);

        this.borrowedBooks.splice(bookToRemove, 1);

        let record = this.borrowHistory.find(record => record.isbn === isbn && !record.returnDate);

        if (record) {
            record.returnDate = new Date();
        }
    }

    getBorrowHistory() {
        return this.borrowHistory;
    }

    getFormattedHistory() {
        let history: string = '';

        this.borrowHistory.map((item) => {
            history += `ISBN: ${item.isbn}, Borrow date: ${item.borrowDate}, Return date: ${item.returnDate}\n`;
        });

        return history;
    }

    hasOverdueBooks(days: number) {
        let overdueBooks: string = '';

        this.borrowHistory.map(book => {
            if (!book.returnDate) {
                if (Date.now() - book.borrowDate.getTime() > days * 24 * 60 * 60 * 1000) {
                    overdueBooks += `User has overdue book. ISBN: ${book.isbn}\n`;
                }
            }
        });

        return overdueBooks;
    }
}

class Library {
    name: string = '';
    books: Book[] = [];
    users: User[] = [];
    loans: string[] = [];
    maxBooksPerUser: number = 5;


    constructor(name: string, books: Book[], users: User[], loans: string[], maxBooksPerUser: number) {
        this.name = name;
        this.books = books;
        this.users = users;
        this.loans = loans;
        this.maxBooksPerUser = maxBooksPerUser;
    }

    get totalBooks() {
        return this.books.length;
    }

    get availableBooks() {
        let availableBooks: number = 0;

        this.books.forEach(book => {
            availableBooks += book.availableCopies;
        });

        return availableBooks;
    }

    get statistics() {
        return {
            name: this.name,
            books: this.totalBooks,
            users: this.users.length,
            loans: this.loans.length,
        }
    }

    addBook({bookData}) {
        this.books.push({
            title: bookData.title,
            author: bookData.author,
            isbn: bookData.isbn,
            publicationYear: bookData.publicationYear,
            totalCopies: bookData.totalCopies,
            borrowedCopies: bookData.borrowedCopies,
            genre: bookData.genre
        });
    }

    removeBook(isbn: string) {
        const bookToRemove = this.books.findIndex(book => book.isbn === isbn);

        this.books.splice(bookToRemove, 1);
    }

    findBookByISBN(isbn: string) {
        const index = this.books.findIndex(books => books.isbn === isbn);

        return books[index];
    }

    findBooksByAuthor(author: string) {
        let filteredBooks: books[] = this.books.filter(book => book.author === author);

        return filteredBooks;
    }

    findBooksByGenre(genre: string) {
        let filteredBooks: books[] = this.books.filter(book => book.genre === genre);

        return filteredBooks;
    }

    updateBook(isbn: string, updates) {
        const bookToUpdate = this.books.findIndex(book => book.isbn === isbn);

        this.books[bookToUpdate] = { ...this.books[bookToUpdate], ...updates };
    }

    registerUser(userData) {
        this.users.push({
            name: userData.name,
            email: userData.email,
            registrationDate: userData.registrationDate,
            borrowedBooks: userData.borrowedBooks,
            borrowHistory: userData.borrowHistory
        });
    }

    removeUser(email) {
        const userToRemove = this.users.findIndex()
    }
}