let currentId = 0; // Global variable
let InitialNumOfBooks = 25;

let statesOfRead = ['not read yet', 'just started', 'halfway through', 'almost finished','read'];

/* Generic function --------------------------------------- */
function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function removeDescendants(elem){
    while (elem.hasChildNodes()) {
        removeDescendants(elem.lastChild)
        elem.removeChild(elem.lastChild);
    }
}

/* Book Constructor --------------------------------------- */

function Book(state, title, author, pages, genre='-', year='-', pagesRead = 0) {
    this.title = title;
    this.author = author;
    this.genre = genre;
    this.year = year;
    this.pages = pages;
    this.pagesRead = pagesRead;
    this.state = state;

    currentId++;
    this.id = currentId;
    this.addedOn = new Date(Date.now());
}

Book.prototype.stateFormatted = function () {
    return statesOfRead[this.state];
};

Book.prototype.addedOnFormatted = function () {
    return this.addedOn.toLocaleDateString();
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

/* Book Box (DOM)*/

function createNewBookBox(newBook){
    let bookBox = document.createElement('div');
    bookBox.classList.add('book-box');

    /* Generate an unique background (here use a lorem ipsum image)*/
    bookBox.style.backgroundImage= `url('https://picsum.photos/400/600?random=${newBook.id}')`;

    /* title section -------------------------------------- */
    let bookTitleSection = document.createElement('div');
    bookTitleSection.classList.add('book-section','book-title-section');

    let bookTitleSection_h2 = document.createElement('h2');
    bookTitleSection_h2.classList.add('book-title');

    let bookTitleSection_var = document.createElement('div');
    bookTitleSection_var.classList.add('var-data','var-title');
    bookTitleSection_var.textContent = newBook.title;

    bookTitleSection_h2.appendChild(bookTitleSection_var);
    bookTitleSection.appendChild(bookTitleSection_h2);
    bookBox.appendChild(bookTitleSection);

    /* author section ------------------------------------- */
    let bookAuthorSection = document.createElement('div');
    bookAuthorSection.classList.add('book-section','book-author-section');

    let bookAuthorSection_div = document.createElement('div');
    bookAuthorSection_div.classList.add('book-author');
    bookAuthorSection_div.textContent = 'by ';

    let bookAuthorSection_div_var = document.createElement('span');
    bookAuthorSection_div_var.classList.add('var-data','var-author');
    bookAuthorSection_div_var.textContent = newBook.author;

    bookAuthorSection_div.appendChild(bookAuthorSection_div_var);
    bookAuthorSection.appendChild(bookAuthorSection_div);
    bookBox.appendChild(bookAuthorSection);

    /* image section (empty) --------------------------------- */
    let bookImageSection = document.createElement('div');
    bookImageSection.classList.add('book-section','book-image-section');

    bookBox.appendChild(bookImageSection);

    /* data section ------------------------------------------ */
    let bookDataSection = document.createElement('div');
    bookDataSection.classList.add('book-section','book-data-section');

    /* genre */
    let bookGenreSection_div = document.createElement('div');
    bookGenreSection_div.classList.add('book-data','book-genre');

    let bookGenreSection_div_var = document.createElement('div');
    bookGenreSection_div_var.classList.add('var-data','var-genre');
    bookGenreSection_div_var.textContent = newBook.genre;

    let bookGenreSection_div_lbl = document.createElement('div');
    bookGenreSection_div_lbl.textContent = 'genre';

    bookGenreSection_div.appendChild(bookGenreSection_div_var);
    bookGenreSection_div.appendChild(bookGenreSection_div_lbl);
    bookDataSection.appendChild(bookGenreSection_div);

    /* year */
    let bookYearSection_div = document.createElement('div');
    bookYearSection_div.classList.add('book-data','book-year');

    let bookYearSection_div_var = document.createElement('div');
    bookYearSection_div_var.classList.add('var-data','var-year');
    bookYearSection_div_var.textContent = newBook.year;

    let bookYearSection_div_lbl = document.createElement('div');
    bookYearSection_div_lbl.textContent = 'year';

    bookYearSection_div.appendChild(bookYearSection_div_var);
    bookYearSection_div.appendChild(bookYearSection_div_lbl);
    bookDataSection.appendChild(bookYearSection_div);
    
    /* pages */ 
    let bookPagesSection_div = document.createElement('div');
    bookPagesSection_div.classList.add('book-data','book-pages');

    //var

    let bookPagesSection_div_var = document.createElement('div');
    bookPagesSection_div_var.classList.add('var-data','var-pages');

    let bookPagesSection_div_var_read = document.createElement('span');
    bookPagesSection_div_var_read.classList.add('var-input-data','var-pages-read');
    bookPagesSection_div_var_read.textContent = newBook.pagesRead + ' / ';

    let bookPagesSection_div_var_tot = document.createElement('span');
    bookPagesSection_div_var_tot.textContent = newBook.pages;

    bookPagesSection_div_var.appendChild(bookPagesSection_div_var_read);
    bookPagesSection_div_var.appendChild(bookPagesSection_div_var_tot);

    //lbl

    let bookPagesSection_div_lbl = document.createElement('div');
    bookPagesSection_div_lbl.classList.add('pages-lbl-with-buttons');

    let bookPagesSection_div_btn1 = document.createElement('button');
    bookPagesSection_div_btn1.classList.add('decrease-pages');
    bookPagesSection_div_btn1.textContent = '-';

    let bookPagesSection_div_lbl_txt = document.createElement('div'); 
    bookPagesSection_div_lbl_txt.textContent = 'pages';

    let bookPagesSection_div_btn2 = document.createElement('button');
    bookPagesSection_div_btn2.classList.add('increase-pages');
    bookPagesSection_div_btn2.textContent = '+';

    bookPagesSection_div_lbl.appendChild(bookPagesSection_div_btn1);

    bookPagesSection_div_lbl.appendChild(bookPagesSection_div_lbl_txt);
    bookPagesSection_div_lbl.appendChild(bookPagesSection_div_btn2);

    bookPagesSection_div.appendChild(bookPagesSection_div_var);
    bookPagesSection_div.appendChild(bookPagesSection_div_lbl);
    bookDataSection.appendChild(bookPagesSection_div);

    /* status */
    let bookStatusSection_div = document.createElement('div');
    bookStatusSection_div.classList.add('book-status');

    let bookStatusSvg = createStatusSvg();
    bookStatusSection_div.appendChild(bookStatusSvg);
    bookDataSection.appendChild(bookStatusSection_div);

    bookBox.appendChild(bookDataSection);

    /* footer section ---------------------------------------- */
    let bookFooterSection = document.createElement('div');
    bookFooterSection.classList.add('book-section','book-footer-section');

    /* icons */
    let bookIconsSection_div = document.createElement('div');
    bookIconsSection_div.classList.add('book-icons');
    bookIconsSection_div.textContent = '';

    let iconsClass = ['like','share','del'];
    let iconsContent = ['❤','❤','❤']; /* temporary */

    for (let i=0; i<iconsClass.length; i++){
        let bookIconsSection_div_icon = document.createElement('div');
        bookIconsSection_div_icon.classList.add('icon',iconsClass[i]);
        bookIconsSection_div_icon.textContent = iconsContent[i];
        
        bookIconsSection_div.appendChild(bookIconsSection_div_icon);
    }

    bookFooterSection.appendChild(bookIconsSection_div);

    /* addedon */
    let bookAddedonSection_div = document.createElement('div');
    bookAddedonSection_div.classList.add('book-addedon');
    bookAddedonSection_div.textContent = 'inserted on ';

    let bookAddedonSection_div_var = document.createElement('span');
    bookAddedonSection_div_var.classList.add('var-data','var-addedon');
    bookAddedonSection_div_var.textContent = newBook.addedOnFormatted();

    bookAddedonSection_div.appendChild(bookAddedonSection_div_var);
    bookFooterSection.appendChild(bookAddedonSection_div);

    bookBox.appendChild(bookFooterSection);

    /* return the new book box*/
    return bookBox;
}

function createStatusSvg(){
    // SVG code for the circle progress from:
    // https://nikitahl.github.io/svg-circle-progress-generator/
    // SVG code for the circular text from:
    // https://stackoverflow.com/questions/5737975/circle-drawing-with-svgs-arc-path
    // How to create SVG programmatically:
    // https://dev.to/tqbit/how-to-create-svg-elements-with-javascript-4mmp

    let svgNS = 'http://www.w3.org/2000/svg';

    // Create an element within the svg - namespace (svgNS)
    let statusSvg = document.createElementNS(svgNS, 'svg');

    statusSvg.setAttribute('width',     '100%');
    statusSvg.setAttribute('height',    '100%');
    statusSvg.setAttribute('viewBox',   '-44.035 -40 199.035 195');
    statusSvg.setAttribute('version',   '1.1');
    statusSvg.setAttribute('style',     'transform:rotate(-90deg)');

    /* Outer circle */
    let outerCircle = document.createElementNS(svgNS, 'circle');

    outerCircle.setAttribute('r',       '47.5');
    outerCircle.setAttribute('cx',      '57.5');
    outerCircle.setAttribute('cy',      '57.5');
    outerCircle.setAttribute('fill',    'transparent');
    outerCircle.setAttribute('stroke-dasharray', '298.3px');

    outerCircle.setAttribute('stroke',           '#e0e0e0');
    outerCircle.setAttribute('stroke-width',     '50');

    outerCircle.setAttribute('stroke-dashoffset','0');

    /* Inner circle */
    let innerCircle = outerCircle.cloneNode(true); /* deep copy */

    innerCircle.setAttribute('stroke',           '#e31616');
    innerCircle.setAttribute('stroke-width',     '33');
    innerCircle.setAttribute('stroke-dashoffset','149px'); // stroke-dashoffset = stroke-dasharray * (1-30%)
    innerCircle.setAttribute('stroke-linecap',   'round');

    /* Circular path (hidden) */
    let circularPath = document.createElementNS(svgNS, 'path');

    circularPath.setAttribute('id',   'curve');
    circularPath.setAttribute('fill', 'transparent');
    circularPath.setAttribute('d',    'M 57.5, 57.5 m 97.5, 0 a 97.5,97.5 0 1,0 -195,0 a 97.5,97.5 0 1,0  195,0');

    /* Circular text */
    let circularText = document.createElementNS(svgNS, 'text');
    circularText.setAttribute('width','50');

    let circularTextPath = document.createElementNS(svgNS, 'textPath');
    circularTextPath.setAttribute('href','#curve');
    circularTextPath.setAttribute('startOffset','50%');
    circularTextPath.setAttribute('fill','#ffffff');
    circularTextPath.setAttribute('method','stretch');
    circularTextPath.setAttribute('spacing','auto');
    circularTextPath.setAttribute('text-anchor','middle');
    circularTextPath.textContent = 'halfway through';

    circularText.appendChild(circularTextPath);

    /* Append the elements to the main svg */
    statusSvg.appendChild(outerCircle);
    statusSvg.appendChild(innerCircle);
    statusSvg.appendChild(circularPath);
    statusSvg.appendChild(circularText);

    /* return the new svg image*/
    return statusSvg;
}

/* bookBox -> .favourite is optional */

/* Buttons callbacks */
function newBook_callback(e){

}

function clearall_callback(e){
      


    /* Delete all the childred and the descendants of book-container*/
    let booksContainer = document.querySelector(".books-container");
    removeDescendants(booksContainer);

    /* Delete the myLibrary object */
    /* remove all references to the object, which will be garbage collected later on*/
    myLibrary = undefined;
}

/* Get template data --------------------------------------- */

function initLibrary(library,numOfBooks){ // library is an object, passed by reference
    let booksContainer = document.querySelector(".books-container");

    for (let i=0; i<numOfBooks; i++){
        let bookData = sampleBooks[i];
        let state =  randomInt(0,statesOfRead.length-1);
        let book = new Book(state,...bookData);
        library.addBook(book);

        /* Add it to the DOM */
        let bookBox = createNewBookBox(book);
        booksContainer.appendChild(bookBox);
    }

    let clearAllBtn = document.querySelector(".header-container .clear-all");
    clearAllBtn.addEventListener('click',clearall_callback);
}


/* Some sample data --------------------------------------- */

const sampleBooks = [
    ['The Hobbit', 'J.R.R. Tolkien', 295, 'Fantasy', 1937],
    ['The Lord of the Rings: The Fellowship of the Ring', 'J.R.R. Tolkien', 423, 'Fantasy', 1954],
    ['The Lord of the Rings: The Two Towers', 'J.R.R. Tolkien', 352, 'Fantasy', 1954],
    ['The Lord of the Rings: The Return of the King', 'J.R.R. Tolkien', 416, 'Fantasy', 1955],
    ['The Silmarillion', 'J.R.R. Tolkien', 365, 'Fantasy', 1977],

    ['Harry Potter and the Philosopher\'s Stone', 'J.K. Rowling', 304, 'Fantasy', 1997],
    ['Harry Potter and the Chamber of Secrets', 'J.K. Rowling', 224, 'Fantasy', 1998],
    ['Harry Potter and the Prisoner of Azkaban', 'J.K. Rowling', 416, 'Fantasy', 1999],
    ['Harry Potter and the Goblet of Fire', 'J.K. Rowling', 656, 'Fantasy', 2000],
    ['Harry Potter and the Order of the Phoenix', 'J.K. Rowling', 880, 'Fantasy', 2003],
    ['Harry Potter and the Half-Blood Prince', 'J.K. Rowling', 592, 'Fantasy', 2005],
    ['Harry Potter and the Deathly Hallows', 'J.K. Rowling', 688, 'Fantasy', 2007],

    ['His Dark Materials: Northern Lights', 'P. Pullman', 448, 'Fantasy', 1995],
    ['His Dark Materials: The Subtle Knife', 'P. Pullman', 341, 'Fantasy', 1997],
    ['His Dark Materials: The Amber Spyglass', 'P. Pullman', 544, 'Fantasy', 2000],

    ['The Chronicles of Narnia: The Lion, the Witch and the Wardrobe', 'C.S.S. Lewis', 208, 'Fantasy', 1950],
    ['The Chronicles of Narnia: Prince Caspian', 'C.S.S. Lewis', 240, 'Fantasy', 1951],
    ['The Chronicles of Narnia: The Voyage of the Dawn Treader', 'C.S.S. Lewis', 272, 'Fantasy', 1952],
    ['The Chronicles of Narnia: The Silver Chair', 'C.S.S. Lewis', 272, 'Fantasy', 1953],
    ['The Chronicles of Narnia: The Horse and His Boy', 'C.S.S. Lewis', 240, 'Fantasy', 1954],
    ['The Chronicles of Narnia: The Magician\'s Nephew', 'C.S.S. Lewis', 224, 'Fantasy', 1955],
    ['The Chronicles of Narnia: The Last Battle', 'C.S.S. Lewis', 224, 'Fantasy', 1956],

    ['A study in scarlet', 'A.C. Doyle', 350, 'Detective', 1887],
    ['The Sign of the Four', 'A.C. Doyle', 100, 'Detective', 1890],
    ['The Hound of the Baskervilles', 'A.C. Doyle', 'Detective', 186, 1901],
    ['The Valley of Fear', 'A.C. Doyle', 240, 'Detective', 1914],
    ['The Adventures of Sherlock Holmes', 'A.C. Doyle', 307, 'Detective', 1891],
    ['The Memoirs of Sherlock Holmes', 'A.C. Doyle', 279, 'Detective', 1892],
    ['The Return of Sherlock Holmes', 'A.C. Doyle', 403, 'Detective', 1903],
    ['His Last Bow: Some Later Reminiscences of Sherlock Holmes', 305, 'Detective', 1917],
    ['The Case-Book of Sherlock Holmes', 'T.H. White', 320, 'Detective', 1927],

    ['The Neverending Story', 'M. Ende', 528, 'Fantasy', 1979],
    ['The Wonderful Wizard of Oz', 'L.F. Baum', 244, 'Fantasy', 1900],
    ['Peter Pan', 'J.M. Barrie', 250, 'Fantasy', 1904],
    ['Alice\'s Adventures in Wonderland', 'J.M. Barrie', 313, 'Fantasy', 1865],
    ['Through the Looking-Glass', 'J.M. Barrie', 313, 'Fantasy', 1871],
    ['Matilda', 'R. Dahl', 40, 'Fantasy', 1988],
    ['Charlie and the Chocolate Factory', 'R. Dahl', 160, 'Fantasy', 1964],
    ['The Once and Future King', 'T.H. White', 864,'Fantasy',  1958],
    ['Frankenstein','M. Shelley', 280, 'Horror', 1818]
];


/* Initialization + Testing code */

let myLibrary = new Library();
initLibrary(myLibrary,InitialNumOfBooks);
myLibrary.printInfo();