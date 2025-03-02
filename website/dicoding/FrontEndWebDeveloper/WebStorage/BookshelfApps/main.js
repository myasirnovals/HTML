document.addEventListener('DOMContentLoaded', () => {
    let books = [];

    function addBook(event) {
        event.preventDefault();

        const title = document.querySelector("#inputBookTitle");
        const author = document.querySelector("#inputBookAuthor");
        const year = document.querySelector("#inputBookYear");
        const isComplete = document.querySelector("#inputBookIsComplete"), book = {
            id: +new Date,
            title: title.value,
            author: author.value,
            year: parseInt(year.value, 10),
            isComplete: isComplete.checked
        };

        console.log(book);
        books.push(book);

        document.dispatchEvent(new Event("bookChanged"));

        title.value = "";
        author.value = "";
        year.value = "";
        isComplete.checked = false;
    }

    function searchBooks(event) {
        event.preventDefault();

        const search = document.querySelector("#searchBookTitle");
        const query = search.value;

        query ? displayBooks(books.filter(
            (book) => book.title.toLowerCase().includes(query.toLowerCase()))
        ) : displayBooks(books);

    }


    function markAsComplete(event) {
        const id = Number(event.target.id), index = books.findIndex((book) => book.id === id);
        if (index !== -1) {
            books[index] = {
                ...books[index],
                isComplete: true,
            };

            document.dispatchEvent(new Event("bookChanged"));
        }
    }


    function markAsIncomplete(event) {
        const id = Number(event.target.id), index = books.findIndex((book) => book.id === id);
        if (index !== -1) {
            books[index] = {
                ...books[index],
                isComplete: false,
            };

            document.dispatchEvent(new Event("bookChanged"));
        }
    }


    function removeBook(event) {
        const id = Number(event.target.id), index = books.findIndex((book) => book.id === id);
        if (index !== -1) {
            books.splice(index, 1);
            document.dispatchEvent(new Event("bookChanged"));
        }
    }

    function displayBooks(bookList) {
        const incompleteList = document.querySelector("#incompleteBookshelfList");
        const completeList = document.querySelector("#completeBookshelfList");

        incompleteList.innerHTML = "";
        completeList.innerHTML = "";

        for (const book of bookList) {
            const bookItem = document.createElement("article");
            bookItem.classList.add("book_item");

            const titleElement = document.createElement("h2");
            titleElement.innerText = book.title;

            const authorElement = document.createElement("p");
            authorElement.innerText = "Penulis: " + book.author;

            const yearElement = document.createElement("p");
            yearElement.innerText = "Tahun: " + book.year;

            bookItem.appendChild(titleElement);
            bookItem.appendChild(authorElement);
            bookItem.appendChild(yearElement);

            if (book.isComplete) {
                const actionContainer = document.createElement("div");
                actionContainer.classList.add("action");

                const incompleteButton = createActionButton(
                    book.id, "Belum Selesai dibaca", "green", markAsIncomplete
                );
                const deleteButton = createActionButton(
                    book.id, "Hapus buku", "red", removeBook
                );

                actionContainer.appendChild(incompleteButton);
                actionContainer.appendChild(deleteButton);
                bookItem.appendChild(actionContainer);
                completeList.appendChild(bookItem);
            } else {
                const actionContainer = document.createElement("div");
                actionContainer.classList.add("action");

                const completeButton = createActionButton(
                    book.id, "Selesai dibaca", "green", markAsComplete
                );
                const deleteButton = createActionButton(
                    book.id, "Hapus buku", "red", removeBook
                );

                actionContainer.appendChild(completeButton);
                actionContainer.appendChild(deleteButton);
                bookItem.appendChild(actionContainer);
                incompleteList.appendChild(bookItem);
            }
        }
    }


    function createActionButton(id, text, className, clickHandler) {
        const button = document.createElement("button");

        button.id = id;
        button.innerText = text;
        button.classList.add(className);
        button.addEventListener("click", clickHandler);

        return button;
    }


    function saveBooksToLocalStorage(books) {
        localStorage.setItem("books", JSON.stringify(books));
    }


    function loadBooksFromLocalStorage() {
        return JSON.parse(localStorage.getItem("books")) || [];
    }


    function initialize() {
        books = loadBooksFromLocalStorage();

        displayBooks(books);

        const inputBookForm = document.querySelector("#inputBook");
        const searchBookForm = document.querySelector("#searchBook");

        inputBookForm.addEventListener("submit", addBook);
        searchBookForm.addEventListener("submit", searchBooks);

        document.addEventListener("bookChanged", () => {
            saveBooksToLocalStorage(books);
            displayBooks(books);
        });
    }

    window.addEventListener("load", initialize);
});