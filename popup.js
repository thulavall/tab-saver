document.getElementById('saveTabs').addEventListener('click', saveTabs);

function saveTabs() {
  let setupName = prompt("Enter a name for this setup:");
  if (setupName) {
    chrome.tabs.query({ currentWindow: true }, function(tabs) {
      const tabUrls = tabs.map(tab => tab.url);
      chrome.storage.local.get(null, function(data) { // Get all stored data
        let savedSetups = data || {}; 
        savedSetups[setupName] = tabUrls;
        chrome.storage.local.set(savedSetups);
      });
    });
    setTimeout(() => {
      displaySavedSetups(); // Refresh the list after a delay
    }, 500);
  }
}

function loadTabs(setupName) {
  chrome.storage.local.get(null, function(data) {
    let setupNames = Object.keys(data);
    if (setupNames.length > 0) {
      // let setupName = prompt("Choose a setup to load:", setupNames.join(", "));
      if (setupName && data[setupName]) {

        // Create a new window
        chrome.windows.create(function(window) {
          // Load tabs in the new window
          data[setupName].forEach(url => chrome.tabs.create({ windowId: window.id, url }));
        });
      }
    } else {
      alert("No saved setups found.");
    }
  });
}

function displaySavedSetups() {
  const prevList = document.getElementById("setupList");
  deleteElement(prevList);
  const prevMessage = document.getElementById("messageCard");
  deleteElement(prevMessage);
  chrome.storage.local.get(null, function(data) {
    let setupNames = Object.keys(data);
    if (setupNames.length > 0) {
      renderSetupList(setupNames);
    } else {
      displayMessage("No saved setups - try saving one!");
    }
  });
}

function renderSetupList(setupNames) {
  const listContainer = document.createElement('ul'); // Create a list element
  listContainer.id = "setupList"; // Add an id for easier deletion
  listContainer.classList.add('list-group', 'mt-3'); // Add Bootstrap classes

  setupNames.forEach(name => {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
    listItem.textContent = name;

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('btn', 'btn-sm', 'btn-danger');
    const trashIcon = document.createElement('i');
    trashIcon.classList.add('bi', 'bi-trash-fill'); 
    deleteButton.appendChild(trashIcon);

    // Inside the forEach loop:
    deleteButton.addEventListener('click', (event) => { 
      event.stopPropagation(); // Prevents triggering the loadTabs click event
      if (confirm(`Are you sure you want to delete ${name}?`)) {
          deleteSetup(name); 
      } 
    });
    
    listItem.appendChild(deleteButton); // Add the button

    // Add click event to load the setup
    listItem.addEventListener('click', () => {
      loadTabs(name); 
    });

    listContainer.appendChild(listItem);
  });

  // Replace existing previous list with the new list 
  const contentArea = document.querySelector('.container.mt-4');
  contentArea.appendChild(listContainer); 
}

function deleteElement(element) {
  if (element) {
    element.parentNode.removeChild(element);
  }
}


function displayMessage(message) {
  const cardContainer = document.createElement('div'); // Create a container for the card
  cardContainer.classList.add('card', 'mt-3'); // Add Bootstrap classes
  cardContainer.id = "messageCard"; // Add an id for easier deletion

  const cardBody = document.createElement('div'); // Create a card body
  cardBody.classList.add('card-body');

  const messageText = document.createElement('p'); // Create a paragraph element for the message
  messageText.textContent = message; // Set the text content of the paragraph
  messageText.classList.add('text-center'); // Add the text-center class

  cardBody.appendChild(messageText); // Add the message to the card body
  cardContainer.appendChild(cardBody); // Add the card body to the container

  const contentArea = document.querySelector('.container.mt-4'); // Find the content area
  contentArea.appendChild(cardContainer); // Add the card container to the content area
}


function deleteSetup(setupName) {
  chrome.storage.local.remove(setupName);
  displaySavedSetups(); // Refresh the list
}

// Initial display on popup open
displaySavedSetups(); 