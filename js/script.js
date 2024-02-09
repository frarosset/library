let currentId = 0; // Global variable
let InitialNumOfBooks = 10;

let statesOfRead = ['not read yet', 'just started', 'about half read', 'almost finished','read'];

/* Generic function --------------------------------------- */
function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* Book Constructor --------------------------------------- */

function Book(state, title, author, pages) {
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.state = state;

    currentId++;
    this.id = currentId;
    this.addedOn = new Date(Date.now());
}

Book.prototype.stateFormatted = function () {
    return statesOfRead[this.state];
};

Book.prototype.addedOnFormatted = function () {
    return this.addedOn.toLocaleString();
};

Book.prototype.info = function () {
    return `${this.title} by ${this.author}, ${this.pages} pages, ${this.stateFormatted()} [#${this.id} - added on ${this.addedOnFormatted()}]`;
};

Book.prototype.printInfo = function () {
    console.log(this.info())
};

/* Library Constructor --------------------------------------- */

function Library() {
    this.books = [];
}

Library.prototype.info = function () {
    return this.books.reduce((str, itm, idx) => {
        return `${str} ${idx + 1}) ${itm.info()} \n`;
    }, '');
}

Library.prototype.printInfo = function () {
    console.log(this.info())
}

Library.prototype.addBook = function (book) {
    // If the book is already in the library, ignore the request // XXXTOFIXXXX
    if (this.books.includes(book)) {
        return;
    }

    // Update the library array
    this.books.push(book);
}

/* Get template data --------------------------------------- */

function initLibrary(library,numOfBooks){ // library is an object, passed by reference
    for (let i=0; i<numOfBooks; i++){
        let bookData = sampleBooks[i];
        let state =  randomInt(0,statesOfRead.length-1);
        let book = new Book(state,...bookData);
        library.addBook(book);
    }
}

/* Some sample data --------------------------------------- */

const sampleBooks = [
    ['The Hobbit', 'J.R.R. Tolkien', 295, 1937],
    ['The Lord of the Rings: The Fellowship of the Ring', 'J.R.R. Tolkien', 423, 1954],
    ['The Lord of the Rings: The Two Towers', 'J.R.R. Tolkien', 352, 1954],
    ['The Lord of the Rings: The Return of the King', 'J.R.R. Tolkien', 416, 1955],
    ['The Silmarillion', 'J.R.R. Tolkien', 365, 1977],

    ['Harry Potter and the Philosopher\'s Stone', 'J.K. Rowling', 304, 1997],
    ['Harry Potter and the Chamber of Secrets', 'J.K. Rowling', 224, 1998],
    ['Harry Potter and the Prisoner of Azkaban', 'J.K. Rowling', 416, 1999],
    ['Harry Potter and the Goblet of Fire', 'J.K. Rowling', 656, 2000],
    ['Harry Potter and the Order of the Phoenix', 'J.K. Rowling', 880, 2003],
    ['Harry Potter and the Half-Blood Prince', 'J.K. Rowling', 592, 2005],
    ['Harry Potter and the Deathly Hallows', 'J.K. Rowling', 688, 2007],

    ['His Dark Materials: Northern Lights', 'P. Pullman', 448, 1995],
    ['His Dark Materials: The Subtle Knife', 'P. Pullman', 341, 1997],
    ['His Dark Materials: The Amber Spyglass', 'P. Pullman', 544, 2000],

    ['The Chronicles of Narnia: The Lion, the Witch and the Wardrobe', 'C.S.S. Lewis', 208, 1950],
    ['The Chronicles of Narnia: Prince Caspian', 'C.S.S. Lewis', 240, 1951],
    ['The Chronicles of Narnia: The Voyage of the Dawn Treader', 'C.S.S. Lewis', 272, 1952],
    ['The Chronicles of Narnia: The Silver Chair', 'C.S.S. Lewis', 272, 1953],
    ['The Chronicles of Narnia: The Horse and His Boy', 'C.S.S. Lewis', 240, 1954],
    ['The Chronicles of Narnia: The Magician\'s Nephew', 'C.S.S. Lewis', 224, 1955],
    ['The Chronicles of Narnia: The Last Battle', 'C.S.S. Lewis', 224, 1956],

    ['A study in scarlet', 'A.C. Doyle', 350, 1887],
    ['The Sign of the Four', 'A.C. Doyle', 100, 1890],
    ['The Hound of the Baskervilles', 'A.C. Doyle', 186, 1901],
    ['The Valley of Fear', 'A.C. Doyle', 240, 1914],
    ['The Adventures of Sherlock Holmes', 'A.C. Doyle', 307, 1891],
    ['The Memoirs of Sherlock Holmes', 'A.C. Doyle', 279, 1892],
    ['The Return of Sherlock Holmes', 'A.C. Doyle', 403, 1903],
    ['His Last Bow: Some Later Reminiscences of Sherlock Holmes', 305, 1917],
    ['The Case-Book of Sherlock Holmes', 'T.H. White', 320, 1927],
    ['The Neverending Story', 'M. Ende', 528, 1979],
    ['The Wonderful Wizard of Oz', 'L.F. Baum', 244, 1900],
    ['Peter Pan', 'J.M. Barrie', 250, 1904],
    ['Alice\'s Adventures in Wonderland', 'J.M. Barrie', 313, 1865],
    ['Through the Looking-Glass', 'J.M. Barrie', 313, 1871],
    ['Matilda', 'R. Dahl', 40, 1988],
    ['Charlie and the Chocolate Factory', 'R. Dahl', 160, 1964],
    ['The Once and Future King', 'T.H. White', 864, 1958],
    ['Frankenstein','M. Shelley', 280, 1818]
];


/* Initialization + Testing code */

let myLibrary = new Library();
initLibrary(myLibrary,InitialNumOfBooks);
myLibrary.printInfo();