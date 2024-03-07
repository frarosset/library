let currentId; // Global variable
let InitialNumOfBooks = 25;

let simplifiedStatesOfRead = ['not read yet', 'reading','read'];
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

// from: https://stackoverflow.com/a/143889
// Determines if the passed element is overflowing its bounds,
// either vertically or horizontally.
// Will temporarily modify the "overflow" style to detect this
// if necessary.
function checkOverflow(el)
{
   let curOverflow = el.style.overflow;

   if ( !curOverflow || curOverflow === "visible" )
      el.style.overflow = "hidden";

   let isOverflowing = el.clientWidth < el.scrollWidth 
                    || el.clientHeight < el.scrollHeight;

   el.style.overflow = curOverflow;

   return isOverflowing;
}

/* Book Constructor --------------------------------------- */

function Book(pagesRead, title, author, pages, genre='-', year='-') {
    this.title = title;
    this.author = author;
    this.genre = genre;
    this.year = year;
    this.pages = pages;
    this.pagesRead = pagesRead;
    this.favourite = false;

    currentId++;
    this.id = currentId;
    this.addedOn = new Date(Date.now());

    // Update the state
    this.updateState();

    this.bookBoxDiv = undefined;
}

Book.prototype.stateFormatted = function () {
    return statesOfRead[this.stateId];
};

Book.prototype.simplifiedStateFormatted = function () {
    return simplifiedStatesOfRead[this.simplifiedStateId];
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

Book.prototype.incrementReadPages = function (n=1) {
    // this returns the number of incremented pages
    // The book is read! No more pages to read
    if (this.pagesRead == this.pages || n<=0)
        return 0;

    // n can be larger than 1: adjust it if needed
    n = Math.min(n,this.pages-this.pagesRead);

    // Increase the read pages number
    this.pagesRead += n;

    // Update the state
    this.updateState();

    return n;
}

Book.prototype.decrementReadPages = function (n=1) {
    // this returns the number of decremented pages
    // The book is read! No more pages to read
    if (this.pagesRead == 0 || n<=0)
        return 0;

    // n can be larger than 1: adjust it if needed
    n = Math.min(n,this.pagesRead);
    
    // Increase the read pages number
    this.pagesRead -= n;

    // Update the state
    this.updateState();

    return n;
}

Book.prototype.updateState = function () {
    if (this.pagesRead == 0){
        this.progress = 0;
        this.stateId = 0;
        this.simplifiedStateId = 0;
    } else if (this.pagesRead == this.pages){
        this.progress = 1;
        this.stateId = statesOfRead.length-1;
        this.simplifiedStateId = 2;
    } else if (this.pagesRead > 0 && this.pagesRead < this.pages){
        this.progress = this.pagesRead / this.pages;
        let N = statesOfRead.length;
        let interval = 1/(N-2);
        this.stateId = Math.floor(this.progress/interval) + 1;
        this.simplifiedStateId = 1;
    }
    this.state = statesOfRead[this.stateId];
    this.simplifiedState = simplifiedStatesOfRead[this.simplifiedStateId];
}

Book.prototype.setBookBoxDiv = function (bookBoxDiv) {
    this.bookBoxDiv = bookBoxDiv;
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

Library.prototype.deleteBook = function (book) {
    const index = this.books.indexOf(book);
    if (index > -1) {
        this.books.splice(index, 1);
    }
}

// eg, properties to sort: title, author, genre, year, pages, pagesRead, id[addedOn], progress
Library.prototype.sortBy = function (property, descend = false) {
    if (this.books.length==0 || !property in this.books[0])
        return;

    let sampleItem = this.books[0][property];

    if (typeof sampleItem == 'number')
        this.books.sort((a,b) => a[property] - b[property]);
    else if (typeof sampleItem == 'string') // alphabetical order
        this.books.sort((a,b) => {
            aStr = a[property].toUpperCase();
            bStr = b[property].toUpperCase();
            if (aStr < bStr)
                return -1;
            else if (aStr > bStr)
                return 1;
            else
                return 0;
        });
    else if (sampleItem instanceof Date)
        this.books.sort((a,b) => a[property].getTime() - b[property].getTime());    

    if (descend)
        this.books.reverse();

    //console.table(this.books);

    // Update the displayed order
    this.books.map((itm,idx) => itm.bookBoxDiv.style.order = idx);
}

function attributeForFilter(property,...values){
    // use this as attributeForFilter('title','value1','value2')
    return {property: property, values: values};
}

Library.prototype.filterBy = function (...attributes) {
    // attributes: array of {property: 'year', values: [1999,2009]]}: see function attributeForFilter()
    // this function ASSUMES that each property is reported only once in attributes array
    // a "" value is ignored
    if (this.books.length==0)
        return;

    // The books to show contains all the attributes A,B,C,..: A and B and C ...
    // Note: to get the items to hide, you would need: not(A) or not(B) or not(C) or ...

    // init the show status
    this.books.map(itm => itm.show = true);

    attributes.map(attr =>{        
        if (!attr.property in this.books[0] || attr.values.length==0 || attr.values=="")
            return;

        this.books.map(itm => {
            if (itm.show && !attr.values.includes(itm[attr.property]))
                itm.show = false;
        });
    });

    //console.table(this.books.filter(itm => itm.show));

    // Update the displayed order
    this.books.map((itm) => {
        if (!itm.show)
            itm.bookBoxDiv.classList.add('hide');
        else
            itm.bookBoxDiv.classList.remove('hide');
    });
}

Library.prototype.search = function (str,properties=['title','author']) {
    // a "" string is ignored
    if (this.books.length==0)
        return;

    if (str==""){
        this.books.map(itm => itm.matched = true);
        return;
    }
        
    str = str.toLowerCase().trim();

    if (properties.length==undefined || properties.length==0)
        properties = Object.keys(myLibrary.books[0]);

    // init the show status
    this.books.map(itm => itm.matched = false);

    properties.map(prop =>{        
        if (!prop in this.books[0])
            return;
        this.books.map(itm => {
            if (!itm.matched && itm[prop].toString().toLowerCase().includes(str))
                itm.matched = true;
        });
    });

    //console.table(this.books.filter(itm => itm.matched));

    // Update the displayed order
    this.books.map((itm) => {
        if (!itm.matched)
            itm.bookBoxDiv.classList.add('unmatched');
        else
            itm.bookBoxDiv.classList.remove('unmatched');
    });
}

function updateDisplayBooks(){
    sortBooks();
    searchBooks();
    filterBooks();
}

/* Book Box (DOM)*/
/* HTML CODE TO GENERATE:
<div class="book-box favourite">
                <div class="book-section book-title-section">
                    <h2 class="book-title"><div class="var-data var-title">The Hobbit</div></h2>
                    <!-- <div class="book-year">(<span class="var-year">1937</span>)</div> -->
                </div>
                <div class="book-section book-author-section">
                    <div class="book-author">by <span class="var-data var-author">J.R.R. Tolkien</span></div>
                </div>
                <div class="book-section book-image-section">
                </div>
                <div class="book-section book-data-section">
                    <div class="book-data book-genre"><div class="var-data var-genre">Fantasy</div><div>genre</div></div>
                    <div class="book-data book-year"><div class="var-data var-year">1937</div><div>year</div></div>
                    <div class="book-data book-pages"><div class="var-data var-pages"><span class="var-input-data var-pages-read">64</span><span class="var-pages-read-style"> / </span> 123 <div>pages</div></div>
                    <div class="pages-buttons"><button class="decrease-pages">-</button><button class="increase-pages">+</button></div>
                    <div class="book-state">
                        <!-- https://nikitahl.github.io/svg-circle-progress-generator/ -->
                        <svg width="100%" height="100%" viewBox="-44.035 -40 199.035 195" version="1.1" xmlns="http://www.w3.org/2000/svg" style="transform:rotate(-90deg)">
                            <circle r="47.5" cx="57.5" cy="57.5" fill="transparent" stroke="#e0e0e0" stroke-width="50" stroke-dasharray="298.3px" stroke-dashoffset="0"></circle>
                            <circle r="47.5" cx="57.5" cy="57.5" stroke="#e31616" stroke-width="33" stroke-linecap="round" stroke-dashoffset="149px" fill="transparent" stroke-dasharray="298.3px"></circle> <!-- stroke-dashoffset = stroke-dasharray * (1-30%) -->
                            <!-- -->
                            <!-- https://stackoverflow.com/questions/5737975/circle-drawing-with-svgs-arc-path -->
                            <path id="curve" fill="transparent"
                                    d="
                                    M 57.5, 57.5
                                    m 97.5, 0
                                    a 97.5,97.5 0 1,0 -195,0
                                    a 97.5,97.5 0 1,0  195,0
                                    " />
                            <text width="50">
                                <textPath xlink:href="#curve" startOffset="50%" fill='#ffffff' method="stretch" spacing="auto" text-anchor="middle">
                                    halfway through
                                </textPath>
                            </text>
                        </svg>
                    </div>
                </div>
                <div class="book-section book-footer-section">  
                    <ul class="book-icons">
                        <li><div class="icon like">❤</div></li>
                        <li><a href="#" class="icon share">❤</a></li>
                        <li><div class="icon del">❤</div></li>
                    </ul>
                    <div class="book-addedon">inserted on <span class="var-data var-addedon">10/2/2024</span></div>
                </div>
            </div>
*/
function createNewBookBox(newBook){
    let bookBox = document.createElement('div');
    bookBox.classList.add('book-box');

    /* Generate an unique background (here use a lorem ipsum image)*/
    bookBox.style.backgroundImage= `url('https://picsum.photos/400/500?random=${newBook.id}')`;

    /* title section -------------------------------------- */
    let bookHeaderSection = document.createElement('div');
    bookHeaderSection.classList.add('book-header-section');

    let bookTitleSection = document.createElement('div');
    bookTitleSection.classList.add('book-section','book-title-section');

    let bookTitleSection_h2 = document.createElement('h2');
    bookTitleSection_h2.classList.add('book-title');

    let bookTitleSection_var = document.createElement('div');
    bookTitleSection_var.classList.add('var-data','var-title');
    bookTitleSection_var.textContent = newBook.title;

    bookTitleSection_h2.appendChild(bookTitleSection_var);
    bookTitleSection.appendChild(bookTitleSection_h2);

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

    bookHeaderSection.appendChild(bookTitleSection);
    bookHeaderSection.appendChild(bookAuthorSection);
    bookBox.appendChild(bookHeaderSection);    

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

    let bookPagesSection_div_var = document.createElement('div');
    bookPagesSection_div_var.classList.add('var-data','var-pages');

    let bookPagesSection_div_var_read = document.createElement('span');
    bookPagesSection_div_var_read.classList.add('var-input-data','var-pages-read');
    bookPagesSection_div_var_read.textContent = newBook.pagesRead;

    let bookPagesSection_div_var_bar = document.createElement('span');
    bookPagesSection_div_var_bar.classList.add('var-pages-read-style');
    bookPagesSection_div_var_bar.textContent = ' / ';


    let bookPagesSection_div_var_tot = document.createElement('span');
    bookPagesSection_div_var_tot.textContent = newBook.pages;

    bookPagesSection_div_var.appendChild(bookPagesSection_div_var_read);
    bookPagesSection_div_var.appendChild(bookPagesSection_div_var_bar);
    bookPagesSection_div_var.appendChild(bookPagesSection_div_var_tot);

    //lbl
    let bookPagesSection_div_lbl = document.createElement('div'); 
    bookPagesSection_div_lbl.textContent = 'read pages';

    bookPagesSection_div.appendChild(bookPagesSection_div_var);
    bookPagesSection_div.appendChild(bookPagesSection_div_lbl);
    bookDataSection.appendChild(bookPagesSection_div);

    // increase/decrease read pages btns

    let bookPagesSectionBtns_div = document.createElement('div');
    bookPagesSectionBtns_div.classList.add('book-pages-btns');

    let bookPagesSection_div_btn1 = document.createElement('button');
    bookPagesSection_div_btn1.classList.add('decrease-pages');
    bookPagesSection_div_btn1.textContent = '-';
    let bookPagesSection_div_btn2 = document.createElement('button');
    bookPagesSection_div_btn2.classList.add('increase-pages');
    bookPagesSection_div_btn2.textContent = '+';

    bookPagesSectionBtns_div.appendChild(bookPagesSection_div_btn1);
    bookPagesSectionBtns_div.appendChild(bookPagesSection_div_btn2);
    bookDataSection.appendChild(bookPagesSectionBtns_div);

    /* state */
    let bookstateSection_div = document.createElement('div');
    bookstateSection_div.classList.add('book-state');

    let bookstateSvg = createstateSvg();
    bookstateSection_div.appendChild(bookstateSvg);
    bookDataSection.appendChild(bookstateSection_div);

    bookBox.appendChild(bookDataSection);

    /* footer section ---------------------------------------- */
    let bookFooterSection = document.createElement('div');
    bookFooterSection.classList.add('book-section','book-footer-section');

    /* icons */
    let bookIconsSection_ul = document.createElement('ul');
    bookIconsSection_ul.classList.add('book-icons');
    bookIconsSection_ul.textContent = '';

    let iconsClass = ['like','share','del'];
    let iconsType = ['div','a','div'];
    let iconsContent = ['like','share','del']; /* temporary */
    let likeToggle,deleteThisBook;

    for (let i=0; i<iconsClass.length; i++){
        let bookIconsSection_li = document.createElement('li');
        
        let bookIconsSection_li_icon = document.createElement('div');
        bookIconsSection_li_icon.classList.add('icon',iconsClass[i]);
        bookIconsSection_li_icon.textContent = iconsContent[i];

        if (iconsType[i]=='a'){
            let bookIconsSection_li_icon_a = document.createElement('a');
            bookIconsSection_li_icon_a.setAttribute('href','#');
            bookIconsSection_li_icon_a.appendChild(bookIconsSection_li_icon);
            bookIconsSection_li.appendChild(bookIconsSection_li_icon_a);
        } else {
            bookIconsSection_li.appendChild(bookIconsSection_li_icon);
        }

        if (iconsClass[i]=='like'){
            likeToggle = bookIconsSection_li_icon;
        } else if (iconsClass[i]=='del'){
            deleteThisBook = bookIconsSection_li_icon;
        }

        bookIconsSection_ul.appendChild(bookIconsSection_li);
    }

    bookFooterSection.appendChild(bookIconsSection_ul);

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

    /* Append useful info on buttons and add event listeners */
    bookBox.book = newBook;
    bookBox.readPagesDiv = bookPagesSection_div_var_read;
    bookBox.bookstateSvg = bookstateSvg;

    bookPagesSection_div_btn1.bookBoxDiv = bookBox;
    bookPagesSection_div_btn2.bookBoxDiv = bookBox;

    //bookPagesSection_div_btn1.addEventListener('click',decreaseReadPages_callback);
    // bookPagesSection_div_btn2.addEventListener('click',increaseReadPages_callback);

    bookPagesSection_div_btn1.addEventListener('pointerdown',startDecreaseReadPages_callback);
    bookPagesSection_div_btn1.addEventListener('pointerup',stopChangeReadPages_callback);
    bookPagesSection_div_btn1.addEventListener('pointerout',stopChangeReadPages_callback);

    bookPagesSection_div_btn2.addEventListener('pointerdown',startIncreaseReadPages_callback);
    bookPagesSection_div_btn2.addEventListener('pointerup',stopChangeReadPages_callback);
    bookPagesSection_div_btn2.addEventListener('pointerout',stopChangeReadPages_callback);

    /* ***** */
    likeToggle.bookBoxDiv = bookBox;  
    likeToggle.addEventListener('click',likeToggle_callback);

    /* ***** */
    /* you must associate  the deleteThisBookDialog to the button you use to delete this
    specific book. Here the icon deleteThisBook is used. A proper callback is also also specified, 
    which associates this book to the opened dialog. */

    let deleteThisBookDialog = document.querySelector("#dialog-delete-this-book");
    let deleteThisBookYesBtn = document.querySelector("#dialog-delete-this-book button.yes");

    deleteThisBook.associatedModal = deleteThisBookDialog;
    deleteThisBook.addEventListener('click',(e) => {
        showModal_callback(e); 
        deleteThisBookYesBtn.bookBoxDiv = bookBox;
    });  
    
    /* return the new book box*/
    return bookBox;
}

function createstateSvg(){
    // SVG code for the circle progress from:
    // https://nikitahl.github.io/svg-circle-progress-generator/
    // SVG code for the circular text from:
    // https://stackoverflow.com/questions/5737975/circle-drawing-with-svgs-arc-path
    // How to create SVG programmatically:
    // https://dev.to/tqbit/how-to-create-svg-elements-with-javascript-4mmp

    let svgNS = 'http://www.w3.org/2000/svg';

    // Create an element within the svg - namespace (svgNS)
    let stateSvg = document.createElementNS(svgNS, 'svg');

    stateSvg.setAttribute('width',     '100%');
    stateSvg.setAttribute('height',    '100%');
    stateSvg.setAttribute('viewBox',   '-60.006 -58.741 215.006 232.483'); /* '-44.035 -40 199.035 195' */
    stateSvg.setAttribute('version',   '1.1');
    stateSvg.setAttribute('style',     'transform:rotate(-90deg)');

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
    circularText.setAttribute('dy','5%');
    
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
    stateSvg.appendChild(outerCircle);
    stateSvg.appendChild(innerCircle);
    stateSvg.appendChild(circularPath);
    stateSvg.appendChild(circularText);

    stateSvg.progressCircle = innerCircle;
    stateSvg.stateText = circularTextPath;

    /* return the new svg image*/
    return stateSvg;
}

function updateBookInfo(bookBox,book){
    // Update the displayed pages read string
    bookBox.readPagesDiv.textContent = book.pagesRead;

    // Update the displayed progress of reading
    setBookstate(bookBox.bookstateSvg,book);
}

function splitCSSUnits(CSSAttrVal){
    return [CSSAttrVal.match(/[\d.]+/)[0], CSSAttrVal.match(/[^\d.]+/)[0]];
}

function setBookstate(bookstateSvg,book){
    // for progress circle, stroke-dashoffset = stroke-dasharray * (1-progress)

    let strokeDasharray = bookstateSvg.progressCircle.getAttribute('stroke-dasharray');
    let strokeDasharrayVal,strokeDasharrayUnit;
    [strokeDasharrayVal,strokeDasharrayUnit] = splitCSSUnits(strokeDasharray);

    let strokeDashoffsetVal = strokeDasharrayVal*(1-book.progress);

    bookstateSvg.progressCircle.setAttribute('stroke-dashoffset',strokeDashoffsetVal + strokeDasharrayUnit);

    bookstateSvg.stateText.textContent = book.state;
}

function adaptBookTitlesSize(){
    let defaultFontSize = window.getComputedStyle(document.documentElement).getPropertyValue('--book-title-fontsize');;
    // ForEach book title section h2, check if the text overflows: in that case, scale down its size.
    let bookTitleSection_divs = [...document.querySelectorAll(".book-title-section h2")];
    bookTitleSection_divs.forEach((titleSection)=> {
        fitFontSize(titleSection,defaultFontSize);
    });
}

function fitFontSize(elem, defaultFontSize='',delta=0.9){
    // Initialize the fontSize, if the initial value is provided
    if (defaultFontSize)
        elem.style.fontSize = defaultFontSize;
    let fontSize = getComputedStyle(elem).getPropertyValue('font-size');

    let fontSizeVal,fontSizeUnit; 
    [fontSizeVal,fontSizeUnit] = splitCSSUnits(fontSize);

    while (checkOverflow(elem)){
        fontSizeVal *= delta;
        elem.style.fontSize = fontSizeVal + fontSizeUnit;
    }
}

/* Buttons callbacks */
function showModal_callback(e){
    e.target.associatedModal.showModal();
}

function closeModal_callback(e){
    e.target.associatedModal.close();
}


function clearAll_callback(e){
    /* Delete all the childred and the descendants of book-container*/
    removeDescendants(booksContainer);

    /* Delete the myLibrary object */
    /* remove all references to the object, which will be garbage collected later on*/
    myLibrary = undefined;

    // Close the modal
    e.target.associatedModal.close();
}

function deleteThisBook_callback(e){
    let thisBookDiv = e.target.bookBoxDiv;
    let thisBook = e.target.bookBoxDiv.book;

    /* Delete all the childred and the descendants of thisBookDiv,
       and then, thisBookDiv itself*/
    removeDescendants(thisBookDiv);
    thisBookDiv.remove();

    /* Delete thisBook from myLibrary */
    myLibrary.deleteBook(thisBook);

    // Close the modal
    e.target.associatedModal.close();
}

function increaseReadPages_callback(e){
    let elem = e.target;
    let thisBook = elem.bookBoxDiv.book;

    // The book is read! No more pages to read
    if (!thisBook.incrementReadPages(1))
        return;

    updateBookInfo(elem.bookBoxDiv,thisBook);
}

function decreaseReadPages_callback(e){
    let elem = e.target;
    let thisBook = elem.bookBoxDiv.book;

    // The book is not started! No more pages to decrement
    if (!thisBook.decrementReadPages(1))
        return;

    updateBookInfo(elem.bookBoxDiv,thisBook);
}

function startDecreaseReadPages_callback(e){
    let btn = e.target;
    decreaseReadPages_callback(e);
    clearInterval(btn.interval);
    btn.interval = setInterval(function(e){
        decreaseReadPages_callback(e);
    }, 200, e);
}
function startIncreaseReadPages_callback(e){
    let btn = e.target;
    increaseReadPages_callback(e);
    clearInterval(btn.interval);
    btn.interval = setInterval(function(e){
        increaseReadPages_callback(e);
    }, 200, e);
}
function stopChangeReadPages_callback(e){
    let btn = e.target;
    clearInterval(btn.interval);
    updateDisplayBooks();
}

function likeToggle_callback(e){
    let elem = e.target;
    elem.bookBoxDiv.book.favourite = elem.bookBoxDiv.classList.toggle('favourite');
    updateDisplayBooks()
}

function adaptBookTitlesSizeResize_callback(){
    // wait some time before calling the actual resize function,
    // to avoid calling it multiple times
    // see https://stackoverflow.com/a/27923937
    clearTimeout(window.resizedFinished);
    window.resizedFinished = setTimeout(function(){
        adaptBookTitlesSize();
    }, 200);
}

/* Display settings */
function sortBooks(){
    // to be called when:
    //  - the method of sorting changes
    //  - a new book is added (todo)
    //  - the state / favourite changes (todo)
    myLibrary.sortBy(displaySettings.orderBy, displaySettings.orderByDescend)
}

function searchBooks(){
    // to be called when:
    //  - the search text changes
    //  - a new book is added (todo)
    //  - when a property to search in changes in a book 
    //    (note: here this does not happens as we will only search in the title and author fixed fields)

    // you can filter both because of the search field, and the explicit filters
    myLibrary.search(displaySettings.search, displaySettings.searchInProperties);
}

function filterBooks(){
    // to be called when:
    //  - a filter changes
    //  - a new book is added (todo)
    //  - when a property to filter changes in a book 

    // you can filter both because of the search field, and the explicit filters
    myLibrary.filterBy(...displaySettings.filterArg);
}

function displaySettingOrderby_callback(e){
    displaySettings.orderBy = e.target.value;
    sortBooks();
}

function displaySettingOrderByDescend_callback(e){
    displaySettings.orderByDescend = e.target.classList.toggle('descend');
    sortBooks();
}

function displaySettingSearch_callback(e){
    displaySettings.search = e.target.value;
    searchBooks();
    adaptBookTitlesSize();
}

function displaySettingFilterFavourites_callback(e){
    displaySettings.getLogicValueFromStr('favourite', e.target.value);     
    
    /* Update filter argument: trasform the properties of displaySettings.filter to an array (discarding the keys) */
    displaySettings.updateFilterArgInDisplaySettings();

    filterBooks();
    adaptBookTitlesSize();
}

function displaySettingFilterState_callback(e){
    displaySettings.getIntegerValueFromStr('simplifiedStateId', e.target.value);     
    
    /* Update filter argument: trasform the properties of displaySettings.filter to an array (discarding the keys) */
    displaySettings.updateFilterArgInDisplaySettings();

    filterBooks();
    adaptBookTitlesSize();
}

function displaySettingViewInfo_callback(e){
    e.target.classList.toggle('view-text');
    booksContainer.classList.toggle('view-text');
}

/* Display settings object */

function DisplaySettings(){

    let displaySettingOrderby = document.querySelector("#display-setting-orderby");
    this.orderBy = displaySettingOrderby.value;

    let displaySettingOrderByDescend = document.querySelector("#display-setting-orderby-descend-btn");
    this.orderByDescend = displaySettingOrderByDescend.classList.contains('descend');

    let displaySettingSearch = document.querySelector("#display-setting-search");
    this.search = displaySettingSearch.value;

    this.searchInProperties = ['title','author'];

    this.filter = {};

    let displaySettingFilterFavourites = document.querySelector("#display-setting-filter-favourites");
    let filterFavouritesValueStr = getCheckedRadioValueAmongDescendants(displaySettingFilterFavourites);
    this.getLogicValueFromStr('favourite', filterFavouritesValueStr);

    let displaySettingFilterState = document.querySelector("#display-setting-filter-state");
    let filterStateValueStr = getCheckedRadioValueAmongDescendants(displaySettingFilterState);
    this.getIntegerValueFromStr('simplifiedStateId', filterStateValueStr);    

    this.updateFilterArgInDisplaySettings(); /* this sets .filterArg*/

}

DisplaySettings.prototype.getLogicValueFromStr = function(property,str){
    if (str == "")
        this.filter[property] =  attributeForFilter(property, ); // empty values
    else
        this.filter[property] =  attributeForFilter(property, str == true);  
};

DisplaySettings.prototype.getIntegerValueFromStr = function(property,str){
    if (str == "")
        this.filter[property] =  attributeForFilter(property, ); // empty values
    else
        this.filter[property] =  attributeForFilter(property, parseInt(str));  
};

DisplaySettings.prototype.updateFilterArgInDisplaySettings = function(){
    /* Update filter argument: trasform the properties of displaySettings.filter to an array (discarding the keys) */
    this.filterArg = Object.entries(this.filter).map(itm => itm[1]);
};

function getCheckedRadioValueAmongDescendants(ascendentElement){
    return ascendentElement.querySelector("input[type=radio]:checked").value;
}



/* Get template data --------------------------------------- */

function initRandomLibrary(library,numOfBooks){ // library is an object, passed by reference
    currentId = -1;

    for (let i=0; i<numOfBooks; i++){
        let bookData = sampleBooks[i];
        /* generate a random simplified state: 'not read yet' or 'reading' or 'read' */
        /* if the state is reading, generate a more specific state by generating a random nmber of pages read */
        let simplifiedState =  randomInt(0,2);
        let pagesRead =  simplifiedState==0? 0 : simplifiedState==1? randomInt(1,bookData[2]-1) : bookData[2];
        let book = new Book(pagesRead,...bookData);
        library.addBook(book);

        /* Add it to the DOM */
        let bookBox = createNewBookBox(book);
        book.setBookBoxDiv(bookBox);
        updateBookInfo(bookBox,book);
        booksContainer.appendChild(bookBox);

        /* Randomly set is as favourite */
        if (randomInt(0,1))
            book.favourite = bookBox.classList.toggle('favourite');
    }
}

function initInterface(){ 
    let newBookBtn = document.querySelector(".header-container button.new-book");
    let newBookDialog = document.querySelector("#dialog-new-book");

    let newBookCancelBtn = document.querySelector("#dialog-new-book button.cancel");
    let newBookSuggestBtn = document.querySelector("#dialog-new-book button.suggest");
    let newBookAddBtn = document.querySelector("#dialog-new-book button.add");

    let clearAllBtn = document.querySelector(".header-container button.clear-all");
    let clearAllDialog = document.querySelector("#dialog-clear-all");

    let clearAllCancelBtn = document.querySelector("#dialog-clear-all button.cancel");
    let clearAllYesBtn = document.querySelector("#dialog-clear-all button.yes");
    
    newBookBtn.associatedModal = newBookDialog;
    newBookCancelBtn.associatedModal = newBookDialog;
    newBookSuggestBtn.associatedModal = newBookDialog;
    newBookAddBtn.associatedModal = newBookDialog;

    clearAllBtn.associatedModal = clearAllDialog;
    clearAllCancelBtn.associatedModal = clearAllDialog;
    clearAllYesBtn.associatedModal = clearAllDialog;

    newBookBtn.addEventListener('click',showModal_callback);
    clearAllBtn.addEventListener('click',showModal_callback);

    newBookCancelBtn.addEventListener('click',closeModal_callback);
    clearAllCancelBtn.addEventListener('click',closeModal_callback);

    //newBookSuggestBtn.addEventListener('click',newBookSuggest_callback); /* TODO */
    //newBookAddBtn.addEventListener('click',newBookAdd_callback); /* TODO */  
    clearAllYesBtn.addEventListener('click',clearAll_callback);

    /* dialog for deleteThisBook functionality*/
    /* Note: you must associate  the deleteThisBookDialog to the button you use to delete a
       specific book. Here the icon deleteThisBook is used, and this association is done
       when a new book is added (see createNewBookBox()). A proper callback is also also specified. */
    let deleteThisBookDialog = document.querySelector("#dialog-delete-this-book");
    let deleteThisBookCancelBtn = document.querySelector("#dialog-delete-this-book button.cancel");
    let deleteThisBookYesBtn = document.querySelector("#dialog-delete-this-book button.yes");

    deleteThisBookCancelBtn.associatedModal = deleteThisBookDialog;
    deleteThisBookYesBtn.associatedModal = deleteThisBookDialog;
       
    deleteThisBookCancelBtn.addEventListener('click',closeModal_callback);
    deleteThisBookYesBtn.addEventListener('click',deleteThisBook_callback);

    /* Re-fit book titles sizes when resizing the window */
    window.addEventListener('resize',adaptBookTitlesSizeResize_callback);

    /* Display settings */
    let displaySettingOrderby = document.querySelector("#display-setting-orderby");
    displaySettingOrderby.addEventListener('change', displaySettingOrderby_callback);
    
    let displaySettingOrderByDescend = document.querySelector("#display-setting-orderby-descend-btn");
    displaySettingOrderByDescend.addEventListener('click', displaySettingOrderByDescend_callback);
    
    let displaySettingSearch = document.querySelector("#display-setting-search");
    displaySettingSearch.addEventListener('input', displaySettingSearch_callback);

    let displaySettingFilterFavourites = document.querySelector("#display-setting-filter-favourites");
    displaySettingFilterFavourites.addEventListener('change', displaySettingFilterFavourites_callback);

    let displaySettingFilterState = document.querySelector("#display-setting-filter-state");
    displaySettingFilterState.addEventListener('change', displaySettingFilterState_callback);

    let displaySettingViewInfo = document.querySelector("#display-setting-view-info-btn");
    displaySettingViewInfo.addEventListener('click', displaySettingViewInfo_callback);
    
    adaptBookTitlesSize();
    updateDisplayBooks();
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
    ['The Hound of the Baskervilles', 'A.C. Doyle', 186, 'Detective', 1901],
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
let booksContainer = document.querySelector(".books-container");
let displaySettings = new DisplaySettings();

let myLibrary = new Library();
initRandomLibrary(myLibrary,InitialNumOfBooks);
initInterface();
//myLibrary.printInfo();