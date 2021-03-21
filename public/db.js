let db;
let dbReq = indexedDB.open("budgetDatabase", 1);
dbReq.onupgradeneeded = function (event) {
  // Set the db variable to our database so we can use it!
  db = event.target.result;

  db.createObjectStore("waiting", { autoIncrement: true });
};
dbReq.onsuccess = function (event) {
  db = event.target.result;
  //check if the app is online before running database
  //   if (navigator.onLine) {
  //     checkDatabase();
  //   }
};
dbReq.onerror = function (event) {
  alert("error opening database " + event.target.errorCode);
};
function addInfo(record) {
  // Start a database transaction and get the notes object store
  let transaction = db.transaction(["waiting"], "readwrite");
  let store = transaction.objectStore("waiting");
  // Put the sticky note into the object store
  store.add(record);
}

function checkDatabase() {
  // open a transaction on your waiting db
  const transaction = db.transaction(["waiting"], "readwrite");
  // access your waiting object store
  const store = transaction.objectStore("waiting");
  // get all records from store and set to a variable
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          // if successful, open a transaction on your waiting db
          const transaction = db.transaction(["waiting"], "readwrite");

          // access your waiting object store
          const store = transaction.objectStore("waiting");

          // clear all items in your store
          store.clear();
        });
    }
  };
}
window.addEventListener("online", checkDatabase);
