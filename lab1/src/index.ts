class DateUtils {
    static isLeapYear(year: number): boolean {
        if (year % 4 === 0 || year % 400 === 0) {
            return true;
        } else if (year % 100 === 0){
            return false;
        } else {
            return false;
        }
    }

    static getDaysBetween(date1: Date, date2: Date) {
        const dayInMilliseconds = 86400000;
        return Math.abs(date1.getTime() - date2.getTime()) / dayInMilliseconds;
    }

    static formatDate(date: Date) {
        const days = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        return `${days}-${month}-${year}`;
    }

    static addDays(date: Date, days: number) {
        const dayInMilliseconds = 86400000;

        return new Date(date.getTime() + days * dayInMilliseconds);
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
        if (year > 1000 && year < new Date().getFullYear()) {
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
    title: string;
    author: string;
    isbn: string;
    publicationYear: number;
    totalCopies: number;
    borrowedCopies: number;
    genre: string;

    constructor(title: string, author: string, isbn: string, publicationYear: number, totalCopies: number, borrowedCopies: number, genre: string) {
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
        return `${this.title} by ${this.author} was published in ${this.publicationYear}, has total copies of ${this.totalCopies} among which ${this.borrowedCopies} borrowed ones.`
    }

    get age(): number {
        return new Date().getFullYear() - this.publicationYear;
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
        return Validator.isValidISBN(bookData.isbn) && Validator.isValidYear(bookData.publicationYear);
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
    name: string;
    email: string;
    registrationDate: Date;
    borrowedBooks: {isbn: string, title: string}[];
    borrowHistory: {isbn: string, borrowDate: Date, returnDate?: Date}[];


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
    name: string;
    books: Book[];
    users: User[];
    loans: string[];
    maxBooksPerUser: number;


    constructor(name: string, books: Book[], users: User[], loans: string[]) {
        this.name = name;
        this.books = books;
        this.users = users;
        this.loans = loans;
        this.maxBooksPerUser = 5;
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

    addBook({
        title,
        author,
        isbn,
        publicationYear,
        totalCopies,
        borrowedCopies = 0,
        genre
    }: {
        title: string,
        author: string,
        isbn: string,
        publicationYear: number,
        totalCopies: number,
        borrowedCopies?: number,
        genre: string
    }): void {
        this.books.push(new Book(
            title,
            author,
            isbn,
            publicationYear,
            totalCopies,
            borrowedCopies,
            genre
        ));
    }

    removeBook(isbn: string) {
        const bookToRemove = this.books.findIndex(book => book.isbn === isbn);

        this.books.splice(bookToRemove, 1);
    }

    findBookByISBN(isbn: string) {
        const index = this.books.findIndex(books => books.isbn === isbn);

        return this.books[index];
    }

    findBooksByAuthor(author: string) {
        let filteredBooks: Book[] = this.books.filter(book => book.author === author);

        return filteredBooks;
    }

    findBooksByGenre(genre: string) {
        let filteredBooks: Book[] = this.books.filter(book => book.genre === genre);

        return filteredBooks;
    }

    updateBook(isbn: string, updates: Partial<Book>) {
        const bookIndex = this.books.findIndex(book => book.isbn === isbn);

        const bookToUpdate = this.books[bookIndex];

        const {title, author, publicationYear, totalCopies, borrowedCopies, genre} = {...bookToUpdate, ...updates};

        bookToUpdate.title = title;
        bookToUpdate.author = author;
        bookToUpdate.publicationYear = publicationYear;
        bookToUpdate.totalCopies = totalCopies;
        bookToUpdate.borrowedCopies = borrowedCopies;
        bookToUpdate.genre = genre;
    }

    registerUser({
        name,
        email,
        registrationDate = new Date(),
        borrowedBooks = [],
        borrowHistory = []
    }: {
        name: string,
        email: string,
        registrationDate?: Date,
        borrowedBooks?: {isbn: string, title: string}[],
        borrowHistory?: {isbn: string, borrowDate: Date, returnDate?: Date}[]
    }): void {
        this.users.push(new User(
            name,
            email,
            registrationDate,
            borrowedBooks,
            borrowHistory
        ));
    }

    removeUser(email: string) {
        const userToRemove = this.users.findIndex(user => user.email === email);

        this.users.splice(userToRemove, 1);
    }

    findUserByEmail(email: string) {
        const index = this.users.findIndex(user => user.email === email);

        return this.users[index];
    }

    updateUser(email: string, updates: Partial<User>) {
        const userIndex = this.users.findIndex(user => user.email === email);

        const userToUpdate = this.users[userIndex];

        const {name, registrationDate, borrowedBooks, borrowHistory} = {...userToUpdate, ...updates};

        userToUpdate.name = name;
        userToUpdate.registrationDate = registrationDate;
        userToUpdate.borrowedBooks = borrowedBooks;
        userToUpdate.borrowHistory = borrowHistory;
    }

    borrowBook(userEmail: string, isbn: string) {
        const userIndex = this.users.findIndex(user => user.email === userEmail);
        const user = this.users[userIndex];
        const bookIndex = this.books.findIndex(book => book.isbn === isbn);
        const bookTitle = this.books[bookIndex].title;
        const book = this.books[bookIndex];

        user.addBorrowedBook(isbn, bookTitle);

        book.borrow();
    }

    returnBook(userEmail: string, isbn: string) {
        const userIndex = this.users.findIndex(user => user.email === userEmail);
        const user = this.users[userIndex];
        const bookIndex = this.books.findIndex(book => book.isbn = isbn);
        const book = this.books[bookIndex];

        book.return();
        user.removeBorrowedBook(isbn);
    }

    getUserLoans(userEmail: string) {
        const userIndex = this.users.findIndex(user => user.email === userEmail);
        const user = this.users[userIndex];

        return user.borrowedBooks;
    }

    getOverdueLoans(days: number) {
        let overdueBooks: string = '';

        this.users.map(user => {
            overdueBooks += user.hasOverdueBooks(days);
        });

        return overdueBooks;
    }

    getPopularBooks(limit: number) {
        const sortedBooks: Book[] = this.books.sort((a, b) => b.borrowedCopies - a.borrowedCopies);

        return [...sortedBooks].splice(0, limit);
    }

    getActiveUsers(limit: number) {
        const sortedUsers: User[] = this.users.sort((a, b) => b.borrowHistory.length - a.borrowHistory.length);

        return [...sortedUsers].splice(0, limit);
    }

    generateReport() {
        return `
            Name: ${this.name}
            Total books: ${this.totalBooks}
            Available books: ${this.availableBooks}
            Total users: ${this.users.length}
            Total loans: ${this.loans.length}
        `;
    }
}

////////////////// TESTS ///////////////////////

// VALIDATOR //
const validISBN = '1234567890123';
const invalidISBN = '12345678901234';
//console.log(Validator.isValidISBN(validISBN));
//console.log(Validator.isValidISBN(invalidISBN));

const validEmail = 'spaceskata@gmail.com';
const invalidEmail = 'fkdsjfldf?!@invalid_$1.pl';
//console.log(Validator.isValidEmail(validEmail));
//console.log(Validator.isValidEmail(invalidEmail));

const validYear = 2017;
const invalidYear = 2027;
//console.log(Validator.isValidYear(validYear));
//console.log(Validator.isValidYear(invalidYear));

const validPageCount = 493;
const invalidPageCount1 = 0;
const invalidPageCount2 = -45;
//console.log(Validator.isValidPageCount(validPageCount));
//console.log(Validator.isValidPageCount(invalidPageCount1));
//console.log(Validator.isValidPageCount(invalidPageCount2));


// BOOK //
const book = new Book(
    "The Last Wish",
    "Andrzej Sapkowski",
    "9780575082441",
    1993,
    546,
    0,
    "Fantasy"
);

// console.log(book.availableCopies);
// console.log(book.isAvailable);
// book.totalCopies = 0;
// console.log(book.availableCopies);
// console.log(book.isAvailable);

// console.log(book.info);
// book.borrowedCopies = 3;
// console.log(book.info);

//console.log(book.age);

// console.log(book.info);
// book.copies = {
//     total: 1372,
//     borrowed: 395
// };
// console.log(book.info);

// console.log(book.info);
// book.details = {
//     title: "Blood of Elves",
//     author: "Sapkowski",
//     genre: "Dark fantasy"
// };
// console.log(book.info);

// console.log(book.info);
// console.log(book.availableCopies);
// book.borrow();
// console.log(book.info);
// console.log(book.availableCopies);
// book.return();
// console.log(book.info);
// console.log(book.availableCopies);

// console.log(book.getFormattedInfo());
// book.borrow();
// console.log(book.getFormattedInfo());

// console.log(Book.isValidBook({
//     isbn: '1234567890123',
//     publicationYear: 1993
// }));
// console.log(Book.isValidBook({
//     isbn: '12345678901234',
//     publicationYear: 2027
// }));
// console.log(Book.isValidBook({
//     isbn: '1234567890123',
//     publicationYear: 2027
// }));

// console.log(Book.compareByYear({year: 2017}, {year: 1993}));
// console.log(Book.compareByYear({year: 2017}, {year: 2025}));
// console.log(Book.compareByYear({year: 2017}, {year: 2017}));


// USER //
const user = new User(
    "Denys",
    "denn8051@gmail.com",
    new Date(),
    [],
    []
);

//console.log(user);

//console.log(user.canBorrow);

// console.log(user.borrowCount);

// console.log(user.profile);

// console.log(user);
// user.info = {
//     name: 'Novikov',
//     email: 's30888@pjwstk.edu.pl'
// };
// console.log(user);

// console.log(user.borrowedBooks);
// console.log(user.borrowHistory);
// console.log(user.borrowCount);
// user.addBorrowedBook('1234567890123', 'Lord of the rings');
// console.log(user.borrowedBooks);
// console.log(user.borrowHistory);
// console.log(user.borrowCount);
// for (let i = 0; i < user.borrowedBooks.length; i++) {
//     console.log(user.borrowedBooks[i]);
// }
// for (let i = 0; i < user.borrowHistory.length; i++) {
//     console.log(user.borrowHistory[i]);
// }
// user.removeBorrowedBook('1234567890123');
// console.log(user.borrowHistory);
// for (let i = 0; i < user.borrowHistory.length; i++) {
//     console.log(user.borrowHistory[i]);
// }
// console.log(user.borrowCount);
// const borrowHistory = user.getBorrowHistory();
// for (let i = 0; i < borrowHistory.length; i++) {
//     console.log(borrowHistory[i]);
// }
// console.log(user.getFormattedHistory());

// const oldDate = new Date();
// oldDate.setDate(oldDate.getDate() - 10);
// user.borrowHistory.push({
//     isbn: '1234567890123',
//     borrowDate: oldDate
// });
// console.log(user.hasOverdueBooks(5));
// console.log(user.hasOverdueBooks(15));


// LIBRARY //
const library = new Library(
    "Library",
    [],
    [],
    []
);

// console.log(library.totalBooks);

// console.log(library.availableBooks);

// console.log(library.statistics);

library.addBook({
    title: "The Last Wish",
    author: 'Andrzej Sapkowski',
    isbn: '9780575082441',
    publicationYear: 1993,
    totalCopies: 453,
    genre: "Fantasy"
});

library.addBook({
    title: 'The Fellowship of the Ring',
    author: 'J. R. R. Tolkien',
    isbn: '9780261103573',
    publicationYear: 1954,
    totalCopies: 8459,
    genre: 'Fantasy'
});

//console.log(library.books);
//library.removeBook('9780575082441');
//console.log(library.books);

// console.log(library.findBookByISBN('9780575082441'));
// console.log(library.findBookByISBN('9780261103573'));

// console.log(library.findBooksByAuthor('Andrzej Sapkowski'));

// console.log(library.findBooksByGenre('Fantasy'));

// library.updateBook('9780575082441', {title: 'The Witcher', genre: 'Dark fantasy'});
// console.log(library.findBookByISBN('9780575082441'));
// for (let i = 0; i < library.books.length; i++) {
//     console.log(library.books[i]);
// }

library.registerUser({
    name: "Denys",
    email: "denn8051@gmail.com"
});

library.registerUser({
    name: 'Snizhana',
    email: 'spaceskata@gmail.com'
});

// console.log(library.users.length);

// for (let i = 0; i < library.users.length; i++) {
//     console.log(library.users[i]);
// }

// console.log(library.findUserByEmail('denn8051@gmail.com'));

// library.updateUser('denn8051@gmail.com', {
//     name: 'Den',
//     borrowedBooks: [{
//         isbn: '1234567890123',
//         title: 'Some book'
//     },
//     {
//         isbn: '1111111111111',
//         title: 'Another book'
//     }
// ]});

// for (let i = 0; i < library.users.length; i++) {
//     console.log(library.users[i]);
// }

// library.removeUser('denn8051@gmail.com');

// console.log(library.users.length);

// library.borrowBook('denn8051@gmail.com', '9780575082441');
// console.log(library.users[0]);
// console.log(library.books[0].borrowedCopies);

// library.returnBook('denn8051@gmail.com', '9780575082441');
// console.log(library.users[0].borrowHistory[0]);
// console.log(library.books[0].borrowedCopies);

// console.log(library.getUserLoans('denn8051@gmail.com'));

library.borrowBook('denn8051@gmail.com', '9780261103573');
// const popularBooks1 = library.getPopularBooks(1);
// const popularBooks2 = library.getPopularBooks(2);

// for (let i = 0; i < popularBooks1.length; i++) {
//     console.log(popularBooks1[i]);
//     console.log(popularBooks1[i].borrowedCopies);
// }

// for (let i = 0; i < popularBooks2.length; i++) {
//     console.log(popularBooks2[i]);
//     console.log(popularBooks2[i].borrowedCopies);
// }

// const activeUsers = library.getActiveUsers(2);
// for (let i = 0; i < activeUsers.length; i++) {
//     console.log(activeUsers[i]);
//     console.log(activeUsers[i].borrowHistory);
// }

// console.log(library.generateReport());

const date1 = '2025-01-5';
const date2 = '2025-01-3';

// console.log(DateUtils.isLeapYear(2025));
// console.log(DateUtils.isLeapYear(2000));

// console.log(DateUtils.getDaysBetween(new Date(date1), new Date(date2)));

// console.log(DateUtils.formatDate(new Date(date1)));

// console.log(DateUtils.getDaysBetween(new Date(date1), new Date(date2)));

// console.log(DateUtils.addDays(new Date(date1), 30));